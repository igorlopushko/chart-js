let chartBuilder = require('./chart-builder/chartBuilder').default;

module.exports = {
    create: function(canvas, data, config) {
        return new chartBuilder(canvas, data, config);
    },
};
