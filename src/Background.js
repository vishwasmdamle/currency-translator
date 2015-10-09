var CurrencyProvider = function() {
    this.allCurrencies = ["EUR", "GBP", "INR", "JPY", "USD"];

    var self = this;
    this.serviceId = 0;
    this.hostCurrency = "INR";
    this.numberFormat = "ENGLISH";
    this.isToggledOff = false;
    this.selectedCurrencies = ["EUR", "GBP", "INR", "JPY", "USD"];
    this.currencyMetadata;

    this.init = function() {
        chrome.storage.sync.get(function(dataObject) {
            if(!dataObject.data)
                return;
            self.hostCurrency = dataObject.data.hostCurrency;
            self.selectedCurrencies = dataObject.data.selectedCurrencies;
            self.numberFormat = dataObject.data.numberFormat;
            self.isToggledOff = dataObject.data.isToggledOff;
            self.updateCurrencyInfo(updateDataFromJson);
        });
    }

    this.updateCurrencyInfo = function(onSuccess) {
        console.log("fetching rates from http://api.fixer.io/...");
        var requestUrl = "http://api.fixer.io/latest?base=" + self.hostCurrency;

        $.ajax({
            url: requestUrl,
            success: onSuccess
        });
    }

    var updateDataFromJson = function(jsonResponse) {
        var results = jsonResponse.rates;
        self.currencyMetadata = getEmptyCurrencyMetadata();
        for(var index in self.selectedCurrencies) {
            var key = self.selectedCurrencies[index];
            if(results[key]) {
                self.currencyMetadata[key].conversion = results[key];
            }
        }
        self.currencyMetadata[self.hostCurrency].conversion = 1;
    }
    this.makePersistent = function() {
        chrome.storage.sync.set({
            data: {
                hostCurrency: self.hostCurrency,
                selectedCurrencies: self.selectedCurrencies,
                numberFormat: self.numberFormat,
                isToggledOff: self.isToggledOff
            }
        });
    }

    this.sendUpdatedPreferences = function() {
        this.updateCurrencyInfo(function(jsonData) {
            updateDataFromJson(jsonData);
            data = self.generateDataForCS();
            chrome.tabs.query({},
                function(tabs) {
                    $.each(tabs,
                        function(key, currentTab) {
                            chrome.tabs.sendMessage(currentTab.id, {query: 'PreferenceUpdateFromBackground', data: data})
                    });
                }
            );
        });
    }

    this.generateDataForCS = function() {
        return {
            currencyMetadata: self.currencyMetadata,
            selectedCurrencies: self.selectedCurrencies,
            hostCurrency: self.hostCurrency,
            numberFormat: self.numberFormat,
            isToggledOff: self.isToggledOff
        };
    }

    this.startRefreshService = function() {
        self.updateCurrencyInfo();
        self.serviceId = setInterval(self.updateCurrencyInfo, 900000);
    }

    var getEmptyCurrencyMetadata = function() {
        return {
            USD: {
                currencyName: "United States dollar",
                currencySymbol: "$",
                id: "USD"
            },
            GBP: {
                currencyName: "Great Briton Pound",
                currencySymbol: "£",
                id: "GBP"
            },
            INR: {
                currencyName: "Indian Rupee",
                currencySymbol: "₹",
                id: "INR"
            },
            JPY: {
                currencyName: "Japanese Yen",
                currencySymbol: "¥",
                id: "JPY"
            },
            EUR: {
                currencyName: "Euro",
                currencySymbol: "€",
                id: "EUR"
            }
        }
    };

    this.init();
}

var currencyProvider = new CurrencyProvider();
currencyProvider.startRefreshService();


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.query == "CurrencyRateFromCS") {
            sendResponse(currencyProvider.generateDataForCS());
        }
        if (request.query == "PreferencesFromPopup") {
            sendResponse({
                allCurrencies: currencyProvider.allCurrencies,
                selectedCurrencies: currencyProvider.selectedCurrencies,
                hostCurrency: currencyProvider.hostCurrency,
                numberFormat: currencyProvider.numberFormat,
                isToggledOff: currencyProvider.isToggledOff
            });
        }
        if (request.query == "PreferenceUpdateFromPopup") {
            currencyProvider.selectedCurrencies = request.data.selectedCurrencies;
            currencyProvider.hostCurrency = request.data.hostCurrency;
            currencyProvider.numberFormat = request.data.numberFormat;
            currencyProvider.isToggledOff = request.data.isToggledOff;
            currencyProvider.makePersistent();
            currencyProvider.updateCurrencyInfo();
            currencyProvider.sendUpdatedPreferences();
        }
});
