import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import { 
  X, 
  Send, 
  Upload, 
  Image as ImageIcon, 
  Smile, 
  AlertCircle, 
  CheckCircle2, 
  Feather,
  Sparkles 
} from 'lucide-react';

const MOODS = [
  { emoji: '🥺', label: 'Sad' },
  { emoji: '😤', label: 'Angry' },
  { emoji: '😒', label: 'Annoyed' },
  { emoji: '💔', label: 'Hurt' },
  { emoji: '🥹', label: 'Emotional' },
  { emoji: '😶', label: 'Disappointed' },
  { emoji: '❤️', label: 'Just need you' },
  { emoji: '😂', label: "I'm not actually that mad" },
];

const WANTS = [
  'I want an apology',
  'I want reassurance',
  'I want attention',
  'I want quality time',
  'I want a hug',
  'I want you to listen',
  'I want you to do something for me',
  'I just want to vent',
  "I don't know yet",
  'Something else…'
];

const SEVERITY_LEVELS = [
  { label: '🌱 Tiny thing', desc: 'Just a slight ruffle in the feathers' },
  { label: '🌷 I noticed it', desc: 'Worth mentioning before it grows' },
  { label: '🥀 It really bothered me', desc: 'My feelings are genuinely hurt' },
  { label: '💔 We need to talk', desc: 'Please hold me and listen closely' },
];

