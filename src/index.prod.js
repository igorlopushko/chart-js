let chartBuilder = require('./chart-builder/chartBuilder').default;

module.exports = {
    create: function(canvas, data) {
        return new chartBuilder(canvas, data);
    },
};
