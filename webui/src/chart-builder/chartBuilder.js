import MiniMap from './miniMap';
import * as ActionTypes from './dragActionTypes';
import DateHelper from './helpers/dateHelper';
import AxisHelper from './helpers/axisHelper';
import Canvas from './canvas';
import Chart from './chart';

class ChartBuilder {
    constructor(canvas, initData, config, dataPrivider) {
        this.canvas = new Canvas(canvas);
        this.data = initData;
        this.zoomedData = null;
        this.dataPrivider = dataPrivider;
        this.chart = new Chart();
        this.miniMap = new MiniMap();
        this.dateHelper = new DateHelper();
        this.axisHelper = new AxisHelper();
        this.columnsToDisplay = new Array();

        /* internal veriables */
        this.isDragging = false;
        this.enableZoom = false;
        this.drawInfoBox = false;
        this.zoomIn = false;
        this.actionType = ActionTypes.EMPTY;
        this.clickChartX = 0;
        this.clickMiniMapX = 0;
        this.clickedTimestamp = 0;
        this.isNightMode = false;

        this._setConfigValues(config);

        this.canvas.ref.addEventListener('mousedown', this);
        this.canvas.ref.addEventListener('mouseup', this);
        this.canvas.ref.addEventListener('mousemove', this);
        this.canvas.ref.addEventListener('mouseout', this);

        this.canvas.ref.addEventListener('touchstart', this);
        this.canvas.ref.addEventListener('touchend', this);
        this.canvas.ref.addEventListener('touchcancel', this);
        this.canvas.ref.addEventListener('touchmove', this);

        this._init();
        this.render();
    }

    // should be called each time component has to be re-rendered.
    render() {
        this.canvas.setup();

        this._reset();
        this._parseData(this.data, this.chart.data, this.miniMap.data);
        this._calculateData(this.chart.data, this.miniMap.data, 0, 0);
        this._drawComponents(this.chart.data, this.miniMap.data);
    }

    // call to switch from light to dark mode.
    swithcMode() {
        if (this.isNightMode == true) {
            this.isNightMode = false;
        } else {
            this.isNightMode = true;
        }

        this._calculateChartData(0, this._getCurrentChartDataSet());
        this._calculateMiniMapData(0, this._getCurrentChartDataSet(), this._getCurrentMiniMapDataSet());
        this._drawComponents(this._getCurrentChartDataSet(), this._getCurrentMiniMapDataSet());
    }

    // call when want to hide a column
    hideColumn(columnId) {
        if (this._getCurrentChartDataSet().yAxis.columns.length == 1) {
            return;
        }
        let index = this._getArrayIndex(this.columnsToDisplay, columnId);
        if (index != -1) {
            this.columnsToDisplay.splice(index, 1);
            this._reset();
            this._parseData(
                this._getCurrentDataSet(),
                this._getCurrentChartDataSet(),
                this._getCurrentMiniMapDataSet()
            );
            this._animate(
                this.canvas.buttonAnimation,
                this._getCurrentChartDataSet(),
                this._getCurrentMiniMapDataSet()
            );
        }
    }

    // call when want show a column
    showColumn(columnId) {
        let index = this._getArrayIndex(this.columnsToDisplay, columnId);
        if (index == -1) {
            this.columnsToDisplay.push(columnId);
            this._reset();
            this._parseData(
                this._getCurrentDataSet(),
                this._getCurrentChartDataSet(),
                this._getCurrentMiniMapDataSet()
            );
            this._animate(
                this.canvas.buttonAnimation,
                this._getCurrentChartDataSet(),
                this._getCurrentMiniMapDataSet()
            );
        }
    }

    _setConfigValues(config) {
        if (config === null) {
            return;
        }

        if (config.yLabelsDisplayCoef != null) {
            this.chart.data.axis.yLabels.displayCoef = config.yLabelsDisplayCoef;
        }

        if (config.title != null) {
            this.chart.header.title = config.title;
        }

        if (config.minDisplayPositions != null) {
            this.miniMap.data.frame.minDisplayPositions = config.minDisplayPositions;
        }

        if (config.enableZoom != null) {
            this.enableZoom = config.enableZoom;
        }
    }

    _calculateData(chartData, miniMapData, chartMaxValue, miniMapMaxValue) {
        this._calculateChartData(chartMaxValue, chartData);
        this._calculateMiniMapData(miniMapMaxValue, chartData, miniMapData);
    }

    _drawComponents(chartData, miniMapData) {
        this.canvas.clear(this.isNightMode);
        this._drawMiniMapData(miniMapData);
        this._drawMiniMapFrame(miniMapData, chartData.displayStartIndex, chartData.displayEndIndex);
        this._drawChartData(chartData);
        this._drawChartInfo(chartData);
        this._drawButtons();
    }

