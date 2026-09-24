import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Mail, 
  Sparkles, 
  Heart, 
  Clock, 
  Search, 
  Filter, 
  RotateCw, 
  ChevronRight, 
  MessageCircle,
  AlertCircle
} from 'lucide-react';

const REMINDERS = [
  "She might not need fixing. She might just need you.",
  "Ask her how her day actually went.",
  "Do something nice without being asked.",
  "Remember the little things.",
  "A 5-second forehead kiss changes her whole day.",
  "Bring her favorite sweet treat unexpectedly.",
  "Listen with your full heart before offering solutions."
];

export default function BoyfriendDashboard({ onSelectComplaint, refreshTrigger }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [reminderIndex, setReminderIndex] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [complaintsData, statsData] = await Promise.all([
        api.getComplaints({ status: statusFilter, sort: sortFilter, search: searchQuery }),
        api.getStats()
      ]);
      setComplaints(complaintsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load boyfriend data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, sortFilter, searchQuery, refreshTrigger]);

  const cycleReminder = () => {
    setReminderIndex((prev) => (prev + 1) % REMINDERS.length);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-serif-vintage font-bold bg-[#F3D8D6] text-[#722F37] border border-[#E8C5BE]">
            🌸 New Note
          </span>
        );
      case 'read':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-serif-vintage font-medium bg-[#F5EFEB] text-[#6D5B57] border border-[#EADBCC]">
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
      
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <span className="text-xs font-serif-vintage tracking-widest text-[#722F37] uppercase">
          Boyfriend's Mission Board
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#722F37]">
          Your little list of things to make her smile ♡
        </h2>
        <p className="font-serif-vintage text-base sm:text-lg text-[#6D5B57] italic max-w-lg mx-auto">
          “Understanding her heart is your greatest priority.”
        </p>
      </div>

      {/* Vintage Stats Cards (NOT corporate Jira metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="vintage-card p-4 rounded-2xl text-center space-y-1 border border-[#EADBCC] hover:border-[#D8A49B] transition-colors">
          <span className="text-2xl">💌</span>
          <p className="text-2xl font-serif-display font-bold text-[#722F37]">
            {stats?.new_notes ?? 0}
          </p>
          <p className="text-xs font-serif-vintage text-[#6D5B57]">New notes</p>
        </div>

        <div className="vintage-card p-4 rounded-2xl text-center space-y-1 border border-[#EADBCC] hover:border-[#CAD8C7] transition-colors">
          <span className="text-2xl">🌷</span>
          <p className="text-2xl font-serif-display font-bold text-[#4A5D46]">
            {stats?.in_progress ?? 0}
          </p>
          <p className="text-xs font-serif-vintage text-[#6D5B57]">Things to work on</p>
        </div>

        <div className="vintage-card p-4 rounded-2xl text-center space-y-1 border border-[#EADBCC] hover:border-amber-300 transition-colors">
          <span className="text-2xl">✨</span>
          <p className="text-2xl font-serif-display font-bold text-amber-800">
            {stats?.completed ?? 0}
          </p>
          <p className="text-xs font-serif-vintage text-[#6D5B57]">Completed</p>
        </div>

        <div className="vintage-card p-4 rounded-2xl text-center space-y-1 border border-[#EADBCC] hover:border-rose-300 transition-colors">
          <span className="text-2xl">❤️</span>
          <p className="text-2xl font-serif-display font-bold text-[#722F37]">
            {stats?.total_requests ?? 0}
          </p>
          <p className="text-xs font-serif-vintage text-[#6D5B57]">Total requests</p>
        </div>
      </div>

      {/* Random Reminder Postcard Card */}
      <div className="vintage-card p-5 rounded-2xl bg-[#FAF6EE] border border-[#EADBCC] flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0">💡</span>
          <div>
            <p className="text-xs font-serif-vintage font-bold uppercase tracking-wider text-[#722F37]">
              Gentle Reminder For You
            </p>
            <p className="font-handwriting text-lg sm:text-xl text-[#3E2723] mt-0.5">
              “{REMINDERS[reminderIndex]}”
            </p>
          </div>
        </div>

        <button
          onClick={cycleReminder}
          className="p-2 text-[#6D5B57] hover:text-[#722F37] hover:bg-[#EADBCC]/50 rounded-full transition-all shrink-0"
          title="Cycle to another gentle reminder"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter, Sort & Search Toolbar */}
      <div className="vintage-card p-4 rounded-2xl border border-[#EADBCC] space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A29288] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search her hints, words, or requests…"
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FBF7F0] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#722F37] font-serif-vintage"
            />
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif-vintage text-[#6D5B57] whitespace-nowrap">Sort:</span>
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#FBF7F0] border border-[#EADBCC] rounded-xl focus:outline-none font-serif-vintage text-[#3E2723]"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="most_serious">Most serious first 🥀</option>
              <option value="not_completed">Not completed first</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-[#EADBCC]/60 pb-1">
          {[
            { id: 'all', label: 'All Notes' },
            { id: 'new', label: 'New' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'waiting_for_me', label: 'Waiting For Me 💌' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-serif-vintage transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#722F37] text-white shadow-xs font-semibold'
                  : 'bg-[#F5EFEB] text-[#6D5B57] hover:bg-[#EADBCC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#D8A49B] border-t-[#722F37] rounded-full animate-spin mx-auto" />
          <p className="font-handwriting text-sm text-[#6D5B57]">Retrieving her sweet notes… ♡</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="vintage-card rounded-3xl p-8 sm:p-12 text-center space-y-3 border border-dashed border-[#EADBCC]">
          <span className="text-3xl">🕊️</span>
          <h4 className="font-serif-display text-xl font-bold text-[#722F37]">
            No notes found under this filter
          </h4>
          <p className="font-serif-vintage text-xs text-[#6D5B57] max-w-xs mx-auto">
            You are all caught up, or she is happily smiling right now ♡
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectComplaint(item.id)}
              className="group vintage-card rounded-2xl p-5 border border-[#EADBCC] hover:border-[#722F37] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" title={item.mood}>{item.mood.split(' ')[0]}</span>
                    <span className="text-[11px] font-mono text-[#A29288]">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                {/* Title */}
                <div>
                  <h4 className="font-serif-display text-base font-bold text-[#722F37] group-hover:text-[#8C3B47] transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="font-serif-vintage text-xs text-[#6D5B57] line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* What she wants & hint */}
                <div className="space-y-1.5">
                  {item.desired_response_type && (
                    <div className="text-[11px] font-serif-vintage text-[#3E2723] bg-[#F5EFEB] px-2.5 py-1 rounded-lg border border-[#EADBCC]/60">
                      She wants: <span className="font-semibold text-[#722F37]">{item.desired_response_type}</span>
                    </div>
                  )}

                  {item.hint && (
                    <div className="text-[11px] font-serif-vintage text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200">
                      Hint: <span className="font-handwriting text-xs text-amber-950">“{item.hint}”</span>
                    </div>
                  )}
                </div>

                {/* Trouble level badge */}
                <div className="text-[10px] font-serif-vintage text-[#6D5B57]">
                  Trouble level: <span className="font-bold text-[#3E2723]">{item.seriousness}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-[#EADBCC]/60 flex items-center justify-between text-xs">
                {item.response_count > 0 ? (
                  <span className="text-xs font-serif-vintage text-[#4A5D46] font-medium flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Replied ({item.response_count})</span>
                  </span>
                ) : (
                  <span className="text-xs font-serif-vintage text-rose-700 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Waiting for your reply 💌</span>
                  </span>
                )}

                <div className="flex items-center gap-1 text-[#722F37] font-serif-vintage font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Open Letter</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
