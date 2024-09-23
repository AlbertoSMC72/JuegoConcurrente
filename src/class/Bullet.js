class Bullet {
    constructor(ctx, objGame, x, y, color, angle = Math.PI / 2, damageToPlayer = 0, damageToEnemy = 0) {
        this.del = false;
        this.ctx = ctx;
        this.objGame = objGame;
        this.color = color;
        this.radius = canvas.height / 100;
        this.speed = canvas.height / 110;
        this.angle = angle;
        this.x = x - this.radius / 2;
        this.y = y - this.radius / 2;
        this.damageToPlayer = damageToPlayer;
        this.damageToEnemy = damageToEnemy;
    }

    draw() {
        if (!this.checkCrush()) {
            this.drawBullet();
            this.move();
        } else {
            this.del = true;
        }
    }

    move() {
        this.y -= this.speed * Math.sin(this.angle);
        this.x -= this.speed * Math.cos(this.angle);
    }

    drawBullet() {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.arc(this.x + this.radius / 2, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }

    checkCrush() {
        if (this.y + this.radius * 2 < 0 || this.y > canvas.height || this.x < 0 || this.x > canvas.width) {// if reach top
            return true;
        }
        for (const obj of this.objGame.drawableObjects[1]) {
            if (Math.pow(obj.x + obj.width / 2 - this.x, 2) + Math.pow(obj.y + obj.height / 2 - this.y, 2) <= Math.pow(obj.radius, 2)) {
                if (obj.type === 'player' && this.damageToPlayer !== 0) {
                    obj.takeDamage(this.damageToPlayer);
                }
                if (obj.type === 'enemy' && this.damageToEnemy !== 0) {
                    obj.countOfLives -= this.damageToEnemy;
                    this.objGame.currentScore += this.damageToEnemy;
                }
                return true;
            }
        }
        return false;
    }
}