
import React, { useState } from 'react';
import { generateOffer } from '../geminiService';
import { BrandContext } from '../types';
import { CopyIcon } from './Icons';

interface Props {
  brand: BrandContext;
  onSave: (item: any) => void;
}

const OfferGenerator: React.FC<Props> = ({ brand, onSave }) => {
  const [product, setProduct] = useState('');
  const [details, setDetails] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const output = await generateOffer(brand, product, details);
      if (output) {
        setResult(output);
        onSave({ type: 'offer', content: output, meta: { product } });
      }
    } catch (e) {
      alert("Error generating offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Product / Service Name</label>
          <input 
            className="w-full border rounded-lg p-3"
            placeholder="e.g. Diwali Dhamaka Sale"
            value={product}
            onChange={e => setProduct(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Offer Details (Optional)</label>
          <textarea 
            className="w-full border rounded-lg p-3 h-20"
            placeholder="e.g. 20% off on all items, valid till Sunday"
            value={details}
            onChange={e => setDetails(e.target.value)}
          />
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading || !product}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? 'Creating Offer...' : 'Create Offer Post'}
        </button>
      </div>

      {result && (
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Generated Content:</h3>
            <button onClick={() => {
              navigator.clipboard.writeText(result);
              alert("Copied!");
            }} className="text-blue-600 flex items-center gap-1 text-sm">
              <CopyIcon className="w-4 h-4" /> Copy All
            </button>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl whitespace-pre-wrap text-sm border">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferGenerator;
