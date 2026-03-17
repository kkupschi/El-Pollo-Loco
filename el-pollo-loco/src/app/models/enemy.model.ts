import { MovableObject } from './movable-object.model';

export class Enemy extends MovableObject {

    override width = 80;
    override height = 80;
    override speed = 0.4;
    override energy = 1;

    override offsetTop = 10;
    override offsetBottom = 10;
    override offsetLeft = 10;
    override offsetRight = 10;

    images_walking = [
        'assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png',
    ];

    images_dead = [
        'assets/img/3_enemies_chicken/chicken_normal/2_dead/dead.png',
    ];

    constructor(x: number) {
        super();
        this.x = x;
        this.y = 350;
    }
}

export class SmallEnemy extends MovableObject {

    override width = 50;
    override height = 50;
    override speed = 0.6;
    override energy = 1;

    override offsetTop = 5;
    override offsetBottom = 5;
    override offsetLeft = 5;
    override offsetRight = 5;

    images_walking = [
        'assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        'assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        'assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png',
    ];

    images_dead = [
        'assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png',
    ];

    constructor(x: number) {
        super();
        this.x = x;
        this.y = 370;
    }
}