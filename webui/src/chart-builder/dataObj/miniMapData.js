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
            leftDragLine: { x: 0, y: 0, width: 8, height: 50 },
            rightDragLine: { x: 0, y: 0, width: 8, height: 50 },
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
    }
}

export default MiniMapData;
