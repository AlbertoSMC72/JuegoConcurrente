// playerWorker.js

self.onmessage = function(e) {
    const { type, data } = e.data;

    switch (type) {
        case 'keyboard':
            handleKeyboardMovement(data);
            break;
        case 'mouse':
            handleMouseMovement(data);
            break;
        case 'touch':
            handleTouchMovement(data);
            break;
    }
};

// Función para controlar el teclado
function handleKeyboardMovement({ keysStatus, self, speed, width, height, canvas }) {
    if (keysStatus.SPACEBAR) {
        self.fire();
    }
    if (keysStatus.DOWN_KEY && self.y < canvas.height - height) {
        self.y += speed;
    }
    if (keysStatus.UP_KEY && self.y > 0) {
        self.y -= speed;
    }
    if (keysStatus.LEFT_KEY && self.x > 0) {
        self.x -= speed;
    }
    if (keysStatus.RIGHT_KEY && self.x < canvas.width - width) {
        self.x += speed;
    }

    self.postMessage({ x: self.x, y: self.y });
}

// Funciones para manejar otros controles (ratón y toque)
function handleMouseMovement({ mouseX, mouseY, width, height }) {
    self.postMessage({ x: mouseX - width / 2, y: mouseY - height / 2 });
}

function handleTouchMovement({ dTouchX, dTouchY, self, width, height, canvas }) {
    self.x -= dTouchX * 0.4;
    if (self.x <= 0) self.x = 1;
    if (self.x + width >= canvas.width) self.x = canvas.width - width;
    self.y -= dTouchY * 0.4;
    if (self.y <= 0) self.y = 1;
    if (self.y + height >= canvas.height) self.y = canvas.height - height;

    self.postMessage({ x: self.x, y: self.y });
}
