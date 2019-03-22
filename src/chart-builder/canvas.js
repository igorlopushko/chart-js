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
            darkModeColor: 'rgba(0, 0, 0, 1)',
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
}
export default Canvas;
