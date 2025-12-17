class World {
    character = new Character();
    enemies = [
        new Chicken(),
        new Chicken(),
        new Chicken()
    ];

    clouds = [
        new Cloud()
    ];

    backgroundObjects = [
        new BackgroundObject('assets/img/5_background/layers/1_first_layer/1.png')
    ];

    canvas;
    ctx;

    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        addObjectsToMap(this.clouds);
        addObjectsToMap(this.enemies);
        addObjectsToMap(this.backgroundObjects);

        // Draw() wird immer aufgerufen!
        self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    addToMap(mo) {
        this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
    }
    
}