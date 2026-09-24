import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Disc } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isOpen, setIsOpen] = useState(false);
  
  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Soft romantic music box melody notes (frequencies in Hz)
  // Canon in D / Clair de lune inspired soothing lullaby progression
  const melody = [
    { freq: 587.33, dur: 0.6 }, // D5
    { freq: 440.00, dur: 0.4 }, // A4
    { freq: 493.88, dur: 0.6 }, // B4
    { freq: 369.99, dur: 0.4 }, // F#4
    { freq: 392.00, dur: 0.6 }, // G4
    { freq: 293.66, dur: 0.4 }, // D4
    { freq: 392.00, dur: 0.6 }, // G4
    { freq: 440.00, dur: 0.8 }, // A4
    { freq: 587.33, dur: 0.5 }, // D5
    { freq: 659.25, dur: 0.5 }, // E5
    { freq: 739.99, dur: 0.8 }, // F#5
    { freq: 587.33, dur: 0.5 }, // D5
    { freq: 493.88, dur: 0.6 }, // B4
    { freq: 440.00, dur: 0.6 }, // A4
    { freq: 369.99, dur: 0.6 }, // F#4
    { freq: 440.00, dur: 1.0 }, // A4
  ];

  const noteIndexRef = useRef(0);

  const playNote = (freq, duration) => {
    if (!audioCtxRef.current || isMuted) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      // Music-box bell tone: sine wave with slight high-overtone sparkle
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Bell envelope: fast attack, gentle decay
      noteGain.gain.setValueAtTime(0, ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(volume * 0.4, ctx.currentTime + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration * 1.8);

      osc.connect(noteGain);
      noteGain.connect(gainNodeRef.current);

      osc.start();
      osc.stop(ctx.currentTime + duration * 1.9);
    } catch (e) {
      console.error('Audio playback error', e);
    }
  };

  const startMusic = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      const gainNode = audioCtxRef.current.createGain();
      gainNode.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
      gainNode.connect(audioCtxRef.current.destination);
      gainNodeRef.current = gainNode;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    setIsPlaying(true);

    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      const currentNote = melody[noteIndexRef.current];
      playNote(currentNote.freq, currentNote.dur);
      noteIndexRef.current = (noteIndexRef.current + 1) % melody.length;
    }, 750);
  };

  const stopMusic = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(!isMuted ? 0 : volume, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5EFEB] border border-[#EADBCC] text-[#722F37] hover:bg-[#F3D8D6]/60 transition-all text-xs font-serif-vintage shadow-xs"
        title="Romantic Music Player"
      >
        <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin text-[#722F37]' : 'text-[#6D5B57]'}`} style={{ animationDuration: '4s' }} />
        <span className="hidden sm:inline">Melody Box</span>
        <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
      </button>

      {/* Mini Player Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#FDFBF7] border border-[#EADBCC] rounded-xl shadow-xl p-3.5 z-50 text-[#3E2723]">
          <div className="flex items-center justify-between border-b border-[#EADBCC]/60 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full bg-[#722F37] flex items-center justify-center text-white ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
                <span className="text-[10px]">♡</span>
              </div>
              <div>
                <p className="text-xs font-serif-display font-semibold text-[#722F37]">Music Box For Us</p>
                <p className="text-[11px] font-handwriting text-[#6D5B57]">Soft nostalgic lullaby</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#6D5B57] hover:text-[#722F37]"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#722F37] text-white hover:bg-[#8C3B47] transition-colors shadow-xs"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>

            <button
              onClick={toggleMute}
              className="text-[#6D5B57] hover:text-[#722F37] transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <input
              type="range"
              min="0.05"
              max="0.8"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                if (gainNodeRef.current && audioCtxRef.current && !isMuted) {
                  gainNodeRef.current.gain.setValueAtTime(val, audioCtxRef.current.currentTime);
                }
              }}
              className="w-24 accent-[#722F37] h-1.5 bg-[#EADBCC] rounded-lg cursor-pointer"
            />
          </div>

          <p className="text-[10px] text-center text-[#6D5B57] font-handwriting mt-2.5">
            {isPlaying ? '♪ Playing gently in the background…' : 'Press play to hear our vintage tune'}
          </p>
        </div>
      )}
    </div>
  );
}
