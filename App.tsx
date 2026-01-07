
import React, { useState, useEffect } from 'react';
import { BrandContext, HistoryItem } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import PostGenerator from './components/PostGenerator';
import OfferGenerator from './components/OfferGenerator';
import ReplyAssistant from './components/ReplyAssistant';
import BroadcastHelper from './components/BroadcastHelper';
import ImagePromptGenerator from './components/ImagePromptGenerator';
import { 
  saveUserProfile, 
  getUserProfile, 
  addHistoryToCloud, 
  getHistoryFromCloud 
} from './firebase';
import { 
  HomeIcon, 
  HistoryIcon, 
  SettingsIcon,
  ChevronLeftIcon
} from './components/Icons';

const App: React.FC = () => {
  const [brand, setBrand] = useState<BrandContext | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [view, setView] = useState<'dashboard' | 'post' | 'offer' | 'reply' | 'broadcast' | 'prompt' | 'history' | 'settings'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        const cloudBrand = await getUserProfile();
        if (cloudBrand) setBrand(cloudBrand);
        
        const cloudHistory = await getHistoryFromCloud();
        setHistory(cloudHistory);
      } catch (e) {
        console.error("Initialization failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const handleSaveBrand = async (newBrand: BrandContext) => {
    setIsSyncing(true);
    setBrand(newBrand);
    await saveUserProfile(newBrand);
    setIsSyncing(false);
    setView('dashboard');
  };

  const addToHistory = async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    setIsSyncing(true);
    const newId = await addHistoryToCloud(item);
    const newItem: HistoryItem = {
      ...item,
      id: newId,
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));
    setIsSyncing(false);
  };

  const exportToCSV = () => {
    if (history.length === 0) return;
    const headers = ["ID", "Date", "Time", "Type", "Content"];
    const rows = history.map(item => {
      const d = new Date(item.timestamp);
      const cleanContent = `"${item.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      return [item.id, d.toLocaleDateString(), d.toLocaleTimeString(), item.type, cleanContent].join(",");
    });
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `MCCIA_Socials_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Syncing Cloud</p>
    </div>
  );

  if (!brand) return <Onboarding onSave={handleSaveBrand} />;

  const renderView = () => {
    switch (view) {
      case 'post': return <PostGenerator brand={brand} history={history} onSave={addToHistory} />;
      case 'offer': return <OfferGenerator brand={brand} onSave={addToHistory} />;
      case 'reply': return <ReplyAssistant brand={brand} onSave={addToHistory} />;
      case 'broadcast': return <BroadcastHelper brand={brand} onSave={addToHistory} />;
      case 'prompt': return <ImagePromptGenerator brand={brand} onSave={addToHistory} />;
      case 'history': return <HistoryView history={history} onExport={exportToCSV} />;
      case 'settings': return <Onboarding onSave={handleSaveBrand} initialData={brand} onCancel={() => setView('dashboard')} />;
      default: return <Dashboard setView={setView} brand={brand} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white pb-24 shadow-2xl border-x border-slate-100">
      <header className="px-6 py-5 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-30 border-b border-slate-100/50">
        <div className="flex items-center gap-4">
          {view !== 'dashboard' && (
            <button onClick={() => setView('dashboard')} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-all active:scale-90">
              <ChevronLeftIcon className="w-5 h-5 text-slate-800" />
            </button>
          )}
          <div>
            <h1 className="font-black text-xl tracking-tighter text-blue-600 leading-none">MCCIA</h1>
            <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">Socials</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isSyncing && <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>}
          <button onClick={() => setView('settings')} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
            <SettingsIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">{renderView()}</main>
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 flex justify-around py-5 z-30 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1.5 ${view === 'dashboard' ? 'text-blue-600' : 'text-slate-300'}`}>
          <HomeIcon className={`w-6 h-6 transition-transform ${view === 'dashboard' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
        </button>
        <button onClick={() => setView('history')} className={`flex flex-col items-center gap-1.5 ${view === 'history' ? 'text-blue-600' : 'text-slate-300'}`}>
          <HistoryIcon className={`w-6 h-6 transition-transform ${view === 'history' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">History</span>
        </button>
      </nav>
    </div>
  );
};

const HistoryView: React.FC<{ history: HistoryItem[], onExport: () => void }> = ({ history, onExport }) => (
  <div className="space-y-6 animate-slide-up">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Activity</h2>
        <p className="text-sm font-medium text-slate-400">Cloud-synced history</p>
      </div>
      {history.length > 0 && (
        <button onClick={onExport} className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-xs font-black shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center gap-2">
          Export CSV
        </button>
      )}
    </div>
    {history.length === 0 ? (
      <div className="text-center py-24 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
        <div className="text-5xl mb-4 opacity-10">📁</div>
        <p className="text-slate-400 font-bold italic">No history yet.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {history.map(item => (
          <div key={item.id} className="p-6 border border-slate-100 rounded-[2rem] bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] uppercase font-black bg-blue-50 text-blue-600 ring-1 ring-blue-100">{item.type}</span>
              <span className="text-[10px] font-bold text-slate-300 tracking-tighter uppercase">{new Date(item.timestamp).toLocaleDateString()}</span>
            </div>
            <p className="text-[15px] text-slate-700 whitespace-pre-wrap line-clamp-4 font-bold leading-relaxed">{item.content}</p>
            <div className="mt-5 flex justify-end">
              <button onClick={() => { navigator.clipboard.writeText(item.content); alert("Copied!"); }} className="text-xs font-black text-blue-600 hover:underline">Copy Again</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default App;
