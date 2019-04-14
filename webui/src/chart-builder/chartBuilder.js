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
        this.isTouch = false;
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
        if (this.isNightMode === true) {
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

        if (config.title != null) {
            this.chart.header.title = config.title;
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
        this._clearChart();
        this._drawChartData(chartData);
        this._drawChartHeader();
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
                    event,
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
        if (event.touches.length > 1 || (event.type == 'touchend' && event.touches.length > 0)) {
            return;
        }

        let touch = null;

        switch (event.type) {
            case 'touchstart':
                touch = event.touches[0];
                this._handleMouseDown(
                    event,
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

    _handleMouseDown(event, chartData, miniMapData, x, y) {
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
            if (this.clickedTimestamp != 0 && this.enableZoom === true && this.zoomIn === false) {
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
            event.preventDefault();
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

    _clearChart() {
        // draw background rectangle to overlay minimap animation
        this.canvas.ctx.fillStyle =
            this.isNightMode === true ? this.canvas.style.darkModeColor : this.canvas.style.ligthModeColor;
        this.canvas.ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height -
                this.miniMap.height -
                this.chart.buttons.height -
                this.miniMap.style.frame.width -
                Math.floor(this.miniMap.style.frame.width / 2)
        );
    }

    _drawChartHeader() {
        this.canvas.ctx.fillStyle =
            this.isNightMode === true ? this.canvas.style.darkModeColor : this.canvas.style.ligthModeColor;
        this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.chart.header.height - 1);
        // draw title
        this.canvas.ctx.font = this.chart.header.style.titleFontSize + 'px ' + this.chart.style.fontFamily;
        this.canvas.ctx.fillStyle =
            this.isNightMode === true
                ? this.chart.header.style.darkModeFontColor
                : this.chart.header.style.lightModeFontColor;
        this.canvas.ctx.fillText(
            this.chart.header.title,
            this.canvas.style.leftPadding,
            this.chart.header.style.titleTopPadding
        );

        // draw dates range
        this.canvas.ctx.font = this.chart.header.style.datesRangeFontSize + 'px ' + this.chart.style.fontFamily;
        this.canvas.ctx.moveTo(
            this.canvas.width - this.canvas.style.rightPadding,
            this.chart.header.style.datesRangeTopPadding
        );
        this.canvas.ctx.textAlign = 'end';
        let startDateTimestamp = this._getCurrentChartDataSet().xAxis.values[0].originalValue;
        let endDateTimestamp = this._getCurrentChartDataSet().xAxis.values[
            this._getCurrentChartDataSet().xAxis.values.length - 1
        ].originalValue;
        let startDate = this.dateHelper.convertToDate(startDateTimestamp);
        let endDate = this.dateHelper.convertToDate(endDateTimestamp);

        this.canvas.ctx.fillText(
            startDate.getDate() +
                ' ' +
                this.dateHelper.getMonthName(startDate.getMonth()) +
                ' ' +
                startDate.getFullYear() +
                ' - ' +
                endDate.getDate() +
                ' ' +
                this.dateHelper.getMonthName(endDate.getMonth()) +
                ' ' +
                endDate.getFullYear(),
            this.canvas.width - this.canvas.style.rightPadding,
            this.chart.header.style.datesRangeTopPadding
        );
        this.canvas.ctx.textAlign = 'start';
    }

    _drawChartData(data) {
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
        if (this.drawInfoBox === false) {
            return;
        }
        let infoIndex = this._getClickedChartIndex(data);
        if (infoIndex == -1) {
            return;
        }
        // set X clicked value
        this._setClickedTimestamp(infoIndex, data);
        let chartX = data.xAxis.values[infoIndex].scaledValue;

        // draw info line
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.strokeStyle = this.chart.info.style.color;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(chartX, this.chart.header.height + this.chart.info.style.cornersRadius);
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

        /*----------- draw info box ----------*/
        let date = this.dateHelper.convertToDate(data.xAxis.values[infoIndex].originalValue);
        let headerText =
            this.dateHelper.getDayShortName(date.getDay()) +
            ', ' +
            date.getDate() +
            ' ' +
            this.dateHelper.getMonthShortName(date.getMonth()) +
            ' ' +
            date.getFullYear();
        let headerWidth = this.canvas.ctx.measureText(headerText).width;
        let nameValueLengths = new Array();

        // find all name/value row length
        data.yAxis.columns.forEach((element) => {
            let nameLength = this.canvas.ctx.measureText(element.name).width;
            let valueLength = this.canvas.ctx.measureText(element.values[infoIndex].originalValue.toString()).width;
            nameValueLengths.push(nameLength + valueLength + this.chart.info.style.nameValueSpace);
        });
        let maxContentLegth = headerWidth;
        for (let i = 0; i < nameValueLengths.length; i++) {
            if (maxContentLegth < nameValueLengths[i]) {
                maxContentLegth = nameValueLengths[i];
            }
        }
        this.chart.info.width =
            this.chart.info.style.leftPadding + maxContentLegth + this.chart.info.style.rightPadding;
        this.chart.info.height =
            this.chart.info.style.topPadding +
            this.chart.info.style.nameValuesBoxShift +
            (data.yAxis.columns.length > 2 ? this.chart.info.style.lineShift * (data.yAxis.columns.length - 2) : 0) +
            this.chart.info.style.bottomPadding;

        // select X position for the info box
        if (chartX - this.chart.info.width / 2 + this.chart.info.width >= this.canvas.width) {
            // draw on the left
            this.chart.info.x = this.canvas.width - this.chart.info.width - this.canvas.style.rightPadding;
        } else if (chartX - this.chart.info.width / 2 <= 0) {
            // draw on the right
            this.chart.info.x = this.canvas.style.leftPadding;
        } else {
            // draw in the middle
            this.chart.info.x = chartX - this.chart.info.width / 2;
        }

        this.chart.info.y = this.chart.header.height;

        // draw info box border shadow
        this.canvas.ctx.save();
        this.canvas.ctx.strokeStyle =
            this.isNightMode === true ? this.chart.info.style.darkModeColor : this.chart.info.style.color;
        this.canvas.ctx.shadowOffsetX = 0.5;
        this.canvas.ctx.shadowOffsetY = 0.5;
        this.canvas.ctx.shadowBlur = 4;
        this.canvas.ctx.shadowColor =
            this.isNightMode === true
                ? this.chart.info.style.borderColorDarkMode
                : this.chart.info.style.borderColorLightMode;
        this.canvas.ctx.lineWidth = 1;
        this.canvas.drawRoundedRect(
            this.chart.info.x,
            this.chart.info.y,
            this.chart.info.width,
            this.chart.info.height,
            {
                tl: this.chart.info.style.cornersRadius,
                tr: this.chart.info.style.cornersRadius,
                br: this.chart.info.style.cornersRadius,
                bl: this.chart.info.style.cornersRadius,
            },
            false,
            true
        );
        this.canvas.ctx.restore();

        // draw info box border
        this.canvas.ctx.fillStyle =
            this.isNightMode === true ? this.canvas.style.darkModeColor : this.canvas.style.ligthModeColor;
        this.canvas.ctx.fill();
        this.canvas.drawRoundedRect(
            this.chart.info.x,
            this.chart.info.y,
            this.chart.info.width,
            this.chart.info.height,
            {
                tl: this.chart.info.style.cornersRadius,
                tr: this.chart.info.style.cornersRadius,
                br: this.chart.info.style.cornersRadius,
                bl: this.chart.info.style.cornersRadius,
            },
            true,
            false
        );

        // draw header text
        let headerTextX = this.chart.info.x + this.chart.info.style.leftPadding;
        let headerTextY = this.chart.info.y + this.chart.info.style.topPadding;
        this.canvas.ctx.font =
            this.chart.info.style.headerFontWeight +
            ' ' +
            this.chart.info.style.headerFontSize +
            'px ' +
            this.chart.style.fontFamily;
        this.canvas.ctx.fillStyle =
            this.isNightMode === true ? this.chart.style.fontColorDarkMode : this.chart.style.fontColorLightMode;
        this.canvas.ctx.fillText(headerText, headerTextX, headerTextY);

        // draw arrow
        this.canvas.ctx.beginPath();
        this.canvas.ctx.lineWidth = 1;
        this.canvas.ctx.strokeStyle =
            this.isNightMode === true ? this.chart.info.style.arrowDarkMode : this.chart.info.style.arrowLightModeColor;
        this.canvas.ctx.moveTo(
            this.chart.info.x + this.chart.info.width - this.chart.info.style.rightPadding - 4,
            headerTextY
        );
        this.canvas.ctx.lineTo(
            this.chart.info.x + this.chart.info.width - this.chart.info.style.rightPadding,
            headerTextY - 4
        );
        this.canvas.ctx.lineTo(
            this.chart.info.x + this.chart.info.width - this.chart.info.style.rightPadding - 4,
            headerTextY - 8
        );
        this.canvas.ctx.stroke();

        // draw info lines
        let columnCount = 0;
        data.yAxis.columns.forEach((element) => {
            let name = element.name;
            let value = element.values[infoIndex].originalValue;
            let nameX = this.chart.info.x + this.chart.info.style.leftPadding;
            let nameY =
                this.chart.info.y +
                this.chart.info.style.nameValuesBoxShift +
                columnCount * this.chart.info.style.lineShift;
            let valueX = this.chart.info.x + this.chart.info.width - this.chart.info.style.rightPadding;
            let valueY = nameY;

            // draw names
            this.canvas.ctx.font =
                this.chart.info.style.namesFontWeight +
                ' ' +
                this.chart.info.style.namesFontSize +
                'px ' +
                this.chart.style.fontFamily;
            this.canvas.ctx.textAlign = 'start';
            this.canvas.ctx.fillStyle =
                this.isNightMode === true ? this.chart.style.fontColorDarkMode : this.chart.style.fontColorLightMode;
            this.canvas.ctx.fillText(name, nameX, nameY);

            // draw values
            this.canvas.ctx.fillStyle = element.color;
            this.canvas.ctx.font =
                this.chart.info.style.valuesFontWeight +
                ' ' +
                this.chart.info.style.valuesFontSize +
                'px ' +
                this.chart.style.fontFamily;
            this.canvas.ctx.textAlign = 'end';
            this.canvas.ctx.fillText(value, valueX, valueY);
            this.canvas.ctx.textAlign = 'start';
            columnCount++;
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
        const sharpnessCoef = 0.5;

        data.frame.leftDragLine.x = data.xAxis.values[displayStartIndex] - sharpnessCoef;
        data.frame.leftDragLine.y =
            this.canvas.height -
            this.miniMap.height -
            this.chart.buttons.height -
            this.miniMap.style.frame.width -
            sharpnessCoef;
        data.frame.rightDragLine.x =
            Math.round(data.xAxis.values[displayEndIndex]) - data.frame.rightDragLine.width + 1;
        data.frame.rightDragLine.y = data.frame.leftDragLine.y;

        // draw LEFT fade box
        this.canvas.ctx.fillStyle =
            this.isNightMode === true
                ? this.miniMap.style.frame.darkModeFadeColor
                : this.miniMap.style.frame.lightModeFadeColor;
        if (data.frame.leftDragLine.x > this.canvas.style.leftPadding) {
            let x = this.canvas.style.leftPadding - sharpnessCoef;
            let y = data.frame.leftDragLine.y + this.miniMap.style.frame.width;
            let width = data.frame.leftDragLine.x - x + data.frame.leftDragLine.width;
            let height = data.frame.leftDragLine.height - 2 * this.miniMap.style.frame.width;
            this.canvas.drawRoundedRect(
                x,
                y,
                width,
                height + this.miniMap.style.frame.width / 2,
                {
                    tl: this.miniMap.style.frame.cornerRadius,
                    tr: 0,
                    br: 0,
                    bl: this.miniMap.style.frame.cornerRadius,
                },
                true,
                false
            );
        }

        // draw RIGHT fade box
        if (displayEndIndex < data.xAxis.originalValues.length - 1) {
            let x = data.frame.rightDragLine.x;
            let y = data.frame.rightDragLine.y + this.miniMap.style.frame.width;
            let width = this.miniMap.width - data.frame.rightDragLine.x - this.canvas.style.leftPadding + sharpnessCoef;
            let height = data.frame.rightDragLine.height - 2 * this.miniMap.style.frame.width;
            //this.canvas.ctx.fillRect(x, y, width, height);
            this.canvas.drawRoundedRect(
                x,
                y,
                width,
                height + this.miniMap.style.frame.width / 2,
                {
                    tl: 0,
                    tr: this.miniMap.style.frame.cornerRadius,
                    br: this.miniMap.style.frame.cornerRadius,
                    bl: 0,
                },
                true,
                false
            );
        }

        // draw frame lines
        this.canvas.ctx.strokeStyle =
            this.isNightMode === true
                ? this.miniMap.style.frame.darkModeColor
                : this.miniMap.style.frame.lightModeColor;

        this.canvas.ctx.fillStyle =
            this.isNightMode === true
                ? this.miniMap.style.frame.darkModeColor
                : this.miniMap.style.frame.lightModeColor;

        // left line
        this.canvas.drawRoundedRect(
            data.frame.leftDragLine.x,
            data.frame.leftDragLine.y,
            data.frame.leftDragLine.width,
            data.frame.leftDragLine.height + this.miniMap.style.frame.width / 2,
            {
                tl: this.miniMap.style.frame.cornerRadius,
                tr: 0,
                br: 0,
                bl: this.miniMap.style.frame.cornerRadius,
            },
            true,
            false
        );

        // rigth line
        this.canvas.drawRoundedRect(
            data.frame.rightDragLine.x,
            data.frame.rightDragLine.y,
            data.frame.rightDragLine.width,
            data.frame.rightDragLine.height + this.miniMap.style.frame.width / 2,
            {
                tl: 0,
                tr: this.miniMap.style.frame.cornerRadius,
                br: this.miniMap.style.frame.cornerRadius,
                bl: 0,
            },
            true,
            false
        );

        // draw drag tick lines
        this.canvas.ctx.lineWidth = 2;
        this.canvas.ctx.strokeStyle = this.miniMap.style.frame.dragTickLineColor;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(
            data.frame.leftDragLine.x + data.frame.leftDragLine.width / 2,
            data.frame.leftDragLine.y + this.miniMap.height / 2 - this.miniMap.style.frame.dragTickLineSize / 2
        );
        this.canvas.ctx.lineTo(
            data.frame.leftDragLine.x + data.frame.leftDragLine.width / 2,
            data.frame.leftDragLine.y + this.miniMap.height / 2 + this.miniMap.style.frame.dragTickLineSize / 2
        );
        this.canvas.ctx.stroke();

        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(
            data.frame.rightDragLine.x + data.frame.rightDragLine.width / 2,
            data.frame.rightDragLine.y + this.miniMap.height / 2 - this.miniMap.style.frame.dragTickLineSize / 2
        );
        this.canvas.ctx.lineTo(
            data.frame.rightDragLine.x + data.frame.rightDragLine.width / 2,
            data.frame.rightDragLine.y + this.miniMap.height / 2 + this.miniMap.style.frame.dragTickLineSize / 2
        );
        this.canvas.ctx.stroke();

        // top line
        this.canvas.ctx.strokeStyle =
            this.isNightMode === true
                ? this.miniMap.style.frame.darkModeColor
                : this.miniMap.style.frame.lightModeColor;
        this.canvas.ctx.lineWidth = this.miniMap.style.frame.width;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(
            data.frame.leftDragLine.x + data.frame.leftDragLine.width - sharpnessCoef,
            data.frame.leftDragLine.y + this.miniMap.style.frame.width / 2
        );
        this.canvas.ctx.lineTo(
            data.frame.rightDragLine.x,
            data.frame.leftDragLine.y + this.miniMap.style.frame.width / 2
        );
        this.canvas.ctx.stroke();

        // bottom line
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(
            data.frame.leftDragLine.x + data.frame.leftDragLine.width - sharpnessCoef,
            data.frame.leftDragLine.y + data.frame.leftDragLine.height
        );
        this.canvas.ctx.lineTo(data.frame.rightDragLine.x, data.frame.leftDragLine.y + data.frame.leftDragLine.height);
        this.canvas.ctx.stroke();

        // set mini map frame coordinates
        data.frame.x = data.frame.leftDragLine.x + data.frame.leftDragLine.width;
        data.frame.y = data.frame.leftDragLine.y;
        data.frame.height = data.frame.leftDragLine.height;
        data.frame.width = data.frame.rightDragLine.x - data.frame.x;
    }

    _drawButtons() {
        this.chart.buttons.items = [];
        let nextX = this.canvas.style.leftPadding;
        for (let i = 0; i < this._getCurrentDataSet().columns.length; i++) {
            let column = this._getCurrentDataSet().columns[i];
            let id = column[0];
            let type = this._getCurrentDataSet().types[id];
            let index = this._getArrayIndex(this.columnsToDisplay, id);
            let isHidden = index == -1;
            if (type.toLowerCase() == 'line') {
                this.canvas.ctx.font = this.chart.buttons.style.fontSize + 'px ' + this.chart.style.fontFamily;

                let name = this._getCurrentDataSet().names[id];
                let buttonWidth =
                    this.chart.buttons.style.leftPadding +
                    // cicle width
                    (this.chart.buttons.style.height / 3) * 2 +
                    this.chart.buttons.style.titleLeftPadding +
                    this.canvas.ctx.measureText(name).width +
                    this.chart.buttons.style.rightPadding;

                // draw button border
                let x = nextX;
                nextX += buttonWidth + this.chart.buttons.style.rightMargin;
                let y = this.canvas.height - this.miniMap.height + this.chart.buttons.style.topPadding;
                let height = this.chart.buttons.style.height;
                let width = buttonWidth;

                // draw button color circles
                this.canvas.ctx.fillStyle = this._getCurrentDataSet().colors[id];
                let radius = height / 2;
                let circleX = x + this.chart.buttons.style.height / 2;
                let circleY = y + this.chart.buttons.style.height / 2;
                this.canvas.ctx.beginPath();
                this.canvas.ctx.arc(circleX, circleY, radius, Math.PI + (Math.PI * 2) / 2, false);
                this.canvas.ctx.arc(
                    circleX + this.chart.buttons.style.titleLeftPadding + this.canvas.ctx.measureText(name).width,
                    circleY,
                    radius,
                    Math.PI + (Math.PI * 2) / 2,
                    false
                );
                this.canvas.ctx.fill();
                this.canvas.ctx.fillRect(
                    x + radius,
                    y,
                    this.chart.buttons.style.titleLeftPadding + this.canvas.ctx.measureText(name).width,
                    this.chart.buttons.style.height
                );

                // draw checkbox
                if (isHidden === true) {
                    this.canvas.ctx.fillStyle =
                        this.isNightMode === true ? this.canvas.style.darkModeColor : this.canvas.style.ligthModeColor;
                    this.canvas.ctx.beginPath();
                    this.canvas.ctx.arc(circleX, circleY, Math.floor(radius / 2), Math.PI + (Math.PI * 2) / 2, false);
                    this.canvas.ctx.fill();
                } else {
                    this.canvas.ctx.beginPath();
                    this.canvas.ctx.lineWidth = 2;
                    this.canvas.ctx.strokeStyle = this.chart.buttons.style.checkColor;
                    this.canvas.ctx.moveTo(circleX - 4, circleY);
                    this.canvas.ctx.lineTo(circleX - 1, circleY + 3);
                    this.canvas.ctx.lineTo(circleX + 4, circleY - 4);
                    this.canvas.ctx.stroke();
                }

                // draw button title
                this.canvas.ctx.fillStyle = this.chart.buttons.style.fontColor;
                this.canvas.ctx.fillText(
                    name,
                    circleX + this.chart.buttons.style.titleLeftPadding,
                    circleY + this.chart.buttons.style.titleTopPadding
                );

                this.chart.buttons.items.push({
                    x: x,
                    y: y,
                    id: id,
                    width: buttonWidth - this.chart.buttons.style.rightPadding,
                });
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
                let y = this._scaleYValueAndGetWithComponentsShift(column.originalValues[i], data.yAxis.scaleFactor);
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
            let y = this._scaleYValueAndGetWithComponentsShift(value, data.yAxis.scaleFactor);
            if (y > this.chart.style.axis.fontSize + 1) {
                data.axis.yLabels.values.push({
                    text: value,
                    x: this.canvas.style.leftPadding,
                    y: y - this.chart.style.axis.textBottomPadding,
                });
                data.axis.grid.values.push({
                    x1: this.canvas.style.leftPadding,
                    y1: y,
                    x2: this.canvas.width - this.canvas.style.rightPadding,
                    y2: y,
                });
            }
        }

        // calculate X axis labels
        let pixelRange = Math.ceil(
            (this.canvas.width - this.canvas.style.leftPadding - this.canvas.style.rightPadding) /
                this.chart.style.axis.textLabelPlaceHolder
        );
        let ticks = this.axisHelper.getDateIncrementsForAxis(
            data.xAxis.originalValues[data.displayStartIndex],
            data.xAxis.originalValues[data.displayEndIndex],
            pixelRange
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

    _scaleYValueAndGetWithComponentsShift(value, scaleFactor) {
        // get minimap scale factor to multiply Y values
        // shifts all values up to free space for minimap
        let miniMapScaleShift =
            (this.canvas.height -
                this.miniMap.height -
                this.chart.style.axis.bottomPadding -
                this.chart.buttons.height) /
            (this.canvas.height + this.chart.style.axis.topPadding + this.chart.header.height);

        let scaledY = value * scaleFactor * miniMapScaleShift;
        return (
            this.canvas.height -
            scaledY -
            this.miniMap.height -
            this.chart.style.axis.bottomPadding -
            this.chart.buttons.height
        );
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
