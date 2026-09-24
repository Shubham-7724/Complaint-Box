import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Send, 
  Sparkles, 
  Heart, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const REACTIONS = [
  '❤️ Loved this',
  '🥹 That made me happy',
  "😂 You're forgiven",
  '😤 Still mad',
  '💋 Come here'
];

export default function ComplaintDetailModal({ complaintId, isOpen, onClose, onRefresh }) {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDetail = async () => {
    if (!complaintId) return;
    setLoading(true);
    try {
      const data = await api.getComplaint(complaintId);
      setComplaint(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not find this letter in the box ♡');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && complaintId) {
      fetchDetail();
    }
  }, [complaintId, isOpen]);

  if (!isOpen) return null;

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setIsSubmittingReply(true);
    try {
      await api.addResponse(complaint.id, replyMessage.trim());
      setReplyMessage('');
      await fetchDetail();
      onRefresh?.();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to deliver reply ♡');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await api.updateStatus(complaint.id, newStatus);
      if (newStatus === 'completed') {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#8A9A86', '#D8A49B', '#722F37', '#F5EFEB']
        });
      }
      setShowCompleteConfirm(false);
      await fetchDetail();
      onRefresh?.();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to update status ♡');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSelectReaction = async (reaction) => {
    setReacting(true);
    try {
      await api.setReaction(complaint.id, reaction);
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.7 }
      });
      await fetchDetail();
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setReacting(false);
    }
  };

  const isBoyfriend = user?.role === 'BOYFRIEND';
  const isGirlfriend = user?.role === 'GIRLFRIEND';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start">
      <div className="relative w-full max-w-3xl bg-[#FDFBF7] border border-[#EADBCC] rounded-3xl shadow-2xl my-3 sm:my-8 text-[#3E2723] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Pinned Header */}
        <div className="sticky top-0 z-20 bg-[#FDFBF7] border-b border-[#EADBCC] px-5 sm:px-8 py-4 sm:py-5 flex items-start justify-between shrink-0 shadow-xs">
          <div>
            <span className="text-xs font-serif-vintage tracking-wider text-[#722F37] uppercase">
              A Little Note From Her
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#722F37]">
              {complaint ? complaint.title : 'Loading Note…'}
            </h2>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-[#6D5B57] hover:text-[#722F37] hover:bg-[#F5EFEB] rounded-full transition-all shrink-0 ml-2"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Letter Body */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-8 py-5 sm:py-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#D8A49B] border-t-[#722F37] rounded-full animate-spin mx-auto" />
              <p className="font-handwriting text-lg text-[#6D5B57]">Unfolding the handwritten letter… ♡</p>
            </div>
          ) : !complaint ? (
            <div className="py-12 text-center">
              <p className="font-serif-vintage text-rose-700">{errorMsg || 'Note not found'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Date & Status Badge Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EADBCC]/60 pb-3">
                <span className="text-xs font-mono text-[#6D5B57] bg-[#F5EFEB] px-3 py-1 rounded-full border border-[#EADBCC]">
                  {new Date(complaint.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <div className="px-3 py-1 rounded-full text-xs font-serif-vintage font-semibold bg-[#F3D8D6] text-[#722F37] border border-[#E8C5BE]">
                  {complaint.status === 'new' && '🌸 New Note'}
                  {complaint.status === 'read' && '💌 I Read It'}
                  {complaint.status === 'working' && '🫶 Working On It'}
                  {complaint.status === 'completed' && '✨ Fixed Together'}
                </div>
              </div>

              {/* Letter Body: Vintage Handwritten Paper Feel */}
              <div className="bg-[#FAF6F0] border border-[#EADBCC] rounded-2xl p-5 sm:p-7 shadow-inner relative space-y-5">
              
              {/* Mood & Severity Badges */}
              <div className="flex flex-wrap items-center gap-2 border-b border-[#EADBCC]/60 pb-3">
                <div className="px-3 py-1 bg-white/80 rounded-full border border-[#EADBCC] text-xs font-serif-vintage text-[#3E2723] flex items-center gap-1.5 shadow-xs">
                  <span>Mood:</span>
                  <span className="font-bold">{complaint.mood}</span>
                </div>
                <div className="px-3 py-1 bg-white/80 rounded-full border border-[#EADBCC] text-xs font-serif-vintage text-[#3E2723] flex items-center gap-1.5 shadow-xs">
                  <span>Trouble level:</span>
                  <span className="font-bold">{complaint.seriousness}</span>
                </div>
              </div>

              {/* “How I'm feeling…” */}
              <div>
                <p className="text-xs font-serif-vintage font-bold uppercase tracking-wider text-[#722F37] mb-1">
                  “How I'm feeling…”
                </p>
                <div className="bg-white/60 p-4 rounded-xl border border-[#EADBCC]/60 font-body-vintage text-base leading-relaxed text-[#3E2723] whitespace-pre-wrap">
                  {complaint.description}
                </div>
              </div>

              {/* “What I wish you'd done…” */}
              {complaint.wished_action && (
                <div>
                  <p className="text-xs font-serif-vintage font-bold uppercase tracking-wider text-[#722F37] mb-1">
                    “What I wish you'd done…”
                  </p>
                  <div className="bg-white/60 p-3.5 rounded-xl border border-[#EADBCC]/60 font-serif-vintage text-sm leading-relaxed text-[#3E2723] italic">
                    {complaint.wished_action}
                  </div>
                </div>
              )}

              {/* “What I actually want…” */}
              {complaint.desired_response_type && (
                <div>
                  <p className="text-xs font-serif-vintage font-bold uppercase tracking-wider text-[#722F37] mb-1">
                    “What I actually want…”
                  </p>
                  <span className="inline-block px-3.5 py-1.5 bg-[#F3D8D6] text-[#722F37] rounded-full text-xs font-serif-vintage font-semibold border border-[#E8C5BE]">
                    {complaint.desired_response_type}
                  </span>
                </div>
              )}

              {/* “Here's a hint…” */}
              {complaint.hint && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                  <p className="text-xs font-serif-vintage font-bold uppercase tracking-wider text-amber-900 mb-0.5 flex items-center gap-1">
                    <span>Here's a hint… 👀</span>
                  </p>
                  <p className="font-handwriting text-base text-amber-950">
                    “{complaint.hint}”
                  </p>
                </div>
              )}

              {/* Polaroid Attachment if present */}
              {complaint.attachment_url && (
                <div className="pt-2">
                  <div className="polaroid-frame inline-block max-w-[200px] -rotate-1">
                    <div className="washi-tape -top-2 left-10" />
                    <img
                      src={complaint.attachment_url}
                      alt="Attachment"
                      className="w-full h-36 object-cover rounded-xs border border-stone-200"
                    />
                    <p className="text-[10px] font-handwriting text-center mt-2 text-[#6D5B57]">
                      photograph attached ♡
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Responses Section */}
            <div className="space-y-4 pt-2">
              <h3 className="font-serif-display text-lg font-bold text-[#722F37] flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>His Response 💌</span>
              </h3>

              {complaint.responses && complaint.responses.length > 0 ? (
                <div className="space-y-3">
                  {complaint.responses.map((resp) => (
                    <div
                      key={resp.id}
                      className="p-4 rounded-2xl bg-[#F5EFEB] border border-[#D8A49B] shadow-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif-display font-bold text-[#722F37]">
                          From: {resp.responder_name} ♡
                        </span>
                        <span className="text-[10px] font-mono text-[#6D5B57]">
                          {new Date(resp.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-serif-vintage text-sm leading-relaxed text-[#3E2723] whitespace-pre-wrap">
                        {resp.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FBF7F0] border border-[#EADBCC] text-center text-xs text-[#6D5B57] font-serif-vintage">
                  He hasn't written his reply yet. He's thinking of the sweetest words… ♡
                </div>
              )}

              {/* Girlfriend Reaction Display & Picker */}
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADBCC] space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-serif-vintage font-bold text-[#3E2723]">
                    {complaint.reactions && complaint.reactions.length > 0
                      ? 'Her Reaction:'
                      : isGirlfriend
                      ? 'How did his response make you feel?'
                      : 'Her reaction will appear here ♡'}
                  </p>
                  {complaint.reactions && complaint.reactions.length > 0 && (
                    <span className="px-3 py-1 bg-[#F3D8D6] text-[#722F37] font-bold rounded-full text-xs border border-[#E8C5BE]">
                      {complaint.reactions[0].reaction}
                    </span>
                  )}
                </div>

                {/* Reaction Picker for Girlfriend */}
                {isGirlfriend && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {REACTIONS.map((rx) => (
                      <button
                        key={rx}
                        onClick={() => handleSelectReaction(rx)}
                        disabled={reacting}
                        className={`px-3 py-1.5 rounded-full text-xs font-serif-vintage transition-all ${
                          complaint.reactions?.[0]?.reaction === rx
                            ? 'bg-[#722F37] text-white shadow-xs font-bold'
                            : 'bg-[#F5EFEB] text-[#6D5B57] hover:bg-[#EADBCC] border border-[#EADBCC]'
                        }`}
                      >
                        {rx}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Boyfriend Action Area */}
            {isBoyfriend && (
              <div className="space-y-4 pt-4 border-t border-[#EADBCC]">
                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="space-y-2">
                  <label className="block text-xs font-serif-vintage font-bold uppercase tracking-wide text-[#722F37]">
                    “What am I going to do about it?”
                  </label>
                  <textarea
                    rows={3}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Write what you want to say to her… (e.g. I know. I'm sorry. I'm taking you out tonight ❤️)"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FBF7F0] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#722F37] font-serif-vintage"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReply || !replyMessage.trim()}
                      className="px-5 py-2 rounded-xl bg-[#722F37] hover:bg-[#8C3B47] text-white text-xs font-serif-vintage font-semibold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send my reply 💌</span>
                    </button>
                  </div>
                </form>

                {/* Status Progression: "Make it happen" */}
                <div className="pt-3">
                  <p className="text-xs font-serif-vintage font-bold uppercase tracking-wide text-[#3E2723] mb-2">
                    Make it happen
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleStatusChange('working')}
                      disabled={statusLoading || complaint.status === 'working'}
                      className={`px-3.5 py-2 rounded-xl text-xs font-serif-vintage transition-all flex items-center gap-1.5 ${
                        complaint.status === 'working'
                          ? 'bg-[#EBF0E9] text-[#4A5D46] font-bold border border-[#8A9A86]'
                          : 'bg-[#F5EFEB] text-[#6D5B57] hover:bg-[#EADBCC] border border-[#EADBCC]'
                      }`}
                    >
                      <span>🌷 I'm working on it</span>
                    </button>

                    <button
                      onClick={() => setShowCompleteConfirm(true)}
                      disabled={statusLoading || complaint.status === 'completed'}
                      className={`px-3.5 py-2 rounded-xl text-xs font-serif-vintage transition-all flex items-center gap-1.5 ${
                        complaint.status === 'completed'
                          ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                          : 'bg-[#722F37] text-white hover:bg-[#8C3B47] shadow-xs'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>✨ I did it</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange('completed')}
                      disabled={statusLoading || complaint.status === 'completed'}
                      className="px-3.5 py-2 rounded-xl text-xs font-serif-vintage bg-[#F3D8D6] text-[#722F37] hover:bg-[#E8C5BE] border border-[#E8C5BE] transition-all flex items-center gap-1.5"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#722F37]" />
                      <span>❤️ She loved it</span>
                    </button>
                  </div>
                </div>

                {/* Confirmation Modal when clicking "I did it" */}
                {showCompleteConfirm && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-amber-700" />
                      <p className="font-serif-display font-bold text-sm">
                        Are you sure you did it? 👀
                      </p>
                    </div>
                    <p className="text-xs font-serif-vintage text-stone-700">
                      Did you give her the hug, fix the promise, or arrange the sweet surprise? She's counting on you!
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleStatusChange('completed')}
                        className="px-4 py-1.5 bg-[#722F37] text-white rounded-xl text-xs font-serif-vintage font-bold shadow-xs hover:bg-[#8C3B47]"
                      >
                        Yes, I fixed it! ✨
                      </button>
                      <button
                        onClick={() => setShowCompleteConfirm(false)}
                        className="px-3 py-1.5 bg-white text-stone-700 border border-stone-300 rounded-xl text-xs font-serif-vintage hover:bg-stone-50"
                      >
                        Not quite yet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Fixed Together Memory Stamp (if completed) */}
            {complaint.status === 'completed' && (
              <div className="p-4 rounded-2xl bg-[#EBF0E9] border border-[#CAD8C7] flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-serif-display font-bold text-sm text-[#4A5D46]">
                    This Little Thing Was Fixed Together!
                  </p>
                  <p className="text-xs font-serif-vintage text-[#6D7D69]">
                    Archived into “Things We Fixed Together” postcards as a lasting memory ♡
                  </p>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  </div>
  );
}
