export default {
    axis: {
        grid: [{ x1: 0, y1: 0, x2: 0, y2: 0 }],
        xLabels: { displayCoef: 8, values: [{ text: '', x: 0, y: 0 }] },
        yLabels: { displayCoef: 6, values: [{ text: '', x: 0, y: 0 }] },
        style: {
            fontSize: 12,
            fonyStyle: 'arial',
            fonyColor: 'rgba(150, 162, 170, 1)',
            color: 'rgba(242, 244, 245, 1)',
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
        maxValue: 0,
    },
    xAxis: {
        values: [{ scaledValue: 0, originalValue: 0 }],
        originalValues: [],
        scaleFactor: 0.0,
    },
    displayStartIndex: 0,
    displayEndIndex: 0,
};
