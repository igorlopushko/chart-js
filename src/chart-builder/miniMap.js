export default {
    yAxis: {
        columns: [
            {
                values: [],
                id: '',
                color: '',
            },
        ],
        scaleFactor: 0.0,
    },
    xAxis: {
        values: [],
        scaleFactor: 0.0,
    },
    x: 0,
    y: 0,
    height: 50,
    width: 0,
    frame: {
        minDisplayPositions: 20,
        dragLineWidth: 8,
        // is used to reduse issue with targeting exact drag line position
        dragErrorPixelFactor: 10,
        border: {
            color: 'rgba(150, 162, 170, 0.5)',
            fadeColor: 'rgba(150, 162, 170, 0.2)',
            width: 2,
        },
        leftDragLine: { x: 0, y: 0, width: 5, height: 50 },
        rightDragLine: { x: 0, y: 0, width: 5, height: 50 },
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    },
};
