/**
 * CHHATH PUJA - INTERACTIVE DIGITAL DEVOTIONAL EXPERIENCE
 * Features:
 *  - Dynamic Motion-Triggered Audio: Music plays ONLY when moving the thali!
 *  - Devotional Song Selector: Choose between iconic Chhath geets or upload custom MP3
 *  - Unified Pointer Spring Physics Engine (Mouse & Touch)
 *  - Procedural Web Audio API Drone & Temple Bell Chimes
 *  - Canvas Particle & River Floating Diya Engine
 *  - Interactive River Stream Diya Launcher
 *  - Ritual Action Controls & Haptic/Visual Feedback
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. DEVOTIONAL AUDIO MANAGER (MOTION-TRIGGERED & MULTI-TRACK)
  // ==========================================================================
  class DevotionalAudioManager {
    constructor() {
      this.audioElement = document.getElementById('chhath-audio');
      this.musicToggleBtn = document.getElementById('music-toggle-btn');
      this.musicBtnText = document.getElementById('music-btn-text');
      this.mobileMusicToggle = document.getElementById('mobile-music-toggle');
      this.mobileMusicBtnText = document.getElementById('mobile-music-btn-text');
      this.headerSongName = document.getElementById('header-song-name');
      this.motionSoundPill = document.getElementById('motion-sound-pill');
      this.motionSoundText = document.getElementById('motion-sound-text');

      // Modal elements
      this.modal = document.getElementById('song-selector-modal');
      this.openModalBtn = document.getElementById('open-song-modal-btn');
      this.mobileSongBtn = document.getElementById('mobile-song-btn');
      this.actionChangeSongBtn = document.getElementById('action-change-song');
      this.closeModalBtn = document.getElementById('close-song-modal-btn');
      this.confirmModalBtn = document.getElementById('confirm-song-modal-btn');
      this.customAudioInput = document.getElementById('custom-audio-input');
      this.customFileNameLabel = document.getElementById('custom-file-name');

      // Built-in Traditional Chhath Tracks
      this.tracks = [
        {
          id: 'track-0',
          title: 'छठी मैया बुलाये (Chhathi Maiya Bulaye)',
          artist: 'विशाल मिश्रा • कौशल किशोर • देश अनप्लग्ड',
          src: 'audio/chhath-puja.mp3',
          badge: 'भक्ति गीत'
        },
        {
          id: 'track-1',
          title: 'जोड़े जोड़े फलवा (Jode Jode Falwa)',
          artist: 'पवन सिंह • टी-सीरीज़ छठ महापर्व गीत',
          src: 'audio/jode-jode-falwa.mp3',
          badge: 'महाप्रसाद धुन'
        },
        {
          id: 'track-2',
          title: 'कांच ही बांस के बहंगिया, बहंगी लचकत जाए',
          artist: 'लोक-आस्था का अमर गीत • पारंपरिक बांसुरी',
          src: 'audio/chhath-geet-2.mp3',
          badge: 'बांसुरी व लोकधुन'
        },
        {
          id: 'track-3',
          title: 'उग हे सुरुज देव, भेल अरघ के बेर',
          artist: 'पारंपरिक सूर्य वंदना • प्रातःकालीन अर्घ्य',
          src: 'audio/chhath-geet-3.mp3',
          badge: 'शंख व घंटानाद'
        },
        {
          id: 'track-4',
          title: 'वैदिक नाद • शुद्ध तानपुरा व मंदिर घंटियाँ',
          artist: 'शांत ध्यानमयी धुन • गंगाजल तरंग',
          src: 'audio/chhath-vedic-drone.mp3',
          badge: 'वैदिक नाद'
        }
      ];

      this.currentTrackIndex = 0;
      // 'move_only' (Default requested by user) or 'continuous'
      this.playMode = 'move_only';
      this.isPlaying = false;
      this.isMotionActive = false;
      this.idleMotionTimer = null;
      this.fadeInterval = null;

      this.webAudioCtx = null;
      this.tanpuraNodes = null;
      this.isUsingWebAudioFallback = false;

      this.initEvents();
      this.updateTrackUI();
    }

    initEvents() {
      // Toggle button in header
      if (this.musicToggleBtn) {
        this.musicToggleBtn.addEventListener('click', () => this.toggleMusic());
      }
      if (this.mobileMusicToggle) {
        this.mobileMusicToggle.addEventListener('click', () => this.toggleMusic());
      }

      // Modal open triggers
      if (this.openModalBtn) {
        this.openModalBtn.addEventListener('click', () => this.openModal());
      }
      if (this.mobileSongBtn) {
        this.mobileSongBtn.addEventListener('click', () => this.openModal());
      }
      if (this.actionChangeSongBtn) {
        this.actionChangeSongBtn.addEventListener('click', () => this.openModal());
      }

      // Modal close triggers
      if (this.closeModalBtn) {
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
      }
      if (this.confirmModalBtn) {
        this.confirmModalBtn.addEventListener('click', () => this.closeModal());
      }
      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) this.closeModal();
        });
      }

      // Track selection in modal
      document.querySelectorAll('.song-card').forEach((card) => {
        card.addEventListener('click', () => {
          const idx = parseInt(card.getAttribute('data-track-index'), 10);
          this.selectTrack(idx);
        });
      });

      // Playback mode options in modal
      const modeMove = document.getElementById('mode-opt-move');
      const modeCont = document.getElementById('mode-opt-continuous');
      if (modeMove && modeCont) {
        modeMove.addEventListener('click', () => this.setPlayMode('move_only'));
        modeCont.addEventListener('click', () => this.setPlayMode('continuous'));
      }

      // Custom file upload
      if (this.customAudioInput) {
        this.customAudioInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) this.handleCustomAudio(file);
        });
      }

      // Fallback on audio error
      if (this.audioElement) {
        this.audioElement.addEventListener('error', () => {
          console.warn('Audio source fallback: using Web Audio procedural synthesizer.');
          this.isUsingWebAudioFallback = true;
          if (this.isPlaying) {
            this.startProceduralDrone();
          }
        });
      }
    }

    ensureAudioContext() {
      if (!this.webAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.webAudioCtx = new AudioCtx();
        }
      }
      if (this.webAudioCtx && this.webAudioCtx.state === 'suspended') {
        this.webAudioCtx.resume();
      }
    }

    // ==========================================================================
    // DYNAMIC MOTION-TRIGGERED PLAYBACK (ONLY WHEN MOVING THALI)
    // ==========================================================================
    onThaliMove() {
      this.ensureAudioContext();

      if (this.playMode === 'move_only') {
        this.isMotionActive = true;

        // Visual feedback on motion status
        if (this.motionSoundPill) {
          this.motionSoundPill.classList.add('playing-active');
        }
        if (this.motionSoundText) {
          const titleShort = this.tracks[this.currentTrackIndex].title.slice(0, 16);
          this.motionSoundText.textContent = `🎶 ${titleShort}... बज रहा है`;
        }

        // If not currently playing, start immediately with smooth rapid fade-in
        if (!this.isPlaying) {
          this.startAudioPlayback(200);
        }

        // Reset idle motion timer
        // If user stops moving thali (holds still for > 950ms), fade audio out!
        if (this.idleMotionTimer) {
          clearTimeout(this.idleMotionTimer);
        }
        this.idleMotionTimer = setTimeout(() => {
          this.onThaliStopMotion();
        }, 950);
      }
    }

    onThaliStopMotion() {
      if (this.playMode === 'move_only' && this.isPlaying) {
        this.isMotionActive = false;
        if (this.motionSoundPill) {
          this.motionSoundPill.classList.remove('playing-active');
        }
        if (this.motionSoundText) {
          this.motionSoundText.textContent = 'थाली घुमाते ही भजन गूँजेगा';
        }
        this.pauseAudioPlayback(450);
      }
    }

    onThaliRelease() {
      if (this.idleMotionTimer) {
        clearTimeout(this.idleMotionTimer);
        this.idleMotionTimer = null;
      }

      if (this.playMode === 'move_only' && this.isPlaying) {
        this.isMotionActive = false;
        if (this.motionSoundPill) {
          this.motionSoundPill.classList.remove('playing-active');
        }
        if (this.motionSoundText) {
          this.motionSoundText.textContent = 'थाली घुमाते ही भजन गूँजेगा';
        }
        this.pauseAudioPlayback(400);
      }
    }

    // ==========================================================================
    // PLAYBACK CONTROLS & FADING
    // ==========================================================================
    startAudioPlayback(fadeDuration = 300) {
      if (this.isPlaying) return;
      this.isPlaying = true;
      this.ensureAudioContext();

      if (this.audioElement && !this.isUsingWebAudioFallback) {
        this.audioElement.volume = 0;
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.fadeAudio(this.audioElement, 0, 0.8, fadeDuration);
            })
            .catch((err) => {
              console.warn('Playback blocked, starting Web Audio fallback:', err);
              this.isUsingWebAudioFallback = true;
              this.startProceduralDrone();
            });
        }
      } else {
        this.startProceduralDrone();
      }

      this.updateHeaderUI(true);
    }

    pauseAudioPlayback(fadeDuration = 400) {
      if (!this.isPlaying) return;
      this.isPlaying = false;

      if (this.audioElement && !this.isUsingWebAudioFallback) {
        this.fadeAudio(this.audioElement, this.audioElement.volume, 0, fadeDuration, () => {
          this.audioElement.pause();
        });
      }

      if (this.tanpuraNodes) {
        this.stopProceduralDrone();
      }

      this.updateHeaderUI(false);
    }

    toggleMusic() {
      this.ensureAudioContext();

      if (this.isPlaying) {
        this.pauseAudioPlayback(500);
        showToast('🔇 संगीत रोक दिया गया');
      } else {
        // If user manually toggles on, start playing
        this.startAudioPlayback(400);
        showToast('🔊 संगीत चालू: थाली घुमाकर भी आनंद ले सकते हैं');
      }
    }

    fadeAudio(audio, startVol, targetVol, duration, callback) {
      if (this.fadeInterval) clearInterval(this.fadeInterval);
      const startTime = performance.now();
      audio.volume = Math.max(0, Math.min(1, startVol));

      this.fadeInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        audio.volume = Math.max(0, Math.min(1, startVol + (targetVol - startVol) * progress));

        if (progress >= 1) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
          if (callback) callback();
        }
      }, 25);
    }

    // ==========================================================================
    // TRACK SELECTION & CUSTOM AUDIO HANDLING
    // ==========================================================================
    selectTrack(index) {
      if (index < 0 || index >= this.tracks.length) return;
      this.currentTrackIndex = index;
      const track = this.tracks[index];

      const wasPlaying = this.isPlaying;
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.src = track.src;
        this.audioElement.load();
      }

      this.isUsingWebAudioFallback = false;
      this.updateTrackUI();

      if (wasPlaying) {
        this.startAudioPlayback(200);
      }

      showToast(`🎵 भजन चुना गया: ${track.title}`);
    }

    handleCustomAudio(file) {
      if (!file) return;
      const objectUrl = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');

      const customTrack = {
        id: `custom-${Date.now()}`,
        title: cleanName,
        artist: 'आपकी चुनी हुई ऑडियो फ़ाइल (कस्टम)',
        src: objectUrl,
        badge: 'कस्टम गीत'
      };

      this.tracks.push(customTrack);
      this.selectTrack(this.tracks.length - 1);

      if (this.customFileNameLabel) {
        this.customFileNameLabel.style.display = 'inline-block';
        this.customFileNameLabel.textContent = `✓ चुना गया: ${cleanName}`;
      }
    }

    setPlayMode(mode) {
      this.playMode = mode;
      const modeMove = document.getElementById('mode-opt-move');
      const modeCont = document.getElementById('mode-opt-continuous');

      if (modeMove && modeCont) {
        modeMove.classList.toggle('active', mode === 'move_only');
        modeCont.classList.toggle('active', mode === 'continuous');
        const rMove = modeMove.querySelector('input');
        const rCont = modeCont.querySelector('input');
        if (rMove) rMove.checked = mode === 'move_only';
        if (rCont) rCont.checked = mode === 'continuous';
      }

      if (mode === 'continuous' && !this.isPlaying) {
        this.startAudioPlayback(400);
        showToast('🔁 निरंतर पृष्ठभूमि संगीत सक्रिय!');
      } else if (mode === 'move_only' && this.isPlaying && !this.isMotionActive) {
        this.pauseAudioPlayback(400);
        showToast('✨ थाली घुमाने पर संगीत मोड सक्रिय!');
      }
    }

    updateTrackUI() {
      const track = this.tracks[this.currentTrackIndex];

      // Update header badge
      if (this.headerSongName) {
        const shortName = track.title.length > 16 ? track.title.slice(0, 16) + '...' : track.title;
        this.headerSongName.textContent = shortName;
        this.headerSongName.setAttribute('title', track.title);
      }

      // Update active card styling in modal
      document.querySelectorAll('.song-card').forEach((card) => {
        const idx = parseInt(card.getAttribute('data-track-index'), 10);
        card.classList.toggle('active', idx === this.currentTrackIndex);
      });
    }

    updateHeaderUI(playing) {
      const text = playing ? '🔊 संगीत चालू' : '🔇 संगीत बंद';
      if (this.musicBtnText) this.musicBtnText.textContent = text;
      if (this.mobileMusicBtnText) this.mobileMusicBtnText.textContent = text;

      if (this.musicToggleBtn) {
        this.musicToggleBtn.classList.toggle('playing', playing);
        this.musicToggleBtn.setAttribute('aria-pressed', playing);
      }
      if (this.mobileMusicToggle) {
        this.mobileMusicToggle.classList.toggle('playing', playing);
      }
    }

    openModal() {
      if (this.modal) {
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
      }
    }

    closeModal() {
      if (this.modal) {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
      }
    }

    // ==========================================================================
    // PROCEDURAL WEB AUDIO SYNTHESIZER (FALLBACK & TEMPLE BELLS)
    // ==========================================================================
    startProceduralDrone() {
      this.ensureAudioContext();
      if (!this.webAudioCtx || this.tanpuraNodes) return;

      try {
        const ctx = this.webAudioCtx;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 1.2);
        masterGain.connect(ctx.destination);

        const freqs = [146.83, 220.0, 293.66, 73.41];
        const oscs = [];

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450 + idx * 100, ctx.currentTime);

          gain.gain.setValueAtTime(0.18 / (idx + 1), ctx.currentTime);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start();
          oscs.push(osc);
        });

        this.tanpuraNodes = { masterGain, oscs };
      } catch (e) {
        console.warn('Procedural synthesis failed:', e);
      }
    }

    stopProceduralDrone() {
      if (!this.tanpuraNodes || !this.webAudioCtx) return;
      try {
        const { masterGain, oscs } = this.tanpuraNodes;
        masterGain.gain.exponentialRampToValueAtTime(0.0001, this.webAudioCtx.currentTime + 0.6);
        setTimeout(() => {
          oscs.forEach((osc) => osc.stop());
          this.tanpuraNodes = null;
        }, 700);
      } catch (e) {
        this.tanpuraNodes = null;
      }
    }

    playTempleBell(intensity = 1.0) {
      this.ensureAudioContext();
      if (!this.webAudioCtx) return;

      try {
        const ctx = this.webAudioCtx;
        const now = ctx.currentTime;
        const bellGain = ctx.createGain();
        bellGain.gain.setValueAtTime(0.24 * intensity, now);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
        bellGain.connect(ctx.destination);

        const partials = [
          { f: 1174.66, g: 0.6 },
          { f: 2349.32, g: 0.35 },
          { f: 3520.0, g: 0.2 },
          { f: 780.0, g: 0.4 }
        ];

        partials.forEach((p) => {
          const osc = ctx.createOscillator();
          const pGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(p.f, now);
          pGain.gain.setValueAtTime(p.g, now);
          pGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
          osc.connect(pGain);
          pGain.connect(bellGain);
          osc.start(now);
          osc.stop(now + 2.6);
        });
      } catch (e) {
        // Silent catch
      }
    }
  }

  // ==========================================================================
  // 2. INTERACTIVE CHHATH PUJA THALI SPRING PHYSICS ENGINE
  // ==========================================================================
  class InteractiveThaliEngine {
    constructor(audioManager, particleEngine) {
      this.audioManager = audioManager;
      this.particleEngine = particleEngine;

      this.thali = document.getElementById('interactive-thali');
      this.stage = document.getElementById('thali-stage');
      this.mandalaAura = document.getElementById('sun-mandala-aura');
      this.waterReflection = document.getElementById('thali-water-reflection');
      this.dropShadow = document.getElementById('thali-drop-shadow');
      this.instructionBadge = document.getElementById('drag-instruction-badge');

      if (!this.thali) return;

      // Physics State
      this.isDragging = false;
      this.currentX = 0;
      this.currentY = 0;
      this.targetX = 0;
      this.targetY = 0;
      this.velX = 0;
      this.velY = 0;

      this.currentRotation = 0;
      this.targetRotation = 0;
      this.currentTiltX = 0;
      this.targetTiltX = 0;
      this.currentTiltY = 0;
      this.targetTiltY = 0;
      this.currentScale = 1.0;
      this.targetScale = 1.0;

      // Pointer tracking
      this.startPointerX = 0;
      this.startPointerY = 0;
      this.lastPointerX = 0;
      this.lastPointerY = 0;
      this.pointerVelocity = 0;

      this.lastBellTime = 0;
      this.hasInteracted = false;

      this.initEvents();
      this.startPhysicsLoop();
    }

    initEvents() {
      // Unified Pointer Events for Mouse, Touch and Stylus
      this.thali.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      window.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: false });
      window.addEventListener('pointerup', (e) => this.onPointerUp(e));
      window.addEventListener('pointercancel', (e) => this.onPointerUp(e));

      // Accessibility Keyboard Interaction
      this.thali.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    onPointerDown(e) {
      e.preventDefault();
      this.isDragging = true;
      this.thali.setPointerCapture(e.pointerId);
      this.thali.classList.add('dragging');

      this.startPointerX = e.clientX;
      this.startPointerY = e.clientY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      this.targetScale = 1.08;

      if (!this.hasInteracted) {
        this.hasInteracted = true;
        if (this.instructionBadge) {
          this.instructionBadge.classList.add('hidden-guide');
        }
      }

      // Ensure audio context is primed on first touch
      this.audioManager.ensureAudioContext();
      this.audioManager.playTempleBell(0.65);

      // Emit touch blessing particles
      const rect = this.thali.getBoundingClientRect();
      this.particleEngine.emitBlessingBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);
    }

    onPointerMove(e) {
      if (!this.isDragging) return;
      e.preventDefault();

      const deltaX = e.clientX - this.startPointerX;
      const deltaY = e.clientY - this.startPointerY;

      const damp = 0.88;
      this.targetX = deltaX * damp;
      this.targetY = deltaY * damp;

      // Velocity calculation
      const vx = e.clientX - this.lastPointerX;
      const vy = e.clientY - this.lastPointerY;
      this.pointerVelocity = Math.sqrt(vx * vx + vy * vy);

      // CRITICAL: DYNAMIC SONG TRIGGER WHILE MOVING THALI
      if (this.pointerVelocity > 0.8) {
        this.audioManager.onThaliMove();
      }

      // Rotation based on horizontal velocity (tilt with movement)
      this.targetRotation = Math.max(-14, Math.min(14, vx * 0.45));

      // 3D Tilt perspective
      this.targetTiltX = Math.max(-10, Math.min(10, -vy * 0.3));
      this.targetTiltY = Math.max(-12, Math.min(12, vx * 0.3));

      // Emit golden stardust and marigold petals while moving
      if (this.pointerVelocity > 2.5) {
        const rect = this.thali.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        this.particleEngine.emitThaliDrift(centerX, centerY, vx, vy);

        const now = performance.now();
        if (this.pointerVelocity > 15 && now - this.lastBellTime > 950) {
          this.audioManager.playTempleBell(0.5);
          this.lastBellTime = now;
        }
      }

      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    }

    onPointerUp(e) {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.thali.classList.remove('dragging');

      // CRITICAL: FADE MUSIC OUT UPON RELEASING THALI
      this.audioManager.onThaliRelease();

      // Spring settles back to center
      this.targetX = 0;
      this.targetY = 0;
      this.targetRotation = 0;
      this.targetTiltX = 0;
      this.targetTiltY = 0;
      this.targetScale = 1.0;

      const rect = this.thali.getBoundingClientRect();
      this.particleEngine.emitRippleRing(rect.left + rect.width / 2, rect.top + rect.height * 0.85);
    }

    onKeyDown(e) {
      const step = 25;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        this.audioManager.onThaliMove();

        if (e.key === 'ArrowLeft') this.targetX -= step;
        if (e.key === 'ArrowRight') this.targetX += step;
        if (e.key === 'ArrowUp') this.targetY -= step;
        if (e.key === 'ArrowDown') this.targetY += step;

        this.targetScale = 1.04;
        setTimeout(() => {
          this.targetX = 0;
          this.targetY = 0;
          this.targetScale = 1.0;
          this.audioManager.onThaliRelease();
        }, 500);
      }
    }

    startPhysicsLoop() {
      const loop = () => {
        const stiffness = this.isDragging ? 0.16 : 0.085;
        const damping = this.isDragging ? 0.76 : 0.82;

        const ax = (this.targetX - this.currentX) * stiffness;
        const ay = (this.targetY - this.currentY) * stiffness;

        this.velX = (this.velX + ax) * damping;
        this.velY = (this.velY + ay) * damping;

        this.currentX += this.velX;
        this.currentY += this.velY;

        this.currentRotation += (this.targetRotation - this.currentRotation) * 0.12;
        this.currentTiltX += (this.targetTiltX - this.currentTiltX) * 0.12;
        this.currentTiltY += (this.targetTiltY - this.currentTiltY) * 0.12;
        this.currentScale += (this.targetScale - this.currentScale) * 0.14;

        // Apply 3D hardware-accelerated transform
        this.thali.style.transform = `translate3d(${this.currentX.toFixed(2)}px, ${this.currentY.toFixed(2)}px, 0) scale(${this.currentScale.toFixed(3)}) rotate(${this.currentRotation.toFixed(2)}deg) rotateX(${this.currentTiltX.toFixed(2)}deg) rotateY(${this.currentTiltY.toFixed(2)}deg)`;

        // React water reflection & shadow
        if (this.waterReflection && this.dropShadow) {
          const reflX = this.currentX * 0.75;
          const reflScale = 1 + Math.abs(this.currentY) * 0.001;
          this.waterReflection.style.transform = `translate3d(${reflX.toFixed(2)}px, ${(this.currentY * 0.3).toFixed(2)}px, 0) scale(${reflScale.toFixed(2)})`;
          this.dropShadow.style.transform = `translate3d(${(reflX * 0.8).toFixed(2)}px, ${(this.currentY * 0.2).toFixed(2)}px, 0)`;
        }

        // React background sun mandala aura
        if (this.mandalaAura) {
          const auraX = this.currentX * 0.25;
          const auraY = this.currentY * 0.25;
          this.mandalaAura.style.transform = `translate3d(${auraX.toFixed(2)}px, ${auraY.toFixed(2)}px, 0) scale(${this.isDragging ? 1.08 : 1})`;
        }

        requestAnimationFrame(loop);
      };

      requestAnimationFrame(loop);
    }
  }

  // ==========================================================================
  // 3. AMBIENT CANVAS ENGINE (MIST, PARTICLES, FLOATING DIYAS, RIPPLES)
  // ==========================================================================
  class AmbientCanvasEngine {
    constructor() {
      this.canvas = document.getElementById('ambient-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      this.particles = [];
      this.floatingDiyas = [];
      this.waterRipples = [];

      this.width = (this.canvas.width = window.innerWidth);
      this.height = (this.canvas.height = window.innerHeight);

      this.initDiyas();
      this.initEvents();
      this.animate();
    }

    initEvents() {
      window.addEventListener('resize', () => {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
      });
    }

    initDiyas() {
      const diyaCount = window.innerWidth < 768 ? 5 : 9;
      for (let i = 0; i < diyaCount; i++) {
        this.floatingDiyas.push({
          x: Math.random() * this.width,
          y: this.height * 0.72 + Math.random() * (this.height * 0.25),
          baseY: this.height * 0.72 + Math.random() * (this.height * 0.25),
          speed: 0.15 + Math.random() * 0.25,
          bobPhase: Math.random() * Math.PI * 2,
          scale: 0.65 + Math.random() * 0.5,
          flamePhase: Math.random() * Math.PI * 2
        });
      }
    }

    emitThaliDrift(x, y, vx, vy) {
      const count = Math.min(6, Math.floor(Math.sqrt(vx * vx + vy * vy) * 0.5));
      for (let i = 0; i < count; i++) {
        const isPetal = Math.random() > 0.6;
        this.particles.push({
          x: x + (Math.random() - 0.5) * 140,
          y: y + (Math.random() - 0.5) * 140,
          vx: -vx * 0.15 + (Math.random() - 0.5) * 1.5,
          vy: -vy * 0.15 + (Math.random() - 0.5) * 1.5 - 0.5,
          size: isPetal ? 4 + Math.random() * 5 : 2 + Math.random() * 3,
          color: isPetal ? (Math.random() > 0.5 ? '#EA580C' : '#D97706') : '#FFD54F',
          alpha: 1.0,
          decay: 0.015 + Math.random() * 0.02,
          isPetal: isPetal,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.08
        });
      }
    }

    emitBlessingBurst(x, y, total = 30) {
      for (let i = 0; i < total; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        const isPetal = Math.random() > 0.45;

        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          size: isPetal ? 5 + Math.random() * 6 : 2 + Math.random() * 4,
          color: isPetal ? (Math.random() > 0.5 ? '#F59E0B' : '#E11D48') : '#FFF9C4',
          alpha: 1.0,
          decay: 0.012 + Math.random() * 0.015,
          isPetal: isPetal,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.1
        });
      }
    }

    emitRippleRing(x, y) {
      this.waterRipples.push({
        x: x,
        y: y,
        radius: 8,
        maxRadius: 70,
        alpha: 0.6,
        growth: 1.2
      });
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      const time = performance.now() * 0.001;

      // 1. Ambient Floating Diyas
      this.ctx.save();
      this.floatingDiyas.forEach((diya) => {
        diya.x -= diya.speed;
        if (diya.x < -60) diya.x = this.width + 60;
        diya.y = diya.baseY + Math.sin(time * 1.5 + diya.bobPhase) * 6;

        const s = diya.scale;

        const glowGrad = this.ctx.createRadialGradient(diya.x, diya.y + 6 * s, 2, diya.x, diya.y + 6 * s, 28 * s);
        glowGrad.addColorStop(0, 'rgba(255, 167, 38, 0.4)');
        glowGrad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = glowGrad;
        this.ctx.beginPath();
        this.ctx.arc(diya.x, diya.y + 6 * s, 28 * s, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#6D381E';
        this.ctx.beginPath();
        this.ctx.ellipse(diya.x, diya.y + 3 * s, 16 * s, 7 * s, 0, 0, Math.PI);
        this.ctx.fill();

        this.ctx.strokeStyle = '#B45309';
        this.ctx.lineWidth = 1.5 * s;
        this.ctx.stroke();

        const flameH = 12 * s + Math.sin(time * 6 + diya.flamePhase) * 3;
        this.ctx.fillStyle = '#FFF8E1';
        this.ctx.beginPath();
        this.ctx.ellipse(diya.x, diya.y - flameH * 0.4, 4 * s, flameH * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();

        const outerFlame = this.ctx.createRadialGradient(diya.x, diya.y - flameH * 0.4, 1, diya.x, diya.y - flameH * 0.4, 10 * s);
        outerFlame.addColorStop(0, 'rgba(255, 213, 79, 0.9)');
        outerFlame.addColorStop(0.6, 'rgba(234, 88, 12, 0.5)');
        outerFlame.addColorStop(1, 'transparent');
        this.ctx.fillStyle = outerFlame;
        this.ctx.beginPath();
        this.ctx.arc(diya.x, diya.y - flameH * 0.4, 10 * s, 0, Math.PI * 2);
        this.ctx.fill();
      });
      this.ctx.restore();

      // 2. Water Ripples
      for (let i = this.waterRipples.length - 1; i >= 0; i--) {
        const rip = this.waterRipples[i];
        rip.radius += rip.growth;
        rip.alpha -= 0.012;

        if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
          this.waterRipples.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.strokeStyle = `rgba(245, 205, 121, ${rip.alpha * 0.5})`;
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.ellipse(rip.x, rip.y, rip.radius, rip.radius * 0.35, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      }

      // 3. Particles & Petals
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);

        if (p.isPetal) {
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  // ==========================================================================
  // 4. INTERACTIVE RIVER STREAM DIYA LAUNCHER
  // ==========================================================================
  class RiverStreamLauncher {
    constructor(audioManager, particleEngine) {
      this.audioManager = audioManager;
      this.particleEngine = particleEngine;

      this.canvas = document.getElementById('river-stream-canvas');
      this.btn = document.getElementById('launch-diya-btn');
      this.prayerSelect = document.getElementById('prayer-preset');
      this.devoteeInput = document.getElementById('devotee-name');
      this.countDisplay = document.getElementById('total-diyas-count');

      if (!this.canvas || !this.btn) return;
      this.ctx = this.canvas.getContext('2d');

      this.diyas = [];
      this.totalLaunched = 108;

      this.initCanvasSize();
      this.initEvents();
      this.initPreloadDiyas();
      this.animate();
    }

    initCanvasSize() {
      const container = this.canvas.parentElement;
      this.width = this.canvas.width = container.clientWidth;
      this.height = this.canvas.height = container.clientHeight || 280;

      window.addEventListener('resize', () => {
        this.width = this.canvas.width = container.clientWidth;
        this.height = this.canvas.height = container.clientHeight || 280;
      });
    }

    initPreloadDiyas() {
      for (let i = 0; i < 4; i++) {
        this.diyas.push({
          x: this.width * (0.2 + i * 0.22),
          y: this.height * (0.35 + i * 0.14),
          vx: -0.4 - Math.random() * 0.3,
          name: 'भक्त',
          prayer: 'सुख-शांति व आरोग्य',
          scale: 0.8 + Math.random() * 0.3,
          bobPhase: Math.random() * Math.PI * 2
        });
      }
    }

    initEvents() {
      this.btn.addEventListener('click', () => this.launchNewDiya());
    }

    launchNewDiya() {
      const name = this.devoteeInput.value.trim() || 'सपरिवार';
      const prayer = this.prayerSelect.value;

      this.diyas.push({
        x: this.width + 40,
        y: this.height * 0.45 + (Math.random() - 0.5) * (this.height * 0.4),
        vx: -0.85 - Math.random() * 0.4,
        name: name,
        prayer: prayer,
        scale: 1.15,
        bobPhase: Math.random() * Math.PI * 2
      });

      this.totalLaunched++;
      if (this.countDisplay) {
        this.countDisplay.textContent = `${this.totalLaunched}+`;
      }

      this.audioManager.playTempleBell(1.0);
      const rect = this.btn.getBoundingClientRect();
      this.particleEngine.emitBlessingBurst(rect.left + rect.width / 2, rect.top, 25);

      showToast(`जय छठी मैया! ${name} का दीप पवित्र गंगा में अर्पित हुआ।`);
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      const time = performance.now() * 0.001;

      // River wave lines
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(212, 163, 71, 0.08)';
      this.ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const y = this.height * (0.2 + i * 0.14);
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        for (let x = 0; x < this.width; x += 30) {
          this.ctx.lineTo(x, y + Math.sin(x * 0.015 - time * 1.5 + i) * 5);
        }
        this.ctx.stroke();
      }
      this.ctx.restore();

      // Diyas
      for (let i = this.diyas.length - 1; i >= 0; i--) {
        const d = this.diyas[i];
        d.x += d.vx;
        const currentY = d.y + Math.sin(time * 2 + d.bobPhase) * 4;

        if (d.x < -160) {
          this.diyas.splice(i, 1);
          continue;
        }

        const s = d.scale;

        const waterGlow = this.ctx.createRadialGradient(d.x, currentY + 8 * s, 1, d.x, currentY + 8 * s, 26 * s);
        waterGlow.addColorStop(0, 'rgba(255, 183, 77, 0.45)');
        waterGlow.addColorStop(1, 'transparent');
        this.ctx.fillStyle = waterGlow;
        this.ctx.beginPath();
        this.ctx.arc(d.x, currentY + 8 * s, 26 * s, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#5A2A14';
        this.ctx.beginPath();
        this.ctx.ellipse(d.x, currentY + 3 * s, 18 * s, 8 * s, 0, 0, Math.PI);
        this.ctx.fill();
        this.ctx.strokeStyle = '#D97706';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        const flameH = 14 * s + Math.sin(time * 8 + d.bobPhase) * 3;
        this.ctx.fillStyle = '#FFFDE7';
        this.ctx.beginPath();
        this.ctx.ellipse(d.x, currentY - flameH * 0.4, 5 * s, flameH * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();

        const flameGlow = this.ctx.createRadialGradient(d.x, currentY - flameH * 0.4, 1, d.x, currentY - flameH * 0.4, 12 * s);
        flameGlow.addColorStop(0, 'rgba(255, 193, 7, 0.9)');
        flameGlow.addColorStop(0.7, 'rgba(234, 88, 12, 0.4)');
        flameGlow.addColorStop(1, 'transparent');
        this.ctx.fillStyle = flameGlow;
        this.ctx.beginPath();
        this.ctx.arc(d.x, currentY - flameH * 0.4, 12 * s, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.font = '11px "Noto Serif Devanagari", serif';
        this.ctx.fillStyle = 'rgba(245, 235, 208, 0.85)';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${d.name} • 🪔`, d.x, currentY - flameH - 6);
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  // ==========================================================================
  // 5. TOAST NOTIFICATION HELPER
  // ==========================================================================
  function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const msgEl = document.getElementById('toast-message');
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.classList.add('active');

    if (window.toastTimer) clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 3800);
  }

  // ==========================================================================
  // 6. INITIALIZATION & UI BINDINGS
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Core Systems
    const audioManager = new DevotionalAudioManager();
    const particleEngine = new AmbientCanvasEngine();
    const thaliEngine = new InteractiveThaliEngine(audioManager, particleEngine);
    const riverLauncher = new RiverStreamLauncher(audioManager, particleEngine);

    // 2. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('active');
        mobileToggle.setAttribute('aria-expanded', isOpen);
      });

      document.querySelectorAll('.mobile-nav-link').forEach((link) => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // 3. Navbar scroll blur transition
    const mainHeader = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        mainHeader.classList.add('scrolled');
      } else {
        mainHeader.classList.remove('scrolled');
      }
    });

    // 4. Ritual Action Pills
    const actionBell = document.getElementById('action-bell');
    const actionFlowers = document.getElementById('action-flowers');
    const actionArghya = document.getElementById('action-arghya');
    const actionDiya = document.getElementById('action-diya');

    if (actionBell) {
      actionBell.addEventListener('click', () => {
        audioManager.playTempleBell(1.2);
        const rect = actionBell.getBoundingClientRect();
        particleEngine.emitBlessingBurst(rect.left + rect.width / 2, rect.top, 15);
        showToast('🔔 पावन मंदिर की घंटी की मंगल ध्वनि!');
      });
    }

    if (actionFlowers) {
      actionFlowers.addEventListener('click', () => {
        audioManager.playTempleBell(0.7);
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight * 0.45;
        particleEngine.emitBlessingBurst(centerX, centerY, 45);
        showToast('🌸 गेंदे व गुलाब की पवित्र पुष्प वर्षा!');
      });
    }

    if (actionArghya) {
      actionArghya.addEventListener('click', () => {
        audioManager.playTempleBell(1.0);
        const centerX = window.innerWidth / 2;
        particleEngine.emitBlessingBurst(centerX, window.innerHeight * 0.4, 35);
        showToast('☀️ ॐ सूर्याय नमः! भगवान भास्कर को पावन अर्घ्य समर्पित।');
      });
    }

    if (actionDiya) {
      actionDiya.addEventListener('click', () => {
        audioManager.playTempleBell(0.8);
        const centerX = window.innerWidth / 2;
        particleEngine.emitBlessingBurst(centerX, window.innerHeight * 0.5, 25);
        showToast('🪔 पावन अखंड दीप प्रज्ज्वलित हुआ!');
      });
    }

    // 5. Final Section Blessing Diya
    const closingDiya = document.getElementById('closing-interactive-diya');
    if (closingDiya) {
      closingDiya.addEventListener('click', () => {
        audioManager.playTempleBell(1.1);
        const rect = closingDiya.getBoundingClientRect();
        particleEngine.emitBlessingBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
        showToast('✨ छठी मैया का आशीर्वाद सदा आपके और आपके परिवार के साथ रहे!');
      });
    }

    // 6. Copy Wishes Button
    const copyWishesBtn = document.getElementById('copy-wishes-btn');
    if (copyWishesBtn) {
      copyWishesBtn.addEventListener('click', () => {
        const text = `सूर्य देव और छठी मैया के पावन महापर्व 'छठ पूजा' की आपको और आपके पूरे परिवार को हार्दिक शुभकामनाएँ!\n\n॥ ॐ सूर्याय नमः ॥\nछठी मैया आपके जीवन में सुख, शांति, समृद्धि और उत्तम स्वास्थ्य का आशीर्वाद दें। जय छठी मैया! 🪔☀️`;
        navigator.clipboard.writeText(text).then(
          () => {
            showToast('✨ शुभकामना संदेश कॉपी कर लिया गया है!');
          },
          () => {
            showToast('छठ पूजा की हार्दिक शुभकामनाएँ!');
          }
        );
      });
    }

    const blessingShowerBtn = document.getElementById('blessing-shower-btn');
    if (blessingShowerBtn) {
      blessingShowerBtn.addEventListener('click', () => {
        audioManager.playTempleBell(1.0);
        particleEngine.emitBlessingBurst(window.innerWidth / 2, window.innerHeight / 2, 55);
        showToast('🌸 छठी मैया की असीम कृपा व पुष्प वर्षा!');
      });
    }
  });
})();
