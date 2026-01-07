
import React, { useState } from 'react';
import { generateMonthlyPlan } from '../geminiService';
import { BrandContext, MonthlyPlanItem } from '../types';

interface Props {
  brand: BrandContext;
}

const MonthlyPlanner: React.FC<Props> = ({ brand }) => {
  const [plan, setPlan] = useState<MonthlyPlanItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const output = await generateMonthlyPlan(brand);
      setPlan(output);
    } catch (e) {
      alert("Error generating plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-100 p-4 rounded-xl">
        <h3 className="font-bold text-slate-800">Monthly Content Outline</h3>
        <p className="text-xs text-slate-500 mt-1">Generate a calendar of what to post. We only suggest topics to save tokens.</p>
        {!plan.length && (
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? 'Planning...' : 'Generate 30-Day Plan'}
          </button>
        )}
      </div>

      {plan.length > 0 && (
        <div className="space-y-3">
          {plan.map((item, idx) => (
            <div key={idx} className="p-3 border rounded-xl flex gap-4 items-start bg-white shadow-sm">
              <div className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded text-xs shrink-0 w-16 text-center">
                {item.date}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">{item.type}</span>
                <p className="text-sm font-medium text-slate-800">{item.topic}</p>
              </div>
            </div>
          ))}
          <button 
            onClick={() => setPlan([])}
            className="w-full text-center py-4 text-xs text-slate-400 underline"
          >
            Clear and generate again
          </button>
        </div>
      )}
    </div>
  );
};

export default MonthlyPlanner;
