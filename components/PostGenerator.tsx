
import React, { useState } from 'react';
import { generateTodayPost, generateImagePromptForPost } from '../geminiService';
import { BrandContext, HistoryItem, ImagePrompt } from '../types';
import { CopyIcon } from './Icons';

interface Props {
  brand: BrandContext;
  history: HistoryItem[];
  onSave: (item: any) => void;
}

const PostGenerator: React.FC<Props> = ({ brand, history, onSave }) => {
  const [result, setResult] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<ImagePrompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'caption' | 'visual'>('caption');

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setImagePrompt(null);
    try {
      const output = await generateTodayPost(brand, history);
      if (output) {
        setResult(output);
        onSave({ type: 'post', content: output });
        
        // Simultaneously generate the visual prompt for this caption
        const visual = await generateImagePromptForPost(brand, output);
        setImagePrompt(visual);
      }
    } catch (e) {
      alert("Error generating post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert("Caption copied!");
    }
  };

  const copyVisualPrompt = () => {
    if (imagePrompt) {
      navigator.clipboard.writeText(JSON.stringify(imagePrompt, null, 2));
      alert("Visual prompt JSON copied!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm">✨</div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Daily Content</h3>
        <p className="text-slate-500 mb-8 leading-relaxed font-medium">Instantly craft your caption and a matching image prompt for social media.</p>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gradient-to-br from-blue-600 to-blue-700 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Crafting Magic...</span>
            </>
          ) : (
            'Generate for Today'
          )}
        </button>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="flex bg-slate-100 p-2 rounded-2xl mb-6">
            <button 
              onClick={() => setActiveTab('caption')}
              className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'caption' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Post Caption
            </button>
            <button 
              onClick={() => setActiveTab('visual')}
              className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'visual' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Visual Idea
            </button>
          </div>

          <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-6 shadow-sm">
            {activeTab === 'caption' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Ready-to-copy Caption</span>
                  <button onClick={copyCaption} className="text-blue-600 flex items-center gap-2 text-xs font-black bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-all active:scale-95">
                    <CopyIcon className="w-4 h-4" /> Copy
                  </button>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl whitespace-pre-wrap text-base leading-relaxed text-slate-900 font-bold border-l-4 border-blue-500 shadow-inner">
                  {result}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">AI Designer Prompt</span>
                  {imagePrompt && (
                    <button onClick={copyVisualPrompt} className="text-blue-600 flex items-center gap-2 text-xs font-black bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-all active:scale-95">
                      <CopyIcon className="w-4 h-4" /> Copy JSON
                    </button>
                  )}
                </div>
                <div className="bg-slate-900 text-green-400 p-6 rounded-2xl text-[13px] font-mono overflow-auto border-4 border-slate-800 shadow-2xl min-h-[240px] flex items-center ring-4 ring-slate-900">
                  {imagePrompt ? (
                    <pre className="whitespace-pre-wrap w-full leading-relaxed">
                      {JSON.stringify(imagePrompt, null, 2)}
                    </pre>
                  ) : (
                    <div className="w-full text-center py-10 space-y-4">
                      <div className="w-10 h-10 border-3 border-green-400/20 border-t-green-400 rounded-full animate-spin mx-auto"></div>
                      <p className="text-slate-500 font-sans italic font-medium">Designing the perfect visual...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-300 mt-10 text-center font-black uppercase tracking-[0.3em] opacity-40">Intelligence by Gemini</p>
        </div>
      )}
    </div>
  );
};

export default PostGenerator;
