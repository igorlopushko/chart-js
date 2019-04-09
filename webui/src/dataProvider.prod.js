let dataProvider = require('./api/dataProvider').default;

module.exports = {
    create: function(url) {
        return new dataProvider(url);
    },
};
