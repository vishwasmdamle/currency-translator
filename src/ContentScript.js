
$(document).ready(function() {
    new Translator().init();
});
var Translator = function() {
    this.figureExp = new RegExp('(\\$[0-9., ]*[0-9$])(?!([^<]+)?>)', 'gi');
    var self = this;
    this.conversionRates;
    this.init = function() {
        chrome.runtime.sendMessage(
            {query: "CurrencyRate"},
            function(response) {
                self.conversionRates = response;
                tagAllCurrencies();
                bindHover();
        });
    };

    var tagAllCurrencies = function(text) {
        document.body.innerHTML = document.body.innerHTML.replace(
                self.figureExp,
                '<span class="currency-tag">$&</span>'
            );
    };

    var bindHover = function() {
        $(".currency-tag").hover(
            function() {
                $(this).append($("<span> ***</span>"));
            },
            function() {
                $(this).find("span:last").remove();
            }
        );
    }
}
