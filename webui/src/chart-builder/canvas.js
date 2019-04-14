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

        this.buttonAnimation = {
            iterations: 30,
            timeOut: 10,
        };

        this.scrollAnimation = {
            iterations: 10,
            timeOut: 5,
        };

        this.xScaleShift = (this.width - this.style.leftPadding - this.style.rightPadding) / this.width;
    }

    _getRatio() {
        let dpr = window.devicePixelRatio || 1,
            bsr =
                this.ctx.webkitBackingStorePixelRatio ||
                this.ctx.mozBackingStorePixelRatio ||
                this.ctx.msBackingStorePixelRatio ||
                this.ctx.oBackingStorePixelRatio ||
                this.ctx.backingStorePixelRatio ||
                1;
        return dpr / bsr;
    }

    setup() {
        const ratio = this._getRatio();
        this.ref.width = this.width * ratio;
        this.ref.height = this.height * ratio;
        this.ref.style.width = this.width + 'px';
        this.ref.style.height = this.height + 'px';
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    clear(isNightMode) {
        /*this.ctx.fillStyle =
            isNightMode == true ? this.style.darkModeColor : this.ctx.lightModeColor;
        this.ctx.fillRect(0, 0, this.width, this.height);*/
        this.ctx.clearRect(0, 0, this.width, this.height);
        if (isNightMode == true) {
            this.ctx.save();
            this.ctx.fillStyle = this.style.darkModeColor;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        }
        this.ctx.fillStyle = isNightMode == true ? this.style.darkModeColor : this.style.ligthModeColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawRoundedRect(x, y, width, height, radius, fill, stroke) {
        if (typeof stroke == 'undefined') {
            stroke = true;
        }
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        if (typeof radius === 'number') {
            radius = { tl: radius, tr: radius, br: radius, bl: radius };
        } else {
            let defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
            for (let side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius.tl, y);
        this.ctx.lineTo(x + width - radius.tr, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        this.ctx.lineTo(x + width, y + height - radius.br);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        this.ctx.lineTo(x + radius.bl, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        this.ctx.lineTo(x, y + radius.tl);
        this.ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        this.ctx.closePath();
        if (fill) {
            this.ctx.fill();
        }
        if (stroke) {
            this.ctx.stroke();
        }
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
