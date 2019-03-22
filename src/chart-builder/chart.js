export default {
    axis: {
        grid: [{ x1: 0, y1: 0, x2: 0, y2: 0 }],
        xLabels: { displayCoef: 8, values: [{ text: '', x: 0, y: 0 }] },
        yLabels: { displayCoef: 6, values: [{ text: '', x: 0, y: 0 }] },
        style: {
            fontSize: 10,
            fonyStyle: 'Helvetica',
            fonyColor: 'rgba(150, 162, 170, 0.7)',
            color: 'rgba(150, 162, 170, 0.5)',
            textTopPadding: 2,
            textLeftPadding: 1,
            textBottomPadding: 5,
            topPadding: 12,
            bottomPadding: 30,
        },
    },
    yAxis: {
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
            borderColorLightMode: 'rgba(242, 244, 245, 1)',
            borderColorDarkMode: 'rgba(0, 0, 0, 0.5)',
        },
        headerStyle: {
            fontSize: '12px',
            fontColorLightMode: 'rgba(0, 0, 0, 1)',
            fontColorDarkMode: 'rgba(255, 255, 255, 1)',
        },
        valuesStyle: {
            fontSize: '12px',
            fontWeight: 'bold',
        },
        namesStyle: {
            fontSize: '10px',
        },
    },
};
