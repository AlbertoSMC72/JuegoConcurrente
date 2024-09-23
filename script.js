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

        this.width = textWidth + 50; // Add some padding
        this.height = textHeight + 25; // Add some padding

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

let worker = new Worker('./class/gameWorker.js');

class Game {
    constructor(ctx) {
        this.drawableObjects = {
            0: [],
            1: [],
        };
        this.level = 1;
        this.levelsCount = 2;
        this.ctx = ctx;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.inBeforeGameMenu = true;
        this.inAfterGameMenu = false;
        this.currentScore = 0;
        this.bestScore = 0;
        this.enemyCount = 0;
        this.controllerType = 0;
        this.prepareInGameBackground();
        this.prepareButtons();
        this.setupWorkerListeners(); // Configura listeners para el Worker
    }

    setupWorkerListeners() {
        // Recibir mensajes del Worker
        worker.onmessage = (e) => {
            if (e.data.obstacle) {
                const { x, y, speed, angle } = e.data.obstacle;
                this.drawableObjects[1].push(
                    new Obstacle(x, y, this.ctx, this, speed, angle)
                );
            }
        };
    }

    prepare() {
        this.currentScore = 0;
        this.enemyCount = 0;
        // Level 1 Player, Enemies, Obstacles, Bullets
        this.player = new Player(this.width / 2, (this.height / 10) * 9, this.ctx, this, this.controllerType);
        this.drawableObjects[1].push(this.player);
        //
        this.levels(this.level);
    }

    prepareButtons() {
        let n = 4;
        this.beforeGameMenuButtons = [
            new Button(ctx, this, (canvas.width - canvas.width / 15) / (n + 1), (canvas.height - canvas.height / 10) / 2, canvas.width / 10, canvas.height / 7, 'Keyboard'),
            new Button(ctx, this, (canvas.width - canvas.width / 15) / (n + 1) * 2, (canvas.height - canvas.height / 10) / 2, canvas.width / 10, canvas.height / 7, 'Mouse'),
            new Button(ctx, this, (canvas.width - canvas.width / 15) / (n + 1) * 3, (canvas.height - canvas.height / 10) / 2, canvas.width / 10, canvas.height / 7, 'Mouse (auto)'),
            new Button(ctx, this, (canvas.width - canvas.width / 15) / (n + 1) * 4, (canvas.height - canvas.height / 10) / 2, canvas.width / 10, canvas.height / 7, 'Touch (auto)'),
        ];
        n = 2
        this.afterGameMenuButtons = [
            new Button(ctx, this, (canvas.width - canvas.width / 15) / (n + 1), (canvas.height - canvas.height / 10) / 2, canvas.width / 10, canvas.height / 7, 'New Game'),
            new Button(ctx, this, (canvas.width - canvas.width / 15) / (n + 1) * 2, (canvas.height - canvas.height / 10) / 2, canvas.width / 10, canvas.height / 7, 'Exit'),
        ];
    }

    createObstacle() {
        // Enviar tarea de creación de obstáculos al Worker
        worker.postMessage({
            task: 'createObstacle',
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
        });
    }

    draw() {
        this.drawBackground();
        if (this.enemyCount <= 0 && !this.inBeforeGameMenu) {
            if (this.level === this.levelsCount) {
                this.drawableObjects[0].length = 0;
                this.drawableObjects[1].length = 0;
                this.message = 'Tu favorito!';
                this.checkBestScore();
                this.level = 0;
                this.inAfterGameMenu = true;
            } else {
                this.level++;
                this.levels(this.level);
            }
        }
        if (this.inAfterGameMenu) {
            this.afterGameMenu();
        } else if (this.inBeforeGameMenu) {
            this.beforeGameMenu();
        } else {
            this.inGame();
        }
    }

    inGame() {
        this.createObstacle(); // Llamar al Worker para crear obstáculos
        for (const obj of this.drawableObjects[0]) {
            obj.draw();
        }
        this.drawableObjects[0] = this.drawableObjects[0].filter(item => !item.del);
        for (const obj of this.drawableObjects[1]) {
            obj.draw();
        }
        this.drawableObjects[1] = this.drawableObjects[1].filter(item => !item.del);

        if (typeof this.player.del !== undefined && this.player.del) {
            this.drawableObjects[0].length = 0;
            this.drawableObjects[1].length = 0;
            this.message = 'You died!';
            this.checkBestScore();
            this.inAfterGameMenu = true;
        }
        this.drawCurrentScore();
    }

    checkBestScore() {
        this.bestScore = this.currentScore > this.bestScore ? this.currentScore : this.bestScore;
    }

