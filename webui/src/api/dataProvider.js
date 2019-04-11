import jQuery from 'jquery';

class DataProvider {
    constructor(getDataApiUrl, getSpecificDataApiUrl) {
        this.getDataApiUrl = getDataApiUrl;
        this.getSpecificDataApiUrl = getSpecificDataApiUrl;
    }

    getData(callback) {
        jQuery.ajax({
            method: 'GET',
            dataType: 'json',
            url: this.getDataApiUrl,
            async: true,
            context: document.body,
            success: function(data) {
                callback(data);
            },
        });
    }

    getSpecificData(timstamp, callback) {
        jQuery.ajax({
            method: 'GET',
            dataType: 'json',
            url: this.getSpecificDataApiUrl + timstamp,
            async: true,
            context: document.body,
            success: function(data) {
                callback(data);
            },
        });
    }
}

export default DataProvider;
