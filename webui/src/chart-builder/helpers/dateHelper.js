class DateHelper {
    getMonthShortName(index) {
        switch (index) {
            case 0:
                return 'Jan';
            case 1:
                return 'Feb';
            case 2:
                return 'Mar';
            case 3:
                return 'Apr';
            case 4:
                return 'May';
            case 5:
                return 'Jun';
            case 6:
                return 'Jul';
            case 7:
                return 'Aug';
            case 8:
                return 'Sep';
            case 9:
                return 'Oct';
            case 10:
                return 'Nov';
            case 11:
                return 'Dec';
        }
    }

    getMonthName(index) {
        switch (index) {
            case 0:
                return 'January';
            case 1:
                return 'February';
            case 2:
                return 'March';
            case 3:
                return 'April';
            case 4:
                return 'May';
            case 5:
                return 'June';
            case 6:
                return 'July';
            case 7:
                return 'August';
            case 8:
                return 'September';
            case 9:
                return 'Octoner';
            case 10:
                return 'November';
            case 11:
                return 'December';
        }
    }

    getDayShortName(index) {
        switch (index) {
            case 0:
                return 'Mon';
            case 1:
                return 'Tue';
            case 2:
                return 'Wed';
            case 3:
                return 'Thu';
            case 4:
                return 'Fri';
            case 5:
                return 'Sat';
            case 6:
                return 'Sun';
        }
    }

    // converts UNIX timestamp in milliseconds to Date
    convertToDate(value) {
        return new Date(value);
    }
}

export default DateHelper;
