import MiniMap from './miniMap';
import * as ActionTypes from './dragActionTypes';
import DateHelper from './helpers/dateHelper';
import AxisHelper from './helpers/axisHelper';
import Canvas from './canvas';
import Chart from './chart';

class ChartBuilder {
    constructor(canvas, data) {
        this.canvas = new Canvas(canvas);
        this.data = data;
        this.chart = new Chart();
        this.miniMap = new MiniMap();
        this.dateHelper = new DateHelper();
        this.axisHelper = new AxisHelper();

        // get column ids to display
        this.columnsToDisplay = new Array();
        this.data.columns.forEach((element) => {
            this.columnsToDisplay.push(element[0]);
        });

        this.chart.displayStartIndex = 0;
        // -1 because of array indexation, and -1 because first element is not a value = -2
        this.chart.displayEndIndex = this.data.columns[0].length - 2;

        /* internal veriables */
        this.isDragging = false;
        this.drawInfo = false;
        this.actionType = ActionTypes.EMPTY;
        this.clickX = 0;
        this.clickXInfo = 0;
        this.isNightMode = false;
        this.previousChartMaxValue = 0;
        this.previousMiniMapMaxValue = 0;

        canvas.addEventListener('mousedown', this);
        canvas.addEventListener('mouseup', this);
        canvas.addEventListener('mousemove', this);
        canvas.addEventListener('mouseout', this);

        canvas.addEventListener('touchstart', this);
        canvas.addEventListener('touchend', this);
        canvas.addEventListener('touchcancel', this);
        canvas.addEventListener('touchmove', this);

        this.render();
    }

    render() {
        this.canvas.height = this.canvas.ref.height;
        this.canvas.width = this.canvas.ref.width;

        this._init();
        this._parseData();
        this._calculateData(0, 0);
        this._drawComponents();
    }

    _calculateData(maxValue, miniMapMaxValue) {
        this._calculateChartData(maxValue);
        this._calculateMiniMapData(miniMapMaxValue);
    }
    _drawComponents() {
        this._clearCanvas();
        this._drawMiniMapData();
        this._drawMiniMapFrame();
        this._drawChartData();
        this._drawChartInfo();
        this._drawButtons();
    }

    swithcMode() {
        if (this.isNightMode == true) {
            this.isNightMode = false;
        } else {
            this.isNightMode = true;
        }

        this._calculateChartData(0);
        this._calculateMiniMapData(0);
        this._drawComponents();
    }

    _animate(animationSettings) {
        let newChartMaxValue = this._findMaxValue(this.chart.displayStartIndex, this.chart.displayEndIndex);
        let newMiniMapMaxValue = this._findMaxValue(0, this.chart.xAxis.originalValues.length - 1);

        if (newChartMaxValue < this.previousChartMaxValue) {
            let incrementChart = (this.previousChartMaxValue - newChartMaxValue) / animationSettings.iterations;
            let incrementMiniMap = (this.previousMiniMapMaxValue - newMiniMapMaxValue) / animationSettings.iterations;
            let animatedChartMaxValue = this.previousChartMaxValue - incrementChart;
            let animatedMiniMapMaxValue = this.previousMiniMapMaxValue - incrementMiniMap;
            let that = this;
            for (let i = 0; i < animationSettings.iterations; i++) {
                (function(i) {
                    setTimeout(function() {
                        that._calculateData(
                            animatedChartMaxValue - incrementChart * i,
                            animatedMiniMapMaxValue - incrementMiniMap * i
                        );
                        that._drawComponents();
                    }, animationSettings.timeOut * i);
                })(i);
            }
            this.previousChartMaxValue = newChartMaxValue;
            this.previousMiniMapMaxValue = newMiniMapMaxValue;
        } else if (newChartMaxValue > this.previousChartMaxValue) {
            let incrementChart = (newChartMaxValue - this.previousChartMaxValue) / animationSettings.iterations;
            let incrementMiniMap = (newMiniMapMaxValue - this.previousMiniMapMaxValue) / animationSettings.iterations;
            let animatedChartMaxValue = this.previousChartMaxValue + incrementChart;
            let animatedMiniMapMaxValue = this.previousMiniMapMaxValue + incrementMiniMap;
            let that = this;
            for (let i = 0; i < animationSettings.iterations; i++) {
                (function(i) {
                    setTimeout(function() {
                        that._calculateData(
                            animatedChartMaxValue + incrementChart * i,
                            animatedMiniMapMaxValue + incrementMiniMap * i
                        );
                        that._drawComponents();
                    }, animationSettings.timeOut * i);
                })(i);
            }
            this.previousChartMaxValue = newChartMaxValue;
            this.previousMiniMapMaxValue = newMiniMapMaxValue;
        } else {
            this._calculateData(0, 0);
            this._drawComponents();
        }
    }

