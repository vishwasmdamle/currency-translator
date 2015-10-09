
var PopupHandler = function(numberConverter, currencyData) {
    var self = this;

    this.displayPopup = function(symbol, amount) {
        self.amount = amount;
        setupPrimaryConversionRate(symbol);

        var popupElement;
        if($('#conversion-popup').length != 0) {
            popupElement = $('#conversion-popup');
            $('#conversion-popup').show();
        } else {
            popupElement = $("<div id='conversion-popup'></div>");
        }

        popupElement.empty();
        popupElement.append(buildPopup());
        setupPopupWidth(popupElement);
        $(document.body).append(popupElement);
    }

    var buildPopup = function() {
        var div = document.createElement('div');
        addIcon(div);
        appendParagraphElement(div,
            currencyData.currencyMetadata[currencyData.hostCurrency].currencySymbol,
            (self.amount / self.primaryConversionRate).toFixed(2));
        div.appendChild(document.createElement('hr'));
        appendOtherCurrencies(div);
        return div;
    };

    var addIcon = function(div) {
        var img = document.createElement('img');
        img.src = chrome.extension.getURL("/images/AegonGold.png");
        div.appendChild(img);
    }

    var appendOtherCurrencies = function(div) {
        $.each(currencyData.currencyMetadata, function(key, value) {
            if($.inArray(value.id, currencyData.selectedCurrencies) != -1 && value.id != currencyData.hostCurrency) {
                convertedAmount = (self.amount / self.primaryConversionRate * value.conversion).toFixed(2);
                appendParagraphElement(div, value.currencySymbol, convertedAmount)
            }
        });
    }

    var appendParagraphElement = function(div, currencySymbol, convertedAmount) {
        p = document.createElement('p');
        p.innerHTML = currencySymbol + ' ' + numberConverter.getFormattedAmount(convertedAmount);
        div.appendChild(p);
    }

    var setupPopupWidth = function(element, p) {
        var className = 'conversion-popup ' + getSizeClass(element.find('p')[0].innerText.length);
        element.removeClass();
        element.addClass(className);
    }

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

    var setupPrimaryConversionRate = function(symbol) {
        var currency;
        $.each(currencyData.currencyMetadata, function(key, value) {
            if(value.currencySymbol == symbol) {currency = value;}
        });
        self.primaryConversionRate = currencyData.currencyMetadata[currency.id].conversion;
    }
}
