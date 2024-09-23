// drawPlayerWorker.js
onmessage = function(e) {
    const { playerData, currentTime } = e.data;
    const timeMoving = currentTime % 900; 
    
    let playerImgSrc;
    if (timeMoving < 300) {
        playerImgSrc = 'src/assets/player/player_1.png';
    } else if (timeMoving < 600) {
        playerImgSrc = 'src/assets/player/player_2.png';
    } else {
        playerImgSrc = 'src/assets/player/player_3.png';
    }
    
    // Devolver los datos al hilo principal
    postMessage({
        playerImgSrc,
        x: playerData.x,
        y: playerData.y,
        width: playerData.width,
        height: playerData.height,
        radius: playerData.radius
    });
};
