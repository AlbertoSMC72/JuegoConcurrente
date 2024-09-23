self.onmessage = function (e) {
    const { x, y, speed, angle, canvasWidth, canvasHeight, damageToPlayer, damageToEnemy, obstacles } = e.data;

    // Mover la bala
    const newY = y - speed * Math.sin(angle);
    const newX = x - speed * Math.cos(angle);

    // Verificar si la bala salió del canvas
    let del = false;
    if (newY < 0 || newY > canvasHeight || newX < 0 || newX > canvasWidth) {
        del = true;
    }

    // Verificar colisiones con obstáculos o enemigos
    let hitObject = null;
    for (const obj of obstacles) {
        const distance = Math.pow(obj.x + obj.width / 2 - newX, 2) + Math.pow(obj.y + obj.height / 2 - newY, 2);
        if (distance <= Math.pow(obj.radius, 2)) {
            hitObject = obj;
            del = true;
            break;
        }
    }

    // Enviar de vuelta los resultados, incluyendo detalles de hitObject si es que hay colisión
    self.postMessage({
        newX,
        newY,
        del,
        hitObject,
    });
};
