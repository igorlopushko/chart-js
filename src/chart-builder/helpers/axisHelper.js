import DateHelper from './dateHelper';

class AxisHelper {
    constructor() {
        this.dateHelper = new DateHelper();
        this.milliseconds = 1000;
        this.seconds = this.milliseconds * 60;
        this.hour = 60 * this.seconds;
        this.day = 24 * this.hour;
        this.week = 7 * this.day;
        this.month28 = 28 * this.day;
        this.month29 = 29 * this.day;
        this.month30 = 30 * this.day;
        this.month31 = 31 * this.day;
        this.year = 7 * this.month31 + this.month28 + 4 * this.month30;
        this.leapYear = this.year + 1;
    }

    getAxisLabelsMultiplier(maxValue, tickCount) {
        let range = maxValue;
        let unroundedTickSize = range / (tickCount - 1);
        let x = Math.ceil(Math.log10(unroundedTickSize) - 1);
        let pow10x = Math.pow(10, x);
        return Math.ceil(unroundedTickSize / pow10x) * pow10x;
    }

    getDateIncrementsForAxis(startValue, endValue, ticks) {
        let range = endValue - startValue;

        let result = new Array();

        if (Math.floor(range / this.hour) <= ticks) {
            // use hours
            let count = Math.floor(range / this.hour);
            for (let i = 0; i < count; i++) {
                result.push(startValue);
                startValue += this.hour;
            }
        } else if (Math.floor(range / this.day) <= ticks) {
            // use days
            let count = Math.floor(range / this.day);
            for (let i = 0; i < count + 1; i++) {
                result.push(startValue);
                startValue += this.day;
            }
        } else if (Math.floor(range / this.week) <= ticks) {
            // use weeks
            result.push(startValue);
            let count = Math.floor(range / this.week);
            for (let i = 0; i < count + 1; i++) {
                startValue += this.week;
                result.push(startValue);
            }
        } else if (Math.floor(range / (this.week * 2)) <= ticks) {
            // use 2 weeks
            result.push(startValue);
            let count = Math.floor(range / (this.week * 2));
            for (let i = 0; i < count + 1; i++) {
                startValue += this.week;
                startValue += this.week;
                result.push(startValue);
            }
        } else if (Math.floor(range / this.month29) <= ticks) {
            // use months
            result.push(startValue);
            let count = Math.floor(range / this.month29);
            for (let i = 0; i < count + 1; i++) {
                startValue += this._getNextMonths(startValue);
                result.push(startValue);
            }
        } else if (Math.floor(range / (this.month29 * 2) <= ticks)) {
            // use every 2 months
            result.push(startValue);
            let count = Math.floor(range / (this.month29 * 2));
            for (let i = 0; i < count + 1; i++) {
                startValue += this._getNextMonths(startValue);
                startValue += this._getNextMonths(startValue);
                result.push(startValue);
            }
        } else if (Math.floor(range / (this.month29 * 3) <= ticks)) {
            // use every 3 months
            result.push(startValue);
            let count = Math.floor(range / (this.month29 * 3));
            for (let i = 0; i < count + 1; i++) {
                startValue += this._getNextMonths(startValue);
                startValue += this._getNextMonths(startValue);
                startValue += this._getNextMonths(startValue);
                result.push(startValue);
            }
        } else if (Math.floor(range / (this.month29 * 6) <= ticks)) {
            // use every 6 months
            result.push(startValue);
            let count = Math.floor(range / (this.month29 * 6));
            for (let i = 0; i < count + 1; i++) {
                startValue += this._getNextMonths(startValue);
                startValue += this._getNextMonths(startValue);
                startValue += this._getNextMonths(startValue);
                startValue += this._getNextMonths(startValue);
                startValue += this._getNextMonths(startValue);
                startValue += this._getNextMonths(startValue);
                result.push(startValue);
            }
        } else if (Math.floor(range / this.year) <= ticks) {
            // use years
            let count = Math.floor(range / this.year);
            for (let i = 0; i < count + 1; i++) {
                result.push(startValue);
                if (i < count) {
                    if (this._isNextYearLeap(startValue)) {
                        startValue += this.leapYear;
                    } else {
                        startValue += this.year;
                    }
                }
            }
        }

        return result;
    }

    _getNextMonths(currentValue) {
        if (this._isNextMonth28(currentValue)) {
            return this.month28;
        } else if (this._isNextMonth29(currentValue)) {
            return this.month29;
        } else if (this._isNextMonth30(currentValue)) {
            return this.month30;
        } else if (this._isNextMonth31(currentValue)) {
            return this.month31;
        }
    }

    _isNextYearLeap(timestamp) {
        let date = this.dateHelper.convertToDate(timestamp);
        let year = date.getFullYear() + 1;
        if (this._isLeapYear(year)) {
            return true;
        }
        return false;
    }

    _isLeapYear(year) {
        return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
    }

    _isNextMonth28(timestamp) {
        let date = this.dateHelper.convertToDate(timestamp);
        if (date.getMonth() == 1) {
            if (this._isLeapYear(date.getFullYear())) {
                return false;
            }
            return true;
        }
        return false;
    }

    _isNextMonth29(timestamp) {
        let date = this.dateHelper.convertToDate(timestamp);
        if (date.getMonth() == 1) {
            if (this._isLeapYear(date.getFullYear())) {
                return true;
            }
            return false;
        }
        return false;
    }

    _isNextMonth30(timestamp) {
        let date = this.dateHelper.convertToDate(timestamp);
        let monthIndex = date.getMonth() == 11 ? 0 : date.getMonth();
        switch (monthIndex) {
            case 3:
            case 5:
            case 8:
            case 10:
                return true;
        }
        return false;
    }

    _isNextMonth31(timestamp) {
        let date = this.dateHelper.convertToDate(timestamp);
        let monthIndex = date.getMonth() == 11 ? 0 : date.getMonth();
        switch (monthIndex) {
            case 0:
            case 2:
            case 4:
            case 6:
            case 7:
            case 9:
            case 11:
                return true;
        }
        return false;
    }
}

export default AxisHelper;
