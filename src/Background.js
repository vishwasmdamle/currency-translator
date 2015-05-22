var CurrencyProvider = function() {
    var self = this;
    this.serviceId = 0;
    this.hostCurrency = "INR";
    var currencyList = ["USD", "GBP", "EUR", "JPY"];
    this.currencyMetadata = {
    USD: {
        currencyName: "United States dollar",
        currencySymbol: "$",
        id: "USD"
        }
    };

    this.conversionRates = {
        INR: {
            USD: 60
        }
    }

    this.refreshRates = function() {
        console.log("fetching rates from http://www.freecurrencyconverterapi.com...");
        var requestUrl = "http://www.freecurrencyconverterapi.com/api/v3/convert?q=";
        for(var index in currencyList) {
            requestUrl = requestUrl + currencyList[index] + "_" + self.hostCurrency + ",";
        }
        requestUrl = requestUrl.replace(/,$/, "");

        $.ajax({
            url: requestUrl,
            success: function(jsonResult) {
                var results = jsonResult.results;
                for(var index in currencyList) {
                    var key = currencyList[index] + "_" + self.hostCurrency;
                    var srcCurrency = currencyList[index];
                    if(results[key]) {
                        self.conversionRates[self.hostCurrency][srcCurrency] = results[key].val;
                    }
                }
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
                for(var index in currencyList) {
                    var key = currencyList[index];
                    if(results[key]) {
                        self.currencyMetadata[key] = results[key];
                    }
                }
            }
        });
    }

    this.startRefreshService = function() {
        self.updateCurrencyInfo();
        self.refreshRates();
        self.serviceId = setInterval(self.refreshRates, 900000);
    }
}

var currencyProvider = new CurrencyProvider();
currencyProvider.startRefreshService();


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.query == "CurrencyRate") {
            sendResponse({
                conversionRates: currencyProvider.conversionRates,
                currencyMetadata: currencyProvider.currencyMetadata,
                hostCurrency: currencyProvider.hostCurrency
            });
        }
});