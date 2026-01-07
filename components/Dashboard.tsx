
import React from 'react';
import { BrandContext } from '../types';

interface Props {
  setView: (view: any) => void;
  brand: BrandContext;
}

const Dashboard: React.FC<Props> = ({ setView, brand }) => {
  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-200/50">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Business Dashboard</p>
          <h2 className="text-2xl font-extrabold tracking-tight">{brand.businessName}</h2>
          <p className="text-sm opacity-90 mt-2 font-medium">Ready to boost your presence in {brand.city || 'your city'}?</p>
        </div>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-400/20 rounded-full blur-xl"></div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Daily Tools</h3>
        <div className="grid grid-cols-1 gap-4">
          <ActionButton 
            title="Today's Post" 
            desc="Caption + Matching Visual Visual Prompt"
            icon="✨"
            color="bg-purple-50"
            iconColor="text-purple-600"
            onClick={() => setView('post')}
          />
          <ActionButton 
            title="Offer Post" 
            desc="Promote a product or seasonal discount"
            icon="🏷️"
            color="bg-orange-50"
            iconColor="text-orange-600"
            onClick={() => setView('offer')}
          />
          <ActionButton 
            title="Reply Assistant" 
            desc="Professional replies to customer queries"
            icon="💬"
            color="bg-green-50"
            iconColor="text-green-600"
            onClick={() => setView('reply')}
          />
          <ActionButton 
            title="Broadcast Message" 
            desc="Engagement-focused mass messages"
            icon="📢"
            color="bg-blue-50"
            iconColor="text-blue-600"
            onClick={() => setView('broadcast')}
          />
          <ActionButton 
            title="Image Designer" 
            desc="Structured prompts for visual ideas"
            icon="🎨"
            color="bg-pink-50"
            iconColor="text-pink-600"
            onClick={() => setView('prompt')}
          />
        </div>
      </div>
      
      <div className="mt-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-center">
        <p className="text-xs font-bold text-slate-500 italic">"Good content isn't about what you sell, it's about the value you create."</p>
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ 
  title: string, 
  desc: string, 
  icon: string, 
  color: string, 
  iconColor: string, 
  onClick: () => void 
}> = ({ title, desc, icon, color, iconColor, onClick }) => (
  <button 
    onClick={onClick}
    className="group flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all text-left bg-white active:scale-[0.98] duration-200"
  >
    <div className={`text-2xl ${color} ${iconColor} w-14 h-14 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-xs text-slate-500 font-medium leading-tight">{desc}</p>
    </div>
    <div className="text-slate-300 group-hover:text-blue-400 transition-colors pr-2">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
);

export default Dashboard;
