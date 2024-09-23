self.onmessage = function (e) {
    console.log('Worker received message:', e.data);
    const { action, bulletData } = e.data;
    
    switch(action) {
        case 'move':
            bulletData.y -= bulletData.speed * Math.sin(bulletData.angle);
            bulletData.x -= bulletData.speed * Math.cos(bulletData.angle);
            self.postMessage({ action: 'moved', bulletData });
            break;
        
        case 'checkCrush':
            let isCrushed = checkCrush(bulletData);
            self.postMessage({ action: 'crushChecked', isCrushed, bulletData });
            break;
    }
};

function checkCrush(bulletData) {
    const { canvasHeight, canvasWidth, radius, x, y, objGame } = bulletData;
    
    if (y + radius * 2 < 0 || y > canvasHeight || x < 0 || x > canvasWidth) {
        return true;
    }

    for (const obj of objGame.drawableObjects[1]) {
        if (Math.pow(obj.x + obj.width / 2 - x, 2) + Math.pow(obj.y + obj.height / 2 - y, 2) <= Math.pow(obj.radius, 2)) {
            if (obj.type === 'player' && bulletData.damageToPlayer !== 0) {
                obj.takeDamage(bulletData.damageToPlayer);
            }
            if (obj.type === 'enemy' && bulletData.damageToEnemy !== 0) {
                obj.countOfLives -= bulletData.damageToEnemy;
                bulletData.objGame.currentScore += bulletData.damageToEnemy;
            }
            return true;
        }
    }

    return false;
}
