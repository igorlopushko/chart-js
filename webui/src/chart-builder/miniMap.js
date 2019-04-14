import MiniMapData from './dataObj/miniMapData';

class MiniMap {
    constructor() {
        this.data = new MiniMapData();
        this.zoomedData = new MiniMapData();

        this.x = 0;
        this.y = 0;
        this.height = 50;
        this.width = 0;

        this.style = {
            lineWidth: 1,
            // is used to reduse issue with targeting exact drag line position
            dragErrorPixelFactor: 10,
            frame: {
                dragTickLineColor: 'rgba(255, 255, 255, 1)',
                dragTickLineSize: 12,
                cornerRadius: 7,
                lightModeColor: 'rgba(221, 234, 243, 1)',
                darkModeColor: 'rgba(58, 78, 98, 1)',
                lightModeFadeColor: 'rgba(245, 249, 251, 0.8)',
                darkModeFadeColor: 'rgba(25, 33, 42, 0.6)',
                width: 2,
            },
        };
    }
}

export default MiniMap;
