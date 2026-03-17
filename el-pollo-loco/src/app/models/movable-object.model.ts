export class MovableObject {

    x = 0;
    y = 0;
    width = 0;
    height = 0;
    speed = 0;
    energy = 100;

    imgIndex = 0;
    images: HTMLImageElement[] = [];
    imageCache: { [key: string]: HTMLImageElement } = {};

    offsetTop = 0;
    offsetBottom = 0;
    offsetLeft = 0;
    offsetRight = 0;

    loadImage(path: string) {
        const img = new Image();
        img.src = path;
        this.imageCache[path] = img;
    }

    loadImages(paths: string[]) {
        paths.forEach(path => this.loadImage(path));
    }

    getCurrentImage(): HTMLImageElement | null {
        return this.images[this.imgIndex] ?? null;
    }

    nextImage(paths: string[]) {
        this.imgIndex = (this.imgIndex + 1) % paths.length;
        this.images[this.imgIndex] = this.imageCache[paths[this.imgIndex]];
    }

    isColliding(other: MovableObject): boolean {
        return (
            this.x + this.offsetLeft < other.x + other.width - other.offsetRight &&
            this.x + this.width - this.offsetRight > other.x + other.offsetLeft &&
            this.y + this.offsetTop < other.y + other.height - other.offsetBottom &&
            this.y + this.height - this.offsetBottom > other.y + other.offsetTop
        );
    }

    isAbove(other: MovableObject): boolean {
        return this.y + this.height - this.offsetBottom < other.y + other.offsetTop + 20;
    }

    hit(damage: number) {
        this.energy -= damage;
        if (this.energy < 0) this.energy = 0;
    }

    isDead(): boolean {
        return this.energy === 0;
    }

    moveRight() {
        this.x += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }
}