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
