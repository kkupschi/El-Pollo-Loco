import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {

  isMuted = signal(false);

  private sounds: { [key: string]: HTMLAudioElement } = {};

  constructor() {
    const savedMute = localStorage.getItem('muted');
    if (savedMute === 'true') {
      this.isMuted.set(true);
    }
  }

  loadSound(key: string, path: string, volume = 1) {
    const audio = new Audio(path);
    audio.volume = volume;
    this.sounds[key] = audio;
  }

  playSound(key: string, loop = false) {
    const audio = this.sounds[key];
    if (!audio || this.isMuted()) return;
    audio.loop = loop;
    audio.play();
  }

  stopSound(key: string) {
    const audio = this.sounds[key];
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  toggleMute() {
    this.isMuted.set(!this.isMuted());
    localStorage.setItem('muted', String(this.isMuted()));

    Object.values(this.sounds).forEach(audio => {
      audio.muted = this.isMuted();
    });
  }

  isPlaying(key: string): boolean {
    const audio = this.sounds[key];
    if (!audio) return false;
    return !audio.paused;
  }

  stopAllSounds() {
    Object.values(this.sounds).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}