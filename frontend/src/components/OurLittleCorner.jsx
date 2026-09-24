import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import { Heart, Sparkles, Calendar, Coffee, Bookmark, RefreshCw, Feather } from 'lucide-react';

export default function OurLittleCorner({ onSelectComplaint }) {
  const [stats, setStats] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [virtualKissSent, setVirtualKissSent] = useState(false);
  const [waxSealToast, setWaxSealToast] = useState('');
  const [heartToast, setHeartToast] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, memoriesData] = await Promise.all([
        api.getStats(),
        api.getMemories()
      ]);
      setStats(statsData);
      setMemories(memoriesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendKiss = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D8A49B', '#722F37', '#F3D8D6', '#8A9A86']
    });
    setVirtualKissSent(true);
    setTimeout(() => setVirtualKissSent(false), 3500);
  };

  const handleWaxSealClick = () => {
    setWaxSealToast('Sealed with love. 💌');
    setTimeout(() => setWaxSealToast(''), 3000);
  };

  const handleHeartClick = () => {
    setHeartToast("I knew you'd click that. ♡");
    setTimeout(() => setHeartToast(''), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <span className="text-xs font-serif-vintage tracking-widest text-[#722F37] uppercase">
          Our Private Shared Haven
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#722F37] flex items-center justify-center gap-2">
          <span>Our Little Corner</span>
          <Heart 
            onClick={handleHeartClick}
            className="w-6 h-6 text-rose-500 fill-rose-500 cursor-pointer hover:scale-125 transition-transform" 
            title="Click me ♡"
          />
        </h2>
        {heartToast && (
          <p className="font-handwriting text-sm text-[#722F37] animate-bounce">
            {heartToast}
          </p>
        )}
        <p className="font-serif-vintage text-base sm:text-lg text-[#6D5B57] italic max-w-lg mx-auto">
          “A quiet room on the internet, built exclusively for two hearts.”
        </p>
      </div>

      {/* Main Hero Card: Days & Solved stats */}
      <div className="vintage-card rounded-3xl p-6 sm:p-10 bg-[#FAF6EE] border border-[#EADBCC] text-center space-y-6 shadow-md relative overflow-hidden">
        {/* Subtle decorative wax seal */}
        <div 
          onClick={handleWaxSealClick}
          className="wax-seal w-16 h-16 text-2xl mx-auto shadow-md cursor-pointer select-none"
          title="Click the seal"
        >
          <span>♡</span>
        </div>

        {waxSealToast && (
          <p className="font-handwriting text-sm text-[#722F37] animate-bounce">
            {waxSealToast}
          </p>
        )}

        <div className="space-y-2 max-w-lg mx-auto">
          <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#722F37]">
            You've solved {stats?.completed ?? 0} little things together.
          </h3>
          <p className="font-serif-vintage text-base text-[#6D5B57] italic leading-relaxed">
            {stats?.random_message || "Every little thing you fix together builds a forever love. ♡"}
          </p>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 max-w-md mx-auto">
          <div className="bg-white/80 p-4 rounded-2xl border border-[#EADBCC] shadow-xs">
            <span className="text-xl">🕊️</span>
            <p className="text-2xl font-serif-display font-bold text-[#722F37] mt-1">
              {stats?.days_together ?? 365}
            </p>
            <p className="text-[11px] font-serif-vintage text-[#6D5B57]">Days Together</p>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-[#EADBCC] shadow-xs">
            <span className="text-xl">✨</span>
            <p className="text-2xl font-serif-display font-bold text-amber-800 mt-1">
              {stats?.completed ?? 0}
            </p>
            <p className="text-[11px] font-serif-vintage text-[#6D5B57]">Problems Fixed</p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white/80 p-4 rounded-2xl border border-[#EADBCC] shadow-xs">
            <span className="text-xl">💌</span>
            <p className="text-2xl font-serif-display font-bold text-[#4A5D46] mt-1">
              {stats?.total_requests ?? 0}
            </p>
            <p className="text-[11px] font-serif-vintage text-[#6D5B57]">Letters Written</p>
          </div>
        </div>

        {/* Romantic Interactive Kiss Button */}
        <div className="pt-2">
          <button
            onClick={handleSendKiss}
            className="px-6 py-2.5 rounded-full bg-[#722F37] hover:bg-[#8C3B47] text-white text-xs sm:text-sm font-serif-vintage font-semibold shadow-md transition-all flex items-center gap-2 mx-auto"
          >
            <span>💋 Send a Warm Forehead Kiss</span>
          </button>
          {virtualKissSent && (
            <p className="font-handwriting text-sm text-[#722F37] mt-2 animate-bounce">
              Forehead kiss delivered straight to their heart ♡
            </p>
          )}
        </div>
      </div>

      {/* Memory Wall / Couple Constitution */}
      <div className="space-y-4">
        <h3 className="font-serif-display text-xl font-bold text-[#3E2723] flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[#722F37]" />
          <span>Our Saved Promises & Sweet Memories</span>
        </h3>

        {memories.length === 0 ? (
          <div className="vintage-card p-6 rounded-2xl text-center text-xs font-serif-vintage text-[#6D5B57]">
            No pinned memories yet. When you complete notes in “Things We Fixed”, you can attach memories here!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="vintage-card p-5 rounded-2xl border border-[#EADBCC] bg-[#FDFBF7] space-y-2 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-serif-display text-base font-bold text-[#722F37]">
                    {mem.title}
                  </h4>
                  <span className="text-[10px] font-mono text-[#A29288]">
                    {new Date(mem.created_at).toLocaleDateString()}
                  </span>
                </div>
                {mem.description && (
                  <p className="font-handwriting text-base text-[#3E2723] leading-relaxed">
                    “{mem.description}”
                  </p>
                )}
                {mem.complaint_title && (
                  <p className="text-[10px] font-serif-vintage text-[#6D5B57] pt-1 border-t border-[#EADBCC]/50">
                    Linked to: {mem.complaint_title}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
