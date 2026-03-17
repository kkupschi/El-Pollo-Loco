import { Enemy, SmallEnemy } from './enemy.model';
import { Endboss } from './endboss.model';
import { Coin } from './coin.model';
import { Bottle } from './bottle.model';

export class Level {

    enemies: (Enemy | SmallEnemy)[] = [];
    endboss: Endboss[] = [];
    coins: Coin[] = [];
    bottles: Bottle[] = [];
    backgroundLayers: string[][] = [];

    levelEndX = 2500;

    constructor(
        enemies: (Enemy | SmallEnemy)[],
        endboss: Endboss[],
        coins: Coin[],
        bottles: Bottle[],
        backgroundLayers: string[][]
    ) {
        this.enemies = enemies;
        this.endboss = endboss;
        this.coins = coins;
        this.bottles = bottles;
        this.backgroundLayers = backgroundLayers;
    }
}