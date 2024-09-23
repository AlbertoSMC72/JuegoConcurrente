class Obstacle {
    constructor(x, y, ctx, objGame, speed, angle) {
        this.type = 'obstacle';
        this.ctx = ctx;
        this.del = false;
        this.objGame = objGame;
        this.speed = speed;
        this.angle = angle;
        this.radius = canvas.height / 30;
        this.width = this.radius * 2;
        this.height = this.width;
        this.x = x;
        this.y = y;

        // Cargar la imagen solo una vez
        this.meteorImage = new Image();
        this.meteorImage.src = 'images/meteorito.png';

        // Crear el worker
        this.worker = new Worker('./class/obstacleWorker.js');
        this.worker.onmessage = this.updateFromWorker.bind(this);
    }

    draw() {
        // Enviar datos al worker para que realice los cálculos
        this.worker.postMessage({
            x: this.x,
            y: this.y,
            speed: this.speed,
            angle: this.angle,
            radius: this.radius,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height
        });

        // Dibuja el obstáculo
        this.drawObstacle();
    }

    updateFromWorker(e) {
        const { newX, newY, del } = e.data;
        this.x = newX;
        this.y = newY;
        this.del = del;

        if (this.del) {
            this.death();
        }
    }

    drawObstacle() {
        const scaleFactor = 1.5;
        const scaledWidth = this.radius * 2 * scaleFactor;
        const scaledHeight = this.radius * 2 * scaleFactor;
        this.ctx.drawImage(this.meteorImage, this.x - scaledWidth / 2, this.y - scaledHeight / 2, scaledWidth, scaledHeight);
    }

    death() {
        this.del = true;
        console.log('Obstacle is DEAD');
        this.worker.terminate();  // Terminar el worker cuando el obstáculo muera
    }
}
