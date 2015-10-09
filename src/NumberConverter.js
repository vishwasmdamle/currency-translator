var NumberConverter = function(modeName) {
    var mode = modeName == "INDIAN" ? NumberConverter.INDIAN : NumberConverter.ENGLISH;

    var unitsList = 'trillion|billion|million|thousand|tr|tn|bn|m|k';
    var unitsRegex = new RegExp(unitsList, 'i');
    var englishNumber = [
        {multiple: 1000 * 1000 * 1000 * 1000, suffix: "tr"},
        {multiple: 1000 * 1000 * 1000, suffix: "bn"},
        {multiple: 1000 * 1000, suffix: "M"},
        {multiple: 1000, suffix: "K"}
    ];

    var indianNumber = [
        {multiple: 100 * 100 * 1000, suffix: "Cr"},
        {multiple: 100 * 1000, suffix: "lac"},
        {multiple: 1000, suffix: "K"}
    ]

    this.getFormattedAmount = function(amount) {
        var number = mode == NumberConverter.INDIAN ? indianNumber : englishNumber;
        var formattedAmount = 0;
        for(var index in number) {
            if (amount / number[index].multiple > 1) {
                formattedAmount = formattedNumber((amount / number[index].multiple).toFixed(2));
                formattedAmount = formattedAmount + number[index].suffix;
                return formattedAmount;
            }
        }
        return amount;
    }

    var formattedNumber = function(number) {
        var language = mode == NumberConverter.INDIAN ? "hin" : "eng";
        return parseFloat(number).toLocaleString(language);
    }

    this.getNumericalAmount = function(amountText) {
        var digitValue = parseFloat(amountText.replace(/[^.0-9]/g, ""));
        if (amountText.search(unitsRegex) != -1) {
            var unit = amountText.match(unitsRegex)[0].toLowerCase();
            switch(unit) {
                case "thousand": case "k":
                    return digitValue * 1000;
                case "million": case "m":
                    return digitValue * 1000 * 1000;
                case "billion": case "bn":
                    return digitValue * 1000 * 1000 * 1000;
                case "trillion": case "tr": case "tn":
                    return digitValue * 1000 * 1000 * 1000 * 1000;
                default:
                    return digitValue;
            }
        } else {
            return digitValue;
        }
    }
};
NumberConverter.ENGLISH = 1;
NumberConverter.INDIAN = 2;
