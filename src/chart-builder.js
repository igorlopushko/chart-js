import chart from './chart';
import miniMap from './mini-map';

class ChartBuilder {
    constructor(canvas, data) {
        // init canvas internal object
        this.canvas = {
            ctx: canvas.getContext('2d'),
            height: canvas.height,
            width: canvas.width,
            ref: canvas,
        };

        this.data = data;
        this.chart = chart;
        this.miniMap = miniMap;

        // config. has to be calculated or configured

        //this.xMiniMapAxis;
        //this.yMiniMapAxis = new Array();
        this.yMiniMapScaleFactor = 1;
        this.miniMapHeight = 50;
        this.miniMapBorderColor = 'rgba(255, 165, 0, 0.5)';
        this.miniMapBorderWidth = 2;
        this.dragLineWidth = 5;

        this.leftDragLine = { x: 0, y: 0, width: this.dragLineWidth, heigth: this.miniMapHeight };
        this.rigthDragLine = { x: 0, y: 0, width: this.dragLineWidth, heigth: this.miniMapHeight };

        //canvas.addEventListener('mousemove', this._handleMouseMove);
        canvas.addEventListener('mousedown', this);
        //canvas.addEventListener('mouseup', this._handleMouseUp);
        //canvas.addEventListener('mouseout', this._handleMouseOut);

        this._init();
        this._parseData();
        this._calculateData();
        this._drawChartData();
        this._drawMiniMapData();
        this._drawMiniMapFrame();
    }

    handleEvent(event) {
        switch (event.type) {
            case 'mousedown':
                this._handleMouseDown(event);
        }
    }

    _handleMouseDown(event) {
        console.log('mousedown:' + event.offsetX + ' ' + event.offsetY);

        if (event.offsetX >= this.leftDragLine.x && event.offsetX <= this.leftDragLine.x + this.leftDragLine.width) {
            console.log('left');
        }

        if (event.offsetX >= this.rigthDragLine.x && event.offsetX <= this.rigthDragLine.x + this.rigthDragLine.width) {
            console.log('right');
        }
    }

    _handleMouseUp(event) {
        console.log('mouseup:' + event.offsetX + ' ' + event.offsetY);
    }

    _handleMouseMove(event) {
        console.log('mousemove:' + event.offsetX + ' ' + event.offsetY);
    }

    _handleMouseOut(event) {
        console.log('mouseout:' + event.offsetX + ' ' + event.offsetY);
    }

    _init() {
        this.chart.displayStartIndex = 0;
        this.chart.displayEndIndex = this.data.columns[0].length;
    }

