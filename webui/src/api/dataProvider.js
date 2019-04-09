class DataProvider {
    constructor(webApiUrl) {
        this.webApiUrl = webApiUrl;
    }

    getChart1Overview() {
        let url = this.webApiUrl + '/api/Chart1';
        return this._getData;
    }

    getChart1Date(timstamp) {
        let url = this.webApiUrl + '/api/Chart1/' + timstamp;
        return this._getData;
    }

    _getData(url) {
        $.ajax({
            dataType: 'json',
            url: url,
            async: false,
            context: document.body,
        }).success(function(data) {
            return data;
        });
    }
}
