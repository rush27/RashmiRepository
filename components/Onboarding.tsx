
import React, { useState } from 'react';
import { BrandContext } from '../types';
import { saveManualFirebaseConfig } from '../firebase';

interface Props {
  onSave: (brand: BrandContext) => void;
  initialData?: BrandContext;
  onCancel?: () => void;
}

const Onboarding: React.FC<Props> = ({ onSave, initialData, onCancel }) => {
  const [formData, setFormData] = useState<BrandContext>(initialData || {
    businessName: '',
    category: '',
    city: '',
    language: 'English',
    tone: 'Friendly',
    businessDescription: '',
    apiKey: '',
    firebaseConfigJSON: localStorage.getItem('mccia_firebase_config_manual') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.category || !formData.city) {
      alert("Please fill in all required fields.");
      return;
    }

    // Save Firebase config if it changed
    if (formData.firebaseConfigJSON) {
      if (formData.firebaseConfigJSON !== localStorage.getItem('mccia_firebase_config_manual')) {
        saveManualFirebaseConfig(formData.firebaseConfigJSON);
        return; // Page will reload
      }
    }

    onSave(formData);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 py-12">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 p-8 sm:p-10 border border-white animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black mx-auto mb-6 shadow-xl shadow-blue-200">
            M
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Business Profile</h2>
          <p className="text-slate-500 text-base mt-2 font-medium">Let's set up your brand context</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <label className="block text-xs font-black text-blue-600 ml-1 uppercase tracking-widest">Gemini API Key</label>
            <input 
              type="password"
              className="w-full bg-white border-2 border-blue-100 rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-300 font-bold text-sm"
              placeholder="Paste your Gemini API key here..."
              value={formData.apiKey || ''}
              onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
            />
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] font-bold text-blue-500 hover:text-blue-700 underline ml-1 block mt-1"
            >
              Get a free API key from Google AI Studio
            </a>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 ml-1 uppercase tracking-widest">Business Name*</label>
            <input 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 transition-all text-slate-900 font-bold"
              placeholder="e.g. Ramesh Hardware Store"
              value={formData.businessName}
              onChange={e => setFormData({ ...formData, businessName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 ml-1 uppercase tracking-widest">Category*</label>
              <input 
                required
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 transition-all text-slate-900 font-bold text-sm"
                placeholder="Retail"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 ml-1 uppercase tracking-widest">City*</label>
              <input 
                required
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 transition-all text-slate-900 font-bold text-sm"
                placeholder="Pune"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 ml-1 uppercase tracking-widest">Description</label>
            <textarea 
              className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 transition-all text-slate-900 font-bold text-sm min-h-[80px] resize-none"
              placeholder="What products or services do you offer?"
              value={formData.businessDescription}
              onChange={e => setFormData({ ...formData, businessDescription: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 ml-1 uppercase tracking-widest">Language</label>
              <select 
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:border-blue-500"
                value={formData.language}
                onChange={e => setFormData({ ...formData, language: e.target.value as any })}
              >
                <option value="English">English</option>
                <option value="Hinglish">Hinglish</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 ml-1 uppercase tracking-widest">Tone</label>
              <select 
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:border-blue-500"
                value={formData.tone}
                onChange={e => setFormData({ ...formData, tone: e.target.value as any })}
              >
                <option value="Friendly">Friendly</option>
                <option value="Professional">Professional</option>
                <option value="Local">Local</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <details className="group">
              <summary className="text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer list-none flex items-center gap-2">
                <span className="group-open:rotate-90 transition-transform">▸</span>
                Cloud Sync (Optional)
              </summary>
              <div className="mt-4 space-y-2">
                 <p className="text-[10px] text-slate-400 leading-normal">
                   Paste the full "firebaseConfig" code block from your Firebase Console here.
                 </p>
                 <textarea 
                   className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 font-mono text-[10px] text-slate-600 outline-none focus:border-blue-500 min-h-[100px]"
                   placeholder={`const firebaseConfig = {\n  apiKey: "...",\n  projectId: "..."\n};`}
                   value={formData.firebaseConfigJSON || ''}
                   onChange={e => setFormData({ ...formData, firebaseConfigJSON: e.target.value })}
                 />
              </div>
            </details>
          </div>

          <div className="pt-2 space-y-4">
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-[1.5rem] font-black text-lg shadow-xl hover:shadow-blue-200 active:scale-95 hover:-translate-y-0.5 transition-all"
            >
              {initialData ? 'Update Profile' : 'Save & Start'}
            </button>
            {onCancel && (
              <button 
                type="button" 
                onClick={onCancel} 
                className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest"
              >
                Back
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
