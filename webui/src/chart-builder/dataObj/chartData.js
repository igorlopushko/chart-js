class ChartData {
    constructor() {
        this.axis = {
            grid: { values: [{ x1: 0, y1: 0, x2: 0, y2: 0 }] },
            xLabels: { displayCoef: 8, values: [{ text: '', x: 0, y: 0 }] },
            yLabels: { displayCoef: 10, values: [{ text: '', x: 0, y: 0 }] },
        };
        this.yAxis = {
            columns: [
                {
                    values: [{ scaledValue: 0, originalValue: 0 }],
                    originalValues: [],
                    name: '',
                    id: '',
                    color: '',
                },
            ],
            scaleFactor: 0.0,
        };
        this.xAxis = {
            values: [{ scaledValue: 0, originalValue: 0 }],
            originalValues: [],
            scaleFactor: 0.0,
        };
        this.displayStartIndex = 0;
        this.displayEndIndex = 0;
        this.previousMaxValue = 0;
    }
}

export default ChartData;
