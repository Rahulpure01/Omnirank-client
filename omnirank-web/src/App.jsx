import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InteractiveShowcase from './components/InteractiveShowcase';
import WhatsIncluded from './components/WhatsIncluded';
import WeeklyReport from './components/WeeklyReport';
import Footer from './components/Footer';
import LiveAuditModal from './components/LiveAuditModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState({
    url: '',
    keyword: '',
  });

  const handleRunAudit = (url, keyword) => {
    setModalInitial({ url, keyword });
    setIsModalOpen(true);
  };

  const handleOpenAuditModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 selection:bg-purple-100 selection:text-purple-900">
      <Navbar onOpenAudit={handleOpenAuditModal} />
      
      <main>
        <Hero onRunAudit={handleRunAudit} />
        <InteractiveShowcase />
        <WhatsIncluded />
        <WeeklyReport />
      </main>

      <Footer />

      {/* Live Working Backend Audit Modal */}
      <LiveAuditModal
        key={`${modalInitial.url}-${modalInitial.keyword}-${isModalOpen}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialUrl={modalInitial.url}
        initialKeyword={modalInitial.keyword}
      />
    </div>
  );
}

export default App;
