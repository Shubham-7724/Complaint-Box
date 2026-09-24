import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import GirlfriendDashboard from './components/GirlfriendDashboard';
import BoyfriendDashboard from './components/BoyfriendDashboard';
import ComplaintFormModal from './components/ComplaintFormModal';
import ComplaintDetailModal from './components/ComplaintDetailModal';
import CompletedPostcards from './components/CompletedPostcards';
import OurLittleCorner from './components/OurLittleCorner';
import { Heart } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('notes'); // 'notes', 'fixed', 'corner'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF7F0] p-4 text-[#3E2723]">
        <div className="wax-seal w-16 h-16 text-2xl animate-gentle-pulse mb-4 text-white">
          <span>♡</span>
        </div>
        <p className="font-serif-display text-xl text-[#722F37]">Opening our little world…</p>
        <p className="font-handwriting text-sm text-[#6D5B57] mt-1">Please wait a gentle moment</p>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const isGirlfriend = user.role === 'GIRLFRIEND';

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7F0] text-[#3E2723] relative selection:bg-[#E8C5BE] selection:text-[#581C24]">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onSelectComplaint={(id) => setSelectedComplaintId(id)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-12">
        {activeTab === 'notes' && (
          isGirlfriend ? (
            <GirlfriendDashboard
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onSelectComplaint={(id) => setSelectedComplaintId(id)}
              refreshTrigger={refreshKey}
            />
          ) : (
            <BoyfriendDashboard
              onSelectComplaint={(id) => setSelectedComplaintId(id)}
              refreshTrigger={refreshKey}
            />
          )
        )}

        {activeTab === 'fixed' && (
          <CompletedPostcards
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
          />
        )}

        {activeTab === 'corner' && (
          <OurLittleCorner
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
          />
        )}
      </main>

      {/* Modals */}
      <ComplaintFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={triggerRefresh}
      />

      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        isOpen={!!selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
        onRefresh={triggerRefresh}
      />

      {/* Romantic Vintage Bottom Footer */}
      <footer className="border-t border-[#EADBCC] py-6 text-center text-xs font-serif-vintage text-[#6D5B57] bg-[#FDFBF7]/60">
        <p className="flex items-center justify-center gap-1.5 font-handwriting text-sm text-[#722F37]">
          <span>Our Little Complaint Box</span>
          <span>•</span>
          <span>A private sanctuary for us</span>
          <Heart className="w-3.5 h-3.5 text-[#722F37] fill-[#722F37]" />
        </p>
        <p className="text-[11px] text-[#A29288] mt-1 font-serif-vintage">
          Made with infinite patience, understanding, and love.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
