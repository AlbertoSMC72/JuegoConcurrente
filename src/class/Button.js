class Button {
    constructor(ctx, objGame, x, y, width, height, text) {
        this.ctx = ctx;
        this.objGame = objGame;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.clicked = false;
    }

    draw() {
        this.ctx.font = '0.7rem Calibri';
        const textMetrics = this.ctx.measureText(this.text.toUpperCase());
        const textWidth = textMetrics.width;
        const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

        this.width = textWidth + 50;
        this.height = textHeight + 25;

        const gradient = this.ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
        gradient.addColorStop(0, '#28285a');
        gradient.addColorStop(1, '#6220fb');
        this.ctx.fillStyle = gradient;

        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(this.x + this.width, this.y);
        this.ctx.lineTo(this.x + this.width, this.y + this.height - 15);
        this.ctx.lineTo(this.x + this.width - 15, this.y + this.height);
        this.ctx.lineTo(this.x + 15, this.y + this.height);
        this.ctx.lineTo(this.x, this.y + this.height - 15);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.text.toUpperCase(), this.x + this.width / 2, this.y + this.height / 2);

        this.checkClicked();
    }

    checkClicked() {
        if (lMouseX > this.x && lMouseX < this.x + this.width && lMouseY > this.y && lMouseY < this.y + this.height) {
            this.clicked = true;
        }
    }
}