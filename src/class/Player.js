class Player {
    constructor(x, y, ctx, objGame, controlledBy) {
        this.type = 'player';
        this.del = false;
        this.objGame = objGame;
        this.ctx = ctx;
        this.countOfLives = 10;
        this.damage = 1;
        this.maxFiringFrequency = 300; 
        this.immortal = false;
        this.timeOfLastImmortal = Date.now();
        this.timeOfLastShot = Date.now();
        this.autoFire = false;
        this.img = new Image();
        this.width = window.innerHeight / 10;
        this.height = this.width;
        this.radius = this.width / 4;
        this.speed = this.width / 40;
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        
        // Crear el Worker
        this.worker = new Worker('./src/workers/drawPlayerWorker.js');
        
        // Escuchar los mensajes del Worker
        this.worker.onmessage = (e) => {
            const { playerImgSrc, x, y, width, height, radius } = e.data;
            this.img.src = playerImgSrc;
            
            // Dibuja el jugador
            this.ctx.drawImage(this.img, x, y, width, height);
            this.ctx.beginPath();
            this.ctx.fillStyle = 'rgba(255,0,0,0.51)';
            this.ctx.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.closePath();
        };
        
        switch (controlledBy) {
            case 1:
                this.movemenetInterval = setInterval(this.controlledByMouse, 1, this);
                this.autoFire = false;
                break;
            case 2:
                this.movemenetInterval = setInterval(this.controlledByMouseAuto, 1, this);
                this.autoFire = true;
                break;
            case 3:
                this.movemenetInterval = setInterval(this.controlledByTouchAuto, 1, this);
                this.autoFire = true;
                break;
            default:
                this.movemenetInterval = setInterval(this.controlledByKeyboard, 1, this);
                this.autoFire = false;
        }
    }

    draw() {
        this.checkCrush();
        if (this.countOfLives <= 0) {
            this.death();
        }
        this.drawLifes();
        
        this.worker.postMessage({
            playerData: {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                radius: this.radius
            },
            currentTime: Date.now()
        });

        if (this.immortal) {
            this.drawImmortal();
            if (Date.now() - 3000 - this.timeOfLastImmortal >= 0) {
                this.timeOfLastImmortal = Date.now();
                console.log('Player is not immortal anymore');
                this.immortal = false;
            }
        }
        if (this.autoFire) {
            this.fire();
        }
    }


    drawLifes() {
        const shieldImg = new Image();
        shieldImg.src = 'src/assets/player/energia.gif';
        const lifeSize = 30;
        for (let i = 0; i < this.countOfLives; i++) {
            this.ctx.drawImage(shieldImg, 10 + i * (lifeSize + 10), 10, lifeSize, lifeSize);
        }
    }

    fire() {
        if (Date.now() - this.timeOfLastShot - this.maxFiringFrequency > 0) {
            this.timeOfLastShot = Date.now();
            this.drawFireSpray(1);
        }
    }

    drawFireSpray(n) {
        for (let i = 1; i < n + 1; i++) {
            this.objGame.drawableObjects[0].push(new Bullet(ctx, this.objGame, this.x + this.width / 2, this.y - 15, '#a00404', Math.PI / (n + 1) * i, 0, this.damage));
        }
    }

    drawImmortal() {
        const shieldImg = new Image();
        shieldImg.src = 'src/assets/shields.png';
        this.ctx.drawImage(
            shieldImg,
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width * 2,
            this.height * 2
        );
    }

    addToCoord(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    moveTo(x, y) {
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
    }

    controlledByKeyboard(self) {
        if (keysStatus[KEY_CODES.SPACEBAR]) {
            self.fire();
        }
        if (keysStatus[KEY_CODES.DOWN_KEY] && self.y < canvas.height - self.height) {
            self.addToCoord(0, self.speed);
        }
        if (keysStatus[KEY_CODES.UP_KEY] && self.y > 0) {
            self.addToCoord(0, -self.speed);
        }
        if (keysStatus[KEY_CODES.LEFT_KEY] && self.x > 0) {
            self.addToCoord(-self.speed, 0);
        }
        if (keysStatus[KEY_CODES.RIGHT_KEY] && self.x < canvas.width - self.width) {
            self.addToCoord(self.speed, 0);
        }
    }

    controlledByMouse(self) {
        self.shootByMouse();
        self.movementByMouse();
    }

    controlledByMouseAuto(self) {
        self.movementByMouse();
    }

    controlledByTouchAuto(self) {
        self.x -= dTouchX*0.4;
        if (self.x <= 0) {
            self.x = 1;
        }
        if (self.x + self.width >= canvas.width) {
            self.x = canvas.width - self.width;
        }
        self.y -= dTouchY*0.4;
        if (self.y <= 0) {
            self.y = 1;
        }
        if (self.y + self.height >= canvas.height) {
            self.y = canvas.height - self.height;
        }
    }

    shootByMouse() {
        if (keysStatus[KEY_CODES.LEFT_MOUSE]) {
            this.fire();
        }
    }

    movementByMouse() {
        this.x = mouseX - this.width / 2;
        this.y = mouseY - this.height / 2;
    }

    takeDamage(n) {
        if (!this.immortal) {
            this.countOfLives -= n;
            this.immortal = true;
            this.timeOfLastImmortal = Date.now();
        }
    }

    checkCrush() {
        for (const obj of this.objGame.drawableObjects[1]) {
            if (Math.sqrt(
                Math.pow(this.x + this.width / 2 - obj.x - obj.width / 2, 2) +
                Math.pow(this.y + this.height / 2 - obj.y - obj.height / 2, 2)) < (this.radius + obj.radius) &&
                obj.type !== 'player'
            ) {
                this.takeDamage(1);
            }
        }
    }

    death() {
        console.log('PLAYER IS DEAD');
        clearInterval(this.movemenetInterval);
        this.del = true;
    }
}