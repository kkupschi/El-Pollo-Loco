import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
  private animationInterval: any;
  private cameraX = 0;
  private lastFrameTime = 0;
  private fps = 60;

  private backgroundImageCache: { [key: string]: HTMLImageElement } = {};
  private bottleImageCache: { [key: string]: HTMLImageElement } = {};
  private collidingEnemies = new Set<Enemy | SmallEnemy>();
  private collidingBoss = false;
  private hitBottles = new Set<Bottle>();

  character = new Character();
  level!: Level;
  thrownBottles: Bottle[] = [];

  constructor(
    public gameService: GameService,
    public audioService: AudioService,
    private inputService: InputService,
    private router: Router
  ) { }

  ngOnInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.initLevel();
    this.loadAllImages();
    this.preloadBottleImages();
    this.preloadBackgroundImages();
    this.loadAllSounds();
    this.gameService.startGame();
    this.audioService.stopSound('menu_music');
    this.audioService.playSound('music', true);
    this.startAnimations();
    this.startGameLoop();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    clearInterval(this.animationInterval);
    this.audioService.stopSound('music');
  }

  private loadAllSounds() {
    this.audioService.loadSound('music', 'assets/sounds/music/game_music.mp3', 0.15);
    this.audioService.loadSound('characterDamage', 'assets/sounds/character/characterDamage.mp3', 0.4);
    this.audioService.loadSound('characterDead', 'assets/sounds/character/characterDead.wav', 0.4);
    this.audioService.loadSound('characterJump', 'assets/sounds/character/characterJump.wav', 0.3);
    this.audioService.loadSound('characterRun', 'assets/sounds/character/characterRun.mp3', 0.15);
    this.audioService.loadSound('characterSnoring', 'assets/sounds/character/characterSnoring.mp3', 0.2);
    this.audioService.loadSound('chickenDead', 'assets/sounds/chicken/chickenDead.mp3', 0.4);
    this.audioService.loadSound('bottleCollect', 'assets/sounds/collectibles/bottleCollectSound.wav', 0.4);
    this.audioService.loadSound('coinCollect', 'assets/sounds/collectibles/collectSound.wav', 0.4);
    this.audioService.loadSound('endbossApproach', 'assets/sounds/endboss/endbossApproach.wav', 0.4);
    this.audioService.loadSound('bottleBreak', 'assets/sounds/throwable/bottleBreak.mp3', 0.4);
    this.audioService.loadSound('lose', 'assets/sounds/win_lose/lose.mp3', 0.4);
    this.audioService.loadSound('win', 'assets/sounds/win_lose/win.mp3', 0.4);
  }

  private preloadBottleImages() {
    const tempBottle = new Bottle(0, 0);
    [...tempBottle.images_rotation, ...tempBottle.images_splash].forEach(path => {
      const img = new Image();
      img.src = path;
      this.bottleImageCache[path] = img;
    });
  }

  private preloadBackgroundImages() {
    this.level.backgroundLayers.forEach(layer => {
      layer.forEach(imgPath => {
        const img = new Image();
        img.src = imgPath;
        this.backgroundImageCache[imgPath] = img;
      });
    });
  }

  private createEnemies() {
    return [
      new Enemy(600), new Enemy(900), new Enemy(1200),
      new SmallEnemy(750), new SmallEnemy(1050), new SmallEnemy(1400),
    ];
  }

  private createCoins() {
    return [
      new Coin(400, 200), new Coin(600, 150), new Coin(900, 250),
      new Coin(1100, 180), new Coin(1500, 200),
    ];
  }

  private createBottles() {
    return [
      new Bottle(300, 350), new Bottle(500, 350),
      new Bottle(800, 350), new Bottle(1300, 350),
    ];
  }

  private createBackgroundLayers() {
    return [
      ['assets/img/5_background/layers/air.png'],
      ['assets/img/5_background/layers/3_third_layer/1.png', 'assets/img/5_background/layers/3_third_layer/2.png'],
      ['assets/img/5_background/layers/2_second_layer/1.png', 'assets/img/5_background/layers/2_second_layer/2.png'],
      ['assets/img/5_background/layers/1_first_layer/1.png', 'assets/img/5_background/layers/1_first_layer/2.png'],
    ];
  }

  private initLevel() {
    this.level = new Level(
      this.createEnemies(),
      [new Endboss()],
      this.createCoins(),
      this.createBottles(),
      this.createBackgroundLayers()
    );
  }

  private loadCharacterImages() {
    this.character.loadImages(this.character.images_walking);
    this.character.loadImages(this.character.images_jumping);
    this.character.loadImages(this.character.images_hurt);
    this.character.loadImages(this.character.images_dead);
    this.character.loadImages(this.character.images_idle);
    this.character.loadImages(this.character.images_sleep);
  }

  private loadEnemyImages() {
    this.level.enemies.forEach(e => {
      e.loadImages(e.images_walking);
      e.loadImages(e.images_dead);
    });
  }

  private loadEndbossImages() {
    this.level.endboss.forEach(b => {
      b.loadImages(b.images_walking);
      b.loadImages(b.images_alert);
      b.loadImages(b.images_attack);
      b.loadImages(b.images_hurt);
      b.loadImages(b.images_dead);
    });
  }

  private loadAllImages() {
    this.loadCharacterImages();
    this.loadEnemyImages();
    this.loadEndbossImages();
    this.level.coins.forEach(c => c.loadImages(c.images_coin));
    this.level.bottles.forEach(b => b.loadImages(b.images_ground));
  }

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

  private updateSnoringSound() {
    if (this.character.isSleeping) {
      if (!this.audioService.isPlaying('characterSnoring')) {
        this.audioService.playSound('characterSnoring', true);
      }
    } else {
      this.audioService.stopSound('characterSnoring');
    }
  }

  private startAnimations() {
    this.animationInterval = setInterval(() => {
      this.character.imgIndex++;
      if (!this.character.isGrounded && this.character.jumpAnimIndex < this.character.images_jumping.length - 1) {
        this.character.jumpAnimIndex++;
      }
      this.level.enemies.forEach(e => e.imgIndex++);
      this.level.endboss.forEach(b => b.imgIndex++);
      this.updateSnoringSound();
    }, 100);
  }

  private update() {
    if (this.gameService.gameState() !== 'running') return;
    this.updateCharacter();
    this.updateEnemies();
    this.updateBottles();
    this.checkCollisions();
    this.updateCamera();
  }

  private handleMoveRight() {
    this.character.moveRight();
    this.character.facingLeft = false;
    this.character.updateLastMoveTime();
  }

  private handleMoveLeft() {
    if (this.character.x <= 0) return;
    this.character.moveLeft();
    this.character.facingLeft = true;
    this.character.updateLastMoveTime();
  }

  private handleRunSound() {
    if (this.inputService.moveRight() || this.inputService.moveLeft()) {
      if (!this.audioService.isPlaying('characterRun')) {
        this.audioService.playSound('characterRun', true);
      }
    } else {
      this.audioService.stopSound('characterRun');
    }
  }

  private updateCharacter() {
    if (this.inputService.moveRight()) this.handleMoveRight();
    if (this.inputService.moveLeft()) this.handleMoveLeft();
    this.handleRunSound();
    if (this.inputService.jump() && this.character.isGrounded) {
      this.character.jump();
      this.character.updateLastMoveTime();
      this.audioService.playSound('characterJump');
    }
    if (this.inputService.throwBottle()) {
      this.throwBottle();
      this.inputService.setThrowBottle(false);
    }
    this.character.applyGravity();
    this.character.checkSleep();
  }

  private throwBottle() {
    if (this.gameService.bottles() <= 0) return;
    const bottle = new Bottle(this.character.x + 50, this.character.y + 100);
    bottle.imageCache = this.bottleImageCache;
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
        bottle.speedY += 0.5;
        bottle.y += bottle.speedY;
        bottle.imgIndex = (bottle.imgIndex + 1) % bottle.images_rotation.length;
      }
    });
    this.thrownBottles = this.thrownBottles.filter(b => b.y < 480 && b.x < 3000);
  }

  private checkCollisions() {
    this.checkCharacterEnemyCollisions();
    this.checkCharacterEndbossCollision();
    this.checkCharacterCoinCollisions();
    this.checkCharacterBottleCollisions();
    this.checkBottleEnemyCollisions();
    this.checkEndbossProximity();
  }

  private handleCharacterDeath() {
    this.audioService.stopAllSounds();
    this.audioService.playSound('lose');
    this.gameService.loseGame();
  }

  private handleEnemyCollision(enemy: Enemy | SmallEnemy) {
    if (this.collidingEnemies.has(enemy)) return;
    this.collidingEnemies.add(enemy);
    if (this.character.isAbove(enemy)) {
      enemy.hit(1);
      this.audioService.playSound('chickenDead');
    } else {
      this.character.hit(20);
      this.audioService.playSound('characterDamage');
      this.gameService.characterHealth.set(this.character.energy);
      if (this.character.isDead()) this.handleCharacterDeath();
    }
  }

  private checkCharacterEnemyCollisions() {
    this.level.enemies.forEach(enemy => {
      if (enemy.isDead()) return;
      if (this.character.isColliding(enemy)) {
        this.handleEnemyCollision(enemy);
      } else {
        this.collidingEnemies.delete(enemy);
      }
    });
  }

  private handleEndbossCollision() {
    if (this.collidingBoss) return;
    this.collidingBoss = true;
    this.character.hit(40);
    this.audioService.playSound('characterDamage');
    this.gameService.characterHealth.set(this.character.energy);
    if (this.character.isDead()) this.handleCharacterDeath();
  }

  private checkCharacterEndbossCollision() {
    this.level.endboss.forEach(boss => {
      if (boss.isDead()) return;
      if (this.character.isColliding(boss)) {
        this.handleEndbossCollision();
      } else {
        this.collidingBoss = false;
      }
    });
  }

  private checkCharacterCoinCollisions() {
    this.level.coins = this.level.coins.filter(coin => {
      if (this.character.isColliding(coin)) {
        this.audioService.playSound('coinCollect');
        this.gameService.coins.set(this.gameService.coins() + 1);
        return false;
      }
      return true;
    });
  }

  private checkCharacterBottleCollisions() {
    this.level.bottles = this.level.bottles.filter(bottle => {
      if (this.character.isColliding(bottle)) {
        this.audioService.playSound('bottleCollect');
        this.gameService.bottles.set(this.gameService.bottles() + 1);
        return false;
      }
      return true;
    });
  }

  private checkBottleHitsEnemy(bottle: Bottle) {
    this.level.enemies.forEach(enemy => {
      if (!enemy.isDead() && !this.hitBottles.has(bottle) && bottle.isColliding(enemy)) {
        this.hitBottles.add(bottle);
        enemy.hit(1);
        this.audioService.playSound('bottleBreak');
        this.audioService.playSound('chickenDead');
      }
    });
  }

  private handleEndbossDefeated() {
    this.audioService.stopAllSounds();
    this.audioService.playSound('win');
    this.gameService.winGame();
  }

  private checkBottleHitsBoss(bottle: Bottle) {
    this.level.endboss.forEach(boss => {
      if (!boss.isDead() && !this.hitBottles.has(bottle) && bottle.isColliding(boss)) {
        this.hitBottles.add(bottle);
        boss.hit(40);
        this.audioService.playSound('bottleBreak');
        this.gameService.endbossHealth.set(boss.energy);
        if (boss.isDead()) this.handleEndbossDefeated();
      }
    });
  }

  private checkBottleEnemyCollisions() {
    this.thrownBottles.forEach(bottle => {
      this.checkBottleHitsEnemy(bottle);
      this.checkBottleHitsBoss(bottle);
    });
  }

  private checkEndbossProximity() {
    this.level.endboss.forEach(boss => {
      if (Math.abs(this.character.x - boss.x) < 300 && !boss.isAlerted) {
        boss.alert();
        this.gameService.endbossVisible.set(true);
        this.audioService.playSound('endbossApproach');
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
      const imgPath = bottle.images_rotation[bottle.imgIndex];
      const img = this.bottleImageCache[imgPath];
      if (img) this.ctx.drawImage(img, bottle.x, bottle.y, bottle.width, bottle.height);
    });
  }

  private getCharacterImagePath(): string {
    const char = this.character;
    if (char.isDead()) return char.images_dead[char.imgIndex % char.images_dead.length];
    if (!char.isGrounded) return char.images_jumping[char.jumpAnimIndex];
    if (this.inputService.moveLeft() || this.inputService.moveRight()) {
      return char.images_walking[char.imgIndex % char.images_walking.length];
    }
    if (char.isSleeping) return char.images_sleep[char.imgIndex % char.images_sleep.length];
    return char.images_idle[char.imgIndex % char.images_idle.length];
  }

  private drawFlipped(img: HTMLImageElement, x: number, y: number, w: number, h: number) {
    this.ctx.save();
    this.ctx.translate(x + w, y);
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(img, 0, 0, w, h);
    this.ctx.restore();
  }

  private drawCharacter() {
    const char = this.character;
    const img = char.imageCache[this.getCharacterImagePath()];
    if (!img) return;
    if (char.facingLeft) {
      this.drawFlipped(img, char.x, char.y, char.width, char.height);
    } else {
      this.ctx.drawImage(img, char.x, char.y, char.width, char.height);
    }
  }

  restartGame() {
    this.audioService.stopAllSounds();
    this.character = new Character();
    this.thrownBottles = [];
    this.collidingEnemies = new Set();
    this.collidingBoss = false;
    this.cameraX = 0;
    this.initLevel();
    this.loadAllImages();
    this.loadAllSounds();
    this.audioService.playSound('music', true);
    this.hitBottles = new Set();
    this.gameService.restartGame();
  }

  goHome() {
    this.audioService.stopAllSounds();
    this.gameService.gameState.set('menu');
    this.router.navigate(['/']);
  }
}