    hideColumn(columnId) {
        if (this.chart.yAxis.columns.length == 1) {
            return;
        }
        let index = this.columnsToDisplay.findIndex((id) => {
            return id == columnId;
        });
        if (index != -1) {
            this.columnsToDisplay.splice(index, 1);
            this._init();
            this._parseData();
            this._animate(this.canvas.buttonAnimation);
        }
    }

    showColumn(columnId) {
        let index = this.columnsToDisplay.findIndex((id) => {
            return id == columnId;
        });
        if (index == -1) {
            this.columnsToDisplay.push(columnId);
            this._init();
            this._parseData();
            this._animate(this.canvas.buttonAnimation);
        }
    }

    handleEvent(event) {
        event.stopPropagation();
        switch (event.type) {
            case 'mousedown':
                this._handleMouseDown(event.offsetX, event.offsetY);
                break;
            case 'mouseup':
                this._handleMouseUp(event);
                break;
            case 'mousemove':
                this._handleMouseMove(event.offsetX, event.offsetY);
                break;
            case 'mouseout':
                this._handleMouseOut(event);
                break;
            case 'touchstart':
            case 'touchmove':
                this.isTouch = true;
                this._handleTouch(event);
                break;
            case 'touchend':
            case 'touchcancel':
                this.isTouch = false;
                this._handleMouseOut(event);
                break;
        }
    }

    _handleTouch(event) {
        event.preventDefault();
        if (event.touches.length > 1 || (event.type == 'touchend' && event.touches.length > 0)) {
            return;
        }

        let touch = null;

        switch (event.type) {
            case 'touchstart':
                touch = event.touches[0];
                this._handleMouseDown(
                    touch.pageX - this.canvas.getOffsetLeft(this.canvas.ref),
                    touch.pageY - this.canvas.getOffsetTop(this.canvas.ref)
                );
                break;
            case 'touchmove':
                touch = event.touches[0];
                this._handleDragging(touch.pageX - this.canvas.getOffsetLeft(this.canvas.ref));
                break;
            case 'touchend':
                this._handleMouseUp(event);
                break;
        }
    }

    _handleMouseDown(x, y) {
        if (this._isOverLeftDragLine(x, y)) {
            this.isDragging = true;
            this.drawInfo = false;
            this.actionType = ActionTypes.DRAG_LEFT_LINE;
            this.canvas.ref.style.cursor = 'col-resize';
        } else if (this._isOverRightDragLine(x, y)) {
            this.isDragging = true;
            this.drawInfo = false;
            this.actionType = ActionTypes.DRAG_RIGHT_LINE;
            this.canvas.ref.style.cursor = 'col-resize';
        } else if (this._isOverDragFrame(x, y)) {
            this.isDragging = true;
            this.drawInfo = false;
            this.actionType = ActionTypes.DRAG_FRAME;
            this.canvas.ref.style.cursor = 'move';
            this.clickX = x;
        } else if (this._isOverChart(x, y)) {
            this.clickXInfo = x;
            this.drawInfo = true;
            this._calculateChartData(0);
            this._calculateMiniMapData(0);
            this._drawComponents();
        } else if (this._isOverButton(x, y)) {
            this.canvas.ref.style.cursor = 'pointer';
            let id = this._getButtonId(x, y);
            if (id != null) {
                let index = this.columnsToDisplay.findIndex((element) => {
                    return element == id;
                });
                if (index != -1) {
                    this.hideColumn(id);
                } else {
                    this.showColumn(id);
                }
            }
        }
    }

    _handleMouseUp(event) {
        this.isDragging = false;
        this.actionType = ActionTypes.EMPTY;
        this.canvas.ref.style.cursor = 'default';
    }

    _handleDragging(x) {
        if (this.isDragging == true && this.actionType == ActionTypes.DRAG_LEFT_LINE) {
            // drag left line
            for (let i = 0; i < this.chart.displayEndIndex - this.miniMap.frame.minDisplayPositions - 2; i++) {
                if (x >= this.miniMap.xAxis.values[i] && x <= this.miniMap.xAxis.values[i + 1]) {
                    this.chart.displayStartIndex = i;
                    this._animate(this.canvas.scrollAnimation);
                    break;
                }
            }
        } else if (this.isDragging == true && this.actionType == ActionTypes.DRAG_FRAME) {
            // drag frame
            if (this.clickX > x) {
                if (this.chart.displayStartIndex > 0) {
                    this.chart.displayStartIndex -= 1;
                    this.chart.displayEndIndex -= 1;
                }
            } else if (this.clickX < x) {
                if (this.chart.displayEndIndex < this.miniMap.xAxis.values.length - 1) {
                    this.chart.displayStartIndex += 1;
                    this.chart.displayEndIndex += 1;
                }
            }
            this._animate(this.canvas.scrollAnimation);
            this.clickX = x;
        } else if (this.isDragging == true && this.actionType == ActionTypes.DRAG_RIGHT_LINE) {
            // drag right line
            for (
                let i = this.miniMap.xAxis.values.length - 1;
                i > this.chart.displayStartIndex + this.miniMap.frame.minDisplayPositions;
                i--
            ) {
                if (x <= this.miniMap.xAxis.values[i] && x >= this.miniMap.xAxis.values[i - 1]) {
                    this.chart.displayEndIndex = i;
                    this._animate(this.canvas.scrollAnimation);
                    break;
                }
            }
        }
    }

