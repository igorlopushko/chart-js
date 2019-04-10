import ChartData from './dataObj/chartData';

class Chart {
    constructor() {
        this.header = {
            title: '',
            height: 20,
        };

        this.data = new ChartData();
        this.zoomedData = new ChartData();

        this.fontMultiplier = 9;
        this.style = {
            lineWidth: 1.5,
            fontFamily: 'Helvetica',
            fontColorLightMode: 'rgba(0, 0, 0, 1)',
            fontColorDarkMode: 'rgba(255, 255, 255, 1)',
            axis: {
                gridLineWidth: 0.5,
                fontSize: 10,
                fonyStyle: 'Helvetica',
                lightModeFontColor: 'rgba(150, 162, 170, 1)',
                darkModeFontColor: 'rgba(84, 103, 120, 1)',
                textTopPadding: 3,
                textLeftPadding: 10,
                textBottomPadding: 5,
                textLabelPlaceHolder: 70,
                topPadding: 12,
                bottomPadding: 30,
            },
        };
        this.info = {
            x: 0,
            y: 0,
            height: 65,
            width: 0,
            fontMultiplier: 9,
            style: {
                topShift: 5,
                fistLineShift: 40,
                secondLineShift: 12,
                topPadding: 20,
                leftPadding: 15,
                rightPadding: 15,
                color: 'rgba(150, 162, 170, 0.5)',
                darkModeColor: 'rgba(84, 103, 120, 0.8)',
                borderColorLightMode: 'rgba(0, 0, 0, 0.3)',
                borderColorDarkMode: 'rgba(0, 0, 0, 1)',
                headerFontSize: 12,
                valuesFontSize: 12,
                valuesFontWeight: 'bold',
                namesFontSize: 10,
            },
        };
        this.buttons = {
            items: [{ x: 0, y: 0, width: 0, id: '' }],
            style: {
                height: 30,
                topPadding: 10,
                leftPadding: 10,
                textRightPadding: 5,
                fontSize: 12,
                checkColor: 'rgba(255, 255, 255, 1)',
                color: 'rgba(150, 162, 170, 0.7)',
            },
            height: 50,
        };
    }
}

export default Chart;
