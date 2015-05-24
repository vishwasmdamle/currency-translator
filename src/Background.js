var CurrencyProvider = function() {
    this.allCurrencies = ["EUR", "GBP", "INR", "JPY", "USD"];

    var self = this;
    this.serviceId = 0;
    this.hostCurrency = "INR";
    this.currencyList = ["EUR", "GBP", "INR", "JPY", "USD"];
    this.currencyMetadata = {
    USD: {
        currencyName: "United States dollar",
        currencySymbol: "$",
        id: "USD"
        }
    };

    this.refreshRates = function() {
        console.log("fetching rates from http://www.freecurrencyconverterapi.com...");
        var requestUrl = "http://www.freecurrencyconverterapi.com/api/v3/convert?q=";
        for(var index in self.currencyList) {
            requestUrl = requestUrl + self.currencyList[index] + "_" + self.hostCurrency + ",";
        }
        requestUrl = requestUrl.replace(/,$/, "");

        $.ajax({
            url: requestUrl,
            success: function(jsonResult) {
                var results = jsonResult.results;
                for(var index in self.currencyList) {
                    var key = self.currencyList[index] + "_" + self.hostCurrency;
                    var srcCurrency = self.currencyList[index];
                    if(results[key]) {
                        self.currencyMetadata[srcCurrency].conversion = results[key].val;
                    }
                }
                self.currencyMetadata[self.hostCurrency].conversion = 1;
            }
        });
    }

    this.updateCurrencyInfo = function() {
        console.log("fetching currency metadata from http://www.freecurrencyconverterapi.com...");
        var requestUrl = "http://www.freecurrencyconverterapi.com/api/v3/currencies";

        $.ajax({
            url: requestUrl,
            success: function(jsonResult) {
                var results = jsonResult.results;
                self.currencyMetadata = {};
                for(var index in self.currencyList) {
                    var key = self.currencyList[index];
                    if(results[key]) {
                        self.currencyMetadata[key] = results[key];
                    }
                }
                self.currencyMetadata[self.hostCurrency] = results[self.hostCurrency];
                self.refreshRates();
            }
        });
    }

    this.startRefreshService = function() {
        self.updateCurrencyInfo();
        self.serviceId = setInterval(self.updateCurrencyInfo, 900000);
    }
}

var currencyProvider = new CurrencyProvider();
currencyProvider.startRefreshService();


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.query == "CurrencyRate") {
            sendResponse({
                currencyMetadata: currencyProvider.currencyMetadata,
                hostCurrency: currencyProvider.hostCurrency
            });
        }
        if (request.query == "CurrencyList") {
            sendResponse({
                allCurrencies: currencyProvider.allCurrencies,
                selectedCurrencies: currencyProvider.currencyList,
                hostCurrency: currencyProvider.hostCurrency
            });
        }
        if (request.query == "DataUpdate") {
            currencyProvider.currencyList = request.data.selectedCurrencies;
            currencyProvider.hostCurrency = request.data.hostCurrency;
            currencyProvider.updateCurrencyInfo();
        }
});