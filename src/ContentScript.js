
$(document).ready(function() {
    new Translator().init();
});
var Translator = function() {
    var self = this;
    this.figureExp;
    this.currencySymbols = "";
    this.conversionRates;
    this.init = function() {
        chrome.runtime.sendMessage(
            {query: "CurrencyRate"},
            function(response) {
                self.currencyData = response;
                $.each(self.currencyData.currencyMetadata, function(key, value) {
                    self.currencySymbols += '\\' + value.currencySymbol + '|';
                });
                self.currencySymbols = self.currencySymbols.replace(/\|$/, '');
                self.figureExp = new RegExp('((' + self.currencySymbols + ')[0-9\\., ]*[0-9])(?!([^<]+)?>)', 'gi');
                tagAllCurrencies();
                bindHover(self.currencyData);
        });
    };

    var tagAllCurrencies = function(text) {
        document.body.innerHTML = document.body.innerHTML.replace(
                self.figureExp,
                '<span class="currency-tag">$&</span>'
            );
    };

    var bindHover = function(currencyData) {
        $(".currency-tag").hover(
            function() {
                var symbol = this.innerText.match(self.currencySymbols);
                var currency;
                $.each(currencyData.currencyMetadata, function(key, value) {
                    if(value.currencySymbol == symbol) {currency = value;}
                });
                $(this).append($("<span>" + " * " + currencyData.conversionRates[currencyData.hostCurrency][currency.id] + "</span>"));
            },
            function() {
                $(this).find("span:last").remove();
            }
        );
    }
}
