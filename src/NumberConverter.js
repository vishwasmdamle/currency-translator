var NumberConverter = function(mode) {

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
                formattedAmount = (amount / number[index].multiple).toFixed(2);
                formattedAmount = formattedAmount + number[index].suffix;
                return formattedAmount;
            }
        }
        return amount;
    }
};
NumberConverter.ENGLISH = 1;
NumberConverter.INDIAN = 2;
