class MiniMap {
    constructor() {
        this.yAxis = {
            columns: [
                {
                    values: [],
                    id: '',
                    color: '',
                },
            ],
            scaleFactor: 0.0,
        };
        this.xAxis = {
            values: [],
            scaleFactor: 0.0,
        };
        this.x = 0;
        this.y = 0;
        this.height = 50;
        this.width = 0;
        this.frame = {
            minDisplayPositions: 10,
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
        };
    }
}

export default MiniMap;
