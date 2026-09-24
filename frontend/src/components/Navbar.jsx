import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AudioPlayer from './AudioPlayer';
import NotificationModal from './NotificationModal';
import { Heart, Feather, BookOpen, Sparkles, LogOut, ArrowLeftRight } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenCreateModal, onSelectComplaint }) {
  const { user, logout, quickLogin } = useAuth();
  const [easterEggActive, setEasterEggActive] = useState(false);

  const handleHeartClick = () => {
    setEasterEggActive(true);
    setTimeout(() => setEasterEggActive(false), 3000);
  };

  const handleSwitchSide = async () => {
    const targetRole = user.role === 'GIRLFRIEND' ? 'BOYFRIEND' : 'GIRLFRIEND';
    try {
      await quickLogin(targetRole);
      setActiveTab('notes');
    } catch (err) {
      console.error('Failed to switch side:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF7F0]/95 backdrop-blur-md border-b border-[#EADBCC] shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div 
            onClick={handleHeartClick}
            className="wax-seal w-9 h-9 sm:w-10 sm:h-10 text-white cursor-pointer select-none"
            title="Click the wax seal ♡"
          >
            <span className="text-sm">♡</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-display font-bold text-lg sm:text-xl text-[#722F37] tracking-wide leading-tight">
                Our Little Complaint Box
              </h1>
              {easterEggActive && (
                <span className="text-xs bg-[#F3D8D6] text-[#722F37] px-2 py-0.5 rounded-full font-handwriting animate-bounce">
                  I knew you'd click that ♡
                </span>
              )}
            </div>
            <p className="text-[11px] font-handwriting text-[#6D5B57] -mt-0.5 hidden sm:block">
              {user.role === 'GIRLFRIEND' ? "Her safe space to be heard & cherished" : "Boyfriend's loving duty to listen & fix"}
            </p>
          </div>
        </div>

        {/* Center / Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F5EFEB]/80 p-1 rounded-full border border-[#EADBCC]">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-serif-vintage font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'bg-[#FDFBF7] text-[#722F37] shadow-xs font-semibold'
                : 'text-[#6D5B57] hover:text-[#3E2723]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {user.role === 'GIRLFRIEND' ? 'My Notes' : 'Her Notes'}
          </button>

          {user.role === 'GIRLFRIEND' && (
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-1.5 rounded-full text-xs font-serif-vintage font-medium transition-all flex items-center gap-1.5 bg-[#722F37] text-white hover:bg-[#8C3B47] shadow-xs"
            >
              <Feather className="w-3.5 h-3.5" />
              Write Note ♡
            </button>
          )}

          <button
            onClick={() => setActiveTab('fixed')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-serif-vintage font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'fixed'
                ? 'bg-[#FDFBF7] text-[#722F37] shadow-xs font-semibold'
                : 'text-[#6D5B57] hover:text-[#3E2723]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Things We Fixed
          </button>

          <button
            onClick={() => setActiveTab('corner')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-serif-vintage font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'corner'
                ? 'bg-[#FDFBF7] text-[#722F37] shadow-xs font-semibold'
                : 'text-[#6D5B57] hover:text-[#3E2723]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            Our Little Corner
          </button>
        </nav>

        {/* Right side controls: Audio, Notifications, Profile pill, Switch side, Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <AudioPlayer />
          <NotificationModal onSelectComplaint={onSelectComplaint} />

          {/* Role badge with switch button */}
          <div className="flex items-center gap-1.5 pl-1.5 sm:border-l border-[#EADBCC]">
            <button
              onClick={handleSwitchSide}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EBF0E9] border border-[#CAD8C7] text-[#4A5D46] hover:bg-[#DEE7DB] text-[11px] font-serif-vintage font-medium transition-all"
              title={`Switch to ${user.role === 'GIRLFRIEND' ? 'Boyfriend Side' : 'Girlfriend Side'}`}
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Switch: {user.role === 'GIRLFRIEND' ? '♡ Him' : '🌸 Her'}</span>
            </button>

            <span className="text-xs px-2.5 py-1 rounded-full bg-[#F3D8D6] text-[#722F37] border border-[#E8C5BE] font-serif-vintage font-semibold hidden sm:inline-block">
              {user.role === 'GIRLFRIEND' ? '🌸 Her Side' : '💌 My Side'}
            </span>

            <button
              onClick={logout}
              className="p-1.5 sm:p-2 rounded-full text-[#6D5B57] hover:text-[#722F37] hover:bg-[#F5EFEB] transition-all"
              title="Close the Diary (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-[#EADBCC] bg-[#FDFBF7] py-2 px-2">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex flex-col items-center text-[10px] font-serif-vintage py-1 px-2 rounded-lg ${
            activeTab === 'notes' ? 'text-[#722F37] font-bold bg-[#F3D8D6]/40' : 'text-[#6D5B57]'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>Notes</span>
        </button>

        {user.role === 'GIRLFRIEND' && (
          <button
            onClick={onOpenCreateModal}
            className="flex flex-col items-center text-[10px] font-serif-vintage py-1 px-3 rounded-full bg-[#722F37] text-white font-bold shadow-xs -mt-3 border-2 border-white"
          >
            <Feather className="w-4 h-4 mb-0.5" />
            <span>Write ♡</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('fixed')}
          className={`flex flex-col items-center text-[10px] font-serif-vintage py-1 px-2 rounded-lg ${
            activeTab === 'fixed' ? 'text-[#722F37] font-bold bg-[#F3D8D6]/40' : 'text-[#6D5B57]'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5 text-amber-600" />
          <span>Postcards</span>
        </button>

        <button
          onClick={() => setActiveTab('corner')}
          className={`flex flex-col items-center text-[10px] font-serif-vintage py-1 px-2 rounded-lg ${
            activeTab === 'corner' ? 'text-[#722F37] font-bold bg-[#F3D8D6]/40' : 'text-[#6D5B57]'
          }`}
        >
          <Heart className="w-4 h-4 mb-0.5 text-rose-500" />
          <span>Our Corner</span>
        </button>

        <button
          onClick={handleSwitchSide}
          className="flex flex-col items-center text-[10px] font-serif-vintage py-1 px-2 text-[#4A5D46]"
        >
          <ArrowLeftRight className="w-4 h-4 mb-0.5" />
          <span>{user.role === 'GIRLFRIEND' ? 'Him' : 'Her'}</span>
        </button>
      </div>
    </header>
  );
}
