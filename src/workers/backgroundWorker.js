self.onmessage = function(e) {
    const { width, height, arrayOfStars } = e.data;

    const updatedStars = arrayOfStars.map(star => {
        star.x -= 0.1;
        star.y -= 0.1;
        if (star.x < 0) {
            star.x = width;
        }
        if (star.y < 0) {
            star.y = height;
        }
        return star;
    });

    // Devolvemos las estrellas actualizadas al hilo principal
    self.postMessage({ updatedStars });
};
