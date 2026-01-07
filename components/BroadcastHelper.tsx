
import React, { useState } from 'react';
import { generateBroadcast } from '../geminiService';
import { BrandContext } from '../types';
import { CopyIcon } from './Icons';

interface Props {
  brand: BrandContext;
  onSave: (item: any) => void;
}

const BroadcastHelper: React.FC<Props> = ({ brand, onSave }) => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const output = await generateBroadcast(brand);
      if (output) {
        setResult(output);
        onSave({ type: 'broadcast', content: output });
      }
    } catch (e) {
      alert("Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <p className="text-slate-500 text-sm">Get a short message to keep your customers engaged today.</p>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? 'Writing...' : 'Give me a Broadcast Message'}
        </button>
      </div>

      {result && (
        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm relative">
          <div className="absolute top-4 right-4">
            <button onClick={() => {
              navigator.clipboard.writeText(result);
              alert("Copied!");
            }} className="p-2 bg-white rounded-full shadow-md text-blue-600">
              <CopyIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap pr-8">{result}</p>
        </div>
      )}
    </div>
  );
};

export default BroadcastHelper;
