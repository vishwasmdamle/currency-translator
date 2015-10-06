var NumberConverter = function() {
    var englishNumber = [
        {multiple: 1000 * 1000 * 1000 * 1000, suffix: "tr"},
        {multiple: 1000 * 1000 * 1000, suffix: "bn"},
        {multiple: 1000 * 1000, suffix: "M"},
        {multiple: 1000, suffix: "K"}
    ]

    this.getFormattedAmount = function(amount) {
        var formattedAmount = 0;
        for(var index in englishNumber) {
            if (amount / englishNumber[index].multiple > 1) {
                formattedAmount = (amount / englishNumber[index].multiple).toFixed(2);
                formattedAmount = formattedAmount + englishNumber[index].suffix;
                return formattedAmount;
            }
        }
        return amount;
    }
}