var CurrencyProvider = function() {
    var self = this;
    this.serviceId = 0;
    var hostCurrency = "INR";
    var currencyList = ["USD", "GBP"];

    this.conversionRates = {
        INR: {
            USD: 60
        }
    }

    this.refreshRates = function() {
        console.log("fetching rates from http://www.freecurrencyconverterapi.com...");
        var requestUrl = "http://www.freecurrencyconverterapi.com/api/v3/convert?q=";
        for(var index in currencyList) {
            requestUrl = requestUrl + currencyList[index] + "_" + hostCurrency + ",";
        }
        requestUrl = requestUrl.replace(/,$/, "");

        $.ajax({
            url: requestUrl,
            success: function(jsonResult) {
                var results = jsonResult.results;
                for(var index in currencyList) {
                    var key = currencyList[index] + "_" + hostCurrency;
                    var srcCurrency = currencyList[index];
                    if(results[key]) {
                        self.conversionRates[hostCurrency][srcCurrency] = results[key].val;
                    }
                }
            }
        });
    }

    this.startRefreshService = function() {
        self.refreshRates();
        self.serviceId = setInterval(self.refreshRates, 900000);
    }
}

var currencyProvider = new CurrencyProvider();
currencyProvider.startRefreshService();
