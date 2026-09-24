import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Sparkles, Heart, Plus, Image as ImageIcon, Calendar, CheckCircle, Tag } from 'lucide-react';

export default function CompletedPostcards({ onSelectComplaint }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForMemory, setSelectedForMemory] = useState(null);
  const [memTitle, setMemTitle] = useState('');
  const [memDesc, setMemDesc] = useState('');
  const [savingMemory, setSavingMemory] = useState(false);

  const fetchCompleted = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaints({ status: 'completed' });
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load completed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompleted();
  }, []);

  const handleSaveMemory = async (e) => {
    e.preventDefault();
    if (!selectedForMemory || !memTitle.trim()) return;
    setSavingMemory(true);
    try {
      await api.addMemory(selectedForMemory.id, {
        title: memTitle.trim(),
        description: memDesc.trim() || null
      });
      setSelectedForMemory(null);
      setMemTitle('');
      setMemDesc('');
      fetchCompleted();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingMemory(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Section Header */}
      <div className="text-center space-y-2 py-4">
        <span className="text-xs font-serif-vintage tracking-widest text-amber-700 uppercase">
          Relationship Memory Archive
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#722F37] flex items-center justify-center gap-2">
          <span>Things We Fixed Together</span>
          <Sparkles className="w-6 h-6 text-amber-500" />
        </h2>
        <p className="font-serif-vintage text-base sm:text-lg text-[#6D5B57] italic max-w-lg mx-auto">
          “Every disagreement solved with kindness is a love letter to our future.”
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto" />
          <p className="font-handwriting text-sm text-[#6D5B57]">Arranging our vintage postcards… ♡</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="vintage-card rounded-3xl p-10 text-center space-y-3 border border-dashed border-[#EADBCC]">
          <span className="text-3xl">📮</span>
          <h4 className="font-serif-display text-xl font-bold text-[#722F37]">
            No completed postcards yet
          </h4>
          <p className="font-serif-vintage text-xs text-[#6D5B57] max-w-xs mx-auto">
            Once you solve and check off little notes, they will appear here as vintage postcards!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complaints.map((item) => (
            <div
              key={item.id}
              className="postage-stamp rounded-2xl p-6 bg-[#FAF6EE] relative space-y-4 hover:shadow-lg transition-all"
            >
              {/* Vintage Postage Stamp in Top-Right */}
              <div className="absolute top-4 right-4 w-12 h-14 border border-dashed border-[#D8A49B] bg-[#FDFBF7] p-1 text-center rotate-2 shadow-xs">
                <p className="text-[7px] font-mono text-[#722F37] uppercase">RESOLVED</p>
                <span className="text-base block">✨</span>
                <p className="text-[6px] font-mono text-[#6D5B57]">FOREVER</p>
              </div>

              {/* Date & Mood */}
              <div className="flex items-center gap-2 text-xs font-mono text-[#6D5B57]">
                <Calendar className="w-3.5 h-3.5" />
                <span>Fixed on {item.completed_at ? new Date(item.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}</span>
                <span>• {item.mood}</span>
              </div>

              {/* Title & Original Issue */}
              <div>
                <h3 className="font-serif-display text-lg font-bold text-[#722F37] pr-14">
                  {item.title}
                </h3>
                <p className="font-serif-vintage text-xs text-[#6D5B57] line-clamp-2 mt-1 italic">
                  “{item.description}”
                </p>
              </div>

              {/* His Response */}
              {item.latest_response && (
                <div className="p-3 bg-white/70 rounded-xl border border-[#EADBCC] space-y-1">
                  <p className="text-[10px] font-serif-vintage font-bold uppercase tracking-wider text-[#722F37]">
                    How He Fixed It ♡
                  </p>
                  <p className="font-serif-vintage text-xs text-[#3E2723] leading-relaxed">
                    {item.latest_response}
                  </p>
                </div>
              )}

              {/* Her Reaction */}
              {item.latest_reaction && (
                <div className="flex items-center gap-2 text-xs font-serif-vintage">
                  <span className="text-[#6D5B57]">Her verdict:</span>
                  <span className="px-3 py-0.5 rounded-full bg-[#F3D8D6] text-[#722F37] font-semibold border border-[#E8C5BE]">
                    {item.latest_reaction}
                  </span>
                </div>
              )}

              {/* Attached Memory Card Button or Display */}
              <div className="pt-2 border-t border-[#EADBCC]/60 flex items-center justify-between">
                <button
                  onClick={() => setSelectedForMemory(item)}
                  className="text-xs font-serif-vintage text-[#722F37] hover:text-[#8C3B47] flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach sweet memory / photo</span>
                </button>

                <button
                  onClick={() => onSelectComplaint(item.id)}
                  className="text-xs font-serif-vintage text-[#6D5B57] hover:text-[#3E2723] underline"
                >
                  View full letter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Memory Attachment Modal */}
      {selectedForMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#FDFBF7] border border-[#EADBCC] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-serif-display text-xl font-bold text-[#722F37]">
              Attach a Memory to this Postcard ✨
            </h3>
            <p className="text-xs font-serif-vintage text-[#6D5B57]">
              Document what you learned or a cute couple moment that happened after fixing “{selectedForMemory.title}”.
            </p>

            <form onSubmit={handleSaveMemory} className="space-y-3">
              <div>
                <label className="block text-xs font-serif-vintage font-semibold text-[#3E2723] mb-1">
                  Memory Title
                </label>
                <input
                  type="text"
                  value={memTitle}
                  onChange={(e) => setMemTitle(e.target.value)}
                  placeholder="e.g. Our Living Room Tea Date Pact"
                  className="w-full px-3 py-2 text-xs bg-[#FBF7F0] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#722F37] font-serif-vintage"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-serif-vintage font-semibold text-[#3E2723] mb-1">
                  Memory Note / Pinky Promise
                </label>
                <textarea
                  rows={3}
                  value={memDesc}
                  onChange={(e) => setMemDesc(e.target.value)}
                  placeholder="What did you promise each other?"
                  className="w-full px-3 py-2 text-xs bg-[#FBF7F0] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#722F37] font-serif-vintage"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedForMemory(null)}
                  className="px-4 py-1.5 rounded-xl border border-[#EADBCC] text-xs font-serif-vintage text-[#6D5B57]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMemory}
                  className="px-5 py-1.5 rounded-xl bg-[#722F37] text-white text-xs font-serif-vintage font-semibold shadow-xs"
                >
                  Save to Archive ♡
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
