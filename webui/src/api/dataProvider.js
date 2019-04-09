import jQuery from 'jquery';

class DataProvider {
    constructor(webApiUrl) {
        this.webApiUrl = webApiUrl;
    }

    getChart1Overview(callback) {
        let url = this.webApiUrl + '/api/Chart1';
        return this._getData(url, callback);
    }

    getChart1Date(timstamp, callback) {
        let url = this.webApiUrl + '/api/Chart1/' + timstamp;
        return this._getData(url, callback);
    }

    _getData(url, callback) {
        jQuery.ajax({
            method: 'GET',
            dataType: 'json',
            url: url,
            async: false,
            context: document.body,
            success: function(data) {
                callback(data);
            },
        });
    }
}

export default DataProvider;
