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
        this.lineWidth = 1;
        this.frame = {
            minDisplayPositions: 10,
            dragLineWidth: 8,
            // is used to reduse issue with targeting exact drag line position
            dragErrorPixelFactor: 10,
            border: {
                lightModeColor: 'rgba(221, 234, 243, 0.8)',
                darkModeColor: 'rgba(58, 78, 98, 0.8)',
                lightModeFadeColor: 'rgba(245, 249, 251, 0.8)',
                darkModeFadeColor: 'rgba(25, 33, 42, 0.6)',
                width: 2,
            },
            leftDragLine: { x: 0, y: 0, width: 8, height: 50 },
            rightDragLine: { x: 0, y: 0, width: 8, height: 50 },
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
    }
}

export default MiniMap;