    drawCurrentScore() {
        this.ctx.beginPath();
        this.ctx.font = '25px Calibri';
        this.ctx.fillStyle = '#FFF';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`Score: ${this.currentScore}`, canvas.width / 2, 20);
        this.ctx.fill();
        this.ctx.closePath();
    }

    inGame() {
        this.createObstacle();
        for (const obj of this.drawableObjects[0]) {
            obj.draw();
        }
        this.drawableObjects[0] = this.drawableObjects[0].filter(item => !item.del);
        for (const obj of this.drawableObjects[1]) {
            obj.draw();
        }
        this.drawableObjects[1] = this.drawableObjects[1].filter(item => !item.del);
        //
        if (typeof this.player.del !== undefined && this.player.del) {
            this.drawableObjects[0].length = 0;
            this.drawableObjects[1].length = 0;
            this.message = 'You died!';
            this.checkBestScore();
            this.inAfterGameMenu = true;
        }
        this.drawCurrentScore();
    }

    beforeGameMenu() {
        for (const button of this.beforeGameMenuButtons) {
            button.draw();
        }
        for (let i = 0; i < this.beforeGameMenuButtons.length; i++) {
            if (this.beforeGameMenuButtons[i].clicked) {
                this.controllerType = i;
                this.beforeGameMenuButtons[i].clicked = false;
                clearLMousePos();
                this.inBeforeGameMenu = false;
                this.enemyCount = 0;
                this.level = 0;
                console.log('Button clicked');
                this.prepare();
                break;
            }
        }
    }

    levels(level) {
        let n = null;
        switch (level) {
            case 1:
                n = 5;
                for (let i = 1; i < n + 1; i++) {
                    this.drawableObjects[1].push(
                        new Enemy(canvas.width / (n + 1) * i, canvas.height / 10, this.ctx, this)
                    );
                }
                n = 1;
                for (let i = 1; i < n + 1; i++) {
                    this.drawableObjects[1].push(
                        new Enemy1(canvas.width / (n + 1) * i, canvas.height / 10, this.ctx, this)
                    );
                }
                break;
            case 2:
                this.drawableObjects[1].push(
                    new Boss(canvas.width / 2, canvas.height / 10, this.ctx, this)
                );
                break;
        }
    }

    afterGameMenu() {
        this.ctx.beginPath();
        this.ctx.textAlign = 'center';
        this.ctx.font = '30px Calibri';
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText(this.message + `\nTu puntuación: ${this.currentScore}\nMejor puntuación: ${this.bestScore}`, canvas.width / 2, canvas.height / 4);
        this.ctx.closePath();
        for (const button of this.afterGameMenuButtons) {
            button.draw();
        }
        let status = null;
        for (let i = 0; i < this.afterGameMenuButtons.length; i++) {
            if (this.afterGameMenuButtons[i].clicked) {
                this.afterGameMenuButtons[i].clicked = false;
                status = i;
                clearLMousePos();
                console.log('Button clicked');
                break;
            }
        }
        switch (status) {
            case 0:
                this.inBeforeGameMenu = true;
                this.inAfterGameMenu = false;
                break;
            case 1:
                close();
                break;
        }
    }


    drawBackground() {
        this.ctx.beginPath();
        this.ctx.fillStyle = "#020D56"
        this.ctx.fillRect(0, 0, this.width, this.height);
        for (let star of this.arrayOfStars) {
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(156,155,155,${Math.sin(-Date.now() * 0.0000001 + (star.x + star.y) * 0.07)})`;
            this.ctx.fillRect(star.x, star.y, 5, 5);
            this.ctx.closePath();
            star.x -= 0.1;
            star.y -= 0.1;
            if (star.x < 0) {
                star.x = this.width;
            }
            if (star.y < 0) {
                star.y = this.height;
            }
        }
    }

    prepareInGameBackground() {
        this.arrayOfStars = [];
        for (let i = 0; i < Math.floor(this.width * this.height / 2500); i++) {
            this.arrayOfStars.push({x: Math.random() * this.width, y: Math.random() * this.height})
        }
        console.log("Generated array of stars");
    }
}

window.onload = function () {
    document.addEventListener('touchstart', changeTouchStart);
    document.addEventListener('touchmove', changeTouchMove);
    document.addEventListener('touchend', changeTouchEnd);
    document.addEventListener("mousemove", changeMousePos);
    document.addEventListener('mousedown', mKeyPressed);
    document.addEventListener('mouseup', mKeyReleased);
    document.addEventListener('keydown', keyPressed);
    document.addEventListener('keyup', keyReleased);
    canvas.addEventListener('click', changeLMousePos);
}

let canvas = document.getElementById('myCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
const KEY_CODES = {
    LEFT_MOUSE: 0,
    SPACEBAR: 32,
    LEFT_KEY: 37,
    UP_KEY: 38,
    RIGHT_KEY: 39,
    DOWN_KEY: 40,
}
let keysStatus = {};
let mouseX = 0;
let mouseY = 0;
let lMouseX = 0;
let lMouseY = 0;
let lTouchX = 0;
let lTouchY = 0;
let dTouchX = 0;
let dTouchY = 0;
let game = new Game(ctx);
let inGame = true;
let drawInterval = setInterval(draw, 1000 / 60);

function draw() {
    game.draw();
}

function changeTouchEnd(e){
    dTouchX = 0;
    dTouchY = 0;
}

function changeTouchMove(e) {
    dTouchX = lTouchX - e.touches[0].clientX;
    dTouchY = lTouchY - e.touches[0].clientY;
    lTouchX = e.touches[0].clientX;
    lTouchY = e.touches[0].clientY;
}

function changeTouchStart(e) {
    lTouchX = e.touches[0].clientX;
    lTouchY = e.touches[0].clientY;
}

function clearLMousePos() {
    lMouseY = null;
    lMouseX = null;
}

function changeLMousePos(e) {
    // EventListener Click Mouse
    lMouseX = e.clientX;
    lMouseY = e.clientY;
    console.log(`Clicked here ${lMouseX} ${lMouseY}`);
}

function changeMousePos(e) {
    // EventListener mousemove
    mouseY = e.clientY;
    mouseX = e.clientX;
}

function mKeyPressed(e) {
    // EventListener mouse key pressed
    keysStatus[e.button] = true;
}

function mKeyReleased(e) {
    // EventListener mouse key released
    keysStatus[e.button] = false;
}

function keyPressed(e) {
    // EventListener keydown
    keysStatus[e.keyCode] = true;
    // console.log(e.keyCode);
}

function keyReleased(e) {
    // EventListener keyup
    keysStatus[e.keyCode] = false;
}
