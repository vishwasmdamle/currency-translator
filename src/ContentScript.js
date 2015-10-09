var translator;
$(document).ready(function() {
    translator = new Translator();
    translator.init();
});
var Translator = function() {
    var self = this;

    var numberConverter;

    this.figureExp;
    this.currencySymbols = "";
    this.init = function() {
        chrome.runtime.sendMessage(
            {query: "CurrencyRateFromCS"},
            function(response) {
                self.currencyData = response;
                if (response.isToggledOff == false) {
                    setupData();
                    tagAllCurrencies();
                    bindHover();
                }
        });
    };

    var setupData = function() {
        numberConverter = new NumberConverter(self.currencyData.numberFormat);

        $.each(self.currencyData.currencyMetadata, function(key, value) {
            if($.inArray(value.id, self.currencyData.selectedCurrencies) != -1 && value.id != self.currencyData.hostCurrency)
                self.currencySymbols += '\\' + value.currencySymbol + '|';
        });
        self.currencySymbols = self.currencySymbols.replace(/\|$/, '');
        var unitsList = 'trillion|billion|million|thousand|tr|tn|bn|mn|m|k';
        self.figureExp = new RegExp('((' + self.currencySymbols + ')[0-9\\., ]*[0-9]([\\ |\u00a0]*('+ unitsList + '))*)(?!([^<]+)?>)', 'gi');
    };

    this.onPreferenceUpdate = function(data) {
        translator.currencyData = data;
        setupData();
    }
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

    var bindHover = function() {
        $(".currency-tag").hover(
            function() {
                var symbol = this.innerText.match(self.currencySymbols);
                var amount = numberConverter.getNumericalAmount(this.innerText);
                new PopupHandler(numberConverter, self.currencyData).displayPopup(symbol, amount);
            },
            function() {
                $('#conversion-popup').hide();
            }
        );
    }
}
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.query == "PreferenceUpdateFromBackground") {
            if (translator) {
                translator.onPreferenceUpdate(request.data);
            }
        }
    }
);