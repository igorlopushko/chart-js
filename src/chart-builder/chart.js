export default {
    axis: {
        grid: [{ x1: 0, y1: 0, x2: 0, y2: 0 }],
        xLabels: { displayCoef: 8, values: [{ text: '', x: 0, y: 0 }] },
        yLabels: { displayCoef: 6, values: [{ text: '', x: 0, y: 0 }] },
        style: {
            fontSize: 10,
            fonyStyle: 'Helvetica',
            fonyColor: 'rgba(150, 162, 170, 1)',
            color: 'rgba(242, 244, 245, 1)',
            textTopPadding: 2,
            textLeftPadding: 1,
            textBottomPadding: 5,
            topPadding: 7,
            bottomPadding: 30,
        },
    },
    yAxis: {
        columns: [
            {
                values: [{ scaledValue: 0, originalValue: 0 }],
                originalValues: [],
                name: '',
                color: '',
            },
        ],
        scaleFactor: 0.0,
    },
    xAxis: {
        values: [{ scaledValue: 0, originalValue: 0 }],
        originalValues: [],
        scaleFactor: 0.0,
    },
    displayStartIndex: 0,
    displayEndIndex: 0,
    style: {
        lineWidth: 2,
        fontFamily: 'Helvetica',
    },
    info: {
        height: 65,
        fistLineShift: 40,
        secondLineShift: 12,
        fontMultiplier: 9,
        style: {
            topPadding: 20,
            leftPadding: 15,
            rightPadding: 15,
        },
        headerStyle: {
            fontSize: '12px',
            fontColor: 'rgba(0, 0, 0, 1)',
        },
        valuesStyle: {
            fontSize: '12px',
            fontWeight: 'bold',
        },
        namesStyle: {
            fontSize: '8px',
        },
    },
};
