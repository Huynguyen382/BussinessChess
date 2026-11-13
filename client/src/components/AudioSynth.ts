// Web Audio API Synthesizer - Âm thanh mượt mà không cần tải file ngoài
class SoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tiếng chạm/bấm nhẹ nhàng vui nhộn khi chọn ô cờ hoặc danh lam thắng cảnh 3D
  public playTap() {
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Tiếng lắc xúc xắc lọc cọc đậm chất retro-arcade
  public playDiceRoll() {
    this.initCtx();
    if (!this.ctx) return;

    const clicks = 7;
    for (let i = 0; i < clicks; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(350 + Math.random() * 500, now);
        filter.Q.setValueAtTime(3.5, now);

        osc.type = i % 2 === 0 ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(160 + Math.random() * 240, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);

        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.055);
      }, i * 42);
    }
  }

  // Tiếng tiền vàng leng keng khi nhận thưởng hoặc thu tiền
  public playCoin() {
    this.initCtx();
    if (!this.ctx) return;

    const freqs = [987.77, 1318.51, 1567.98]; // B5, E6, G6
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      }, idx * 70);
    });
  }

  // Tiếng giao dịch tiền tệ retro-arcade (Cash Transaction / Cash Register Cha-Ching)
  public playCashTransaction() {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Chuỗi nốt thanh âm kim loại ngân vang của máy đếm tiền
    const bellPitches = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
    bellPitches.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = now + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.33);
    });
  }

  // Tiếng xây nhà / mua đất vui nhộn
  public playBuild() {
    this.initCtx();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
      }, idx * 55);
    });
  }

  // Nhạc kèn khải hoàn rực rỡ khi mua Khách Sạn (Hotel Purchase Fanfare)
  public playHotelFanfare() {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Bản hợp âm khải hoàn retro 16-bit arcade
    const fanfareNotes = [
      { freq: 523.25, time: 0, dur: 0.12 },     // C5
      { freq: 659.25, time: 0.11, dur: 0.12 },  // E5
      { freq: 783.99, time: 0.22, dur: 0.12 },  // G5
      { freq: 1046.50, time: 0.33, dur: 0.3 },  // C6
      // Hợp âm chung cuộc hoàng tráng
      { freq: 659.25, time: 0.52, dur: 0.65 },  // E5
      { freq: 783.99, time: 0.52, dur: 0.65 },  // G5
      { freq: 1046.50, time: 0.52, dur: 0.65 }, // C6
      { freq: 1318.51, time: 0.52, dur: 0.65 }  // E6
    ];

    fanfareNotes.forEach(({ freq, time, dur }) => {
      if (!this.ctx) return;
      const t = now + time;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, t);
      filter.frequency.exponentialRampToValueAtTime(1000, t + dur);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + dur + 0.01);
    });
  }

  // Tiếng sập cửa nhà tù bằng kim loại nặng (Jail Door Slam)
  public playJailSlam() {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Tiếng va chạm thanh sắt sắc lạnh
    const clang = this.ctx.createOscillator();
    const clangGain = this.ctx.createGain();
    const clangFilter = this.ctx.createBiquadFilter();
    clang.type = 'sawtooth';
    clang.frequency.setValueAtTime(1100, now);
    clang.frequency.exponentialRampToValueAtTime(280, now + 0.12);

    clangFilter.type = 'bandpass';
    clangFilter.frequency.setValueAtTime(750, now);
    clangFilter.Q.setValueAtTime(5, now);

    clangGain.gain.setValueAtTime(0.24, now);
    clangGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    clang.connect(clangFilter);
    clangFilter.connect(clangGain);
    clangGain.connect(this.ctx.destination);
    clang.start(now);
    clang.stop(now + 0.23);

    // 2. Tiếng nện trầm chấn động cửa sắt đóng sập
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(120, now + 0.02);
    thud.frequency.exponentialRampToValueAtTime(26, now + 0.45);

    thudGain.gain.setValueAtTime(0.38, now + 0.02);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);

    thud.connect(thudGain);
    thudGain.connect(this.ctx.destination);
    thud.start(now + 0.02);
    thud.stop(now + 0.53);
  }

  // Tiếng chuông rút thẻ Cơ hội / Khí vận lung linh (Card Draw Chime)
  public playCardChime() {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chimeFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    chimeFreqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = now + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.37);
    });
  }

  // Tiếng còi tàu hỏa / bến xe retro (Train Whistle)
  public playTrainWhistle() {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bursts = [
      { start: 0, dur: 0.16 },
      { start: 0.22, dur: 0.45 }
    ];

    bursts.forEach(({ start, dur }) => {
      if (!this.ctx) return;
      const t = now + start;
      const freqs = [587.33, 739.99]; // D5 và F#5 (khoảng âm đặc trưng của còi hơi)

      freqs.forEach(freq => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.linearRampToValueAtTime(freq * 0.985, t + dur);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + dur + 0.01);
      });
    });
  }

  // Tiếng báo hiệu đến lượt
  public playTurnNotification() {
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, this.ctx.currentTime + 0.15); // G5
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  // Tiếng phá sản trầm buồn
  public playBankrupt() {
    this.initCtx();
    if (!this.ctx) return;

    const notes = [300, 260, 220, 180];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
      }, idx * 120);
    });
  }
}

export const sounds = new SoundEffects();
