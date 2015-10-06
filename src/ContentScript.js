
$(document).ready(function() {
    new Translator().init();
});
var Translator = function() {
    var self = this;

    var numberConverter;

    this.figureExp;
    this.currencySymbols = "";
    this.init = function() {
        chrome.runtime.sendMessage(
            {query: "CurrencyRate"},
            function(response) {
                self.currencyData = response;
                var format = response.numberFormat == "INDIAN" ? NumberConverter.INDIAN : NumberConverter.ENGLISH;
                numberConverter = new NumberConverter(format);

                $.each(self.currencyData.currencyMetadata, function(key, value) {
                    if(value.id != self.currencyData.hostCurrency)
                        self.currencySymbols += '\\' + value.currencySymbol + '|';
                });
                self.currencySymbols = self.currencySymbols.replace(/\|$/, '');
                var unitsList = 'trillion|billion|million|thousand|tr|tn|bn|m|k';
                self.figureExp = new RegExp('((' + self.currencySymbols + ')[0-9\\., ]*[0-9]([\\ |\u00a0]*('+ unitsList + '))*)(?!([^<]+)?>)', 'gi');
                tagAllCurrencies();
                bindHover(self.currencyData);
        });
    };

    var tagAllCurrencies = function(text) {
        getNodesUnder(document.body).forEach(markFiguresInNode);
    };

    var markFiguresInNode = function(node) {
        for (var i; (i = node.nodeValue.search(self.figureExp)) > -1; node = after){
            var after = node.splitText( i + node.nodeValue.match(self.figureExp)[0].length);
            var marked = node.splitText(i);

            var span = document.createElement('span');
            span.className = 'currency-tag';
            span.appendChild(marked);

            after.parentNode.insertBefore(span, after);
        }
    }

    var getNodesUnder = function(root) {
        var text = [], node;
        var walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        while(node = walk.nextNode())
            text.push(node);
        return text;
    }

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
        var amount = numberConverter.getNumericalAmount(currencyTag.innerText);

        var tr, td, p, img, div, className;
        var convertedAmount, formattedAmount;
        div = document.createElement('div');
        img = document.createElement('img');
        img.src = chrome.extension.getURL("/images/AegonGold.png");
        div.appendChild(img);

        convertedAmount = (amount / primaryConversionRate).toFixed(2);
        formattedAmount = numberConverter.getFormattedAmount(convertedAmount);
        p = document.createElement('p');
        p.innerHTML = currencyData.currencyMetadata[currencyData.hostCurrency].currencySymbol
            + ' ' + formattedAmount;
        className = 'conversion-popup ' + getSizeClass(formattedAmount.length);

        div.appendChild(p);

        div.appendChild(document.createElement('hr'));

        for(var index in currencyData.currencyMetadata) {
            if(currencyData.currencyMetadata[index].id != currencyData.hostCurrency) {
                convertedAmount = (amount / primaryConversionRate * currencyData.currencyMetadata[index].conversion).toFixed(2);
                p = document.createElement('p');
                p.innerHTML = currencyData.currencyMetadata[index].currencySymbol
                    + ' ' + numberConverter.getFormattedAmount(convertedAmount);
                div.appendChild(p);
            }
        }

        element.empty();
        element.append(div);
        element.removeClass();
        element.addClass(className);
        $(document.body).append(element);
    };

    var getSizeClass = function(length) {
        switch (true) {
            case (length <= 10):
                return "small";
            case (length > 10 && length <= 15):
                return "medium";
            default:
                return "large";
        }
    }
}
