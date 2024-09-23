let lastTime = Date.now();
let frequencyOfObstacle = 1000 + 100 * Math.random();

function createObstacle(canvasWidth, canvasHeight) {
    const now = Date.now();
    if (now - frequencyOfObstacle - lastTime > 0) {
        lastTime = now;
        frequencyOfObstacle = 1000 + 500 * Math.random();
        return {
            x: canvasWidth * Math.random(),
            y: 0,
            speed: 4 + 3 * Math.random(),
            angle: Math.PI * Math.random(),
        };
    }
    return null;
}

self.onmessage = function (e) {
    const { canvasWidth, canvasHeight, task } = e.data;

    if (task === 'createObstacle') {
        const obstacle = createObstacle(canvasWidth, canvasHeight);
        if (obstacle) {
            self.postMessage({ obstacle });
        }
    }
};