export default function ComplaintFormModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wishedAction, setWishedAction] = useState('');
  const [desiredResponse, setDesiredResponse] = useState(WANTS[1]);
  const [customWant, setCustomWant] = useState('');
  const [hint, setHint] = useState('');
  const [mood, setMood] = useState(MOODS[0].emoji + ' ' + MOODS[0].label);
  const [seriousness, setSeriousness] = useState(SEVERITY_LEVELS[1].label);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Please choose a photo smaller than 10MB ♡');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please write a title and tell me what happened ♡');
      return;
    }

    setErrorMsg('');
    setIsDelivering(true);

    try {
      let attachmentUrl = null;
      if (selectedFile) {
        setIsUploading(true);
        const uploadRes = await api.uploadPhoto(selectedFile);
        attachmentUrl = uploadRes.url;
        setIsUploading(false);
      }

      const finalWant = desiredResponse === 'Something else…' && customWant.trim() 
        ? customWant.trim() 
        : desiredResponse;

      await api.createComplaint({
        title: title.trim(),
        description: description.trim(),
        wished_action: wishedAction.trim() || null,
        desired_response_type: finalWant,
        hint: hint.trim() || null,
        mood,
        seriousness,
        attachment_url: attachmentUrl
      });

      // Confetti shower
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D8A49B', '#722F37', '#F3D8D6', '#8A9A86']
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsDelivering(false);
        onSuccess?.();
        onClose();
      }, 2400);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Could not drop note into the box. Try again ♡');
      setIsDelivering(false);
    }
  };

  const isSuspiciousMood = mood.includes("I'm not actually that mad");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start">
      <div className="relative w-full max-w-2xl bg-[#FDFBF7] border border-[#EADBCC] rounded-3xl shadow-2xl my-3 sm:my-8 text-[#3E2723] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Envelope Submission Animation / Confirmation Overlay */}
        {isDelivering && (
          <div className="absolute inset-0 bg-[#FDFBF7]/95 rounded-3xl z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            {isSuccess ? (
              <div className="space-y-4">
                <div className="wax-seal w-20 h-20 text-3xl mx-auto animate-gentle-pulse">
                  <span>💌</span>
                </div>
                <h3 className="font-serif-display text-2xl font-bold text-[#722F37]">
                  Your little note has been safely delivered. 💌
                </h3>
                <p className="font-serif-vintage text-base text-[#6D5B57] max-w-sm mx-auto">
                  It's tucked into the box. I'll come read it soon with all my love. ♡
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-[#8A9A86] font-semibold bg-[#EBF0E9] px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4" /> Delivered to his board
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-[#D8A49B] border-t-[#722F37] animate-spin mx-auto" />
                <p className="font-serif-display text-xl text-[#722F37]">
                  Sealing your note with wax…
                </p>
                <p className="font-handwriting text-sm text-[#6D5B57]">
                  Dropping it into our vintage complaint box ♡
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pinned Header */}
        <div className="sticky top-0 z-20 bg-[#FDFBF7] border-b border-[#EADBCC] px-5 sm:px-8 py-4 sm:py-5 flex items-start justify-between shrink-0 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">✍️</span>
              <span className="text-xs font-serif-vintage tracking-wider text-[#722F37] uppercase">
                Private Diary Entry
              </span>
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#722F37]">
              Tell me what's wrong…
            </h2>
            <p className="font-serif-vintage text-xs sm:text-sm text-[#6D5B57] italic mt-0.5">
              “You can say it directly. Or don't. I'll try to understand. ♡”
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isDelivering}
            className="p-2 text-[#6D5B57] hover:text-[#722F37] hover:bg-[#F5EFEB] rounded-full transition-all shrink-0 ml-2"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form with Scrollable Body and Pinned Footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="overflow-y-auto flex-1 px-5 sm:px-8 py-5 sm:py-6 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-serif-vintage flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Short Title / Summary */}
          <div>
            <label className="block text-xs font-serif-vintage font-semibold text-[#3E2723] uppercase tracking-wide mb-1">
              Short Title / Subject ♡
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. You forgot something… / Need a hug today"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FBF7F0] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#722F37] font-serif-vintage"
              required
            />
          </div>

          {/* A. What's bothering you? */}
          <div>
            <label className="block text-xs font-serif-vintage font-semibold text-[#3E2723] uppercase tracking-wide mb-1">
              A. “What's bothering you?”
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell me what happened… you can let it all out here."
              className="w-full px-3.5 py-2.5 text-sm bg-[#FBF7F0] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#722F37] font-serif-vintage resize-y"
              required
            />
          </div>

          {/* B. What do you wish I'd done? */}
          <div>
            <label className="block text-xs font-serif-vintage font-semibold text-[#3E2723] uppercase tracking-wide mb-1">
              B. “What do you wish I'd done?”
            </label>
            <textarea
              rows={2}
              value={wishedAction}
              onChange={(e) => setWishedAction(e.target.value)}
              placeholder="Something you wish I understood or did differently…"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FBF7F0] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#722F37] font-serif-vintage resize-y"
            />
          </div>

          {/* C. What do you want from me? */}
          <div>
            <label className="block text-xs font-serif-vintage font-semibold text-[#3E2723] uppercase tracking-wide mb-1.5">
              C. “What do you want from me?”
            </label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {WANTS.map((want) => (
                <button
                  type="button"
                  key={want}
                  onClick={() => setDesiredResponse(want)}
                  className={`px-3 py-1.5 rounded-full text-xs font-serif-vintage transition-all ${
                    desiredResponse === want
                      ? 'bg-[#722F37] text-white shadow-xs font-semibold'
                      : 'bg-[#F5EFEB] text-[#6D5B57] hover:bg-[#EADBCC] border border-[#EADBCC]'
                  }`}
                >
                  {want}
                </button>
              ))}
            </div>
            {desiredResponse === 'Something else…' && (
              <input
                type="text"
                value={customWant}
                onChange={(e) => setCustomWant(e.target.value)}
                placeholder="What would make your heart feel better?"
                className="mt-2 w-full px-3 py-2 text-xs bg-[#FBF7F0] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#722F37] font-serif-vintage"
              />
            )}
          </div>

          {/* D. Don't want to say it directly? Hint */}
          <div>
            <label className="block text-xs font-serif-vintage font-semibold text-[#3E2723] uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <span>D. “Don't want to say it directly?”</span>
              <span className="text-stone-400 font-normal">Give me a hint instead 👀</span>
            </label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Maybe I'll figure it out… (e.g. think about what you promised last weekend)"
              className="w-full px-3.5 py-2 text-sm bg-[#FBF7F0] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#722F37] font-serif-vintage"
            />
          </div>

          {/* E. Mood & Suspicious Easter Egg */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-serif-vintage font-semibold text-[#3E2723] uppercase tracking-wide">
                E. Current Mood
              </label>
              {isSuspiciousMood && (
                <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-handwriting animate-pulse">
                  Hmm. Suspicious. 👀
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOODS.map((item) => {
                const moodStr = `${item.emoji} ${item.label}`;
                const isSelected = mood === moodStr;
                return (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => setMood(moodStr)}
                    className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#F3D8D6] border-[#722F37] text-[#722F37] font-semibold shadow-xs'
                        : 'bg-[#FBF7F0] border-[#EADBCC] text-[#6D5B57] hover:bg-[#F5EFEB]'
                    }`}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-xs font-serif-vintage truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* F. How serious is it? */}
          <div>
            <label className="block text-xs font-serif-vintage font-semibold text-[#3E2723] uppercase tracking-wide mb-1.5">
              F. “Okay… how much trouble am I in? 😭”
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SEVERITY_LEVELS.map((level) => {
                const isSelected = seriousness === level.label;
                return (
                  <button
                    type="button"
                    key={level.label}
                    onClick={() => setSeriousness(level.label)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-[#EBF0E9] border-[#8A9A86] text-[#4A5D46] shadow-xs'
                        : 'bg-[#FBF7F0] border-[#EADBCC] text-[#6D5B57] hover:bg-[#F5EFEB]'
                    }`}
                  >
                    <p className="text-xs font-serif-vintage font-bold text-[#3E2723]">{level.label}</p>
                    <p className="text-[11px] font-serif-vintage text-[#6D5B57] mt-0.5">{level.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* G. Optional photo attachment */}
          <div>
            <label className="block text-xs font-serif-vintage font-semibold text-[#3E2723] uppercase tracking-wide mb-1 flex items-center justify-between">
              <span>G. Optional Polaroid / Photo</span>
              <span className="text-stone-400 font-normal">Screenshot, meme, or memory</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-[#F5EFEB] hover:bg-[#EADBCC] border border-[#EADBCC] rounded-xl text-xs font-serif-vintage text-[#6D5B57] transition-all">
                <Upload className="w-4 h-4 text-[#722F37]" />
                <span>{selectedFile ? 'Change photo' : 'Attach a photo ♡'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {selectedFile && (
                <span className="text-xs font-mono text-[#6D5B57] truncate max-w-xs">
                  {selectedFile.name}
                </span>
              )}
            </div>

            {previewUrl && (
              <div className="mt-3 inline-block">
                <div className="polaroid-frame max-w-[140px] rotate-1">
                  <div className="washi-tape -top-2 left-8" />
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-24 object-cover rounded-xs border border-stone-200"
                  />
                  <p className="text-[9px] font-handwriting text-center mt-1 text-[#6D5B57]">attached</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* H. Pinned Bottom Footer Actions */}
        <div className="sticky bottom-0 z-20 bg-[#FDFBF7] border-t border-[#EADBCC] px-5 sm:px-8 py-3.5 sm:py-4 flex items-center justify-end gap-3 shrink-0 shadow-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#EADBCC] text-xs font-serif-vintage text-[#6D5B57] hover:bg-[#F5EFEB] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDelivering}
              className="px-6 py-2 rounded-xl bg-[#722F37] hover:bg-[#8C3B47] text-white text-xs sm:text-sm font-serif-vintage font-semibold transition-all shadow-md flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Put it in the box 💌</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
