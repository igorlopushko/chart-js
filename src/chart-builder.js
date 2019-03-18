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
        this.miniMap.frame.border.color = 'rgba(255, 165, 0, 0.5)';

        this.isDragging = false;
        this.draggingObj = '';

        canvas.addEventListener('mousedown', this);
        canvas.addEventListener('mouseup', this);
        //canvas.addEventListener('mousemove', this._handleMouseMove);
        //canvas.addEventListener('mouseout', this._handleMouseOut);

        this._init();
        this._parseData();
        this._calculateData();
        this._drawChartData();
        this._drawMiniMapData();
        this._drawMiniMapFrame();
    }

    handleEvent(event) {
        event.stopPropagation();
        switch (event.type) {
            case 'mousedown':
                this._handleMouseDown(event);
                break;
            case 'mouseup':
                this._handleMouseUp(event);
                break;
        }
    }

    _handleMouseDown(event) {
        console.log('mousedown:' + event.offsetX + ' ' + event.offsetY);

        if (
            event.offsetX >= this.miniMap.frame.x &&
            event.offsetX <= this.miniMap.frame.leftDragLine.x + this.miniMap.frame.leftDragLine.width &&
            event.offsetY >= this.miniMap.frame.y &&
            event.offsetY <= this.miniMap.frame.leftDragLine.y + this.miniMap.frame.leftDragLine.height
        ) {
            console.log('left');
            this.isDragging = true;
            this.draggingObj = 'leftDragLine';
        } else if (
            event.offsetX >= this.miniMap.frame.rightDragLine.x &&
            event.offsetX <= this.miniMap.frame.rightDragLine.x + this.miniMap.frame.rightDragLine.width &&
            event.offsetY >= this.miniMap.frame.rightDragLine.y &&
            event.offsetY <= this.miniMap.frame.rightDragLine.y + this.miniMap.frame.rightDragLine.height
        ) {
            console.log('right');
            this.isDragging = true;
            this.draggingObj = 'rightDragLine';
        } else if (
            event.offsetX >= this.miniMap.frame.rect.x &&
            event.offsetX <= this.miniMap.frame.rect.x + this.miniMap.frame.rect.width &&
            event.offsetY >= this.miniMap.frame.rect.y &&
            event.offsetY <= this.miniMap.frame.rect.y + this.miniMap.frame.rect.height
        ) {
            console.log('frame');
            this.isDragging = true;
            this.draggingObj = 'dragFrame';
        }
    }

    _handleMouseUp(event) {
        console.log('mouseup:' + event.offsetX + ' ' + event.offsetY);
        this.isDragging = false;
        this.draggingObj = '';
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
        let miniMapY = this.canvas.height - this.miniMap.height;

        this.canvas.ctx.strokeStyle = miniMap.frame.border.color;

        // left line
        this.canvas.ctx.lineWidth = this.miniMap.frame.dragLineWidth;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX + sideBorderWidth, miniMapY);
        this.canvas.ctx.lineTo(miniMapX + sideBorderWidth, miniMapY + this.miniMap.height - bottomBorderWidth);
        this.canvas.ctx.stroke();
        this.miniMap.frame.leftDragLine.x = miniMapX;
        this.miniMap.frame.leftDragLine.y = miniMapY;

        // rigth line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(
            this.miniMap.xAxis.values[this.chart.displayEndIndex - 2] - miniMapX - sideBorderWidth,
            miniMapY
        );
        this.canvas.ctx.lineTo(
            miniMapX + this.miniMap.xAxis.values[this.chart.displayEndIndex - 2] - sideBorderWidth,
            miniMapY + this.miniMap.height - bottomBorderWidth
        );
        this.canvas.ctx.stroke();
        this.miniMap.frame.rightDragLine.x =
            miniMapX + this.miniMap.xAxis.values[this.chart.displayEndIndex - 2] - this.miniMap.frame.dragLineWidth;
        this.miniMap.frame.rightDragLine.y = miniMapY;

        // top line
        this.canvas.ctx.lineWidth = this.miniMap.frame.border.width;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX, miniMapY - borderWidth);
        this.canvas.ctx.lineTo(miniMapX + this.canvas.width, miniMapY - borderWidth);
        this.canvas.ctx.stroke();

        // bottom line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX, miniMapY + this.miniMap.height - borderWidth);
        this.canvas.ctx.lineTo(miniMapX + this.canvas.width, miniMapY + this.miniMap.height - borderWidth);
        this.canvas.ctx.stroke();

        this.miniMap.frame.rect.x = this.miniMap.frame.leftDragLine.x + this.miniMap.frame.leftDragLine.width;
        this.miniMap.frame.rect.y = this.miniMap.frame.leftDragLine.y;
        this.miniMap.frame.rect.height = this.miniMap.frame.leftDragLine.height;
        this.miniMap.frame.rect.width = this.miniMap.frame.rightDragLine.x - this.miniMap.frame.rect.x;
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
        let maxValue = this._findMaxValue();
        this.chart.xAxis.scaleFactor = this.canvas.width / (this.chart.xAxis.originalValues.length - 1);
        this.chart.yAxis.scaleFactor = this.canvas.height / maxValue;
        this.miniMap.xAxis.scaleFactor = this.canvas.width / (this.chart.xAxis.originalValues.length - 1);
        this.miniMap.yAxis.scaleFactor = this.miniMap.height / maxValue;

        // get minimap scale factor to multiply Y values
        // shifts all values up to free space for minimap
        let miniMapScaleShift = (this.canvas.height - this.miniMap.height) / this.canvas.height;

        // calculate X axis values
        this.chart.xAxis.originalValues.forEach((element, index) => {
            this.chart.xAxis.values.push(index * this.chart.xAxis.scaleFactor);
        });
        this.miniMap.xAxis.originalValues.forEach((element, index) => {
            this.miniMap.xAxis.values.push(index * this.miniMap.xAxis.scaleFactor);
        });

        // calculate Y axis values
        this.chart.yAxis.columns.forEach((column) => {
            for (let i = 0; i < column.originalValues.length; i++) {
                let scaledY = column.originalValues[i] * this.chart.yAxis.scaleFactor * miniMapScaleShift;
                let y = this.canvas.height - scaledY - this.miniMap.height;
                column.values.push(y);
            }
        });
        this.miniMap.yAxis.columns.forEach((column, index) => {
            for (let i = 0; i < this.chart.yAxis.columns[index].originalValues.length; i++) {
                let scaledY = this.chart.yAxis.columns[index].originalValues[i] * this.miniMap.yAxis.scaleFactor;
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
