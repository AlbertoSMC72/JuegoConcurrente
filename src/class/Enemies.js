class Enemy {
    constructor(x, y, ctx, objGame) {
        objGame.enemyCount++;
        this.type = 'enemy';
        this.ctx = ctx;
        this.objGame = objGame;
        this.width = window.innerHeight / 15;
        this.height = this.width;
        this.speed = this.width / 50;
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.radius = this.width / 2;
        this.del = false;
        this.timeOfLastShot = Date.now();
        this.autoFire = true;
        this.maxFiringFrequency = 500;
        this.damage = 1;
        this.countOfLives = 3;
    }

    draw() {
        this.movement();
        this.drawEnemy();
        if (this.autoFire) {
            this.fire();
        }
        if (this.countOfLives <= 0 || this.y > canvas.height) {
            this.death();
        }
    }

    movement() {
        this.x += this.speed * 3;
        if (this.x < 0 || this.x + this.width > canvas.width) {
            this.speed *= -1;
        }
        this.y += Math.abs(this.speed) * 0.4;
    }

    drawEnemy() {
        const enemyImage = new Image();
        enemyImage.src = 'src/assets/enemigos/enemy.png';
        this.ctx.drawImage(enemyImage, this.x, this.y, this.width, this.height);

        // Draw health bar only if damage has been taken
        if (this.countOfLives < 3) {
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(this.x, this.y - 10, this.width, 5); // Background bar
            this.ctx.fillStyle = 'green';
            this.ctx.fillRect(this.x, this.y - 10, this.width * (this.countOfLives / 3), 5); // Health bar
        }
    }

    fire() {
        if (Date.now() - this.timeOfLastShot - this.maxFiringFrequency >= 0) {
            this.timeOfLastShot = Date.now();
            this.drawFire();
        }
    }

    drawFire() {
        this.drawFireSpray(1);
    }

    drawFireSpray(n) {
        for (let i = 1; i < n + 1; i++) {
            this.objGame.drawableObjects[0].push(new Bullet(ctx, this.objGame, this.x + this.width / 2, this.y + this.height + 15, '#1fd030', Math.PI / (n + 1) * i + Math.PI, this.damage, 0));
        }
    }

    death() {
        this.objGame.enemyCount--;
        console.log(`Enemy is DEAD. Enemys left ${this.objGame.enemyCount}`);
        this.del = true;
    }
} 

class Enemy1 extends Enemy {
    constructor(x, y, ctx, objGame) {
        super(x, y, ctx, objGame);
        this.maxFiringFrequency *= 1.2;
        this.countOfLives = 10;
    }

    drawEnemy() {
        const enemyImage = new Image();
        enemyImage.src = 'src/assets/enemigos/enemy2.png'; // Asegúrate de que la ruta de la imagen sea correcta
        this.ctx.drawImage(enemyImage, this.x, this.y, this.width, this.height);

        if (this.countOfLives < 10) {
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(this.x, this.y - 10, this.width, 5);
            this.ctx.fillStyle = 'green';
            this.ctx.fillRect(this.x, this.y - 10, this.width * (this.countOfLives / 10), 5); 
        }
    }

    movement() {
        this.x += this.speed * 2;
        if (this.x < 0 || this.x + this.width > canvas.width) {
            this.speed *= -1;
        }
        this.y += Math.abs(this.speed) * 0.05;
    }

    drawFire() {
        this.drawFireSpray(5);
    }
}

class Boss extends Enemy1 {
    constructor(x, y, ctx, objGame) {
        super(x, y, ctx, objGame);
        this.radius *= 2.5;
        this.countOfLives = 30;
        this.frequencyOfSpawn = 7000;
        this.timeOfLastSpawn = Date.now();
        this.width *= 5;
        this.height *= 5;
    }

    movement() {
        this.x += this.speed * 2;
        if (this.x < 0 || this.x + this.width > canvas.width) {
            this.speed *= -1;
        }
    }

    draw() {
        if (Date.now() - this.frequencyOfSpawn - this.timeOfLastSpawn > 0) {
            this.timeOfLastSpawn = Date.now();
            this.spawn();
        }
        super.draw();
    }

    drawFire() {
        this.drawFireSpray(8);
    }

    spawn() {
        for (let i = 1; i < 4; i++) {
            this.objGame.drawableObjects[1].push(
                new Enemy(canvas.width / 4 * i, canvas.height / 10 + 10 * i, this.ctx, this.objGame)
            );
        }
    }
}