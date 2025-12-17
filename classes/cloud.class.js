class Cloud extends MovableObject {
    y = 20;
    height = 250;
    width = 480;

    constructor() {
        super().loadImage('assets/img/5_background/layers/4_clouds/1.png');

        this.x = 0 + Math.random() * 500; // Wolken Movement von Start 0.
        this.animate();
    }

    animate() {
        setInterval(() => {
            this.x -= 0.2;
        }, 1000 / 60);
    }
}