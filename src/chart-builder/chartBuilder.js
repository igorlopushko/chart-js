import chart from './chart';
import miniMap from './miniMap';
import * as ActionTypes from './dragActionTypes';
import DateHelper from './helpers/dateHelper';
import AxisHelper from './helpers/axisHelper';

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
        this.dateHelper = new DateHelper();
        this.axisHelper = new AxisHelper();

        /* internal veriables */
        this.isDragging = false;
        this.drawInfo = false;
        this.draggingObj = '';
        this.clickX = 0;
        this.clickXInfo = 0;

        canvas.addEventListener('mousedown', this);
        canvas.addEventListener('mouseup', this);
        canvas.addEventListener('mousemove', this);
        canvas.addEventListener('mouseout', this);

        this._init();
        this._parseData();
        this._calculateChartData();
        this._calculateMiniMapData();
        this._drawChartData();
        this._drawChartInfo();
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
            case 'mousemove':
                this._handleMouseMove(event);
                break;
            case 'mouseout':
                this._handleMouseOut(event);
                break;
        }
    }

    _handleMouseDown(event) {
        if (this._isOverLeftDragLine()) {
            this.isDragging = true;
            this.drawInfo = false;
            this.draggingObj = ActionTypes.DRAG_LEFT_LINE;
            this.canvas.ref.style.cursor = 'col-resize';
        } else if (this._isOverRightDragLine()) {
            this.isDragging = true;
            this.drawInfo = false;
            this.draggingObj = ActionTypes.DRAG_RIGHT_LINE;
            this.canvas.ref.style.cursor = 'col-resize';
        } else if (this._isOverDragFrame()) {
            this.isDragging = true;
            this.drawInfo = false;
            this.draggingObj = ActionTypes.DRAG_FRAME;
            this.canvas.ref.style.cursor = 'move';
            this.clickX = event.offsetX;
        } else if (this._isOverChart()) {
            this.clickXInfo = event.offsetX;
            this.drawInfo = true;
            this._updateChart();
        }
    }

    _handleMouseUp(event) {
        this.isDragging = false;
        this.draggingObj = ActionTypes.EMPTY;
        this.canvas.ref.style.cursor = 'default';
    }

    _handleMouseMove(event) {
        if (this._isOverLeftDragLine() || this._isOverRightDragLine()) {
            this.canvas.ref.style.cursor = 'col-resize';
        } else if (this._isOverDragFrame()) {
            this.canvas.ref.style.cursor = 'move';
        } else if (this._isOverChart()) {
            this.canvas.ref.style.cursor = 'pointer';
        } else {
            this.canvas.ref.style.cursor = 'default';
        }

        if (this.isDragging == true && this.draggingObj == ActionTypes.DRAG_LEFT_LINE) {
            // drag left line
            for (let i = 0; i < this.chart.displayEndIndex - this.miniMap.frame.minDisplayPositions - 2; i++) {
                if (
                    event.offsetX >= this.miniMap.xAxis.values[i] &&
                    event.offsetX <= this.miniMap.xAxis.values[i + 1]
                ) {
                    this.chart.displayStartIndex = i;
                    this._updateChart();
                    break;
                }
            }
        } else if (this.isDragging == true && this.draggingObj == ActionTypes.DRAG_FRAME) {
            // drag frame
            if (this.clickX > event.offsetX) {
                if (this.chart.displayStartIndex > 0) {
                    this.chart.displayStartIndex -= 1;
                    this.chart.displayEndIndex -= 1;
                }
            } else if (this.clickX < event.offsetX) {
                if (this.chart.displayEndIndex < this.miniMap.xAxis.values.length - 1) {
                    this.chart.displayStartIndex += 1;
                    this.chart.displayEndIndex += 1;
                }
            }
            this._updateChart();
            this.clickX = event.offsetX;
        } else if (this.isDragging == true && this.draggingObj == ActionTypes.DRAG_RIGHT_LINE) {
            // drag right frame
            for (
                let i = this.miniMap.xAxis.values.length - 1;
                i > this.chart.displayStartIndex + this.miniMap.frame.minDisplayPositions;
                i--
            ) {
                if (
                    event.offsetX <= this.miniMap.xAxis.values[i] &&
                    event.offsetX >= this.miniMap.xAxis.values[i - 1]
                ) {
                    this.chart.displayEndIndex = i;
                    this._updateChart();
                    break;
                }
            }
        }
    }

    _updateChart() {
        this._clearCanvas();
        this._calculateChartData();
        this._drawChartData();
        this._drawChartInfo();
        this._drawMiniMapData();
        this._drawMiniMapFrame();
    }

    _handleMouseOut(event) {
        this.isDragging = false;
        this.draggingObj = '';
    }

    _init() {
        this.chart.xAxis.values = [];
        this.chart.xAxis.originalValues = [];
        this.chart.yAxis.columns = [];
        this.chart.displayStartIndex = 0;
        // -1 because of array indexation, and -1 because first element is not a value = -2
        this.chart.displayEndIndex = this.data.columns[0].length - 2;

        this.miniMap.yAxis.columns = [];
        this.miniMap.xAxis.values = [];
        this.miniMap.x = 0;
        this.miniMap.y = this.canvas.height - this.miniMap.height;
        this.miniMap.width = this.canvas.width;
    }

    _clearCanvas() {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    _drawChartData() {
        // draw grid
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.strokeStyle = this.chart.axis.style.color;
        this.canvas.ctx.lineJoin = 'round';
        this.canvas.ctx.lineCap = 'round';
        this.canvas.ctx.font = this.chart.axis.style.fontSize + 'px ' + this.chart.axis.style.fonyStyle;
        this.chart.axis.grid.forEach((element) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(element.x1, element.y1);
            this.canvas.ctx.lineTo(element.x2, element.y2);
            this.canvas.ctx.stroke();
        });

        // draw X labels
        this.canvas.ctx.fillStyle = this.chart.axis.style.fonyColor;
        this.chart.axis.xLabels.values.forEach((element) => {
            this.canvas.ctx.fillText(element.text, element.x, element.y);
        });
        // draw Y labels
        this.canvas.ctx.fillStyle = this.chart.axis.style.fonyColor;
        this.chart.axis.yLabels.values.forEach((element) => {
            this.canvas.ctx.fillText(element.text, element.x, element.y);
        });

        // draw lines
        this.canvas.ctx.lineWidth = 2;
        this.chart.yAxis.columns.forEach((element) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.strokeStyle = this.data.colors[element.name];
            for (let i = 0; i < element.values.length; i++) {
                this.canvas.ctx.lineTo(this.chart.xAxis.values[i].scaledValue, element.values[i].scaledValue);
            }

            this.canvas.ctx.stroke();
        });
    }

    _drawChartInfo() {
        // get clicked index
        let infoIndex = -1;
        if (this.drawInfo) {
            for (let i = 0; i < this.chart.xAxis.values.length; i++) {
                if (i == 0) {
                    if (
                        this.clickXInfo >= 0 &&
                        this.clickXInfo <
                            (this.chart.xAxis.values[i].scaledValue + this.chart.xAxis.values[i + 1].scaledValue) / 2
                    ) {
                        infoIndex = i;
                        break;
                    }
                } else if (i == this.chart.xAxis.values.length - 1) {
                    if (
                        this.clickXInfo >=
                            (this.chart.xAxis.values[i - 1].scaledValue + this.chart.xAxis.values[i].scaledValue) / 2 &&
                        this.clickXInfo <= this.canvas.width
                    ) {
                        infoIndex = i;
                        break;
                    }
                } else {
                    if (
                        this.clickXInfo >=
                            (this.chart.xAxis.values[i - 1].scaledValue + this.chart.xAxis.values[i].scaledValue) / 2 &&
                        this.clickXInfo <
                            (this.chart.xAxis.values[i].scaledValue + this.chart.xAxis.values[i + 1].scaledValue) / 2
                    ) {
                        infoIndex = i;
                        break;
                    }
                }
            }
        }

        if (this.drawInfo) {
            let x = this.chart.xAxis.values[infoIndex].scaledValue;

            // draw info line
            this.canvas.ctx.strokeStyle = this.chart.axis.style.color;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(x, 0);
            this.canvas.ctx.lineTo(
                x,
                this.canvas.height - this.miniMap.height - this.chart.axis.style.axisBottomPadding
            );
            this.canvas.ctx.stroke();

            // draw info circles
            this.chart.yAxis.columns.forEach((element) => {
                let y = element.values[infoIndex].scaledValue;
                this.canvas.ctx.fillStyle = element.color;
                this.canvas.ctx.beginPath();
                this.canvas.ctx.arc(x, y, 5, Math.PI + (Math.PI * 2) / 2, false);
                this.canvas.ctx.fill();
                this.canvas.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                this.canvas.ctx.beginPath();
                this.canvas.ctx.arc(x, y, 2, Math.PI + (Math.PI * 2) / 2, false);
                this.canvas.ctx.fill();
            });

            // draw info box
            let infoBoxX = x - 50;
            let infoBoxY = 0;
            let infoBoxWidth = 100;
            let infoBoxHeigth = 100;
            let infoBoxCornersRadius = 10;
            this.canvas.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            this._drawRoundedRect(infoBoxX, infoBoxY, infoBoxWidth, infoBoxHeigth, infoBoxCornersRadius);
            this.canvas.ctx.fill();
            this.canvas.ctx.strokeStyle = this.chart.axis.style.color;
            this._drawRoundedRect(infoBoxX, infoBoxY, infoBoxWidth, infoBoxHeigth, infoBoxCornersRadius);
            this.canvas.ctx.stroke();

            // draw header text
            let date = this.dateHelper.convertToDate(this.chart.xAxis.values[infoIndex].originalValue);
            let headerTextX = x - 40;
            let headerTextY = infoBoxY + 20;
            let headerText =
                this.dateHelper.getDayShortName(date.getDay()) +
                ', ' +
                this.dateHelper.getMonthShortName(date.getMonth()) +
                ' ' +
                date.getDate();
            this.canvas.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            this.canvas.ctx.fillText(headerText, headerTextX, headerTextY);

            // draw info text
            this.chart.yAxis.columns.forEach((element, index) => {
                let itemX = x - 40;
                if (index != 0) {
                    itemX = itemX + index * 50;
                }
                let itemY = infoBoxY + 40;
                let value = element.values[infoIndex].originalValue;
                this.canvas.ctx.fillStyle = element.color;
                this.canvas.ctx.fillText(element.name, itemX, itemY);
                this.canvas.ctx.fillText(value, itemX, itemY + 20);
            });
        }
    }

    _drawRoundedRect(x, y, width, height, radius) {
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(x, y + radius);
        this.canvas.ctx.lineTo(x, y + height - radius);
        this.canvas.ctx.arcTo(x, y + height, x + radius, y + height, radius);
        this.canvas.ctx.lineTo(x + width - radius, y + height);
        this.canvas.ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
        this.canvas.ctx.lineTo(x + width, y + radius);
        this.canvas.ctx.arcTo(x + width, y, x + width - radius, y, radius);
        this.canvas.ctx.lineTo(x + radius, y);
        this.canvas.ctx.arcTo(x, y, x, y + radius, radius);
    }

    _drawMiniMapData() {
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.lineJoin = 'round';
        this.canvas.ctx.lineCap = 'round';

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
        this.canvas.ctx.lineJoin = 'miter';
        this.canvas.ctx.lineCap = 'butt';

        let miniMapX = this.miniMap.xAxis.values[this.chart.displayStartIndex];
        let miniMapY = this.canvas.height - this.miniMap.height;

        this.canvas.ctx.strokeStyle = this.miniMap.frame.border.color;

        // left line
        this.canvas.ctx.lineWidth = this.miniMap.frame.dragLineWidth;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX + this.miniMap.frame.dragLineWidth / 2, miniMapY);
        this.canvas.ctx.lineTo(
            miniMapX + this.miniMap.frame.dragLineWidth / 2,
            miniMapY + this.miniMap.height - this.miniMap.frame.border.width
        );
        this.canvas.ctx.stroke();
        this.miniMap.frame.leftDragLine.x = miniMapX;
        this.miniMap.frame.leftDragLine.y = miniMapY;

        // rigth line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(
            Math.round(this.miniMap.xAxis.values[this.chart.displayEndIndex]) - this.miniMap.frame.dragLineWidth / 2,
            miniMapY
        );
        this.canvas.ctx.lineTo(
            Math.round(this.miniMap.xAxis.values[this.chart.displayEndIndex]) - this.miniMap.frame.dragLineWidth / 2,
            miniMapY + this.miniMap.height - this.miniMap.frame.border.width
        );
        this.canvas.ctx.stroke();
        this.miniMap.frame.rightDragLine.x =
            Math.round(this.miniMap.xAxis.values[this.chart.displayEndIndex]) - this.miniMap.frame.border.width;
        this.miniMap.frame.rightDragLine.y = miniMapY;

        // top line
        this.canvas.ctx.lineWidth = this.miniMap.frame.border.width;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX, miniMapY - this.miniMap.frame.border.width / 2);
        this.canvas.ctx.lineTo(
            Math.round(this.miniMap.xAxis.values[this.chart.displayEndIndex]),
            miniMapY - this.miniMap.frame.border.width / 2
        );
        this.canvas.ctx.stroke();

        // bottom line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX, miniMapY + this.miniMap.height - this.miniMap.frame.border.width / 2);
        this.canvas.ctx.lineTo(
            this.miniMap.xAxis.values[this.chart.displayEndIndex],
            miniMapY + this.miniMap.height - this.miniMap.frame.border.width / 2
        );
        this.canvas.ctx.stroke();

        this.miniMap.frame.rect.x = this.miniMap.frame.leftDragLine.x + this.miniMap.frame.leftDragLine.width;
        this.miniMap.frame.rect.y = this.miniMap.frame.leftDragLine.y;
        this.miniMap.frame.rect.height = this.miniMap.frame.leftDragLine.height;
        this.miniMap.frame.rect.width = this.miniMap.frame.rightDragLine.x - this.miniMap.frame.rect.x;

        this.canvas.ctx.fillStyle = this.miniMap.frame.border.fadeColor;

        if (this.miniMap.frame.leftDragLine.x > 0) {
            this.canvas.ctx.fillRect(
                0,
                miniMapY - this.miniMap.frame.border.width / 2 - this.miniMap.frame.border.width / 2,
                this.miniMap.frame.leftDragLine.x,
                this.miniMap.height + -this.miniMap.frame.border.width / 2 + this.miniMap.frame.border.width + 1
            );
        }

        if (this.miniMap.frame.rightDragLine.x + this.miniMap.frame.dragLineWidth < this.miniMap.width) {
            this.canvas.ctx.fillRect(
                this.miniMap.frame.rightDragLine.x + 2,
                miniMapY - this.miniMap.frame.border.width / 2 - this.miniMap.frame.border.width / 2,
                this.miniMap.width - this.miniMap.frame.rightDragLine.x + this.miniMap.frame.dragLineWidth,
                this.miniMap.height + -this.miniMap.frame.border.width / 2 + this.miniMap.frame.border.width + 1
            );
        }
    }

    _parseData() {
        let sliceStartIndex = this.chart.displayStartIndex + 1;
        let sliceEndIndex = this.chart.displayEndIndex + 2;
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
                color: this.data.colors[column[0]],
            });
            this.miniMap.yAxis.columns.push({
                name: column[0],
                originalValues: column.slice(sliceStartIndex, sliceEndIndex),
                values: new Array(),
                color: this.data.colors[column[0]],
            });
        });
    }

    _calculateChartData() {
        // calcualate axis scale factor
        let maxValue = this._findMaxValue(this.chart.displayStartIndex, this.chart.displayEndIndex);
        //let maxValue = this._findMaxValue(0, this.chart.xAxis.originalValues.length - 1);

        this.chart.xAxis.values = new Array();
        this.chart.yAxis.columns.forEach((element) => {
            element.values = new Array();
        });
        this.chart.xAxis.scaleFactor = this.canvas.width / (this.chart.displayEndIndex - this.chart.displayStartIndex);
        this.chart.yAxis.scaleFactor = this.canvas.height / maxValue;

        // get minimap scale factor to multiply Y values
        // shifts all values up to free space for minimap
        let miniMapScaleShift =
            (this.canvas.height - this.miniMap.height - this.chart.axis.style.axisBottomPadding) /
            (this.canvas.height + this.chart.axis.style.axisTopPadding);

        // calculate X axis values
        let index = 0;
        for (let i = this.chart.displayStartIndex; i <= this.chart.displayEndIndex; i++) {
            this.chart.xAxis.values.push({
                scaledValue: index * this.chart.xAxis.scaleFactor,
                originalValue: this.chart.xAxis.originalValues[i],
            });
            index++;
        }

        // calculate Y axis values
        this.chart.yAxis.columns.forEach((column) => {
            for (let i = this.chart.displayStartIndex; i <= this.chart.displayEndIndex; i++) {
                let scaledY = column.originalValues[i] * this.chart.yAxis.scaleFactor * miniMapScaleShift;
                let y = this.canvas.height - scaledY - this.miniMap.height - this.chart.axis.style.axisBottomPadding;
                column.values.push({
                    scaledValue: y,
                    originalValue: column.originalValues[i],
                });
            }
        });

        // calculate axis data
        this.chart.axis.yLabels.values = new Array();
        this.chart.axis.xLabels.values = new Array();
        this.chart.axis.grid = new Array();

        // calculate Y axis labels
        let yMultiplier = this.axisHelper.getAxisLabelsMultiplier(maxValue, this.chart.axis.yLabels.displayCoef);
        for (let i = 0; i < this.chart.axis.yLabels.displayCoef; i++) {
            let value = Math.round(yMultiplier * i);
            let scaledValue = value * this.chart.yAxis.scaleFactor * miniMapScaleShift;
            let yValue =
                this.canvas.height - scaledValue - this.miniMap.height - this.chart.axis.style.axisBottomPadding;
            if (yValue > this.chart.axis.style.fontSize + 1) {
                this.chart.axis.yLabels.values.push({
                    text: value,
                    x: this.chart.axis.style.textLeftPadding,
                    y: yValue - this.chart.axis.style.textBottomPadding,
                });
                this.chart.axis.grid.push({ x1: 0, y1: yValue, x2: this.canvas.width, y2: yValue });
            }
        }

        // calculate X axis labels
        let ticks = this.axisHelper.getDateIncrementsForAxis(
            this.chart.xAxis.originalValues[this.chart.displayStartIndex],
            this.chart.xAxis.originalValues[this.chart.displayEndIndex],
            this.chart.axis.xLabels.displayCoef
        );

        for (let i = 0; i < ticks.length; i++) {
            let xIndex = this.chart.xAxis.values.findIndex((element, index) => {
                if (element.originalValue == ticks[i]) {
                    return true;
                }
            });
            if (xIndex != -1 && xIndex < this.chart.xAxis.values.length) {
                let xValue = this.chart.xAxis.values[xIndex].scaledValue;
                let originalValue = ticks[i];
                let date = this.dateHelper.convertToDate(originalValue);
                let displayText = this.dateHelper.getMonthShortName(date.getMonth()) + ' ' + date.getDate();
                this.chart.axis.xLabels.values.push({
                    text: displayText,
                    x: xValue,
                    y:
                        this.canvas.height -
                        this.miniMap.height -
                        this.chart.axis.style.axisBottomPadding +
                        this.chart.axis.style.fontSize,
                });
            }
        }
    }

    _calculateMiniMapData() {
        // calcualate axis scale factor
        let maxValue = this._findMaxValue(0, this.chart.xAxis.originalValues.length - 1);
        this.miniMap.xAxis.scaleFactor = this.canvas.width / (this.chart.xAxis.originalValues.length - 1);
        this.miniMap.yAxis.scaleFactor = this.miniMap.height / maxValue;

        // calculate X axis values
        this.miniMap.xAxis.originalValues.forEach((element, index) => {
            this.miniMap.xAxis.values.push(index * this.miniMap.xAxis.scaleFactor);
        });

        // calculate Y axis values
        this.miniMap.yAxis.columns.forEach((column, index) => {
            for (let i = 0; i < this.chart.yAxis.columns[index].originalValues.length; i++) {
                let scaledY = this.chart.yAxis.columns[index].originalValues[i] * this.miniMap.yAxis.scaleFactor;
                let y = this.canvas.height - scaledY;
                column.values.push(y);
            }
        });
    }

    // finds Y maximum value. required for calculating scale factor.
    _findMaxValue(startIndex, endIndex) {
        let maxValue = 0;
        this.chart.yAxis.columns.forEach((element) => {
            let temp = Math.max.apply(null, element.originalValues.slice(startIndex, endIndex));
            if (temp > maxValue) {
                maxValue = temp;
            }
        });
        return maxValue;
    }

    _isOverLeftDragLine() {
        return (
            event.offsetX + this.miniMap.frame.dragErrorPixelFactor >= this.miniMap.frame.leftDragLine.x &&
            event.offsetX - this.miniMap.frame.dragErrorPixelFactor <=
                this.miniMap.frame.leftDragLine.x + this.miniMap.frame.leftDragLine.width &&
            event.offsetY >= this.miniMap.frame.leftDragLine.y &&
            event.offsetY <= this.miniMap.frame.leftDragLine.y + this.miniMap.frame.leftDragLine.height
        );
    }

    _isOverRightDragLine() {
        return (
            event.offsetX + this.miniMap.frame.dragErrorPixelFactor >= this.miniMap.frame.rightDragLine.x &&
            event.offsetX - this.miniMap.frame.dragErrorPixelFactor <=
                this.miniMap.frame.rightDragLine.x + this.miniMap.frame.rightDragLine.width &&
            event.offsetY >= this.miniMap.frame.rightDragLine.y &&
            event.offsetY <= this.miniMap.frame.rightDragLine.y + this.miniMap.frame.rightDragLine.height
        );
    }

    _isOverDragFrame() {
        return (
            event.offsetX >= this.miniMap.frame.rect.x &&
            event.offsetX <= this.miniMap.frame.rect.x + this.miniMap.frame.rect.width &&
            event.offsetY >= this.miniMap.frame.rect.y &&
            event.offsetY <= this.miniMap.frame.rect.y + this.miniMap.frame.rect.height
        );
    }

    _isOverChart() {
        return (
            event.offsetX >= 0 &&
            event.offsetX <= this.canvas.width &&
            event.offsetY >= this.chart.axis.style.axisTopPadding &&
            event.offsetY <= this.canvas.height - this.miniMap.height - this.chart.axis.style.axisBottomPadding
        );
    }
}

export default ChartBuilder;
