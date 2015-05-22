
$(document).ready(function() {
    new Translator().init();
});
var Translator = function() {
    var self = this;
    this.figureExp;
    this.currencySymbols = "";
    this.init = function() {
        chrome.runtime.sendMessage(
            {query: "CurrencyRate"},
            function(response) {
                self.currencyData = response;
                $.each(self.currencyData.currencyMetadata, function(key, value) {
                    if(value.id != self.currencyData.hostCurrency)
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
                displayPopup(currencyData, this)
            },
            function() {
                $('#conversion-popup').hide();
            }
        );
    }

    var displayPopup = function(currencyData, currencyTag) {
        var symbol = currencyTag.innerText.match(self.currencySymbols);
        var currency;
        $.each(currencyData.currencyMetadata, function(key, value) {
            if(value.currencySymbol == symbol) {currency = value;}
        });

        var popupElement;
        if($('#conversion-popup').length != 0) {
            popupElement = $('#conversion-popup');
            $('#conversion-popup').show();
        } else {
            popupElement = $("<div id='conversion-popup'></div>");
        }

        buildPopup(currencyData, currency, popupElement, currencyTag);

    }

    var buildPopup = function(currencyData, currency, element, currencyTag) {
        var primaryConversionRate = currencyData.currencyMetadata[currency.id].conversion;
        var amount = parseFloat(currencyTag.innerText.replace(/[^.0-9]/g, ""));

        var tr, td, p;
        var div = document.createElement('div');
        p = document.createElement('p');
        p.innerHTML = currencyData.currencyMetadata[currencyData.hostCurrency].currencySymbol
            + ' ' + (amount * primaryConversionRate).toFixed(2);
        div.appendChild(p);

        div.appendChild(document.createElement('hr'));

        for(var index in currencyData.currencyMetadata) {
            if(currencyData.currencyMetadata[index].id != currencyData.hostCurrency) {
                p = document.createElement('p');
                p.innerHTML = currencyData.currencyMetadata[index].currencySymbol
                    + ' ' + (amount * primaryConversionRate / currencyData.currencyMetadata[index].conversion).toFixed(2);
                div.appendChild(p);
            }
        }

        element.empty();
        element.append(div);
        $(document.body).append(element);
    };
}
