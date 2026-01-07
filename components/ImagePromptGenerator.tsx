
import React, { useState } from 'react';
import { generateImagePrompt } from '../geminiService';
import { BrandContext, ImagePrompt } from '../types';
import { CopyIcon } from './Icons';

interface Props {
  brand: BrandContext;
  onSave: (item: any) => void;
}

const ImagePromptGenerator: React.FC<Props> = ({ brand, onSave }) => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<ImagePrompt | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const output = await generateImagePrompt(brand, topic);
      setResult(output);
      onSave({ type: 'prompt', content: JSON.stringify(output) });
    } catch (e) {
      alert("Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-xs text-slate-500">Describe what you want an image of (e.g. "a carpenter working in his shop"). We'll give you a professional prompt for designers or AI tools.</p>
        <input 
          className="w-full border rounded-lg p-3"
          placeholder="Topic for image..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
        />
        <button 
          onClick={handleGenerate}
          disabled={loading || !topic}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? 'Creating Prompt...' : 'Generate Image Prompt'}
        </button>
      </div>

      {result && (
        <div className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs font-mono overflow-auto border-2 border-slate-800 shadow-xl">
          <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
            <span className="text-slate-400">STRUCTURED_PROMPT.JSON</span>
            <button onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(result, null, 2));
              alert("JSON Copied!");
            }} className="text-blue-400 flex items-center gap-1 uppercase">
              <CopyIcon className="w-3 h-3" /> Copy JSON
            </button>
          </div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ImagePromptGenerator;
