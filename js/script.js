const forms = document.querySelectorAll(".form-container");
const ranges = document.querySelectorAll(".form-container__range");
const table = document.querySelector("table");
const graphicButton = document.querySelector(".schedule-button");


document.querySelector(".download-table").addEventListener("click", () => {
    graphicButton.click();
    let file = new Blob([table.outerHTML], {type: "application/vnd.ms-excel"});
    saveAs(file, "table.xls");
})


graphicButton.addEventListener("click", () => {
    const tableContainer = document.querySelector(".table-container");

    tableContainer.style.opacity = "1";

    let {monthPercent, monthlyPayment, creditSum, creditContributionPeriod} = calculateInput();
    fillOutTable(monthPercent, monthlyPayment, creditSum, creditContributionPeriod);
})


function formatDate(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;

    return day + '.' + month + '.' + year;
}
function calculateInput() {


    const cost = +forms[0].querySelector(".form-container__number").value.replaceAll(/[^\d,]/g, '');
    const creditContribution = +forms[1].querySelector(".form-container__number").value.replaceAll(/[^\d,]/g, '');
    const creditContributionPeriod = +forms[2].querySelector(".form-container__number").value.replaceAll(/[^\d,]/g, '');
    const percentage = +forms[3].querySelector(".form-container__number").value.replace(",", ".");

    const creditSum = cost - creditContribution;
    const monthPercent = percentage * 0.01 / 12;
    const creditContributionPeriodMonths = creditContributionPeriod * 12;

    const monthlyPayment =  creditSum * (monthPercent * (1 + monthPercent) ** creditContributionPeriodMonths) / ((1 + monthPercent) ** creditContributionPeriodMonths - 1);
    const credintPercentageSum = monthlyPayment * creditContributionPeriodMonths;
    const expectedIncome = monthlyPayment / 0.6;
    const mortgageInfo = {
        creditSum: creditSum,
        monthlyPayment: monthlyPayment,
        credintPercentageSum: credintPercentageSum,
        expectedIncome: expectedIncome,
        monthPercent: monthPercent,
        creditContributionPeriod: creditContributionPeriod,
    }

    showOutput(creditSum, monthlyPayment, credintPercentageSum, expectedIncome);
    return mortgageInfo;
}

function fillOutTable(monthPercent, monthlyPayment, creditSum, creditContributionPeriod ){
    table.innerHTML = `
        <tr>
            <th>Номер платежа</th>
            <th>Дата платежа</th>
            <th>Остаток долга</th>
            <th>В погашение долга</th>
            <th>В погашение процентов</th>
            <th>Платеж</th>
        </tr>
    `;

    let remainingDebt = creditSum;
    let currentDate = new Date();
    let principalTotal = 0;
    let interestTotal = 0;
    let paymentTotal = 0;
    for (let paymentNumber = 1; paymentNumber <= creditContributionPeriod * 12; paymentNumber++) {
        let interestPay = remainingDebt * monthPercent;
        let principalPay = monthlyPayment - interestPay;
        remainingDebt -= principalPay;
        currentDate.setMonth(currentDate.getMonth() + 1);
        const row = `
            <tr>
                <td>${paymentNumber}</td>
                <td>${formatDate(currentDate)}</td>
                <td>${remainingDebt.toFixed(2)}</td>
                <td>${principalPay.toFixed(2)}</td>
                <td>${interestPay.toFixed(2)}</td>
                <td>${monthlyPayment.toFixed(2)}</td>
            </tr>
        `;
        table.innerHTML += row;

        principalTotal += +principalPay.toFixed(2);
        interestTotal += +interestPay.toFixed(2);
        paymentTotal += +monthlyPayment.toFixed(2);
    }
    const result = `
        <tr>
            <td colspan="3">Всего</td>
            <td>${Math.round(principalTotal)}</td>
            <td>${Math.round(interestTotal)}</td>
            <td>${Math.round(paymentTotal)}</td>
        </tr>
    `
    table.innerHTML += result;
}

