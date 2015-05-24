var loadDetails = function() {
    console.log("a");
    chrome.extension.sendMessage(
        {query: "CurrencyList"},
        function(response) {
            var currencies = response.allCurrencies;
            var selectedCurrencies = response.selectedCurrencies;
            var hostCurrency = response.hostCurrency;
            buildSelect(currencies, hostCurrency);
            buildCheck(currencies, selectedCurrencies);
        }
    )
}
document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        loadDetails();
    }
}

var buildSelect = function(currencies, hostCurrency) {
    var option;
    var selectBox = document.getElementById("host-currency");
    selectBox.innerHTML = "";
    for(var index in currencies) {
        option = document.createElement('option');
        option.value = option.innerText = currencies[index];
        if(hostCurrency == currencies[index]) {
            option.selected = true;
        }
        selectBox.appendChild(option);
    }
}

var buildCheck = function(currencies, selectedCurrencies) {
    var check;
    var div = document.getElementById("currency-support");
    div.innerHTML = "";
    for(var index in currencies) {
        check = document.createElement('input');
        var name = document.createElement('span');
        check.type = "checkbox";
        check.id = check.value = name.innerText = currencies[index]
        if(selectedCurrencies.indexOf(currencies[index]) > -1) {
            check.checked = true;
        }

        var innerDiv = document.createElement('div');
        innerDiv.appendChild(check);
        innerDiv.appendChild(name);
        div.appendChild(innerDiv);
    }
}