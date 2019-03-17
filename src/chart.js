class Chart {
    constructor(canvas, data) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.data = data;
        this.xAxis;
        this.yAxis = new Array();
        this.yMiniMapAxis = new Array();

        // config. has to be calculated or configured
        this.chartWidth = canvas.width;
        this.chartHeight = canvas.height;
        this.xStartIndex = 0;
        this.xEndIndex = 0;
        this.xScaleFactor = 1;
        this.yScaleFactor = 1;
        this.yMiniMapScaleFactor = 1;
        this.miniMapHeight = 50;

        this._init();
        this._parseData();
        this._calculateData();
        this._draw();
    }

    _init() {
        this.xStartIndex = 0;
        this.xEndIndex = this.data.columns[0].length;
    }

    _draw() {
        for (let i = 0; i < this.yAxis.length; i++) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.data.colors[this.yAxis[i].name];
            for (let j = 0; j < this.yAxis[i].values.length; j++) {
                this.ctx.lineTo(this.xAxis.values[j], this.yAxis[i].values[j]);
            }
            this.ctx.stroke();
        }

        for (let i = 0; i < this.yMiniMapAxis.length; i++) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.data.colors[this.yAxis[i].name];
            for (let j = 0; j < this.yMiniMapAxis[i].values.length; j++) {
                this.ctx.lineTo(this.xAxis.values[j], this.yMiniMapAxis[i].values[j]);
            }
            this.ctx.stroke();
        }
    }

    _parseData() {
        let sliceStartIndex = this.xStartIndex + 1;
        let sliceEndIndex = this.xEndIndex;
        this.data.columns.slice(0, 1).forEach((column) => {
            this.xAxis = {
                name: column[0],
                originalValues: column.slice(sliceStartIndex, sliceEndIndex),
                values: new Array(),
            };
        });
        this.data.columns.slice(1).forEach((column) => {
            this.yAxis.push({
                name: column[0],
                originalValues: column.slice(sliceStartIndex, sliceEndIndex),
                values: new Array(),
            });
            this.yMiniMapAxis.push({
                name: column[0],
                originalValues: column.slice(sliceStartIndex, sliceEndIndex),
                values: new Array(),
            });
        });
    }

    _calculateData() {
        // calcualate axis scale factor
        this.xScaleFactor = this.chartWidth / this.xAxis.originalValues.length;
        this.yScaleFactor = this.chartHeight / this._findMaxValue();
        this.yMiniMapScaleFactor = this.miniMapHeight / this._findMaxValue();

        // get minimap scale factor to multiply Y values
        // shifts all values up to free space for minimap
        let miniMapScaleFactor = (this.chartHeight - this.miniMapHeight) / this.chartHeight;

        // calculate X axis values
        for (let i = 0; i < this.xAxis.originalValues.length; i++) {
            this.xAxis.values.push(i * this.xScaleFactor);
        }

        // calculate Y axis values
        this.yAxis.forEach((column) => {
            for (let i = 0; i < column.originalValues.length; i++) {
                let scaledY = column.originalValues[i] * this.yScaleFactor * miniMapScaleFactor;
                let y = this.chartHeight - scaledY - this.miniMapHeight;
                column.values.push(y);
            }
        });
        this.yMiniMapAxis.forEach((column) => {
            for (let i = 0; i < column.originalValues.length; i++) {
                let scaledY = column.originalValues[i] * this.yMiniMapScaleFactor;
                let y = this.chartHeight - scaledY;
                column.values.push(y);
            }
        });
    }

    // finds Y maximum value. required for calculating scale factor.
    _findMaxValue() {
        let maxValue = 0;
        for (let i = 0; i < this.yAxis.length; i++) {
            let temp = Math.max.apply(null, this.yAxis[i].originalValues);
            if (temp > maxValue) {
                maxValue = temp;
            }
        }
        return maxValue;
    }
}

export default Chart;
