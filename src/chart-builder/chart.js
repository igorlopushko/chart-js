class Chart {
    constructor() {
        this.axis = {
            grid: { values: [{ x1: 0, y1: 0, x2: 0, y2: 0 }], style: { lineWidth: 0.5 } },
            xLabels: { displayCoef: 8, values: [{ text: '', x: 0, y: 0 }] },
            yLabels: { displayCoef: 10, values: [{ text: '', x: 0, y: 0 }] },
            style: {
                fontSize: 10,
                fonyStyle: 'Helvetica',
                lightModeFontColor: 'rgba(150, 162, 170, 1)',
                darkModeFontColor: 'rgba(84, 103, 120, 1)',
                color: 'rgba(150, 162, 170, 0.5)',
                darkModeColor: 'rgba(84, 103, 120, 0.8)',
                textTopPadding: 3,
                textLeftPadding: 10,
                textBottomPadding: 5,
                textLabelPlaceHolder: 70,
                topPadding: 12,
                bottomPadding: 30,
            },
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
        this.fontMultiplier = 9;
        this.style = {
            lineWidth: 1.5,
            fontFamily: 'Helvetica',
            fontColorLightMode: 'rgba(0, 0, 0, 1)',
            fontColorDarkMode: 'rgba(255, 255, 255, 1)',
        };
        this.info = {
            height: 65,
            fistLineShift: 40,
            secondLineShift: 12,
            fontMultiplier: 9,
            style: {
                topShift: 5,
                topPadding: 20,
                leftPadding: 15,
                rightPadding: 15,
                borderColorLightMode: 'rgba(0, 0, 0, 0.3)',
                borderColorDarkMode: 'rgba(0, 0, 0, 1)',
            },
            headerStyle: {
                fontSize: 12,
            },
            valuesStyle: {
                fontSize: 12,
                fontWeight: 'bold',
            },
            namesStyle: {
                fontSize: 10,
            },
        };
        this.buttons = {
            items: [{ x: 0, y: 0, width: 0, id: '' }],
            style: {
                height: 30,
                topPadding: 10,
                leftPadding: 10,
                textRightPadding: 5,
                fontSize: 12,
                checkColor: 'rgba(255, 255, 255, 1)',
                color: 'rgba(150, 162, 170, 0.7)',
            },
            height: 50,
        };
    }
}

export default Chart;