    _animate(animationSettings, chartData, miniMapData) {
        let newChartMaxValue = this._findMaxValue(chartData, chartData.displayStartIndex, chartData.displayEndIndex);
        let newMiniMapMaxValue = this._findMaxValue(chartData, 0, chartData.xAxis.originalValues.length - 1);

        if (newChartMaxValue < chartData.previousMaxValue) {
            let incrementChart = (chartData.previousMaxValue - newChartMaxValue) / animationSettings.iterations;
            let incrementMiniMap = (miniMapData.previousMaxValue - newMiniMapMaxValue) / animationSettings.iterations;
            let animatedChartMaxValue = chartData.previousMaxValue - incrementChart;
            let animatedMiniMapMaxValue = miniMapData.previousMaxValue - incrementMiniMap;
            let that = this;
            for (let i = 0; i < animationSettings.iterations; i++) {
                (function(i) {
                    setTimeout(function() {
                        that._calculateData(
                            chartData,
                            miniMapData,
                            animatedChartMaxValue - incrementChart * i,
                            animatedMiniMapMaxValue - incrementMiniMap * i
                        );
                        that._drawComponents(chartData, miniMapData);
                    }, animationSettings.timeOut * i);
                })(i);
            }
            chartData.previousMaxValue = newChartMaxValue;
            miniMapData.previousMaxValue = newMiniMapMaxValue;
        } else if (newChartMaxValue > chartData.previousMaxValue) {
            let incrementChart = (newChartMaxValue - chartData.previousMaxValue) / animationSettings.iterations;
            let incrementMiniMap = (newMiniMapMaxValue - miniMapData.previousMaxValue) / animationSettings.iterations;
            let animatedChartMaxValue = chartData.previousMaxValue + incrementChart;
            let animatedMiniMapMaxValue = miniMapData.previousMaxValue + incrementMiniMap;
            let that = this;
            for (let i = 0; i < animationSettings.iterations; i++) {
                (function(i) {
                    setTimeout(function() {
                        that._calculateData(
                            chartData,
                            miniMapData,
                            animatedChartMaxValue + incrementChart * i,
                            animatedMiniMapMaxValue + incrementMiniMap * i
                        );
                        that._drawComponents(chartData, miniMapData);
                    }, animationSettings.timeOut * i);
                })(i);
            }
            chartData.previousMaxValue = newChartMaxValue;
            miniMapData.previousMaxValue = newMiniMapMaxValue;
        } else {
            this._calculateData(chartData, miniMapData, 0, 0);
            this._drawComponents(chartData, miniMapData);
        }
    }

    handleEvent(event) {
        event.stopPropagation();
        switch (event.type) {
            case 'mousedown':
                this._handleMouseDown(
                    this._getCurrentChartDataSet(),
                    this._getCurrentMiniMapDataSet(),
                    event.offsetX,
                    event.offsetY
                );
                break;
            case 'mouseup':
                this._handleMouseUp();
                break;
            case 'mousemove':
                this._handleMouseMove(this._getCurrentChartDataSet(), this._getCurrentMiniMapDataSet(), event);
                break;
            case 'touchstart':
            case 'touchmove':
                this._handleTouch(this._getCurrentChartDataSet(), this._getCurrentMiniMapDataSet(), event);
                break;
            case 'mouseout':
            case 'touchend':
            case 'touchcancel':
                this._handleMouseOut();
                break;
        }
    }

    _handleTouch(chartData, miniMapData, event) {
        this.isTouch = true;
        //event.preventDefault();
        if (event.touches.length > 1 || (event.type == 'touchend' && event.touches.length > 0)) {
            return;
        }

        let touch = null;

        switch (event.type) {
            case 'touchstart':
                touch = event.touches[0];
                this._handleMouseDown(
                    chartData,
                    miniMapData,
                    touch.pageX - this.canvas.getOffsetLeft(this.canvas.ref),
                    touch.pageY - this.canvas.getOffsetTop(this.canvas.ref)
                );
                break;
            case 'touchmove':
                touch = event.touches[0];
                this._handleDragging(touch.pageX - this.canvas.getOffsetLeft(this.canvas.ref), chartData, miniMapData);
                break;
            case 'touchend':
                this._handleMouseUp(event);
                break;
        }
    }

    _handleMouseDown(chartData, miniMapData, x, y) {
        if (this._isOverLeftDragLine(miniMapData, x, y)) {
            this.isDragging = true;
            this.drawInfoBox = false;
            this.actionType = ActionTypes.DRAG_LEFT_LINE;
            this.canvas.ref.style.cursor = 'col-resize';
        } else if (this._isOverRightDragLine(miniMapData, x, y)) {
            this.isDragging = true;
            this.drawInfoBox = false;
            this.actionType = ActionTypes.DRAG_RIGHT_LINE;
            this.canvas.ref.style.cursor = 'col-resize';
        } else if (this._isOverDragFrame(miniMapData, x, y)) {
            this.isDragging = true;
            this.drawInfoBox = false;
            this.actionType = ActionTypes.DRAG_FRAME;
            this.canvas.ref.style.cursor = 'move';
            this.clickMiniMapX = x;
        } else if (this._isOverInfoBox(x, y)) {
            if (this.clickedTimestamp != 0 && this.enableZoom === true && this.zoomIn == false) {
                let that = this;
                this.dataPrivider.getSpecificData(this.clickedTimestamp, function(data) {
                    that.zoomIn = true;
                    that.zoomedData = data;
                    that.chart.zoomedData.displayStartIndex = 0;
                    that.chart.zoomedData.displayEndIndex = that.zoomedData.columns[0].length - 2;
                    that._parseData(that.zoomedData, that.chart.zoomedData, that.miniMap.zoomedData);
                    that._calculateData(that.chart.zoomedData, that.miniMap.zoomedData, 0, 0);
                    that._drawComponents(that.chart.zoomedData, that.miniMap.zoomedData);
                });
            }
        } else if (this._isOverZoomButton(x, y)) {
            // load new data
            // zoom in out
        } else if (this._isOverChart(x, y)) {
            this.clickChartX = x;
            this.drawInfoBox = true;
            this._calculateChartData(0, chartData);
            this._calculateMiniMapData(0, chartData, miniMapData);
            this._drawComponents(chartData, miniMapData);
        } else if (this._isOverButton(x, y)) {
            this.canvas.ref.style.cursor = 'pointer';
            let id = this._getButtonId(x, y);
            if (id != null) {
                let index = this._getArrayIndex(this.columnsToDisplay, id);
                if (index != -1) {
                    this.hideColumn(id);
                } else {
                    this.showColumn(id);
                }
            }
        }
    }

