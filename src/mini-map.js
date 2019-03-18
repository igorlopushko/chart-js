export default {
    yAxis: {
        columns: [
            {
                values: [],
                name: '',
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
        minDisplayPositions: 10,
        dragLineWidth: 5,
        // is used to reduse issue with targeting exact drag line position
        dragErrorPixelFactor: 5,
        border: { color: '', width: 2 },
        leftDragLine: { x: 0, y: 0, width: 5, height: 50 },
        rightDragLine: { x: 0, y: 0, width: 5, height: 50 },
        rect: { x: 0, y: 0, width: 0, height: 0 },
    },
};
