
import React, { useState } from 'react';
import { generateReply } from '../geminiService';
import { BrandContext } from '../types';
import { CopyIcon, WhatsAppIcon } from './Icons';

interface Props {
  brand: BrandContext;
  onSave: (item: any) => void;
}

const ReplyAssistant: React.FC<Props> = ({ brand, onSave }) => {
  const [msg, setMsg] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!msg) return;
    setLoading(true);
    try {
      const output = await generateReply(brand, msg);
      if (output) {
        setResult(output);
        onSave({ type: 'reply', content: output });
      }
    } catch (e) {
      alert("Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex gap-3">
        <WhatsAppIcon className="w-6 h-6 text-green-600 shrink-0" />
        <p className="text-xs text-green-800">Paste the customer message below to get a polite response.</p>
      </div>

      <textarea 
        className="w-full border rounded-lg p-3 h-32 text-sm"
        placeholder="Paste customer message here..."
        value={msg}
        onChange={e => setMsg(e.target.value)}
      />

      <button 
        onClick={handleGenerate}
        disabled={loading || !msg}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
      >
        {loading ? 'Drafting...' : 'Generate Reply'}
      </button>

      {result && (
        <div className="animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm">Suggested Reply:</h3>
            <button onClick={() => {
              navigator.clipboard.writeText(result);
              alert("Copied!");
            }} className="text-blue-600 flex items-center gap-1 text-xs">
              <CopyIcon className="w-4 h-4" /> Copy
            </button>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl text-sm border italic">
            "{result}"
          </div>
        </div>
      )}
    </div>
  );
};

export default ReplyAssistant;
