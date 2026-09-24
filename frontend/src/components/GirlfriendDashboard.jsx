import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Feather, 
  Mail, 
  MessageCircle, 
  Sparkles, 
  Clock, 
  Heart, 
  CheckCircle2, 
  ChevronRight,
  Filter
} from 'lucide-react';

export default function GirlfriendDashboard({ onOpenCreateModal, onSelectComplaint, refreshTrigger }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaints({ status: filterStatus });
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [filterStatus, refreshTrigger]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-serif-vintage font-semibold bg-[#F3D8D6] text-[#722F37] border border-[#E8C5BE]">
            🌸 New
          </span>
        );
      case 'read':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-serif-vintage font-semibold bg-[#F5EFEB] text-[#6D5B57] border border-[#EADBCC]">
            💌 I read it
          </span>
        );
      case 'working':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-serif-vintage font-semibold bg-[#EBF0E9] text-[#4A5D46] border border-[#CAD8C7]">
            🫶 Working on it
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-serif-vintage font-semibold bg-amber-50 text-amber-900 border border-amber-200">
            ✨ Done
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Diary Header */}
      <div className="text-center space-y-2 py-4">
        <span className="text-xs font-serif-vintage tracking-widest text-[#722F37] uppercase">
          Private Diary & Love Notes
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#722F37]">
          Welcome back, my love ♡
        </h2>
        <p className="font-serif-vintage text-base sm:text-lg text-[#6D5B57] italic max-w-lg mx-auto">
          “Tell me what's on your mind. You don't have to keep it inside.”
        </p>
      </div>

      {/* Large Vintage Envelope CTA Card */}
      <div className="vintage-card rounded-3xl p-6 sm:p-8 bg-[#FDFBF7] border border-[#EADBCC] shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-xl">💌</span>
            <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#722F37]">
              Leave me a little note
            </h3>
          </div>
          <p className="font-serif-vintage text-sm sm:text-base text-[#6D5B57] max-w-md leading-relaxed">
            Whether it's a tiny pout, something you wish I noticed, or a sweet craving you want from me — drop it into the box.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="z-10 px-7 py-3 rounded-2xl bg-[#722F37] hover:bg-[#8C3B47] text-white text-sm sm:text-base font-serif-vintage font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 shrink-0"
        >
          <Feather className="w-4 h-4" />
          <span>Write a Complaint ♡</span>
        </button>

        {/* Vintage envelope illustration backdrop */}
        <div className="absolute right-4 -bottom-6 w-36 h-36 rounded-full bg-[#D8A49B]/10 blur-xl pointer-events-none" />
      </div>

      {/* "My little notes" Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#EADBCC] pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-serif-display text-xl font-bold text-[#3E2723]">
              My little notes
            </h3>
            <span className="text-xs bg-[#F5EFEB] text-[#6D5B57] px-2.5 py-0.5 rounded-full border border-[#EADBCC]">
              {complaints.length} notes
            </span>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'new', 'in_progress', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-full text-xs font-serif-vintage capitalize transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-[#722F37] text-white shadow-xs font-semibold'
                    : 'bg-[#F5EFEB] text-[#6D5B57] hover:bg-[#EADBCC]'
                }`}
              >
                {st === 'in_progress' ? 'Working On It' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#D8A49B] border-t-[#722F37] rounded-full animate-spin mx-auto" />
            <p className="font-handwriting text-sm text-[#6D5B57]">Opening your vintage journal… ♡</p>
          </div>
        ) : complaints.length === 0 ? (
          /* Empty State */
          <div className="vintage-card rounded-3xl p-8 sm:p-12 text-center space-y-4 border border-dashed border-[#D8A49B]">
            <div className="wax-seal w-14 h-14 text-2xl mx-auto opacity-90">
              <span>🌸</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-serif-display text-xl font-bold text-[#722F37]">
                Everything okay? You haven't left me a note lately. ❤️
              </h4>
              <p className="font-serif-vintage text-sm text-[#6D5B57] max-w-sm mx-auto">
                Whenever you're ready, the box is always open and listening.
              </p>
            </div>
            <button
              onClick={onOpenCreateModal}
              className="px-5 py-2 rounded-xl bg-[#F5EFEB] hover:bg-[#EADBCC] text-[#722F37] text-xs font-serif-vintage font-semibold border border-[#EADBCC] transition-all"
            >
              Write your first note ♡
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectComplaint(item.id)}
                className="group relative vintage-card rounded-2xl p-5 border border-[#EADBCC] hover:border-[#D8A49B] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Mood, Date, Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" title={item.mood}>{item.mood.split(' ')[0]}</span>
                      <span className="text-[11px] font-mono text-[#A29288]">
                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Title & Excerpt */}
                  <div>
                    <h4 className="font-serif-display text-base font-bold text-[#722F37] group-hover:text-[#8C3B47] transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="font-serif-vintage text-xs text-[#6D5B57] line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* What She Wants Badge */}
                  {item.desired_response_type && (
                    <div className="text-[11px] font-serif-vintage text-[#3E2723] bg-[#F5EFEB] px-2.5 py-1 rounded-lg border border-[#EADBCC]/60 inline-block">
                      Looking for: <span className="font-semibold text-[#722F37]">{item.desired_response_type}</span>
                    </div>
                  )}
                </div>

                {/* Footer: Response Status & Reaction */}
                <div className="mt-4 pt-3 border-t border-[#EADBCC]/60 flex items-center justify-between text-xs">
                  {item.response_count > 0 ? (
                    <span className="font-serif-vintage text-xs font-semibold text-[#722F37] flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Your note has been answered 💌</span>
                    </span>
                  ) : (
                    <span className="font-serif-vintage text-xs text-[#A29288] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Waiting for him to read ♡</span>
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    {item.latest_reaction && (
                      <span className="text-xs bg-[#F3D8D6] text-[#722F37] px-2 py-0.5 rounded-full font-serif-vintage">
                        {item.latest_reaction}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-[#A29288] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
