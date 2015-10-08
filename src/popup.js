var SettingsHandler = function() {
    var self = this;
    self.currencies = [];
    self.selectedCurrencies = [];
    this.loadDetails = function() {
        chrome.extension.sendMessage(
            {query: "Preferences"},
            function(response) {
                self.currencies = response.allCurrencies;
                self.selectedCurrencies = response.selectedCurrencies;
                self.hostCurrency = response.hostCurrency;
                self.numberFormat = response.numberFormat;
                self.isToggledOff = response.isToggledOff;
                buildToggle();
                buildSelect();
                buildRadio();
                buildCheck();
            }
        )
    }

    var buildToggle = function() {
        var toggle = document.getElementById("toggle");
        toggle.checked = !self.isToggledOff;
        toggle.onchange = function() {
            self.isToggledOff = !this.checked;
            sendUpdate();
        };
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

    var buildRadio = function() {
        var radioIndian = document.getElementById("format-indian");
        var radioEnglish = document.getElementById("format-english");
        radioIndian.checked = self.numberFormat == "INDIAN";
        radioEnglish.checked = self.numberFormat == "ENGLISH";
        radioIndian.onchange = radioToggled;
        radioEnglish.onchange = radioToggled;
    }

    var radioToggled = function() {
       if(this.checked) {
           self.numberFormat = this.value;
           sendUpdate()
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
                hostCurrency: self.hostCurrency,
                numberFormat: self.numberFormat,
                isToggledOff: self.isToggledOff
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