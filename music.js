// Chip Tune Music Generator using Web Audio API
class ChipTunePlayer {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.currentNote = 0;
        this.tempo = 140; // BPM
        this.nextNoteTime = 0;
        this.scheduleAheadTime = 0.1;
        this.noteLength = 0.15;
        this.timerID = null;
        
        // Melodic patterns (notes in semitones from base)
        this.melodyPattern = [
            0, 4, 7, 12, 7, 4, 0, -5,
            0, 4, 7, 12, 7, 4, 0, 2,
            4, 7, 11, 12, 11, 7, 4, 0,
            -1, 2, 4, 7, 4, 2, -1, 0
        ];
        
        // Bass pattern (lower octave)
        this.bassPattern = [
            0, 0, 7, 7, 0, 0, 7, 7,
            4, 4, 11, 11, 4, 4, 11, 11,
            -5, -5, 2, 2, -5, -5, 2, 2,
            0, 0, 7, 7, 0, 0, 7, 7
        ];
        
        // Arpeggio pattern for harmonics
        this.arpeggioPattern = [
            [0, 4, 7], [4, 7, 12], [7, 12, 16], [12, 16, 19],
            [7, 12, 16], [4, 7, 12], [0, 4, 7], [-5, 0, 4]
        ];
        
        this.baseFrequency = 261.63; // C4
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.audioContext.destination);
        }
    }

    // Convert semitone offset to frequency
    noteToFrequency(semitone, baseFreq) {
        return baseFreq * Math.pow(2, semitone / 12);
    }

    // Create a square wave oscillator (classic chip tune sound)
    createSquareWave(frequency, startTime, duration, volume = 0.3) {
        // Ensure startTime is valid
        const scheduleTime = (!startTime || startTime < this.audioContext.currentTime) 
            ? this.audioContext.currentTime 
            : startTime;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.value = frequency;
        
        // ADSR envelope (Attack, Decay, Sustain, Release)
        gainNode.gain.value = 0;
        gainNode.gain.setValueAtTime(0, scheduleTime);
        gainNode.gain.linearRampToValueAtTime(volume, scheduleTime + 0.01); // Attack
        gainNode.gain.linearRampToValueAtTime(volume * 0.7, scheduleTime + 0.05); // Decay
        gainNode.gain.setValueAtTime(volume * 0.7, scheduleTime + duration - 0.05); // Sustain
        gainNode.gain.linearRampToValueAtTime(0, scheduleTime + duration); // Release
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(scheduleTime);
        oscillator.stop(scheduleTime + duration);
        
        return oscillator;
    }

    // Create a triangle wave (softer sound for bass)
    createTriangleWave(frequency, startTime, duration, volume = 0.2) {
        // Ensure startTime is valid
        const scheduleTime = (!startTime || startTime < this.audioContext.currentTime) 
            ? this.audioContext.currentTime 
            : startTime;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;
        
        gainNode.gain.value = 0;
        gainNode.gain.setValueAtTime(0, scheduleTime);
        gainNode.gain.linearRampToValueAtTime(volume, scheduleTime + 0.01);
        gainNode.gain.setValueAtTime(volume, scheduleTime + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, scheduleTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(scheduleTime);
        oscillator.stop(scheduleTime + duration);
        
        return oscillator;
    }

    // Create noise for percussion (hi-hat like sound)
    createNoise(startTime, duration) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const noiseGain = this.audioContext.createGain();
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 2000;
        
        noiseGain.gain.value = 0;
        noiseGain.gain.setValueAtTime(0.1, startTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        
        noise.start(startTime);
        
        return noise;
    }

    // Schedule the next note
    scheduleNote(beatNumber, time) {
        const beat16th = 60.0 / this.tempo / 4; // Duration of a 16th note
        
        // Melody (lead)
        const melodyIndex = beatNumber % this.melodyPattern.length;
        const melodyNote = this.melodyPattern[melodyIndex];
        const melodyFreq = this.noteToFrequency(melodyNote, this.baseFrequency * 2);
        this.createSquareWave(melodyFreq, time, this.noteLength, 0.15);
        
        // Bass (every 2 beats)
        if (beatNumber % 2 === 0) {
            const bassIndex = Math.floor(beatNumber / 2) % this.bassPattern.length;
            const bassNote = this.bassPattern[bassIndex];
            const bassFreq = this.noteToFrequency(bassNote, this.baseFrequency / 2);
            this.createTriangleWave(bassFreq, time, beat16th * 2, 0.2);
        }
        
        // Arpeggio harmony (every 4 beats)
        if (beatNumber % 4 === 0) {
            const arpeggioIndex = Math.floor(beatNumber / 4) % this.arpeggioPattern.length;
            const chord = this.arpeggioPattern[arpeggioIndex];
            
            chord.forEach((note, i) => {
                const freq = this.noteToFrequency(note, this.baseFrequency);
                const delay = i * beat16th * 0.5;
                this.createSquareWave(freq, time + delay, beat16th * 0.4, 0.08);
            });
        }
        
        // Hi-hat (every beat)
        if (beatNumber % 2 === 1) {
            this.createNoise(time, 0.05);
        }
        
        // Kick drum simulation (every 4 beats)
        if (beatNumber % 8 === 0) {
            const kickOsc = this.audioContext.createOscillator();
            const kickGain = this.audioContext.createGain();
            
            kickOsc.type = 'sine';
            kickOsc.frequency.value = 150;
            kickOsc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
            
            kickGain.gain.value = 0.5;
            kickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
            
            kickOsc.connect(kickGain);
            kickGain.connect(this.masterGain);
            
            kickOsc.start(time);
            kickOsc.stop(time + 0.2);
        }
    }

    // Scheduler function
    scheduler() {
        const beat16th = 60.0 / this.tempo / 4;
        
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentNote, this.nextNoteTime);
            this.nextNoteTime += beat16th;
            this.currentNote++;
        }
        
        if (this.isPlaying) {
            this.timerID = setTimeout(() => this.scheduler(), 25);
        }
    }

    // Start playing
    start() {
        if (this.isPlaying) return;
        
        this.init();
        
        // Resume audio context if suspended (required for some browsers)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.isPlaying = true;
        this.currentNote = 0;
        this.nextNoteTime = this.audioContext.currentTime + 0.1; // Small delay to ensure context is ready
        this.scheduler();
    }

    // Stop playing
    stop() {
        this.isPlaying = false;
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }
    }

    // Toggle play/pause
    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    // Set volume
    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, value));
        }
    }
}

// Export for use in game
window.ChipTunePlayer = ChipTunePlayer;
