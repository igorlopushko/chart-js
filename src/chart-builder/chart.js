class Chart {
    constructor() {
        this.axis = {
            grid: [{ x1: 0, y1: 0, x2: 0, y2: 0 }],
            xLabels: { displayCoef: 8, values: [{ text: '', x: 0, y: 0 }] },
            yLabels: { displayCoef: 6, values: [{ text: '', x: 0, y: 0 }] },
            style: {
                fontSize: 10,
                fonyStyle: 'Helvetica',
                fontColor: 'rgba(150, 162, 170, 0.7)',
                color: 'rgba(150, 162, 170, 0.5)',
                textTopPadding: 2,
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
            lineWidth: 2,
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
                borderColorLightMode: 'rgba(242, 244, 245, 1)',
                borderColorDarkMode: 'rgba(0, 0, 0, 0.5)',
            },
            headerStyle: {
                fontSize: '12px',
            },
            valuesStyle: {
                fontSize: '12px',
                fontWeight: 'bold',
            },
            namesStyle: {
                fontSize: '10px',
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
