import DateHelper from './dateHelper';

class AxisHelper {
    constructor() {
        this.dateHelper = new DateHelper();
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
        const milliseconds = 1000;
        const seconds = milliseconds * 60;
        const hour = 60 * seconds;
        const day = 24 * hour;
        const week = 7 * day;
        const month28 = 28 * day;
        const month29 = 29 * day;
        const month30 = 30 * day;
        const month31 = 31 * day;
        const year = 7 * month31 + month28 + 4 * month30;
        const leapYear = year + 1;

        let result = new Array();

        if (Math.floor(range / hour) <= ticks) {
            // use hours
            let count = Math.floor(range / hour);
            for (let i = 0; i < count; i++) {
                result.push(startValue);
                startValue += hour;
            }
        } else if (Math.floor(range / day) <= ticks) {
            // use days
            let count = Math.floor(range / day);
            for (let i = 0; i < count + 1; i++) {
                result.push(startValue);
                startValue += day;
            }
        } else if (Math.floor(range / week) <= ticks) {
            // use weeks
            let count = Math.floor(range / week);
            for (let i = 0; i < count + 1; i++) {
                result.push(startValue);
                startValue += week;
            }
        } else if (Math.floor(range / month29) <= ticks) {
            // use months
            result.push(startValue);
            let count = Math.floor(range / month29);
            for (let i = 0; i < count + 1; i++) {
                if (this._isNextMonth28(startValue)) {
                    startValue += month28;
                } else if (this._isNextMonth29(startValue)) {
                    startValue += month29;
                } else if (this._isNextMonth30(startValue)) {
                    startValue += month30;
                } else if (this._isNextMonth31(startValue)) {
                    startValue += month31;
                }
                result.push(startValue);
            }
        } else if (Math.floor(range / year) <= ticks) {
            // use years
            let count = Math.floor(range / year);
            for (let i = 0; i < count + 1; i++) {
                result.push(startValue);
                if (i < count) {
                    if (this._isNextYearLeap(startValue)) {
                        startValue += leapYear;
                    } else {
                        startValue += year;
                    }
                }
            }
        }

        return result;
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
