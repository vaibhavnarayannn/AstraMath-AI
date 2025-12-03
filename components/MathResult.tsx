
import React, { useState } from 'react';
import { MathResponse } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Copy, ChevronDown, ChevronUp, Lightbulb, CheckCircle2, Share2, AlignCenter } from 'lucide-react';

interface Props {
  data: MathResponse;
  showDecimal: boolean;
  decimalPrecision: number;
}

const MathResult: React.FC<Props> = ({ data, showDecimal, decimalPrecision }) => {
  const [stepsOpen, setStepsOpen] = useState(true);

  // Simple formatter to make LaTeX strings look slightly better without a full MathJax library
  const formatLatex = (str: string) => {
    if (!str) return '';
    return str
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
      .replace(/\\pi/g, 'π')
      .replace(/\\cdot/g, '•')
      .replace(/\\times/g, '×')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/_/g, '')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\$/g, ''); // Remove inline LaTeX delimiters
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const hasGraph = data.graphData && data.graphData.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* Primary Result Card */}
      <div className="bg-white dark:bg-surface rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 md:p-8 relative">
           {/* Header Actions */}
           <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={() => copyToClipboard(showDecimal ? data.decimalResult : data.exactResult)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                title="Copy Result"
              >
                <Copy size={18} />
              </button>
           </div>

          <div className="mb-6">
            {/* Standard Form Display */}
            {data.standardForm && (
              <div className="mb-4 inline-block bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-lg border border-orange-100 dark:border-orange-800/30">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">
                  <AlignCenter size={12} /> Standard Form
                </div>
                <div className="text-xl font-medium text-slate-800 dark:text-slate-200 font-serif">
                  {formatLatex(data.standardForm)}
                </div>
              </div>
            )}

            <h2 className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Final Answer</h2>
            <div className="text-3xl md:text-5xl font-bold text-primary dark:text-blue-400 break-words font-mono mt-2">
              {showDecimal ? data.decimalResult : formatLatex(data.exactResult)}
            </div>
            
            {/* Toggle Comparison */}
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
               <span className="font-semibold">{showDecimal ? 'Exact:' : 'Approx:'}</span>
               <span className="font-mono">{showDecimal ? formatLatex(data.exactResult) : data.decimalResult}</span>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-blue-500 mt-0.5 shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 text-sm mb-1">Teacher's Note</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                  {data.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Visualization */}
      {hasGraph && (
        <div className="bg-white dark:bg-surface rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
              <Share2 size={18} className="text-purple-500" />
              Graph Visualization
            </h3>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500">
              {data.graphLabel || 'f(x)'}
            </span>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.graphData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis 
                  dataKey="x" 
                  type="number" 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#94a3b8', opacity: 0.5 }}
                  domain={['auto', 'auto']}
                />
                <YAxis 
                  dataKey="y" 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#94a3b8', opacity: 0.5 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#60a5fa' }}
                  formatter={(val: number) => val.toFixed(2)}
                  labelFormatter={(label) => `x: ${Number(label).toFixed(2)}`}
                />
                <ReferenceLine y={0} stroke="#94a3b8" opacity={0.5} />
                <ReferenceLine x={0} stroke="#94a3b8" opacity={0.5} />
                <Line 
                  type="monotone" 
                  dataKey="y" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#8b5cf6' }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Step-by-Step Solution */}
      <div className="bg-white dark:bg-surface rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <button 
          onClick={() => setStepsOpen(!stepsOpen)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-lg font-semibold dark:text-white">Step-by-Step Solution</h3>
          </div>
          {stepsOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
        </button>

        {stepsOpen && (
          <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-700/50 mt-4">
            <div className="space-y-0">
              {data.steps.map((step, idx) => (
                <div key={idx} className="relative pl-8 pb-8 last:pb-0 group">
                  {/* Vertical Connector Line */}
                  {idx !== data.steps.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors"></div>
                  )}
                  
                  {/* Step Number Badge */}
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-white dark:bg-surface border-2 border-primary text-primary flex items-center justify-center text-xs font-bold shadow-sm z-10 group-hover:bg-primary group-hover:text-white transition-colors">
                    {idx + 1}
                  </div>

                  {/* Content Card */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all hover:bg-white dark:hover:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-800">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-base font-medium">
                       {formatLatex(step)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathResult;