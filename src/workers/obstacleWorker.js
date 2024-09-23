self.onmessage = function(e) {
    const { x, y, speed, angle, radius, canvasWidth, canvasHeight } = e.data;

    // Calcula el movimiento basado en la velocidad y ángulo
    const newX = x + speed * Math.cos(angle);
    const newY = y + speed * Math.sin(angle);

    // Verifica si el obstáculo sale de los límites del canvas
    let del = false;
    if (newX + radius * 2 < 0 ||
        newX - radius * 2 > canvasWidth ||
        newY + radius * 2 < 0 ||
        newY - radius * 2 > canvasHeight) {
        del = true;
    }

    // Envía los nuevos valores de vuelta al hilo principal
    self.postMessage({ newX, newY, del });
};
