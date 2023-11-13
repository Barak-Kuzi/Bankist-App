'use strict';

// Data
const account1 = {
    owner: 'Barak Kuzi',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,
    movementsDates: [
        '2019-11-18T21:31:17.178Z',
        '2019-12-23T07:42:02.383Z',
        '2020-01-28T09:15:04.904Z',
        '2020-04-01T10:17:24.185Z',
        '2020-05-08T14:11:59.604Z',
        '2023-11-09T17:01:17.194Z',
        '2023-11-12T23:36:17.929Z',
        '2023-11-13T10:51:36.790Z',
    ],
    currency: 'ILS',
    locale: 'he-IL',
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-04-10T14:43:26.374Z',
        '2020-06-25T18:49:59.371Z',
        '2020-07-26T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let currentAccount, timerAccount;
let sorted = false;

// Functions

const createUsername = function (accArray){
    accArray.forEach(function (accElement){
        accElement.username = accElement.owner.toLowerCase().split(' ')
            .map(element => element[0]).join('');
    });
}

const startLogOutTimer = function (){
    let time = 120;
    const funcTimer = function () {
        const minutes = String(Math.trunc(time / 60)).padStart(2, '0');
        const seconds = String(time % 60).padStart(2, '0');
        labelTimer.textContent = `${minutes}:${seconds}`;
        if (time === 0) {
            clearInterval(logOutTimer);
            labelWelcome.textContent = 'Log in to get started';
            containerApp.style.opacity = 0;
        }
        time -= 1;
    };
    funcTimer();
    const logOutTimer = setInterval(funcTimer, 1000);
    return logOutTimer;
}

const formatDisplayDate = function (date, locale){
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs((date2 - date1) / (60 * 60 * 24 * 1000)));
    const daysPassed = calcDaysPassed(new Date(), date);
    if (daysPassed === 0) return `Today`;
    if (daysPassed === 1) return `Yesterday`;
    if (daysPassed <= 7) return `${daysPassed} days ago`;
    return new Intl.DateTimeFormat(locale).format(date);
}

const formatCurrency = function (value, locale, currencyAcc){
    return new Intl.NumberFormat(locale, {style: 'currency', currency: currencyAcc}).format(value);
}

const displayMovements = function (currentAcc, sort = false){
    containerMovements.innerHTML = '';
    const movementsSort = sort ? currentAcc.movements.slice().sort((a, b) => a - b)
        : currentAcc.movements;

    movementsSort.forEach(function (mov, index){
        const typeMov = mov > 0 ? 'deposit' : 'withdrawal';
        const movDate = new Date(currentAcc.movementsDates[index]);
        const displayDate = formatDisplayDate(movDate, currentAcc.locale);
        const formatMov = formatCurrency(mov, currentAcc.locale, currentAcc.currency);
        const html =
            `<div class="movements__row">
                <div class="movements__type movements__type--${typeMov}">${index + 1} ${typeMov}</div>
                <div class="movements__date">${displayDate}</div>
                <div class="movements__value">${formatMov}</div>
            </div>`;
        containerMovements.insertAdjacentHTML('afterbegin', html);
    });
};

const calcAndDisplayBalance = function (account){
    account.balance = account.movements.reduce((acc, element) => acc + element, 0);
    labelBalance.textContent = formatCurrency(account.balance, account.locale, account.currency);
}

const calcAndDisplaySummary = function (account){
    const sumIn = account.movements.filter((mov) => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = formatCurrency(sumIn, account.locale, account.currency);

    const sumOut = account.movements.filter((mov) => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumOut.textContent = formatCurrency(Math.abs(sumOut), account.locale, account.currency);

    const sumInterest = account.movements.filter((mov) => mov > 0)
        .map((deposit) => (deposit * account.interestRate) / 100)
        .filter((interest) => interest >= 1)
        .reduce((acc, interest) => acc + interest, 0);
    labelSumInterest.textContent = formatCurrency(sumInterest, account.locale, account.currency);
}

const displayDetailsAccount = function (currentAcc){
    displayMovements(currentAcc);
    calcAndDisplayBalance(currentAcc);
    calcAndDisplaySummary(currentAcc);
}

// Buttons

btnLogin.addEventListener('click', function (event){
    event.preventDefault();     // Prevent form from submitting
    currentAccount = accounts.find((acc) => acc.username === inputLoginUsername.value);
    if (currentAccount?.pin === Number(inputLoginPin.value)){
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
        const currentDate = new Date();
        const options = {day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'};
        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(currentDate);
        containerApp.style.opacity = 100;
        inputLoginUsername.value = '';
        inputLoginPin.value = '';
        inputLoginPin.blur();
        if (timerAccount)
            clearInterval(timerAccount);
        timerAccount = startLogOutTimer();
        displayDetailsAccount(currentAccount);
    }
});

btnTransfer.addEventListener('click', function (event){
    event.preventDefault();     // Prevent form from submitting
    const amountTransfer = Number(inputTransferAmount.value);
    const receiverAccount = accounts.find((acc) => acc.username === inputTransferTo.value);
    inputTransferTo.value = '';
    inputTransferAmount.value = '';
    if (amountTransfer > 0 && currentAccount.balance >= amountTransfer
        && receiverAccount?.username !== currentAccount.username){
        currentAccount.movements.push(-amountTransfer);
        receiverAccount.movements.push(amountTransfer);
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAccount.movementsDates.push(new Date().toISOString());
        displayDetailsAccount(currentAccount);
        clearInterval(timerAccount);
        timerAccount = startLogOutTimer();
    }
});

btnLoan.addEventListener('click', function (event){
    event.preventDefault();     // Prevent form from submitting
    const loanAmount = Math.floor(inputLoanAmount.value);
    if (loanAmount > 0 && currentAccount.movements.some((mov) => mov >= loanAmount * 0.1)){
        setTimeout(function (){
            currentAccount.movements.push(loanAmount);
            currentAccount.movementsDates.push(new Date().toISOString());
            displayDetailsAccount(currentAccount);
            clearInterval(timerAccount);
            timerAccount = startLogOutTimer();
        }, 2000);
    }
    inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (event){
    event.preventDefault();     // Prevent form from submitting
    if(currentAccount.username === inputCloseUsername.value && currentAccount.pin === Number(inputClosePin.value)){
        const currentIndex = accounts.findIndex((account) =>
            account.username === currentAccount.username);
        accounts.splice(currentIndex, 1);
        containerApp.style.opacity = 0;
        labelWelcome.textContent = 'Log in to get started';
    }
    inputCloseUsername.value = '';
    inputClosePin.value = '';

});

btnSort.addEventListener('click', function (event){
    event.preventDefault();
    displayMovements(currentAccount, !sorted);
    sorted = !sorted;
});

// Init Program
createUsername(accounts);