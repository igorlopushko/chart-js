class Chart {
    constructor(canvas, data) {
        //this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.data = data;
        this.xAxis;
        this.yAxis = new Array();
        this.xMiniMapAxis;
        this.yMiniMapAxis = new Array();

        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        //this.canvasOffset = canvas.offset();

        // config. has to be calculated or configured
        this.xStartIndex = 0;
        this.xEndIndex = 0;
        this.xScaleFactor = 1;
        this.yScaleFactor = 1;
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
        this.xStartIndex = 0;
        this.xEndIndex = this.data.columns[0].length;
    }

    _drawChartData() {
        this.yAxis.forEach((element) => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.data.colors[element.name];
            for (let i = 0; i < element.values.length; i++) {
                this.ctx.lineTo(this.xAxis.values[i], element.values[i]);
            }
            this.ctx.stroke();
        });
    }

    _drawMiniMapData() {
        this.yMiniMapAxis.forEach((elemnt) => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.data.colors[elemnt.name];
            for (let i = 0; i < elemnt.values.length; i++) {
                this.ctx.lineTo(this.xMiniMapAxis.values[i], elemnt.values[i]);
            }
            this.ctx.stroke();
        });
    }

    _drawMiniMapFrame() {
        let borderWidth = 1;
        let bottomBorderWidth = 2;
        let sideBorderWidth = 2.5;
        let miniMapX = this.xMiniMapAxis.values[this.xStartIndex];
        let miniMapY = this.canvasHeight - this.miniMapHeight;

        this.ctx.strokeStyle = this.miniMapBorderColor;

        // left line
        this.ctx.lineWidth = this.dragLineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(miniMapX + sideBorderWidth, miniMapY);
        this.ctx.lineTo(miniMapX + sideBorderWidth, miniMapY + this.miniMapHeight - bottomBorderWidth);
        this.ctx.stroke();
        this.leftDragLine.x = miniMapX;
        this.leftDragLine.y = miniMapY;

        // rigth line
        this.ctx.beginPath();
        this.ctx.moveTo(this.xMiniMapAxis.values[this.xEndIndex - 2] - miniMapX - sideBorderWidth, miniMapY);
        this.ctx.lineTo(
            miniMapX + this.xMiniMapAxis.values[this.xEndIndex - 2] - sideBorderWidth,
            miniMapY + this.miniMapHeight - bottomBorderWidth
        );
        this.ctx.stroke();
        this.rigthDragLine.x = miniMapX + this.xMiniMapAxis.values[this.xEndIndex - 2] - this.dragLineWidth;
        this.rigthDragLine.y = miniMapY;

        // top line
        this.ctx.lineWidth = this.miniMapBorderWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(miniMapX, miniMapY - borderWidth);
        this.ctx.lineTo(miniMapX + this.canvasWidth, miniMapY - borderWidth);
        this.ctx.stroke();

        // bottom line
        this.ctx.beginPath();
        this.ctx.moveTo(miniMapX, miniMapY + this.miniMapHeight - borderWidth);
        this.ctx.lineTo(miniMapX + this.canvasWidth, miniMapY + this.miniMapHeight - borderWidth);
        this.ctx.stroke();
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
            this.xMiniMapAxis = {
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
        this.xScaleFactor = this.canvasWidth / (this.xAxis.originalValues.length - 1);
        this.yScaleFactor = this.canvasHeight / this._findMaxValue();
        this.yMiniMapScaleFactor = this.miniMapHeight / this._findMaxValue();

        // get minimap scale factor to multiply Y values
        // shifts all values up to free space for minimap
        let miniMapScaleFactor = (this.canvasHeight - this.miniMapHeight) / this.canvasHeight;

        // calculate X axis values
        this.xAxis.originalValues.forEach((element, index) => {
            this.xAxis.values.push(index * this.xScaleFactor);
        });
        this.xMiniMapAxis.originalValues.forEach((element, index) => {
            this.xMiniMapAxis.values.push(index * this.xScaleFactor);
        });

        // calculate Y axis values
        this.yAxis.forEach((column) => {
            for (let i = 0; i < column.originalValues.length; i++) {
                let scaledY = column.originalValues[i] * this.yScaleFactor * miniMapScaleFactor;
                let y = this.canvasHeight - scaledY - this.miniMapHeight;
                column.values.push(y);
            }
        });
        this.yMiniMapAxis.forEach((column) => {
            for (let i = 0; i < column.originalValues.length; i++) {
                let scaledY = column.originalValues[i] * this.yMiniMapScaleFactor;
                let y = this.canvasHeight - scaledY;
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
