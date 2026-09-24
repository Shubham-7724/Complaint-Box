import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Lock, KeyRound, Sparkles, Feather } from 'lucide-react';

export default function LandingPage() {
  const { login, quickLogin, error: authError } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null); // 'GIRLFRIEND' or 'BOYFRIEND'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [waxSealMessage, setWaxSealMessage] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setUsername(role === 'GIRLFRIEND' ? 'girlfriend' : 'boyfriend');
    setPassword('love123'); // Preset default for easy access
    setErrorMsg('');
  };

  const handleWaxSealClick = () => {
    setWaxSealMessage('Sealed with love. 💌');
    setTimeout(() => setWaxSealMessage(''), 3500);
  };

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both your name/key to open the box ♡');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await login(username, password);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid key for our little box ♡');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantEnter = async (role) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await quickLogin(role);
    } catch (err) {
      setErrorMsg(err.message || 'Could not enter right now ♡');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#FBF7F0] relative overflow-hidden">
      {/* Decorative Vintage Ambient Background Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#D8A49B]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-[#8A9A86]/10 blur-3xl pointer-events-none" />

      {/* Main Vintage Envelope Card */}
      <div className="relative w-full max-w-xl bg-[#FDFBF7] border border-[#EADBCC] rounded-3xl p-6 sm:p-10 shadow-2xl transition-all">
        {/* Postmark stamp in corner */}
        <div className="absolute top-5 right-5 sm:top-7 sm:right-7 border-2 border-dashed border-[#D8A49B] rounded-lg p-2 text-center rotate-3 opacity-80 pointer-events-none">
          <p className="text-[9px] font-mono tracking-widest text-[#722F37] uppercase">COUPLE POST</p>
          <p className="text-[8px] font-mono text-[#6D5B57]">PARCEL NO. 143</p>
          <p className="text-xs">💌</p>
        </div>

        {/* Vintage Top Tag */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 bg-[#F5EFEB] border border-[#E8DCCF] rounded-full text-xs font-serif-vintage tracking-wider text-[#722F37]">
            EST. FOR TWO HEARTS ♡
          </span>
        </div>

        {/* Main Title & Subtitle */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#722F37] tracking-tight">
            Our Little Complaint Box
          </h1>
          <p className="font-serif-vintage text-base sm:text-lg text-[#6D5B57] max-w-md mx-auto leading-relaxed italic">
            “For the things you want to say,<br />
            the things you wish I'd notice,<br />
            and the things you don't know how to ask for. ♡”
          </p>
        </div>

        {/* Center Wax Seal with Interactive Easter Egg */}
        <div className="flex flex-col items-center justify-center my-6">
          <div 
            onClick={handleWaxSealClick}
            className="wax-seal w-16 h-16 sm:w-20 sm:h-20 shadow-lg text-white text-2xl sm:text-3xl"
            title="Click to inspect the wax seal"
          >
            <span>♡</span>
          </div>
          {waxSealMessage ? (
            <p className="font-handwriting text-sm text-[#722F37] mt-2.5 animate-bounce">
              {waxSealMessage}
            </p>
          ) : (
            <p className="text-[11px] font-serif-vintage text-[#A29288] mt-2 tracking-wide uppercase">
              Sealed with love & trust
            </p>
          )}
        </div>

        {/* Enter Our Little World Header */}
        <div className="text-center mb-6">
          <h2 className="font-serif-display text-lg text-[#3E2723] font-semibold flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-[#EADBCC]" />
            Enter our little world
            <span className="h-px w-8 bg-[#EADBCC]" />
          </h2>
          <p className="text-xs text-[#6D5B57] font-serif-vintage mt-1">
            Choose your side to open your personal diary
          </p>
        </div>

        {/* Two Main Role Doors */}
        {!selectedRole ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            {/* Her Side */}
            <button
              onClick={() => handleRoleSelect('GIRLFRIEND')}
              className="group relative p-5 bg-[#FBF7F0] hover:bg-[#F3D8D6]/40 border border-[#EADBCC] hover:border-[#D8A49B] rounded-2xl text-left transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl p-2 rounded-xl bg-white/80 border border-[#EADBCC]">🌸</span>
                <span className="text-xs font-handwriting text-[#722F37] group-hover:translate-x-1 transition-transform">
                  open diary →
                </span>
              </div>
              <div>
                <h3 className="font-serif-display text-lg font-bold text-[#722F37] mb-1">
                  ♡ Her Side
                </h3>
                <p className="text-xs text-[#6D5B57] font-serif-vintage leading-relaxed">
                  Leave notes, hints, requests, or just vent when you feel unheard.
                </p>
              </div>
            </button>

            {/* My Side */}
            <button
              onClick={() => handleRoleSelect('BOYFRIEND')}
              className="group relative p-5 bg-[#FBF7F0] hover:bg-[#EBF0E9]/70 border border-[#EADBCC] hover:border-[#8A9A86] rounded-2xl text-left transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl p-2 rounded-xl bg-white/80 border border-[#EADBCC]">💌</span>
                <span className="text-xs font-handwriting text-[#4A5D46] group-hover:translate-x-1 transition-transform">
                  open board →
                </span>
              </div>
              <div>
                <h3 className="font-serif-display text-lg font-bold text-[#3E2723] mb-1">
                  ♡ My Side
                </h3>
                <p className="text-xs text-[#6D5B57] font-serif-vintage leading-relaxed">
                  Read her notes, send gentle replies, and mark things you solved.
                </p>
              </div>
            </button>
          </div>
        ) : (
          /* Login Card Form */
          <div className="bg-[#FBF7F0] border border-[#EADBCC] rounded-2xl p-5 sm:p-6 mb-4">
            <div className="flex items-center justify-between border-b border-[#EADBCC] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedRole === 'GIRLFRIEND' ? '🌸' : '💌'}</span>
                <div>
                  <h3 className="font-serif-display text-base font-bold text-[#722F37]">
                    {selectedRole === 'GIRLFRIEND' ? 'Entering Her Diary' : "Entering Boyfriend's Board"}
                  </h3>
                  <p className="text-[11px] text-[#6D5B57] font-serif-vintage">
                    Secure, private credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-xs text-[#6D5B57] hover:text-[#722F37] underline font-serif-vintage"
              >
                Change side
              </button>
            </div>

            <form onSubmit={handleCustomLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-serif-vintage text-[#3E2723] mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#FDFBF7] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#722F37] font-serif-vintage"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-serif-vintage text-[#3E2723] mb-1">
                  Secret Key (Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#FDFBF7] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#722F37] font-serif-vintage"
                  required
                />
              </div>

              {(errorMsg || authError) && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-serif-vintage text-center">
                  {errorMsg || authError}
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-[#722F37] hover:bg-[#8C3B47] text-white rounded-xl font-serif-vintage text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  {isSubmitting ? 'Opening box…' : 'Unlock With Password'}
                </button>

                <button
                  type="button"
                  onClick={() => handleInstantEnter(selectedRole)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto py-2.5 px-4 bg-[#F5EFEB] hover:bg-[#E8DCCF] text-[#722F37] border border-[#EADBCC] rounded-xl font-serif-vintage text-xs font-medium transition-all"
                  title="Quick 1-Click Access for Couple"
                >
                  1-Click Enter ✨
                </button>
              </div>

              <p className="text-[11px] text-center text-[#A29288] font-handwriting pt-1">
                (Pre-seeded default password is <code className="bg-[#EADBCC]/50 px-1 py-0.5 rounded">love123</code>)
              </p>
            </form>
          </div>
        )}

        {/* Vintage Bottom Romantic Footer */}
        <div className="text-center pt-4 border-t border-[#EADBCC]/60">
          <p className="font-handwriting text-sm text-[#722F37] flex items-center justify-center gap-1.5">
            <span>A private haven made with</span>
            <Heart className="w-3.5 h-3.5 fill-[#722F37] text-[#722F37] inline animate-pulse" />
            <span>for our favorite memories.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
