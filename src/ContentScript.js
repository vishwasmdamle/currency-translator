
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
                if (response.isToggledOff == false) {
                    setupData(response);
                    tagAllCurrencies();
                    bindHover(self.currencyData);
                }
        });
    };

    var setupData = function(response) {
        var format = response.numberFormat == "INDIAN" ? NumberConverter.INDIAN : NumberConverter.ENGLISH;
        numberConverter = new NumberConverter(format);

        $.each(self.currencyData.currencyMetadata, function(key, value) {
            if(value.id != self.currencyData.hostCurrency)
                self.currencySymbols += '\\' + value.currencySymbol + '|';
        });
        self.currencySymbols = self.currencySymbols.replace(/\|$/, '');
        var unitsList = 'trillion|billion|million|thousand|tr|tn|bn|mn|m|k';
        self.figureExp = new RegExp('((' + self.currencySymbols + ')[0-9\\., ]*[0-9]([\\ |\u00a0]*('+ unitsList + '))*)(?!([^<]+)?>)', 'gi');
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
