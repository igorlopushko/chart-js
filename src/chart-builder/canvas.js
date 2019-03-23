class Canvas {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.height = canvas.height;
        this.width = canvas.width;
        this.ref = canvas;

        this.style = {
            leftPadding: 7,
            rightPadding: 7,
            ligthModeColor: 'rgba(255, 255, 255, 1)',
            darkModeColor: 'rgba(36, 47, 62, 1)',
        };

        this.xScaleShift = (this.width - this.style.leftPadding - this.style.rightPadding) / this.width;
    }

    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + radius);
        this.ctx.lineTo(x, y + height - radius);
        this.ctx.arcTo(x, y + height, x + radius, y + height, radius);
        this.ctx.lineTo(x + width - radius, y + height);
        this.ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
        this.ctx.lineTo(x + width, y + radius);
        this.ctx.arcTo(x + width, y, x + width - radius, y, radius);
        this.ctx.lineTo(x + radius, y);
        this.ctx.arcTo(x, y, x, y + radius, radius);
    }

    getOffsetLeft(e) {
        let offsetLeft = 0;
        do {
            if (!isNaN(e.offsetLeft)) {
                offsetLeft += e.offsetLeft;
            }
            if (e.offsetParent !== undefined && e.offsetParent !== null) {
                e = e.offsetParent;
            } else {
                e = null;
            }
        } while (e !== null);
        return offsetLeft;
    }

    getOffsetTop(e) {
        let offsetTop = 0;
        do {
            if (!isNaN(e.offsetTop)) {
                offsetTop += e.offsetTop;
            }
            if (e.offsetParent !== undefined && e.offsetParent !== null) {
                e = e.offsetParent;
            } else {
                e = null;
            }
        } while (e !== null);
        return offsetTop;
    }
}
export default Canvas;
