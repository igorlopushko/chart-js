class MiniMapData {
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
        this.frame = {
            minDisplayPositions: 10,
            leftDragLine: { x: 0, y: 0, width: 10, height: 54 },
            rightDragLine: { x: 0, y: 0, width: 10, height: 54 },
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
        this.previousMaxValue = 0;
    }
}

export default MiniMapData;
