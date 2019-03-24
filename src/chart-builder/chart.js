export default {
    axis: {
        grid: [{ x1: 0, y1: 0, x2: 0, y2: 0 }],
        xLabels: { displayCoef: 8, values: [{ text: '', x: 0, y: 0 }] },
        yLabels: { displayCoef: 6, values: [{ text: '', x: 0, y: 0 }] },
        style: {
            fontSize: 10,
            fonyStyle: 'Helvetica',
            fontColor: 'rgba(150, 162, 170, 0.7)',
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
    fontMultiplier: 9,
    style: {
        lineWidth: 2,
        fontFamily: 'Helvetica',
        fontColorLightMode: 'rgba(0, 0, 0, 1)',
        fontColorDarkMode: 'rgba(255, 255, 255, 1)',
    },
    info: {
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
    },
    buttons: {
        items: [{ x: 0, y: 0, width: 0, id: '' }],
        style: {
            height: 25,
            topPadding: 10,
            leftPadding: 10,
            textRightPadding: 5,
            fontSize: 12,
            checkColor: 'rgba(255, 255, 255, 1)',
            color: 'rgba(150, 162, 170, 0.7)',
        },
        height: 50,
    },
};