    _handleMouseUp() {
        this.isDragging = false;
        this.actionType = ActionTypes.EMPTY;
        this.canvas.ref.style.cursor = 'default';
    }

    _handleDragging(x, chartData, miniMapData) {
        if (this.isDragging === true && this.actionType == ActionTypes.DRAG_LEFT_LINE) {
            // drag left line
            for (let i = 0; i < chartData.displayEndIndex - miniMapData.frame.minDisplayPositions - 2; i++) {
                if (x >= miniMapData.xAxis.values[i] && x <= miniMapData.xAxis.values[i + 1]) {
                    chartData.displayStartIndex = i;
                    this._animate(this.canvas.scrollAnimation, chartData, miniMapData);
                    break;
                }
            }
        } else if (this.isDragging === true && this.actionType == ActionTypes.DRAG_FRAME) {
            // drag frame
            if (this.clickMiniMapX > x) {
                if (chartData.displayStartIndex > 0) {
                    chartData.displayStartIndex -= 1;
                    chartData.displayEndIndex -= 1;
                }
            } else if (this.clickMiniMapX < x) {
                if (chartData.displayEndIndex < miniMapData.xAxis.values.length - 1) {
                    chartData.displayStartIndex += 1;
                    chartData.displayEndIndex += 1;
                }
            }
            this._animate(this.canvas.scrollAnimation, chartData, miniMapData);
            this.clickMiniMapX = x;
        } else if (this.isDragging === true && this.actionType == ActionTypes.DRAG_RIGHT_LINE) {
            // drag right line
            for (
                let i = miniMapData.xAxis.values.length - 1;
                i > chartData.displayStartIndex + miniMapData.frame.minDisplayPositions;
                i--
            ) {
                if (x <= miniMapData.xAxis.values[i] && x >= miniMapData.xAxis.values[i - 1]) {
                    chartData.displayEndIndex = i;
                    this._animate(this.canvas.scrollAnimation, chartData, miniMapData);
                    break;
                }
            }
        }
    }

    _handleMouseMove(chartData, miniMapData, e) {
        let x = e.offsetX;
        let y = e.offsetY;
        if (this.isTouch === true) {
            return;
        }
        if (this._isOverLeftDragLine(miniMapData, x, y) || this._isOverRightDragLine(miniMapData, x, y)) {
            this.canvas.ref.style.cursor = 'col-resize';
        } else if (this._isOverDragFrame(miniMapData, x, y)) {
            this.canvas.ref.style.cursor = 'move';
        } else if (this._isOverChart(x, y) || this._isOverButton(x, y) || this._isOverInfoBox(x, y)) {
            this.canvas.ref.style.cursor = 'pointer';
        } else {
            this.canvas.ref.style.cursor = 'default';
        }

        this._handleDragging(event.offsetX, chartData, miniMapData);
    }

    _handleMouseOut() {
        this.isTouch = false;
        this.isDragging = false;
        this.actionType = ActionTypes.EMPTY;
    }

    _init() {
        // get column ids to display. all columns in the begining
        this.data.columns.forEach((element) => {
            this.columnsToDisplay.push(element[0]);
        });

        // set initial indexes: 0 and last elements
        this.chart.data.displayStartIndex = 0;
        // -1 because of array indexation, and -1 because first element is not a value = -2
        this.chart.data.displayEndIndex = this.data.columns[0].length - 2;
    }

    _reset() {
        this.chart.data.xAxis.values = [];
        this.chart.data.xAxis.originalValues = [];
        this.chart.data.yAxis.columns = [];
        this.chart.zoomedData.xAxis.values = [];
        this.chart.zoomedData.xAxis.originalValues = [];
        this.chart.zoomedData.yAxis.columns = [];

        this.miniMap.data.yAxis.columns = [];
        this.miniMap.data.xAxis.values = [];
        this.miniMap.zoomedData.yAxis.columns = [];
        this.miniMap.zoomedData.xAxis.values = [];
        this.miniMap.x = 0;
        this.miniMap.y = this.canvas.height - this.miniMap.height - this.chart.buttons.height;
        this.miniMap.width = this.canvas.width;
    }

    _drawChartData(data) {
        // draw background rectangle to overlay minimap animation
        this.canvas.ctx.fillStyle =
            this.isNightMode === true ? this.canvas.style.darkModeColor : this.canvas.style.ligthModeColor;
        this.canvas.ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height - this.miniMap.height - this.chart.buttons.height - this.miniMap.style.border.width
        );

