class MovableObject {
    x = 120;
    y = 276;
    height = 150;
    width = 100;
    img;


    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    moveRight() {
        console.log('moving Right');
    }

    moveLeft() {
        console.log('Moving Left');
    }
}