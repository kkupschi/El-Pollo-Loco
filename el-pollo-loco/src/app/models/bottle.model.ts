import { MovableObject } from './movable-object.model';

export class Bottle extends MovableObject {

    override width = 70;
    override height = 70;
    override speed = 10;
    override energy = 1;

    override offsetTop = 20;
    override offsetBottom = 20;
    override offsetLeft = 20;
    override offsetRight = 20;

    isThrown = false;
    speedY = 0;
    facingLeft = false;

    images_rotation = [
        'assets/img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        'assets/img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        'assets/img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        'assets/img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png',
    ];

    images_splash = [
        'assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        'assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        'assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        'assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        'assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        'assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png',
    ];

    images_ground = [
        'assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
        'assets/img/6_salsa_bottle/2_salsa_bottle_on_ground.png',
    ];

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }

    throw() {
        this.isThrown = true;
        this.speedY = -5;
    }
}