    _handleMouseMove(x, y) {
        if (this.isTouch == true) {
            return;
        }
        if (this._isOverLeftDragLine(x, y) || this._isOverRightDragLine(x, y)) {
            this.canvas.ref.style.cursor = 'col-resize';
        } else if (this._isOverDragFrame(x, y)) {
            this.canvas.ref.style.cursor = 'move';
        } else if (this._isOverChart(x, y)) {
            this.canvas.ref.style.cursor = 'pointer';
        } else if (this._isOverButton(x, y)) {
            this.canvas.ref.style.cursor = 'pointer';
        } else {
            this.canvas.ref.style.cursor = 'default';
        }

        this._handleDragging(event.offsetX);
    }

    _handleMouseOut(event) {
        this.isDragging = false;
        this.actionType = ActionTypes.EMPTY;
    }

    _init() {
        this.chart.xAxis.values = [];
        this.chart.xAxis.originalValues = [];
        this.chart.yAxis.columns = [];

        this.miniMap.yAxis.columns = [];
        this.miniMap.xAxis.values = [];
        this.miniMap.x = 0;
        this.miniMap.y = this.canvas.height - this.miniMap.height - this.chart.buttons.height;
        this.miniMap.width = this.canvas.width;
    }

    _clearCanvas() {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.isNightMode == true) {
            this.canvas.ctx.save();
            this.canvas.ctx.fillStyle = this.canvas.style.darkModeColor;
            this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.canvas.ctx.restore();
        }
        this.canvas.ctx.fillStyle =
            this.isNightMode == true ? this.canvas.style.darkModeColor : this.canvas.style.ligthModeColor;
        this.canvas.ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }

    _drawChartData() {
        // draw background rectangle to overlay minimap animation
        this.canvas.ctx.fillStyle =
            this.isNightMode == true ? this.canvas.style.darkModeColor : this.canvas.style.ligthModeColor;
        this.canvas.ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height - this.miniMap.height - this.chart.buttons.height - this.miniMap.frame.border.width
        );

        // draw axis grid
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.strokeStyle = this.chart.axis.style.color;
        this.canvas.ctx.lineJoin = 'round';
        this.canvas.ctx.lineCap = 'round';
        this.canvas.ctx.font = this.chart.axis.style.fontSize + 'px ' + this.chart.style.fontFamily;
        this.chart.axis.grid.forEach((element) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(element.x1, element.y1);
            this.canvas.ctx.lineTo(element.x2, element.y2);
            this.canvas.ctx.stroke();
        });

        // draw X axis labels
        this.canvas.ctx.fillStyle = this.chart.axis.style.fontColor;
        this.chart.axis.xLabels.values.forEach((element) => {
            this.canvas.ctx.fillText(element.text, element.x, element.y);
        });
        // draw Y asxis labels
        this.canvas.ctx.fillStyle = this.chart.axis.style.fontColor;
        this.chart.axis.yLabels.values.forEach((element) => {
            this.canvas.ctx.fillText(element.text, element.x, element.y);
        });

        // draw char lines
        this.canvas.ctx.lineWidth = this.chart.style.lineWidth;
        this.chart.yAxis.columns.forEach((element) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.strokeStyle = this.data.colors[element.id];
            this.canvas.ctx.moveTo(this.chart.xAxis.values[0].scaledValue, element.values[0].scaledValue);
            for (let i = 1; i < element.values.length; i++) {
                this.canvas.ctx.lineTo(this.chart.xAxis.values[i].scaledValue, element.values[i].scaledValue);
            }

            this.canvas.ctx.stroke();
        });
    }

    _drawChartInfo() {
        // get clicked index
        if (this.drawInfo == false) {
            return;
        }
        let infoIndex = this._getClickedChartIndex();
        if (infoIndex == -1) {
            return;
        }
        const infoLineTopPadding = 20;
        let chartX = this.chart.xAxis.values[infoIndex].scaledValue;

        // draw info line
        this.canvas.ctx.strokeStyle = this.chart.axis.style.color;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(chartX, infoLineTopPadding);
        this.canvas.ctx.lineTo(
            chartX,
            this.canvas.height - this.miniMap.height - this.chart.axis.style.bottomPadding - this.chart.buttons.height
        );
        this.canvas.ctx.stroke();

        // draw info circles
        this.chart.yAxis.columns.forEach((element) => {
            let y = element.values[infoIndex].scaledValue;
            this.canvas.ctx.fillStyle = element.color;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(chartX, y, 5, Math.PI + (Math.PI * 2) / 2, false);
            this.canvas.ctx.fill();
            this.canvas.ctx.fillStyle =
                this.isNightMode == true ? this.canvas.style.darkModeColor : this.canvas.style.ligthModeColor;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(chartX, y, 2, Math.PI + (Math.PI * 2) / 2, false);
            this.canvas.ctx.fill();
        });

        let date = this.dateHelper.convertToDate(this.chart.xAxis.values[infoIndex].originalValue);
        let headerText =
            this.dateHelper.getDayShortName(date.getDay()) +
            ', ' +
            this.dateHelper.getMonthShortName(date.getMonth()) +
            ' ' +
            date.getDate();

        /*----------- draw info box ----------*/
        let valuesLength = 0;
        this.chart.yAxis.columns.forEach((element) => {
            valuesLength += element.values[infoIndex].originalValue.toString().length;
        });
        let maxContentLegth = valuesLength > headerText.length ? valuesLength : headerText.length;

        let infoBoxWidth = maxContentLegth * this.chart.fontMultiplier + this.chart.info.style.rightPadding;
        let infoBoxX = 0;
        if (chartX - infoBoxWidth / 2 + infoBoxWidth >= this.canvas.width) {
            infoBoxX = this.canvas.width - infoBoxWidth - this.canvas.style.rightPadding;
        } else if (chartX - infoBoxWidth / 2 <= 0) {
            infoBoxX = this.canvas.style.leftPadding;
        } else {
            infoBoxX = chartX - infoBoxWidth / 2;
        }

        const infoBoxY = this.chart.info.style.topShift;
        const infoBoxCornersRadius = 10;

        this.canvas.ctx.save();
        this.canvas.ctx.strokeStyle = this.isNightMode == true ? 'rgba(30, 40, 62, 1)' : this.chart.axis.style.color;
        this.canvas.ctx.shadowOffsetX = 1;
        this.canvas.ctx.shadowOffsetY = 1;
        this.canvas.ctx.shadowBlur = 4;
        this.canvas.ctx.shadowColor =
            this.isNightMode == true
                ? this.chart.info.style.borderColorDarkMode
                : this.chart.info.style.borderColorLightMode;
        this.canvas.drawRoundedRect(infoBoxX, infoBoxY, infoBoxWidth, this.chart.info.height, infoBoxCornersRadius);
        this.canvas.ctx.stroke();
        this.canvas.ctx.restore();

        this.canvas.ctx.fillStyle =
            this.isNightMode == true ? this.canvas.style.darkModeColor : this.canvas.style.ligthModeColor;
        this.canvas.drawRoundedRect(infoBoxX, infoBoxY, infoBoxWidth, this.chart.info.height, infoBoxCornersRadius);
        this.canvas.ctx.fill();

        // draw header text
        let headerTextX = infoBoxX + this.chart.info.style.leftPadding;
        let headerTextY = infoBoxY + this.chart.info.style.topPadding;
        this.canvas.ctx.font = this.chart.info.headerStyle.fontSize + ' ' + this.chart.style.fontFamily;
        this.canvas.ctx.fillStyle =
            this.isNightMode == true ? this.chart.style.fontColorDarkMode : this.chart.style.fontColorLightMode;
        this.canvas.ctx.fillText(headerText, headerTextX, headerTextY);

        // draw info lines
        let columnShift = 0;
        this.chart.yAxis.columns.forEach((element) => {
            let value = element.values[infoIndex].originalValue;
            let itemX = infoBoxX + this.chart.info.style.leftPadding + columnShift;
            columnShift = columnShift + value.toString().length * this.chart.fontMultiplier;
            let itemY = infoBoxY + this.chart.info.fistLineShift;
            this.canvas.ctx.fillStyle = element.color;
            this.canvas.ctx.font =
                this.chart.info.valuesStyle.fontWeight +
                ' ' +
                this.chart.info.valuesStyle.fontSize +
                ' ' +
                this.chart.style.fontFamily;
            this.canvas.ctx.fillText(value, itemX, itemY);
            this.canvas.ctx.font = this.chart.info.namesStyle.fontSize + ' ' + this.chart.style.fontFamily;
            this.canvas.ctx.fillText(element.name, itemX, itemY + this.chart.info.secondLineShift);
        });
    }

    _drawMiniMapData() {
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.lineJoin = 'round';
        this.canvas.ctx.lineCap = 'round';

        this.miniMap.yAxis.columns.forEach((elemnt) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(this.miniMap.xAxis.values[0], elemnt.values[0]);
            this.canvas.ctx.strokeStyle = this.data.colors[elemnt.id];
            for (let i = 1; i < elemnt.values.length; i++) {
                this.canvas.ctx.lineTo(this.miniMap.xAxis.values[i], elemnt.values[i]);
            }
            this.canvas.ctx.stroke();
        });
    }

    _drawMiniMapFrame() {
        this.canvas.ctx.lineJoin = 'miter';
        this.canvas.ctx.lineCap = 'butt';

        let miniMapX = this.miniMap.xAxis.values[this.chart.displayStartIndex];
        let miniMapY = this.canvas.height - this.miniMap.height - this.chart.buttons.height;

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
        let rightLineX =
            Math.round(this.miniMap.xAxis.values[this.chart.displayEndIndex]) -
            this.miniMap.frame.dragLineWidth / 2 +
            1;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(rightLineX, miniMapY);
        this.canvas.ctx.lineTo(rightLineX, miniMapY + this.miniMap.height - this.miniMap.frame.border.width);
        this.canvas.ctx.stroke();
        this.miniMap.frame.rightDragLine.x =
            Math.round(this.miniMap.xAxis.values[this.chart.displayEndIndex]) - this.miniMap.frame.border.width;
        this.miniMap.frame.rightDragLine.y = miniMapY;

        // top line
        this.canvas.ctx.lineWidth = this.miniMap.frame.border.width;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX, miniMapY - this.miniMap.frame.border.width / 2);
        this.canvas.ctx.lineTo(
            Math.round(this.miniMap.xAxis.values[this.chart.displayEndIndex]) + 1,
            miniMapY - this.miniMap.frame.border.width / 2
        );
        this.canvas.ctx.stroke();

        // bottom line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX, miniMapY + this.miniMap.height - this.miniMap.frame.border.width / 2);
        this.canvas.ctx.lineTo(
            this.miniMap.xAxis.values[this.chart.displayEndIndex] + 1,
            miniMapY + this.miniMap.height - this.miniMap.frame.border.width / 2
        );
        this.canvas.ctx.stroke();

        // set mini map frame coordinates
        this.miniMap.frame.x = this.miniMap.frame.leftDragLine.x + this.miniMap.frame.leftDragLine.width;
        this.miniMap.frame.y = this.miniMap.frame.leftDragLine.y;
        this.miniMap.frame.height = this.miniMap.frame.leftDragLine.height;
        this.miniMap.frame.width = this.miniMap.frame.rightDragLine.x - this.miniMap.frame.x;

        this.canvas.ctx.fillStyle = this.miniMap.frame.border.fadeColor;

        // draw LEFT fade box
        if (this.miniMap.frame.leftDragLine.x > this.canvas.style.leftPadding) {
            let x = this.canvas.style.leftPadding;
            let y = miniMapY - this.miniMap.frame.border.width / 2 - this.miniMap.frame.border.width / 2;
            let width = this.miniMap.frame.leftDragLine.x - this.canvas.style.leftPadding;
            let height =
                this.miniMap.height + -this.miniMap.frame.border.width / 2 + this.miniMap.frame.border.width + 1;
            this.canvas.ctx.fillRect(x, y, width, height);
        }

        // draw RIGHT fade box
        if (this.miniMap.frame.rightDragLine.x + this.miniMap.frame.dragLineWidth < this.miniMap.width) {
            let x = this.miniMap.frame.rightDragLine.x + 2;
            let y = miniMapY - this.miniMap.frame.border.width / 2 - this.miniMap.frame.border.width / 2;
            let width = this.miniMap.width - this.miniMap.frame.rightDragLine.x - this.canvas.style.leftPadding - 2;
            let height =
                this.miniMap.height + -this.miniMap.frame.border.width / 2 + this.miniMap.frame.border.width + 1;
            this.canvas.ctx.fillRect(x, y, width, height);
        }
    }

    _drawButtons() {
        this.chart.buttons.items = [];
        let buttonCount = 0;
        for (let i = 0; i < this.data.columns.length; i++) {
            let column = this.data.columns[i];
            let id = column[0];
            let type = this.data.types[id];
            let index = this.columnsToDisplay.findIndex((i) => {
                return i == id;
            });
            let isHidden = index == -1;
            if (type.toLowerCase() == 'line') {
                let name = this.data.names[id];
                let buttonWidth =
                    this.chart.buttons.style.height +
                    name.length * this.chart.fontMultiplier +
                    this.chart.buttons.style.textRightPadding;

                // draw button border
                let x =
                    this.canvas.style.leftPadding + buttonCount * (buttonWidth + this.chart.buttons.style.leftPadding);
                let y = this.canvas.height - this.miniMap.height + this.chart.buttons.style.topPadding;
                let height = this.chart.buttons.style.height;
                let width = buttonWidth;

                this.canvas.ctx.save();
                this.canvas.ctx.lineWidth = 0.7;
                this.canvas.ctx.strokeStyle = this.chart.buttons.style.color;
                this.canvas.drawRoundedRect(x, y, width, height, 15);
                this.canvas.ctx.stroke();

                // draw button color circle
                let radius = height / 3;
                let circleX = x + this.chart.buttons.style.height / 2;
                let circleY = y + this.chart.buttons.style.height / 2;
                this.canvas.ctx.fillStyle = this.data.colors[id];
                this.canvas.ctx.beginPath();
                this.canvas.ctx.arc(circleX, circleY, radius, Math.PI + (Math.PI * 2) / 2, false);
                this.canvas.ctx.fill();

                if (isHidden == true) {
                    this.canvas.ctx.fillStyle =
                        this.isNightMode == true ? this.canvas.style.darkModeColor : this.canvas.style.ligthModeColor;
                    this.canvas.ctx.beginPath();
                    this.canvas.ctx.arc(circleX + 0.1, circleY + 0.1, radius - 2, Math.PI + (Math.PI * 2) / 2, false);
                    this.canvas.ctx.fill();
                } else {
                    this.canvas.ctx.beginPath();
                    this.canvas.ctx.lineWidth = 2;
                    this.canvas.ctx.strokeStyle = this.chart.buttons.style.checkColor;
                    this.canvas.ctx.moveTo(circleX - 4, circleY);
                    this.canvas.ctx.lineTo(circleX - 1, circleY + 3);
                    this.canvas.ctx.lineTo(circleX + 4, circleY - 2);
                    this.canvas.ctx.stroke();
                }

                this.canvas.ctx.font = this.chart.buttons.style.fontSize + 'px ' + this.chart.style.fontFamily;
                this.canvas.ctx.fillStyle =
                    this.isNightMode == true ? this.chart.style.fontColorDarkMode : this.chart.style.fontColorLightMode;
                this.canvas.ctx.fillText(name, circleX + 12, circleY + 4);

                this.canvas.ctx.restore();

                this.chart.buttons.items.push({ x: x, y: y, id: id, width: buttonWidth });
                buttonCount++;
            }
        }
    }

    _parseData() {
        const sliceStartIndex = 1;
        this.data.columns.slice(0, 1).forEach((column) => {
            this.chart.xAxis = {
                id: column[0],
                originalValues: column.slice(sliceStartIndex, column.length),
                values: new Array(),
            };
            this.miniMap.xAxis = {
                id: column[0],
                originalValues: column.slice(sliceStartIndex, column.length),
                values: new Array(),
            };
        });
        this.data.columns.slice(1).forEach((column) => {
            let index = this.columnsToDisplay.findIndex((id) => {
                return id == column[0];
            });
            if (index != -1) {
                this.chart.yAxis.columns.push({
                    id: column[0],
                    name: this.data.names[column[0]],
                    originalValues: column.slice(sliceStartIndex, column.length),
                    values: new Array(),
                    color: this.data.colors[column[0]],
                });
                this.miniMap.yAxis.columns.push({
                    id: column[0],
                    originalValues: column.slice(sliceStartIndex, column.length),
                    values: new Array(),
                    color: this.data.colors[column[0]],
                });
            }
        });
    }

    _calculateChartData(animatedMaxValue) {
        // calculate maxValue
        let maxValue = this._findMaxValue(this.chart.displayStartIndex, this.chart.displayEndIndex);
        let maxValueToUse = 0;
        if (this.previousChartMaxValue == 0) {
            this.previousChartMaxValue = maxValue;
        }
        if (animatedMaxValue == 0) {
            maxValueToUse = maxValue;
        } else {
            maxValueToUse = animatedMaxValue;
        }
        //let maxValue = this._findMaxValue(0, this.chart.xAxis.originalValues.length - 1);

        // init data
        this.chart.xAxis.values = new Array();
        this.chart.yAxis.columns.forEach((element) => {
            element.values = new Array();
        });

        // calcualate axis scale factor
        this.chart.xAxis.scaleFactor = this.canvas.width / (this.chart.displayEndIndex - this.chart.displayStartIndex);
        this.chart.yAxis.scaleFactor = this.canvas.height / maxValueToUse;

        // get minimap scale factor to multiply Y values
        // shifts all values up to free space for minimap
        let miniMapScaleShift =
            (this.canvas.height -
                this.miniMap.height -
                this.chart.axis.style.bottomPadding -
                this.chart.buttons.height) /
            (this.canvas.height + this.chart.axis.style.topPadding);

        // calculate X values
        let index = 0;
        for (let i = this.chart.displayStartIndex; i <= this.chart.displayEndIndex; i++) {
            this.chart.xAxis.values.push({
                scaledValue:
                    index * this.chart.xAxis.scaleFactor * this.canvas.xScaleShift + this.canvas.style.leftPadding,
                originalValue: this.chart.xAxis.originalValues[i],
            });
            index++;
        }

        // calculate Y values
        this.chart.yAxis.columns.forEach((column) => {
            for (let i = this.chart.displayStartIndex; i <= this.chart.displayEndIndex; i++) {
                let scaledY = column.originalValues[i] * this.chart.yAxis.scaleFactor * miniMapScaleShift;
                let y =
                    this.canvas.height -
                    scaledY -
                    this.miniMap.height -
                    this.chart.axis.style.bottomPadding -
                    this.chart.buttons.height;
                column.values.push({
                    scaledValue: y,
                    originalValue: column.originalValues[i],
                });
            }
        });

        // calculate display axis data
        this.chart.axis.xLabels.values = new Array();
        this.chart.axis.yLabels.values = new Array();
        this.chart.axis.grid = new Array();

        // calculate Y axis labels
        let yMultiplier = this.axisHelper.getAxisLabelsMultiplier(maxValueToUse, this.chart.axis.yLabels.displayCoef);
        for (let i = 0; i < this.chart.axis.yLabels.displayCoef; i++) {
            let value = Math.round(yMultiplier * i);
            let scaledValue = value * this.chart.yAxis.scaleFactor;
            let yValue =
                this.canvas.height -
                scaledValue -
                this.miniMap.height -
                this.chart.axis.style.bottomPadding -
                this.chart.buttons.height;
            if (yValue > this.chart.axis.style.fontSize + 1) {
                this.chart.axis.yLabels.values.push({
                    text: value,
                    x: this.canvas.style.leftPadding,
                    y: yValue - this.chart.axis.style.textBottomPadding,
                });
                this.chart.axis.grid.push({
                    x1: this.canvas.style.leftPadding,
                    y1: yValue,
                    x2: this.canvas.width - this.canvas.style.rightPadding,
                    y2: yValue,
                });
            }
        }

        // calculate X axis labels
        let count = Math.ceil(
            (this.canvas.width - this.canvas.style.leftPadding - this.canvas.style.rightPadding) /
                this.chart.axis.style.textLabelPlaceHolder
        );
        let ticks = this.axisHelper.getDateIncrementsForAxis(
            this.chart.xAxis.originalValues[this.chart.displayStartIndex],
            this.chart.xAxis.originalValues[this.chart.displayEndIndex],
            count
        );
        for (let i = 0; i < ticks.length; i++) {
            let xIndex = this.chart.xAxis.values.findIndex((element, index) => {
                if (element.originalValue == ticks[i]) {
                    return true;
                }
            });
            if (xIndex != -1 && xIndex < this.chart.xAxis.values.length) {
                let xValue = 0;
                if (i == 0) {
                    xValue = this.chart.xAxis.values[xIndex].scaledValue;
                } else if (
                    this.chart.xAxis.values[xIndex].scaledValue + 20 >
                    this.canvas.width - this.canvas.style.rightPadding - this.canvas.style.leftPadding
                ) {
                    xValue = this.canvas.width - this.canvas.style.rightPadding - this.canvas.style.leftPadding - 25;
                } else {
                    xValue = this.chart.xAxis.values[xIndex].scaledValue - this.chart.axis.style.textLeftPadding;
                }
                let originalValue = ticks[i];
                let date = this.dateHelper.convertToDate(originalValue);
                let displayText = this.dateHelper.getMonthShortName(date.getMonth()) + ' ' + date.getDate();
                this.chart.axis.xLabels.values.push({
                    text: displayText,
                    x: xValue,
                    y:
                        this.canvas.height -
                        this.miniMap.height -
                        this.chart.buttons.height +
                        this.chart.axis.style.textTopPadding -
                        this.chart.axis.style.bottomPadding +
                        this.chart.axis.style.fontSize,
                });
            }
        }
    }

    _calculateMiniMapData(animatedMaxValue) {
        // reset data
        this.miniMap.xAxis.values = [];
        this.miniMap.yAxis.columns.forEach((element) => {
            element.values = [];
        });

        // calculate maxValue
        let maxValueToUse = 0;
        let maxValue = this._findMaxValue(0, this.chart.xAxis.originalValues.length - 1);
        if (this.previousMiniMapMaxValue == 0) {
            this.previousMiniMapMaxValue = maxValue;
        }
        if (animatedMaxValue == 0) {
            maxValueToUse = maxValue;
        } else {
            maxValueToUse = animatedMaxValue;
        }

        // calcualate axis scale factor
        this.miniMap.xAxis.scaleFactor = this.canvas.width / (this.chart.xAxis.originalValues.length - 1);
        this.miniMap.yAxis.scaleFactor = this.miniMap.height / maxValueToUse;

        // calculate X axis values
        this.miniMap.xAxis.originalValues.forEach((element, index) => {
            this.miniMap.xAxis.values.push(
                index * this.miniMap.xAxis.scaleFactor * this.canvas.xScaleShift + this.canvas.style.leftPadding
            );
        });

        // calculate Y axis values
        this.miniMap.yAxis.columns.forEach((column, index) => {
            for (let i = 0; i < this.chart.yAxis.columns[index].originalValues.length; i++) {
                let scaledY = this.chart.yAxis.columns[index].originalValues[i] * this.miniMap.yAxis.scaleFactor;
                let y = this.canvas.height - scaledY - this.chart.buttons.height;
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

    _isOverLeftDragLine(x, y) {
        return (
            x + this.miniMap.frame.dragErrorPixelFactor >= this.miniMap.frame.leftDragLine.x &&
            x - this.miniMap.frame.dragErrorPixelFactor <=
                this.miniMap.frame.leftDragLine.x + this.miniMap.frame.leftDragLine.width &&
            y >= this.miniMap.frame.leftDragLine.y &&
            y <= this.miniMap.frame.leftDragLine.y + this.miniMap.frame.leftDragLine.height
        );
    }

    _isOverRightDragLine(x, y) {
        return (
            x + this.miniMap.frame.dragErrorPixelFactor >= this.miniMap.frame.rightDragLine.x &&
            x - this.miniMap.frame.dragErrorPixelFactor <=
                this.miniMap.frame.rightDragLine.x + this.miniMap.frame.rightDragLine.width &&
            y >= this.miniMap.frame.rightDragLine.y &&
            y <= this.miniMap.frame.rightDragLine.y + this.miniMap.frame.rightDragLine.height
        );
    }

    _isOverDragFrame(x, y) {
        return (
            x >= this.miniMap.frame.x &&
            x <= this.miniMap.frame.x + this.miniMap.frame.width &&
            y >= this.miniMap.frame.y &&
            y <= this.miniMap.frame.y + this.miniMap.frame.height
        );
    }

    _isOverChart(x, y) {
        return (
            x >= 0 &&
            x <= this.canvas.width &&
            y >= this.chart.axis.style.topPadding &&
            y <=
                this.canvas.height -
                    this.miniMap.height -
                    this.chart.axis.style.bottomPadding -
                    this.chart.buttons.height
        );
    }

    _isOverButton(x, y) {
        return this.chart.buttons.items.some((button) => {
            return (
                x >= button.x &&
                x <= button.x + button.width &&
                y >= button.y &&
                y <= button.y + this.chart.buttons.style.height
            );
        });
    }

    _getButtonId(x, y) {
        let button = this.chart.buttons.items.find((button) => {
            return (
                x >= button.x &&
                x <= button.x + button.width &&
                y >= button.y &&
                y <= button.y + this.chart.buttons.style.height
            );
        });
        if (button != null) {
            return button.id;
        }
        return null;
    }

    _getClickedChartIndex() {
        for (let i = 0; i < this.chart.xAxis.values.length; i++) {
            if (i == 0) {
                if (
                    this.clickXInfo >= 0 &&
                    this.clickXInfo <
                        (this.chart.xAxis.values[i].scaledValue + this.chart.xAxis.values[i + 1].scaledValue) / 2
                ) {
                    return i;
                }
            } else if (i == this.chart.xAxis.values.length - 1) {
                if (
                    this.clickXInfo >=
                        (this.chart.xAxis.values[i - 1].scaledValue + this.chart.xAxis.values[i].scaledValue) / 2 &&
                    this.clickXInfo <= this.canvas.width
                ) {
                    return i;
                }
            } else {
                if (
                    this.clickXInfo >=
                        (this.chart.xAxis.values[i - 1].scaledValue + this.chart.xAxis.values[i].scaledValue) / 2 &&
                    this.clickXInfo <
                        (this.chart.xAxis.values[i].scaledValue + this.chart.xAxis.values[i + 1].scaledValue) / 2
                ) {
                    return i;
                }
            }
        }

        return -1;
    }

    _writeLog(msg) {
        let logElement = document.getElementById('log');
        logElement.innerHTML = logElement.innerHTML + '<br />' + msg;
    }
}

export default ChartBuilder;
