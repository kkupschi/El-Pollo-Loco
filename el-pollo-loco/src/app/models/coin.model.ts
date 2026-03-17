import { MovableObject } from './movable-object.model';

export class Coin extends MovableObject {

    override width = 80;
    override height = 80;
    override energy = 1;

    override offsetTop = 10;
    override offsetBottom = 10;
    override offsetLeft = 10;
    override offsetRight = 10;

    images_coin = [
        'assets/img/8_coin/coin_1.png',
        'assets/img/8_coin/coin_2.png',
    ];

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }
}