    _drawChartData() {
        this.chart.yAxis.columns.forEach((element) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.strokeStyle = this.data.colors[element.name];
            for (let i = 0; i < element.values.length; i++) {
                this.canvas.ctx.lineTo(this.chart.xAxis.values[i], element.values[i]);
            }
            this.canvas.ctx.stroke();
        });
    }

    _drawMiniMapData() {
        this.miniMap.yAxis.columns.forEach((elemnt) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.strokeStyle = this.data.colors[elemnt.name];
            for (let i = 0; i < elemnt.values.length; i++) {
                this.canvas.ctx.lineTo(this.miniMap.xAxis.values[i], elemnt.values[i]);
            }
            this.canvas.ctx.stroke();
        });
    }

    _drawMiniMapFrame() {
        let borderWidth = 1;
        let bottomBorderWidth = 2;
        let sideBorderWidth = 2.5;
        let miniMapX = this.miniMap.xAxis.values[this.chart.displayStartIndex];
        let miniMapY = this.canvas.height - this.miniMapHeight;

        this.canvas.ctx.strokeStyle = this.miniMapBorderColor;

        // left line
        this.canvas.ctx.lineWidth = this.dragLineWidth;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX + sideBorderWidth, miniMapY);
        this.canvas.ctx.lineTo(miniMapX + sideBorderWidth, miniMapY + this.miniMapHeight - bottomBorderWidth);
        this.canvas.ctx.stroke();
        this.leftDragLine.x = miniMapX;
        this.leftDragLine.y = miniMapY;

        // rigth line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(
            this.miniMap.xAxis.values[this.chart.displayEndIndex - 2] - miniMapX - sideBorderWidth,
            miniMapY
        );
        this.canvas.ctx.lineTo(
            miniMapX + this.miniMap.xAxis.values[this.chart.displayEndIndex - 2] - sideBorderWidth,
            miniMapY + this.miniMapHeight - bottomBorderWidth
        );
        this.canvas.ctx.stroke();
        this.rigthDragLine.x =
            miniMapX + this.miniMap.xAxis.values[this.chart.displayEndIndex - 2] - this.dragLineWidth;
        this.rigthDragLine.y = miniMapY;

        // top line
        this.canvas.ctx.lineWidth = this.miniMapBorderWidth;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX, miniMapY - borderWidth);
        this.canvas.ctx.lineTo(miniMapX + this.canvas.width, miniMapY - borderWidth);
        this.canvas.ctx.stroke();

        // bottom line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX, miniMapY + this.miniMapHeight - borderWidth);
        this.canvas.ctx.lineTo(miniMapX + this.canvas.width, miniMapY + this.miniMapHeight - borderWidth);
        this.canvas.ctx.stroke();
    }

    _parseData() {
        let sliceStartIndex = this.chart.displayStartIndex + 1;
        let sliceEndIndex = this.chart.displayEndIndex;
        this.data.columns.slice(0, 1).forEach((column) => {
            this.chart.xAxis = {
                name: column[0],
                originalValues: column.slice(sliceStartIndex, sliceEndIndex),
                values: new Array(),
            };
            this.miniMap.xAxis = {
                name: column[0],
                originalValues: column.slice(sliceStartIndex, sliceEndIndex),
                values: new Array(),
            };
        });
        this.data.columns.slice(1).forEach((column) => {
            this.chart.yAxis.columns.push({
                name: column[0],
                originalValues: column.slice(sliceStartIndex, sliceEndIndex),
                values: new Array(),
            });
            this.miniMap.yAxis.columns.push({
                name: column[0],
                originalValues: column.slice(sliceStartIndex, sliceEndIndex),
                values: new Array(),
            });
        });
    }

    _calculateData() {
        // calcualate axis scale factor
        this.chart.xAxis.scaleFactor = this.canvas.width / (this.chart.xAxis.originalValues.length - 1);
        this.chart.yAxis.scaleFactor = this.canvas.height / this._findMaxValue();
        this.yMiniMapScaleFactor = this.miniMapHeight / this._findMaxValue();

        // get minimap scale factor to multiply Y values
        // shifts all values up to free space for minimap
        let miniMapScaleFactor = (this.canvas.height - this.miniMapHeight) / this.canvas.height;

        // calculate X axis values
        this.chart.xAxis.originalValues.forEach((element, index) => {
            this.chart.xAxis.values.push(index * this.chart.xAxis.scaleFactor);
        });
        this.miniMap.xAxis.originalValues.forEach((element, index) => {
            this.miniMap.xAxis.values.push(index * this.chart.xAxis.scaleFactor);
        });

        // calculate Y axis values
        this.chart.yAxis.columns.forEach((column) => {
            for (let i = 0; i < column.originalValues.length; i++) {
                let scaledY = column.originalValues[i] * this.chart.yAxis.scaleFactor * miniMapScaleFactor;
                let y = this.canvas.height - scaledY - this.miniMapHeight;
                column.values.push(y);
            }
        });
        this.miniMap.yAxis.columns.forEach((column, index) => {
            for (let i = 0; i < this.chart.yAxis.columns[index].originalValues.length; i++) {
                let scaledY = this.chart.yAxis.columns[index].originalValues[i] * this.yMiniMapScaleFactor;
                let y = this.canvas.height - scaledY;
                column.values.push(y);
            }
        });
    }

    // finds Y maximum value. required for calculating scale factor.
    _findMaxValue() {
        let maxValue = 0;
        for (let i = 0; i < this.chart.yAxis.columns.length; i++) {
            let temp = Math.max.apply(null, this.chart.yAxis.columns[i].originalValues);
            if (temp > maxValue) {
                maxValue = temp;
            }
        }
        return maxValue;
    }
}

export default ChartBuilder;
