
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AnalysisState, Business, AnalysisReport } from './types';
import { GeminiService } from './services/geminiService';
import BusinessCard from './components/BusinessCard';
import AnalysisView from './components/AnalysisView';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState<AnalysisState>(AnalysisState.IDLE);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [currentReport, setCurrentReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latLng, setLatLng] = useState<{ latitude: number, longitude: number } | undefined>();

  const gemini = useMemo(() => new GeminiService(), []);

  useEffect(() => {
    // Check for API Key selection
    const checkKey = async () => {
      // @ts-ignore
      const ok = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(ok);
    };
    checkKey();

    // Try to get geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLatLng({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      }, null, { enableHighAccuracy: true });
    }
  }, []);

  const handleOpenKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasApiKey(true); // Assume success after interaction as per guidelines
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry || !location) return;

    setState(AnalysisState.SEARCHING);
    setError(null);
    setBusinesses([]);

    try {
      const { businesses } = await gemini.findBusinesses(industry, location, latLng);
      setBusinesses(businesses);
      if (businesses.length === 0) setError("No businesses with poor reviews found.");
    } catch (err: any) {
      if (err.message?.includes("entity was not found")) {
        setHasApiKey(false);
        setError("API Key session expired. Please re-select your key.");
      } else {
        setError("Search failed. Please try a different location or industry.");
      }
    } finally {
      setState(AnalysisState.IDLE);
    }
  };

  const handleAnalyze = async (business: Business) => {
    setState(AnalysisState.ANALYZING);
    setSelectedBusiness(business);
    try {
      const report = await gemini.analyzeBusiness(business);
      setCurrentReport(report);
    } catch (err) {
      setError("Analysis failed. Try again in a few moments.");
    } finally {
      setState(AnalysisState.IDLE);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl text-center">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Unlock Pro Analysis</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">To use high-fidelity image and video generation, you must select a paid API key from a project with billing enabled.</p>
          <button 
            onClick={handleOpenKey}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mb-4"
          >
            Select API Key
          </button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-sm text-indigo-600 font-medium hover:underline">Learn about billing</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setBusinesses([]); setCurrentReport(null); }}>
            <div className="bg-indigo-600 p-2 rounded-lg"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tighter uppercase">THE BIZ-NIZ <span className="text-indigo-600">PRO</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded uppercase tracking-wider">Live Maps Active</span>
            <button onClick={handleOpenKey} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!currentReport ? (
          <>
            <div className="max-w-2xl mx-auto text-center mb-12">
               <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Turnaround Strategy Engine</h2>
               <p className="text-slate-500 text-lg">Locate struggling businesses using Google Maps and generate high-fidelity visual turnaround reports.</p>
            </div>
            
            <div className="max-w-4xl mx-auto mb-16">
              <form onSubmit={handleSearch} className="bg-white p-3 rounded-3xl shadow-xl border border-slate-100 flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" placeholder="e.g. Sushi Restaurant" value={industry} onChange={e => setIndustry(e.target.value)}
                  className="flex-1 px-5 py-4 focus:outline-none text-slate-800"
                />
                <input 
                  type="text" placeholder="City or District" value={location} onChange={e => setLocation(e.target.value)}
                  className="flex-1 px-5 py-4 border-l border-slate-100 focus:outline-none text-slate-800"
                />
                <button type="submit" disabled={state === AnalysisState.SEARCHING} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-50">
                  {state === AnalysisState.SEARCHING ? 'Finding Targets...' : 'Scan Area'}
                </button>
              </form>
            </div>

            {error && <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-center font-medium">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businesses.map(biz => (
                <BusinessCard key={biz.id} business={biz} onAnalyze={handleAnalyze} isAnalyzing={state === AnalysisState.ANALYZING && selectedBusiness?.id === biz.id} />
              ))}
            </div>
          </>
        ) : (
          <AnalysisView 
            business={selectedBusiness!} 
            report={currentReport} 
            gemini={gemini} 
            onBack={() => { setCurrentReport(null); setSelectedBusiness(null); }} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
