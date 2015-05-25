var SettingsHandler = function() {
    var self = this;
    self.currencies = [];
    self.selectedCurrencies = [];
    this.loadDetails = function() {
        console.log("a");
        chrome.extension.sendMessage(
            {query: "CurrencyList"},
            function(response) {
                self.currencies = response.allCurrencies;
                self.selectedCurrencies = response.selectedCurrencies;
                self.hostCurrency = response.hostCurrency;
                buildSelect();
                buildCheck();
            }
        )
    }

    var buildSelect = function() {
        var option;
        var selectBox = document.getElementById("host-currency");
        selectBox.innerHTML = "";
        selectBox.onchange = selectChanged;

        for(var index in self.currencies) {
            option = document.createElement('option');
            option.value = option.innerText = self.currencies[index];
            if(self.hostCurrency == self.currencies[index]) {
                option.selected = true;
            }
            selectBox.appendChild(option);
        }
    }

    var buildCheck = function() {
        var check;
        var div = document.getElementById("currency-support");
        div.innerHTML = "";
        for(var index in self.currencies) {
            check = document.createElement('input');
            var name = document.createElement('span');
            check.type = "checkbox";
            check.name = "currency-group";
            check.id = check.value = name.innerText = self.currencies[index]

            if(self.selectedCurrencies.indexOf(self.currencies[index]) > -1) {
                check.checked = true;
            }
            check.onclick = checkboxToggled;

            var innerDiv = document.createElement('div');
            innerDiv.appendChild(check);
            innerDiv.appendChild(name);
            innerDiv.className = "option-unit";
            div.appendChild(innerDiv);
        }
    }

    var checkboxToggled = function() {
        if(this.checked)
            self.selectedCurrencies.push(this.value);
        else
            self.selectedCurrencies.splice(self.selectedCurrencies.indexOf(this.value), 1)
        sendUpdate();
    }

    var selectChanged = function() {
       self.hostCurrency = this.value;
       sendUpdate();
    }

    var sendUpdate = function() {
        chrome.extension.sendMessage({
            query: "DataUpdate",
            data: {
                selectedCurrencies: self.selectedCurrencies,
                hostCurrency: self.hostCurrency
            }
        });
    }
}

var settingsHandler = new SettingsHandler();

document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        settingsHandler.loadDetails();
    }
}