        // draw axis grid
        this.canvas.ctx.lineWidth = this.chart.style.axis.gridLineWidth;
        this.canvas.ctx.font = this.chart.style.axis.fontSize + 'px ' + this.chart.style.fontFamily;
        data.axis.grid.values.forEach((element) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.strokeStyle =
                this.isNightMode === true ? this.chart.style.axis.lightModeColor : this.chart.style.axis.lightModeColor;
            this.canvas.ctx.moveTo(element.x1, element.y1);
            this.canvas.ctx.lineTo(element.x2, element.y2);
            this.canvas.ctx.stroke();
        });

        // draw X axis labels
        this.canvas.ctx.fillStyle =
            this.isNightMode === true
                ? this.chart.style.axis.darkModeFontColor
                : this.chart.style.axis.lightModeFontColor;
        data.axis.xLabels.values.forEach((element) => {
            this.canvas.ctx.fillText(element.text, element.x, element.y);
        });
        // draw Y asxis labels
        this.canvas.ctx.fillStyle = this.chart.style.axis.fontColor;
        data.axis.yLabels.values.forEach((element) => {
            this.canvas.ctx.fillText(element.text, element.x, element.y);
        });

        // draw char lines
        this.canvas.ctx.lineJoin = 'round';
        this.canvas.ctx.lineCap = 'round';
        this.canvas.ctx.lineWidth = this.chart.style.lineWidth;
        data.yAxis.columns.forEach((element) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.strokeStyle = element.color;
            this.canvas.ctx.moveTo(data.xAxis.values[0].scaledValue, element.values[0].scaledValue);
            for (let i = 1; i < element.values.length; i++) {
                this.canvas.ctx.lineTo(data.xAxis.values[i].scaledValue, element.values[i].scaledValue);
            }

            this.canvas.ctx.stroke();
        });
    }

    _drawChartInfo(data) {
        // get clicked index
        if (this.drawInfoBox == false) {
            return;
        }
        let infoIndex = this._getClickedChartIndex(data);
        if (infoIndex == -1) {
            return;
        }
        // set X clicked value
        this._setClickedTimestamp(infoIndex, data);
        const infoLineTopPadding = 20;
        let chartX = data.xAxis.values[infoIndex].scaledValue;

        // draw info line
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.strokeStyle = this.chart.info.style.color;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(chartX, infoLineTopPadding);
        this.canvas.ctx.lineTo(
            chartX,
            this.canvas.height - this.miniMap.height - this.chart.style.axis.bottomPadding - this.chart.buttons.height
        );
        this.canvas.ctx.stroke();

        // draw info circles
        data.yAxis.columns.forEach((element) => {
            let y = element.values[infoIndex].scaledValue;
            this.canvas.ctx.fillStyle = element.color;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(chartX, y, 4.5, Math.PI + (Math.PI * 2) / 2, false);
            this.canvas.ctx.fill();
            this.canvas.ctx.fillStyle =
                this.isNightMode === true ? this.canvas.style.darkModeColor : this.canvas.style.ligthModeColor;
            this.canvas.ctx.beginPath();
            this.canvas.ctx.arc(chartX, y, 2.5, Math.PI + (Math.PI * 2) / 2, false);
            this.canvas.ctx.fill();
        });

        let date = this.dateHelper.convertToDate(data.xAxis.values[infoIndex].originalValue);
        let headerText =
            this.dateHelper.getDayShortName(date.getDay()) +
            ', ' +
            this.dateHelper.getMonthShortName(date.getMonth()) +
            ' ' +
            date.getDate();

        /*----------- draw info box ----------*/
        let valuesLength = 0;
        data.yAxis.columns.forEach((element) => {
            valuesLength += element.values[infoIndex].originalValue.toString().length;
        });
        let maxContentLegth = valuesLength > headerText.length ? valuesLength : headerText.length;

        this.chart.info.width = maxContentLegth * this.chart.fontMultiplier + this.chart.info.style.rightPadding;
        if (chartX - this.chart.info.width / 2 + this.chart.info.width >= this.canvas.width) {
            this.chart.info.x = this.canvas.width - this.chart.info.width - this.canvas.style.rightPadding;
        } else if (chartX - this.chart.info.width / 2 <= 0) {
            this.chart.info.x = this.canvas.style.leftPadding;
        } else {
            this.chart.info.x = chartX - this.chart.info.width / 2;
        }

        this.chart.info.y = this.chart.info.style.topShift;
        const infoBoxCornersRadius = 10;

        this.canvas.ctx.save();
        this.canvas.ctx.strokeStyle =
            this.isNightMode === true ? this.chart.info.style.darkModeColor : this.chart.info.style.color;
        this.canvas.ctx.shadowOffsetX = 1;
        this.canvas.ctx.shadowOffsetY = 1;
        this.canvas.ctx.shadowBlur = 4;
        this.canvas.ctx.shadowColor =
            this.isNightMode === true
                ? this.chart.info.style.borderColorDarkMode
                : this.chart.info.style.borderColorLightMode;
        this.canvas.drawRoundedRect(
            this.chart.info.x,
            this.chart.info.y,
            this.chart.info.width,
            this.chart.info.height,
            infoBoxCornersRadius
        );
        this.canvas.ctx.stroke();
        this.canvas.ctx.restore();

        this.canvas.ctx.fillStyle =
            this.isNightMode === true ? this.canvas.style.darkModeColor : this.canvas.style.ligthModeColor;
        this.canvas.drawRoundedRect(
            this.chart.info.x,
            this.chart.info.y,
            this.chart.info.width,
            this.chart.info.height,
            infoBoxCornersRadius
        );
        this.canvas.ctx.fill();

        // draw header text
        let headerTextX = this.chart.info.x + this.chart.info.style.leftPadding;
        let headerTextY = this.chart.info.y + this.chart.info.style.topPadding;
        this.canvas.ctx.font = this.chart.info.style.headerFontSize + 'px ' + this.chart.style.fontFamily;
        this.canvas.ctx.fillStyle =
            this.isNightMode === true ? this.chart.style.fontColorDarkMode : this.chart.style.fontColorLightMode;
        this.canvas.ctx.fillText(headerText, headerTextX, headerTextY);

        // draw info lines
        let columnShift = 0;
        data.yAxis.columns.forEach((element) => {
            let value = element.values[infoIndex].originalValue;
            let itemX = this.chart.info.x + this.chart.info.style.leftPadding + columnShift;
            columnShift = columnShift + value.toString().length * this.chart.fontMultiplier;
            let itemY = this.chart.info.y + this.chart.info.style.fistLineShift;
            this.canvas.ctx.fillStyle = element.color;
            this.canvas.ctx.font =
                this.chart.info.style.valuesFontWeight +
                ' ' +
                this.chart.info.style.valuesFontSize +
                'px ' +
                this.chart.style.fontFamily;
            this.canvas.ctx.fillText(value, itemX, itemY);
            this.canvas.ctx.font = this.chart.info.style.namesFontSize + 'px ' + this.chart.style.fontFamily;
            this.canvas.ctx.fillText(element.name, itemX, itemY + this.chart.info.style.secondLineShift);
        });
    }

    _drawMiniMapData(data) {
        this.canvas.ctx.lineWidth = this.miniMap.style.lineWidth;
        this.canvas.ctx.lineJoin = 'round';
        this.canvas.ctx.lineCap = 'round';

        data.yAxis.columns.forEach((element) => {
            this.canvas.ctx.beginPath();
            this.canvas.ctx.moveTo(data.xAxis.values[0], element.values[0]);
            this.canvas.ctx.strokeStyle = element.color;
            for (let i = 1; i < element.values.length; i++) {
                this.canvas.ctx.lineTo(data.xAxis.values[i], element.values[i]);
            }
            this.canvas.ctx.stroke();
        });
    }

    _drawMiniMapFrame(data, displayStartIndex, displayEndIndex) {
        this.canvas.ctx.lineJoin = 'miter';
        this.canvas.ctx.lineCap = 'butt';

        let miniMapX = data.xAxis.values[displayStartIndex];
        let miniMapY = this.canvas.height - this.miniMap.height - this.chart.buttons.height;

        this.canvas.ctx.strokeStyle =
            this.isNightMode === true
                ? this.miniMap.style.border.darkModeColor
                : this.miniMap.style.border.lightModeColor;

        // left line
        this.canvas.ctx.lineWidth = this.miniMap.style.dragLineWidth;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX + Math.floor(this.miniMap.style.dragLineWidth / 2) - 0.6, miniMapY);
        this.canvas.ctx.lineTo(
            miniMapX + Math.floor(this.miniMap.style.dragLineWidth / 2) - 0.6,
            miniMapY + this.miniMap.height - this.miniMap.style.border.width
        );
        this.canvas.ctx.stroke();
        data.frame.leftDragLine.x = miniMapX;
        data.frame.leftDragLine.y = miniMapY;

        // rigth line
        let rightLineX = Math.round(data.xAxis.values[displayEndIndex]) - this.miniMap.style.dragLineWidth / 2 + 1;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(rightLineX, miniMapY);
        this.canvas.ctx.lineTo(rightLineX, miniMapY + this.miniMap.height - this.miniMap.style.border.width);
        this.canvas.ctx.stroke();
        data.frame.rightDragLine.x = Math.round(data.xAxis.values[displayEndIndex]) - this.miniMap.style.border.width;
        data.frame.rightDragLine.y = miniMapY;

        // top line
        this.canvas.ctx.lineWidth = this.miniMap.style.border.width;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX - 0.5, miniMapY - this.miniMap.style.border.width / 2);
        this.canvas.ctx.lineTo(
            Math.round(data.xAxis.values[displayEndIndex]) + 1,
            miniMapY - this.miniMap.style.border.width / 2
        );
        this.canvas.ctx.stroke();

        // bottom line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(miniMapX - 0.6, miniMapY + this.miniMap.height - this.miniMap.style.border.width / 2);
        this.canvas.ctx.lineTo(
            Math.round(data.xAxis.values[displayEndIndex]) + 1,
            miniMapY + this.miniMap.height - this.miniMap.style.border.width / 2
        );
        this.canvas.ctx.stroke();

        // set mini map frame coordinates
        data.frame.x = data.frame.leftDragLine.x + data.frame.leftDragLine.width;
        data.frame.y = data.frame.leftDragLine.y;
        data.frame.height = data.frame.leftDragLine.height;
        data.frame.width = data.frame.rightDragLine.x - data.frame.x;

        this.canvas.ctx.fillStyle =
            this.isNightMode === true
                ? this.miniMap.style.border.darkModeFadeColor
                : this.miniMap.style.border.lightModeFadeColor;

        // draw LEFT fade box
        if (data.frame.leftDragLine.x > this.canvas.style.leftPadding) {
            let x = this.canvas.style.leftPadding - 0.5;
            let y = miniMapY - this.miniMap.style.border.width / 2 - this.miniMap.style.border.width / 2;
            let width = data.frame.leftDragLine.x - this.canvas.style.leftPadding;
            let height =
                this.miniMap.height + -this.miniMap.style.border.width / 2 + this.miniMap.style.border.width + 1;
            this.canvas.ctx.fillRect(x, y, width, height);
        }

        // draw RIGHT fade box
        if (data.frame.rightDragLine.x + this.miniMap.style.dragLineWidth < this.miniMap.width) {
            let x = data.frame.rightDragLine.x + 3;
            let y = miniMapY - this.miniMap.style.border.width / 2 - this.miniMap.style.border.width / 2;
            let width = this.miniMap.width - data.frame.rightDragLine.x - this.canvas.style.leftPadding - 2;
            let height =
                this.miniMap.height + -this.miniMap.style.border.width / 2 + this.miniMap.style.border.width + 1;
            this.canvas.ctx.fillRect(x, y, width, height);
        }
    }

    _drawButtons() {
        this.chart.buttons.items = [];
        let buttonCount = 0;
        for (let i = 0; i < this._getCurrentDataSet().columns.length; i++) {
            let column = this._getCurrentDataSet().columns[i];
            let id = column[0];
            let type = this._getCurrentDataSet().types[id];
            let index = this._getArrayIndex(this.columnsToDisplay, id);
            let isHidden = index == -1;
            if (type.toLowerCase() == 'line') {
                let name = this._getCurrentDataSet().names[id];
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

                this.canvas.ctx.lineWidth = 0.7;
                this.canvas.ctx.strokeStyle = this.chart.buttons.style.color;
                this.canvas.drawRoundedRect(x, y, width, height, 15);
                this.canvas.ctx.stroke();

                // draw button color circle
                let radius = height / 3;
                let circleX = x + this.chart.buttons.style.height / 2;
                let circleY = y + this.chart.buttons.style.height / 2;
                this.canvas.ctx.fillStyle = this._getCurrentDataSet().colors[id];
                this.canvas.ctx.beginPath();
                this.canvas.ctx.arc(circleX, circleY, radius, Math.PI + (Math.PI * 2) / 2, false);
                this.canvas.ctx.fill();

                if (isHidden === true) {
                    this.canvas.ctx.fillStyle =
                        this.isNightMode === true ? this.canvas.style.darkModeColor : this.canvas.style.ligthModeColor;
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
                    this.isNightMode === true
                        ? this.chart.style.fontColorDarkMode
                        : this.chart.style.fontColorLightMode;
                this.canvas.ctx.fillText(name, circleX + 12, circleY + 4);

                this.chart.buttons.items.push({ x: x, y: y, id: id, width: buttonWidth });
                buttonCount++;
            }
        }
    }

    _parseData(inputData, targetChartData, targetMiniMapData) {
        const sliceStartIndex = 1;
        inputData.columns.slice(0, 1).forEach((column) => {
            targetChartData.xAxis = {
                id: column[0],
                originalValues: column.slice(sliceStartIndex, column.length),
                values: new Array(),
            };
            targetMiniMapData.xAxis = {
                id: column[0],
                originalValues: column.slice(sliceStartIndex, column.length),
                values: new Array(),
            };
        });
        inputData.columns.slice(1).forEach((column) => {
            let index = this._getArrayIndex(this.columnsToDisplay, column[0]);
            if (index != -1) {
                targetChartData.yAxis.columns.push({
                    id: column[0],
                    name: inputData.names[column[0]],
                    originalValues: column.slice(sliceStartIndex, column.length),
                    values: new Array(),
                    color: inputData.colors[column[0]],
                });
                targetMiniMapData.yAxis.columns.push({
                    id: column[0],
                    originalValues: column.slice(sliceStartIndex, column.length),
                    values: new Array(),
                    color: inputData.colors[column[0]],
                });
            }
        });
    }

    _calculateChartData(animatedMaxValue, data) {
        // calculate maxValue
        let maxValue = this._findMaxValue(data, data.displayStartIndex, data.displayEndIndex);
        let maxValueToUse = 0;
        if (data.previousMaxValue == 0) {
            data.previousMaxValue = maxValue;
        }
        if (animatedMaxValue == 0) {
            maxValueToUse = maxValue;
        } else {
            maxValueToUse = animatedMaxValue;
        }

        // init data
        data.xAxis.values = new Array();
        data.yAxis.columns.forEach((element) => {
            element.values = new Array();
        });

        // calcualate axis scale factor
        data.xAxis.scaleFactor = this.canvas.width / (data.displayEndIndex - data.displayStartIndex);
        data.yAxis.scaleFactor = this.canvas.height / maxValueToUse;

        // get minimap scale factor to multiply Y values
        // shifts all values up to free space for minimap
        let miniMapScaleShift =
            (this.canvas.height -
                this.miniMap.height -
                this.chart.style.axis.bottomPadding -
                this.chart.buttons.height) /
            (this.canvas.height + this.chart.style.axis.topPadding);

        // calculate X values
        let index = 0;
        for (let i = data.displayStartIndex; i <= data.displayEndIndex; i++) {
            data.xAxis.values.push({
                scaledValue: index * data.xAxis.scaleFactor * this.canvas.xScaleShift + this.canvas.style.leftPadding,
                originalValue: data.xAxis.originalValues[i],
            });
            index++;
        }

        // calculate Y values
        data.yAxis.columns.forEach((column) => {
            for (let i = data.displayStartIndex; i <= data.displayEndIndex; i++) {
                let scaledY = column.originalValues[i] * data.yAxis.scaleFactor * miniMapScaleShift;
                let y =
                    this.canvas.height -
                    scaledY -
                    this.miniMap.height -
                    this.chart.style.axis.bottomPadding -
                    this.chart.buttons.height;
                column.values.push({
                    scaledValue: y,
                    originalValue: column.originalValues[i],
                });
            }
        });

        // calculate display axis data
        data.axis.xLabels.values = new Array();
        data.axis.yLabels.values = new Array();
        data.axis.grid.values = new Array();

        // calculate Y axis labels
        let yMultiplier = this.axisHelper.getAxisLabelsMultiplier(maxValueToUse, data.axis.yLabels.displayCoef);
        for (let i = 0; i < data.axis.yLabels.displayCoef; i++) {
            let value = Math.round(yMultiplier * i);
            let scaledValue = value * data.yAxis.scaleFactor;
            let yValue =
                this.canvas.height -
                scaledValue -
                this.miniMap.height -
                this.chart.style.axis.bottomPadding -
                this.chart.buttons.height;
            if (yValue > this.chart.style.axis.fontSize + 1) {
                data.axis.yLabels.values.push({
                    text: value,
                    x: this.canvas.style.leftPadding,
                    y: yValue - this.chart.style.axis.textBottomPadding,
                });
                data.axis.grid.values.push({
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
                this.chart.style.axis.textLabelPlaceHolder
        );
        let ticks = this.axisHelper.getDateIncrementsForAxis(
            data.xAxis.originalValues[data.displayStartIndex],
            data.xAxis.originalValues[data.displayEndIndex],
            count
        );
        for (let i = 0; i < ticks.length; i++) {
            let xIndex = -1;
            for (let j = 0; j < data.xAxis.values.length; j++) {
                if (data.xAxis.values[j].originalValue == ticks[i]) {
                    xIndex = j;
                    break;
                }
            }
            if (xIndex != -1 && xIndex < data.xAxis.values.length) {
                let xValue = 0;
                if (i == 0) {
                    xValue = data.xAxis.values[xIndex].scaledValue;
                } else if (
                    data.xAxis.values[xIndex].scaledValue + 20 >
                    this.canvas.width - this.canvas.style.rightPadding - this.canvas.style.leftPadding
                ) {
                    xValue = this.canvas.width - this.canvas.style.rightPadding - this.canvas.style.leftPadding - 25;
                } else {
                    xValue = data.xAxis.values[xIndex].scaledValue - this.chart.style.axis.textLeftPadding;
                }
                let originalValue = ticks[i];
                let date = this.dateHelper.convertToDate(originalValue);
                let displayText = this.dateHelper.getMonthShortName(date.getMonth()) + ' ' + date.getDate();
                data.axis.xLabels.values.push({
                    text: displayText,
                    x: xValue,
                    y:
                        this.canvas.height -
                        this.miniMap.height -
                        this.chart.buttons.height +
                        this.chart.style.axis.textTopPadding -
                        this.chart.style.axis.bottomPadding +
                        this.chart.style.axis.fontSize,
                });
            }
        }
    }

    _calculateMiniMapData(animatedMaxValue, chartData, miniMapData) {
        // reset data
        miniMapData.xAxis.values = [];
        miniMapData.yAxis.columns.forEach((element) => {
            element.values = [];
        });

        // calculate maxValue
        let maxValueToUse = 0;
        let maxValue = this._findMaxValue(chartData, 0, chartData.xAxis.originalValues.length - 1);
        if (miniMapData.previousMaxValue == 0) {
            miniMapData.previousMaxValue = maxValue;
        }
        if (animatedMaxValue == 0) {
            maxValueToUse = maxValue;
        } else {
            maxValueToUse = animatedMaxValue;
        }

        // calcualate axis scale factor
        miniMapData.xAxis.scaleFactor = this.canvas.width / (chartData.xAxis.originalValues.length - 1);
        miniMapData.yAxis.scaleFactor = this.miniMap.height / maxValueToUse;

        // calculate X axis values
        miniMapData.xAxis.originalValues.forEach((element, index) => {
            miniMapData.xAxis.values.push(
                index * miniMapData.xAxis.scaleFactor * this.canvas.xScaleShift + this.canvas.style.leftPadding
            );
        });

        // calculate Y axis values
        miniMapData.yAxis.columns.forEach((column, index) => {
            for (let i = 0; i < chartData.yAxis.columns[index].originalValues.length; i++) {
                let scaledY = chartData.yAxis.columns[index].originalValues[i] * miniMapData.yAxis.scaleFactor;
                let y = this.canvas.height - scaledY - this.chart.buttons.height;
                column.values.push(y);
            }
        });
    }

    // finds Y maximum value. required for calculating scale factor.
    _findMaxValue(data, startIndex, endIndex) {
        let maxValue = 0;
        data.yAxis.columns.forEach((element) => {
            let temp = Math.max.apply(null, element.originalValues.slice(startIndex, endIndex));
            if (temp > maxValue) {
                maxValue = temp;
            }
        });
        return maxValue;
    }

    _isOverLeftDragLine(data, x, y) {
        return (
            x + this.miniMap.style.dragErrorPixelFactor >= data.frame.leftDragLine.x &&
            x - this.miniMap.style.dragErrorPixelFactor <= data.frame.leftDragLine.x + data.frame.leftDragLine.width &&
            y >= data.frame.leftDragLine.y &&
            y <= data.frame.leftDragLine.y + data.frame.leftDragLine.height
        );
    }

    _isOverRightDragLine(data, x, y) {
        return (
            x + this.miniMap.style.dragErrorPixelFactor >= data.frame.rightDragLine.x &&
            x - this.miniMap.style.dragErrorPixelFactor <=
                data.frame.rightDragLine.x + data.frame.rightDragLine.width &&
            y >= data.frame.rightDragLine.y &&
            y <= data.frame.rightDragLine.y + data.frame.rightDragLine.height
        );
    }

    _isOverDragFrame(data, x, y) {
        return (
            x >= data.frame.x &&
            x <= data.frame.x + data.frame.width &&
            y >= data.frame.y &&
            y <= data.frame.y + data.frame.height
        );
    }

    _isOverInfoBox(x, y) {
        return (
            x >= this.chart.info.x &&
            x <= this.chart.info.x + this.chart.info.width &&
            y >= this.chart.info.y &&
            y <= this.chart.info.y + this.chart.info.height
        );
    }

    _isOverZoomButton(x, y) {
        return false;
    }

    _isOverChart(x, y) {
        return (
            x >= 0 &&
            x <= this.canvas.width &&
            y >= this.chart.style.axis.topPadding &&
            y <=
                this.canvas.height -
                    this.miniMap.height -
                    this.chart.style.axis.bottomPadding -
                    this.chart.buttons.height
        );
    }

    _isOverButton(x, y) {
        for (let i = 0; i < this.chart.buttons.items.length; i++) {
            if (
                x >= this.chart.buttons.items[i].x &&
                x <= this.chart.buttons.items[i].x + this.chart.buttons.items[i].width &&
                y >= this.chart.buttons.items[i].y &&
                y <= this.chart.buttons.items[i].y + this.chart.buttons.style.height
            ) {
                return true;
            }
        }
        return false;
    }

    _getButtonId(x, y) {
        let button = null;
        for (let i = 0; i < this.chart.buttons.items.length; i++) {
            if (
                x >= this.chart.buttons.items[i].x &&
                x <= this.chart.buttons.items[i].x + this.chart.buttons.items[i].width &&
                y >= this.chart.buttons.items[i].y &&
                y <= this.chart.buttons.items[i].y + this.chart.buttons.style.height
            ) {
                button = this.chart.buttons.items[i];
                break;
            }
        }
        if (button != null) {
            return button.id;
        }
        return null;
    }

    _getArrayIndex(arr, value) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                return i;
            }
        }
        return -1;
    }

    _setClickedTimestamp(index, data) {
        if (index < data.xAxis.values.length) {
            this.clickedTimestamp = data.xAxis.values[index].originalValue;
        }
    }

    _getClickedChartIndex(data) {
        for (let i = 0; i < data.xAxis.values.length; i++) {
            if (i == 0) {
                if (
                    this.clickChartX >= 0 &&
                    this.clickChartX < (data.xAxis.values[i].scaledValue + data.xAxis.values[i + 1].scaledValue) / 2
                ) {
                    return i;
                }
            } else if (i == data.xAxis.values.length - 1) {
                if (
                    this.clickChartX >= (data.xAxis.values[i - 1].scaledValue + data.xAxis.values[i].scaledValue) / 2 &&
                    this.clickChartX <= this.canvas.width
                ) {
                    return i;
                }
            } else {
                if (
                    this.clickChartX >= (data.xAxis.values[i - 1].scaledValue + data.xAxis.values[i].scaledValue) / 2 &&
                    this.clickChartX < (data.xAxis.values[i].scaledValue + data.xAxis.values[i + 1].scaledValue) / 2
                ) {
                    return i;
                }
            }
        }

        return -1;
    }

    _getCurrentDataSet() {
        return this.zoomIn === true ? this.zoomedData : this.data;
    }

    _getCurrentChartDataSet() {
        return this.zoomIn === true ? this.chart.zoomedData : this.chart.data;
    }

    _getCurrentMiniMapDataSet() {
        return this.zoomIn === true ? this.miniMap.zoomedData : this.miniMap.data;
    }
}

export default ChartBuilder;
