
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, Settings, History, Camera, Mic, Image as ImageIcon, 
  Send, Trash2, Moon, Sun, Type, PenTool, X, Menu, GraduationCap,
  Save, Download, WifiOff
} from 'lucide-react';
import { SolverMode, MathResponse, HistoryItem } from './types';
import { solveMathProblem } from './services/geminiService';
import MathResult from './components/MathResult';
import DrawingCanvas from './components/DrawingCanvas';

const App = () => {
  // --- State ---
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SolverMode>(SolverMode.GENERAL);
  const [result, setResult] = useState<MathResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputMethod, setInputMethod] = useState<'text' | 'draw' | 'image' | 'voice'>('text');
  
  // Settings
  const [darkMode, setDarkMode] = useState(false);
  const [decimalPrecision, setDecimalPrecision] = useState(4);
  const [showDecimal, setShowDecimal] = useState(false);
  
  // Inputs
  const [drawnImage, setDrawnImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History & Sidebar
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Effects ---
  useEffect(() => {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- Handlers ---

  const handleSolve = async () => {
    if (!query && !drawnImage && !uploadedImage && inputMethod !== 'voice') return;
    
    setLoading(true);
    setResult(null);

    // Determine input image based on method
    let imageToSend: string | undefined = undefined;
    if (inputMethod === 'draw' && drawnImage) {
      imageToSend = drawnImage;
    } else if (inputMethod === 'image' && uploadedImage) {
      imageToSend = uploadedImage;
    }

    const response = await solveMathProblem(query, mode, decimalPrecision, imageToSend);
    
    setResult(response);
    setLoading(false);

    // Save to history
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      mode,
      query: query || (imageToSend ? "Image Problem" : "Voice Input"),
      result: response,
      type: inputMethod
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
      };
    } else {
      alert("Voice recognition not supported in this browser.");
    }
  };

  const clearAll = () => {
    setQuery('');
    setDrawnImage(null);
    setUploadedImage(null);
    setResult(null);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setMode(item.mode);
    setQuery(item.query);
    setResult(item.result);
    setSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-dark text-slate-900 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900`}>
      
      {/* --- Header --- */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-surface/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:hidden">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <Calculator size={20} />
            </div>
            <span className="hidden sm:inline">AstraMath AI</span>
            <span className="sm:hidden">AstraMath</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
           {/* Precision Settings */}
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
             <span className="text-xs px-2 text-gray-500 font-medium">Precision:</span>
             <select 
               value={decimalPrecision}
               onChange={(e) => setDecimalPrecision(Number(e.target.value))}
               className="bg-transparent text-sm font-semibold text-primary focus:outline-none cursor-pointer"
             >
               {[2, 4, 6, 8, 10].map(n => <option key={n} value={n}>{n}</option>)}
             </select>
          </div>

          <button 
            onClick={() => setShowDecimal(!showDecimal)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${showDecimal ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800' : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}
          >
            {showDecimal ? 'DECIMAL' : 'EXACT'}
          </button>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* --- Sidebar (History) --- */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-surface shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:w-64 border-r border-gray-200 dark:border-gray-700 pt-20 pb-6 px-4 flex flex-col`}>
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <span className="font-bold text-lg">History</span>
          <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <History size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No history yet</p>
            </div>
          ) : (
            history.map(item => (
              <div 
                key={item.id} 
                onClick={() => loadHistoryItem(item)}
                className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
              >
                <div className="flex justify-between items-start mb-1">
                   <span className="text-[10px] uppercase font-bold text-gray-400">{item.mode}</span>
                   <span className="text-[10px] text-gray-400">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-sm font-medium line-clamp-1 text-slate-700 dark:text-slate-200">{item.query}</p>
                <p className="text-xs text-gray-500 mt-1 font-mono truncate">= {showDecimal ? item.result.decimalResult : item.result.exactResult}</p>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
           <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
             <WifiOff size={12} />
             <span>Offline Capable</span>
           </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <main className="lg:ml-64 pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen flex flex-col gap-8">
        
        {/* Input Section */}
        <div className="max-w-4xl mx-auto w-full space-y-6">
          
          <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
             <div className="relative w-full md:w-64">
               <select 
                 className="w-full appearance-none bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer"
                 value={mode}
                 onChange={(e) => setMode(e.target.value as SolverMode)}
               >
                 {Object.values(SolverMode).map((m) => (
                   <option key={m} value={m}>{m}</option>
                 ))}
               </select>
               <div className="absolute right-3 top-3 pointer-events-none text-gray-400">
                 <Settings size={16} />
               </div>
             </div>
          </div>

          <div className="bg-white dark:bg-surface rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
            {/* Input Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => setInputMethod('text')}
                className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 ${inputMethod === 'text' ? 'bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <Type size={16} /> Keyboard
              </button>
              <button 
                onClick={() => setInputMethod('draw')}
                className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 ${inputMethod === 'draw' ? 'bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <PenTool size={16} /> Draw
              </button>
              <button 
                onClick={() => setInputMethod('image')}
                className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 ${inputMethod === 'image' ? 'bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <Camera size={16} /> Image
              </button>
            </div>

            <div className="p-4">
              {inputMethod === 'text' && (
                <div className="relative">
                  <textarea 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter mathematical problem..."
                    className="w-full h-32 bg-transparent text-lg resize-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    autoFocus
                  />
                  <button 
                    onClick={startVoiceInput}
                    className="absolute bottom-2 right-2 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    title="Voice Input"
                  >
                    <Mic size={18} />
                  </button>
                </div>
              )}

              {inputMethod === 'draw' && (
                <DrawingCanvas onExport={setDrawnImage} />
              )}

              {inputMethod === 'image' && (
                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer relative overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Upload" className="h-full w-full object-contain" />
                  ) : (
                    <>
                      <ImageIcon className="text-gray-400 mb-2" size={32} />
                      <span className="text-sm text-gray-500">Click to upload or snap photo</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={clearAll}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Clear"
              >
                <Trash2 size={20} />
              </button>
              
              <button 
                onClick={handleSolve}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 ${loading ? 'bg-blue-400 cursor-wait' : 'bg-primary hover:bg-blue-600 hover:shadow-blue-600/40'}`}
              >
                {loading ? (
                   <>Processing...</>
                ) : (
                   <>Solve <Send size={18} /></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* --- Result Area --- */}
        {loading && (
           <div className="w-full max-w-4xl mx-auto space-y-4 animate-pulse">
             <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full"></div>
             <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full"></div>
           </div>
        )}

        {!loading && result && (
           <MathResult 
             data={result} 
             showDecimal={showDecimal} 
             decimalPrecision={decimalPrecision} 
           />
        )}
        
        {/* Empty State / Intro */}
        {!loading && !result && history.length === 0 && (
          <div className="text-center mt-10 opacity-60">
            <GraduationCap size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-400">Your Personal AI Math Tutor</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto mt-2">
              Select a mode, type a problem, draw an equation, or snap a photo to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;