function showOutput(creditSum, monthlyPayment, credintPercentageSum, expectedIncome) {
    document.querySelector(".monthly-payment__price").innerHTML = formatNumberWithSpace(Math.round(monthlyPayment)) + " ₽";
    
    const costs = document.querySelectorAll(".list-item__cost");
    
    costs[0].innerHTML = formatNumberWithSpace(Math.round(creditSum)) + " ₽";
    costs[1].innerHTML = formatNumberWithSpace(Math.round(credintPercentageSum - creditSum)) + " ₽";
    costs[2].innerHTML = formatNumberWithSpace(Math.round(credintPercentageSum)) + " ₽";
    costs[3].innerHTML = formatNumberWithSpace(Math.round(expectedIncome)) + " ₽";

}


function formatNumberWithSpace(number, rangeMax = Number.MAX_VALUE) {
    let num = number.toString().replaceAll(" ", "");
    if (+number >= rangeMax) {
        num = rangeMax.toString();
    }
    if (Number.isInteger(+num)) {
        let result = num
            .split('')
            .reverse()
            .map((digit, index) => (index % 3 === 0 && index !== 0) ? digit + ' ' : digit)
            .reverse()
            .join('');
        return result;
    } else {
        return num.replace(".", ",");
    }
}



function handleInputChange(event) {
    const input = event.target;
    const cursorStart = input.selectionStart;
    const cursorEnd = input.selectionEnd;

    const form = input.closest(".form-container");
    const range = form.querySelector(".form-container__range");
    const inputValue = input.value.replaceAll(/[^\d,]/g, '');
    
    range.value = +inputValue;
    input.value = formatNumberWithSpace(inputValue, range.max);

    input.setSelectionRange(cursorStart, cursorEnd);

    const newInputValue = inputValue.replaceAll(/[^\d,]/g, '');
    const rangeContribution = forms[1].querySelector(".form-container__range");
    const inputContribution = forms[1].querySelector(".form-container__number");

    if (form === forms[0]) {
        rangeContribution.max = +newInputValue;
        if (+inputContribution.value.replaceAll(/[^\d,]/g, '') > rangeContribution.max) {
            inputContribution.value = formatNumberWithSpace(rangeContribution.max);
        }
    }
    addSliderGradient();
    calculateInput();
}

function handleRangeChange(event) {
    const range = event.target;
    const form = range.closest(".form-container");
    const input = form.querySelector(".form-container__number");
    input.value = formatNumberWithSpace(range.value, range.max);
    const newInputValue = input.value.replaceAll(/[^\d,]/g, '');

    const rangeContribution = forms[1].querySelector(".form-container__range");
    const inputContribution = forms[1].querySelector(".form-container__number");
    

    if (form === forms[0]) {
        rangeContribution.max = +newInputValue;
        if (+inputContribution.value.replaceAll(/[^\d,]/g, '') > rangeContribution.max) {
            inputContribution.value = formatNumberWithSpace(rangeContribution.max);
        }
    }
    addSliderGradient();
    calculateInput();
}


function formButtonsClick(event) {
    event.preventDefault();
    const button = event.target;
    let value = button.innerHTML.replaceAll(/[^\d,]/g, '');
    const form =   button.closest(".form-container");
    const input = form.querySelector(".form-container__number");
    const range = form.querySelector(".form-container__range");
    input.value = form == forms[1] 
        ? formatNumberWithSpace((value / 100) * +forms[0].querySelector(".form-container__range").value) 
        : formatNumberWithSpace(value);
    
    range.value = form == forms[1] 
    ? value / 100 * +forms[0].querySelector(".form-container__range").value
    : value;
    addSliderGradient();
    calculateInput();
}


function addSliderGradient(){
    for(let range of ranges){
        const percentage = (range.value - range.min) / (range.max - range.min) * 100;
        range.style.background = `linear-gradient(to right, #B5A08D ${percentage}%, #DCDCDC ${percentage}%)`;

    }
}




calculateInput();
addSliderGradient();
forms.forEach((form) => {
    form.addEventListener("submit", function(event) {
        event.preventDefault();     
    });
    const textInput = form.querySelector(".form-container__number");
    const rangeInput = form.querySelector(".form-container__range");
    const buttons = form.querySelectorAll(".button-container__button");
    if(buttons) {
        buttons.forEach((button) => {
            button.addEventListener("click", formButtonsClick);
        });
    }
    textInput.addEventListener("input", handleInputChange);
    rangeInput.addEventListener("input", handleRangeChange);
});


