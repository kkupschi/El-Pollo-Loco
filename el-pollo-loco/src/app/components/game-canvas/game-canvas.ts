import { Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { GameService } from '../../core/services/game';
import { AudioService } from '../../core/services/audio';
import { InputService } from '../../core/services/input';
import { Character } from '../../models/character.model';
import { Enemy, SmallEnemy } from '../../models/enemy.model';
import { Endboss } from '../../models/endboss.model';
import { Coin } from '../../models/coin.model';
import { Bottle } from '../../models/bottle.model';
import { Level } from '../../models/level.model';
import { StatusBarComponent } from '../status-bar/status-bar';
import { MobileControlsComponent } from '../mobile-controls/mobile-controls';
import { EndScreenComponent } from '../end-screen/end-screen';

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  imports: [StatusBarComponent, MobileControlsComponent, EndScreenComponent],
  templateUrl: './game-canvas.html',
  styleUrl: './game-canvas.css'
})
export class GameCanvasComponent implements OnInit, OnDestroy {

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private cameraX = 0;

  character = new Character();
  level!: Level;
  thrownBottles: Bottle[] = [];

  constructor(
    public gameService: GameService,
    public audioService: AudioService,
    private inputService: InputService
  ) { }

  ngOnInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.initLevel();
    this.loadAllImages();
    this.level.backgroundLayers.forEach(layer => {
      layer.forEach(imgPath => {
        const img = new Image();
        img.src = imgPath;
        this.backgroundImageCache[imgPath] = img;
      });
    });
    this.gameService.startGame();
    this.audioService.loadSound('music', 'assets/sounds/music/music.mp3');
    this.audioService.playSound('music', true);
    this.startGameLoop();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    this.audioService.stopSound('music');
  }

  private initLevel() {
    this.level = new Level(
      [
        new Enemy(600),
        new Enemy(900),
        new Enemy(1200),
        new SmallEnemy(750),
        new SmallEnemy(1050),
        new SmallEnemy(1400),
      ],
      [new Endboss()],
      [
        new Coin(400, 200),
        new Coin(600, 150),
        new Coin(900, 250),
        new Coin(1100, 180),
        new Coin(1500, 200),
      ],
      [
        new Bottle(300, 350),
        new Bottle(500, 350),
        new Bottle(800, 350),
        new Bottle(1300, 350),
      ],
      [
        ['assets/img/5_background/layers/air.png'],
        ['assets/img/5_background/layers/3_third_layer/1.png', 'assets/img/5_background/layers/3_third_layer/2.png'],
        ['assets/img/5_background/layers/2_second_layer/1.png', 'assets/img/5_background/layers/2_second_layer/2.png'],
        ['assets/img/5_background/layers/1_first_layer/1.png', 'assets/img/5_background/layers/1_first_layer/2.png'],
      ]
    );
  }

  private loadAllImages() {
    this.character.loadImages(this.character.images_walking);
    this.character.loadImages(this.character.images_jumping);
    this.character.loadImages(this.character.images_hurt);
    this.character.loadImages(this.character.images_dead);
    this.character.loadImages(this.character.images_idle);
    this.character.loadImages(this.character.images_sleep);

    this.level.enemies.forEach(e => {
      e.loadImages(e.images_walking);
      e.loadImages(e.images_dead);
    });

    this.level.endboss.forEach(b => {
      b.loadImages(b.images_walking);
      b.loadImages(b.images_alert);
      b.loadImages(b.images_attack);
      b.loadImages(b.images_hurt);
      b.loadImages(b.images_dead);
    });

    this.level.coins.forEach(c => c.loadImages(c.images_coin));
    this.level.bottles.forEach(b => b.loadImages(b.images_ground));
  }

  private lastFrameTime = 0;
  private fps = 60;

  private startGameLoop() {
    const loop = (timestamp: number) => {
      const interval = 1000 / this.fps;
      const delta = timestamp - this.lastFrameTime;

      if (delta >= interval) {
        this.lastFrameTime = timestamp - (delta % interval);
        this.update();
        this.draw();
      }

      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  private update() {
    if (this.gameService.gameState() !== 'running') return;
    this.updateCharacter();
    this.updateEnemies();
    this.updateBottles();
    this.checkCollisions();
    this.updateCamera();
  }

  private updateCharacter() {
    if (this.inputService.moveRight()) {
      this.character.moveRight();
      this.character.updateLastMoveTime();
    }
    if (this.inputService.moveLeft() && this.character.x > 0) {
      this.character.moveLeft();
      this.character.updateLastMoveTime();
    }
    if (this.inputService.jump() && this.character.isGrounded) {
      this.character.jump();
      this.character.updateLastMoveTime();
    }
    if (this.inputService.throwBottle()) {
      this.throwBottle();
    }
    this.character.applyGravity();
    this.character.checkSleep();
  }

  private throwBottle() {
    if (this.gameService.bottles() <= 0) return;
    const bottle = new Bottle(this.character.x + 50, this.character.y + 100);
    bottle.loadImages(bottle.images_rotation);
    bottle.loadImages(bottle.images_splash);
    bottle.throw();
    this.thrownBottles.push(bottle);
    this.gameService.bottles.set(this.gameService.bottles() - 1);
  }

  private updateEnemies() {
    this.level.enemies.forEach(enemy => {
      if (!enemy.isDead()) enemy.moveLeft();
    });
    this.level.endboss.forEach(boss => {
      if (!boss.isDead()) boss.moveLeft();
    });
  }

  private updateBottles() {
    this.thrownBottles.forEach(bottle => {
      if (bottle.isThrown) {
        bottle.x += bottle.speed;
        bottle.speedY += 1;
        bottle.y += bottle.speedY;
      }
    });
    this.thrownBottles = this.thrownBottles.filter(b => b.x < 720 + this.cameraX);
  }

  private checkCollisions() {
    this.checkCharacterEnemyCollisions();
    this.checkCharacterEndbossCollision();
    this.checkCharacterCoinCollisions();
    this.checkCharacterBottleCollisions();
    this.checkBottleEnemyCollisions();
    this.checkEndbossProximity();
  }

  private checkCharacterEnemyCollisions() {
    this.level.enemies.forEach(enemy => {
      if (enemy.isDead()) return;
      if (this.character.isColliding(enemy)) {
        if (this.character.isAbove(enemy)) {
          enemy.hit(1);
          this.audioService.loadSound('chicken_dead', 'assets/sounds/chicken/chicken_dead.mp3');
          this.audioService.playSound('chicken_dead');
        } else {
          this.character.hit(10);
          this.gameService.characterHealth.set(this.character.energy);
          if (this.character.isDead()) this.gameService.loseGame();
        }
      }
    });
  }

  private checkCharacterEndbossCollision() {
    this.level.endboss.forEach(boss => {
      if (boss.isDead()) return;
      if (this.character.isColliding(boss)) {
        this.character.hit(20);
        this.gameService.characterHealth.set(this.character.energy);
        if (this.character.isDead()) this.gameService.loseGame();
      }
    });
  }

  private checkCharacterCoinCollisions() {
    this.level.coins = this.level.coins.filter(coin => {
      if (this.character.isColliding(coin)) {
        this.gameService.coins.set(this.gameService.coins() + 1);
        return false;
      }
      return true;
    });
  }

  private checkCharacterBottleCollisions() {
    this.level.bottles = this.level.bottles.filter(bottle => {
      if (this.character.isColliding(bottle)) {
        this.gameService.bottles.set(this.gameService.bottles() + 1);
        return false;
      }
      return true;
    });
  }

  private checkBottleEnemyCollisions() {
    this.thrownBottles.forEach(bottle => {
      this.level.enemies.forEach(enemy => {
        if (!enemy.isDead() && bottle.isColliding(enemy)) {
          enemy.hit(1);
        }
      });
      this.level.endboss.forEach(boss => {
        if (!boss.isDead() && bottle.isColliding(boss)) {
          boss.hit(20);
          this.gameService.endbossHealth.set(boss.energy);
          if (boss.isDead()) this.gameService.winGame();
        }
      });
    });
  }

  private checkEndbossProximity() {
    this.level.endboss.forEach(boss => {
      if (Math.abs(this.character.x - boss.x) < 300 && !boss.isAlerted) {
        boss.alert();
      }
    });
  }

  private updateCamera() {
    this.cameraX = -this.character.x + 100;
    if (this.cameraX > 0) this.cameraX = 0;
  }

  private draw() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.drawBackground();

    this.ctx.save();
    this.ctx.translate(this.cameraX, 0);
    this.drawCoins();
    this.drawBottlesOnGround();
    this.drawEnemies();
    this.drawEndboss();
    this.drawThrownBottles();
    this.drawCharacter();
    this.ctx.restore();
  }

  private drawBackground() {
    const canvas = this.canvasRef.nativeElement;
    const canvasWidth = canvas.width;
    const startX = Math.floor(-this.cameraX / canvasWidth) * canvasWidth;

    this.level.backgroundLayers.forEach(layer => {
      layer.forEach(imgPath => {
        const img = this.backgroundImageCache[imgPath];
        if (!img) return;
        for (let x = startX; x <= startX + canvasWidth * 2; x += canvasWidth) {
          this.ctx.drawImage(img, x + this.cameraX, 0, canvasWidth, canvas.height);
        }
      });
    });
  }
  private backgroundImageCache: { [key: string]: HTMLImageElement } = {};

  private drawCoins() {
    this.level.coins.forEach(coin => {
      const img = coin.imageCache[coin.images_coin[0]];
      if (img) this.ctx.drawImage(img, coin.x, coin.y, coin.width, coin.height);
    });
  }

  private drawBottlesOnGround() {
    this.level.bottles.forEach(bottle => {
      const img = bottle.imageCache[bottle.images_ground[0]];
      if (img) this.ctx.drawImage(img, bottle.x, bottle.y, bottle.width, bottle.height);
    });
  }

  private drawEnemies() {
    this.level.enemies.forEach(enemy => {
      const imgPath = enemy.isDead() ? enemy.images_dead[0] : enemy.images_walking[enemy.imgIndex % enemy.images_walking.length];
      const img = enemy.imageCache[imgPath];
      if (img) this.ctx.drawImage(img, enemy.x, enemy.y, enemy.width, enemy.height);
    });
  }

  private drawEndboss() {
    this.level.endboss.forEach(boss => {
      const imgPath = boss.isDead()
        ? boss.images_dead[0]
        : boss.isAttacking
          ? boss.images_attack[boss.imgIndex % boss.images_attack.length]
          : boss.isAlerted
            ? boss.images_alert[boss.imgIndex % boss.images_alert.length]
            : boss.images_walking[boss.imgIndex % boss.images_walking.length];
      const img = boss.imageCache[imgPath];
      if (img) this.ctx.drawImage(img, boss.x, boss.y, boss.width, boss.height);
    });
  }

  private drawThrownBottles() {
    this.thrownBottles.forEach(bottle => {
      const imgPath = bottle.images_rotation[bottle.imgIndex % bottle.images_rotation.length];
      const img = bottle.imageCache[imgPath];
      if (img) this.ctx.drawImage(img, bottle.x, bottle.y, bottle.width, bottle.height);
    });
  }

  private drawCharacter() {
    const char = this.character;
    let imgPath = char.images_idle[char.imgIndex % char.images_idle.length];

    if (char.isDead()) {
      imgPath = char.images_dead[char.imgIndex % char.images_dead.length];
    } else if (!char.isGrounded) {
      imgPath = char.images_jumping[char.imgIndex % char.images_jumping.length];
    } else if (this.inputService.moveLeft() || this.inputService.moveRight()) {
      imgPath = char.images_walking[char.imgIndex % char.images_walking.length];
    } else if (char.isSleeping) {
      imgPath = char.images_sleep[char.imgIndex % char.images_sleep.length];
    }

    const img = char.imageCache[imgPath];
    if (img) this.ctx.drawImage(img, char.x, char.y, char.width, char.height);
  }
}