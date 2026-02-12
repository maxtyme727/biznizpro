
import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { AnalysisReport, Business, AnalysisState, ImageSize, AspectRatio } from '../types';
import { GeminiService } from '../services/geminiService';

interface AnalysisViewProps {
  business: Business;
  report: AnalysisReport;
  onBack: () => void;
  gemini: GeminiService;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ business, report, onBack, gemini }) => {
  const [mediaState, setMediaState] = useState<AnalysisState>(AnalysisState.IDLE);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [videoRatio, setVideoRatio] = useState<AspectRatio>('16:9');
  const [videoStatus, setVideoStatus] = useState('');

  const radarData = report.customerSentiment.map(s => ({
    subject: s.category,
    A: s.score,
    fullMark: 100,
  }));

  const handleGenerateImage = async () => {
    setMediaState(AnalysisState.GENERATING_IMAGE);
    try {
      const img = await gemini.generateVisualReport(business.name, report.recurringThemes, imageSize);
      setGeneratedImage(img);
    } catch (e) {
      console.error(e);
    } finally {
      setMediaState(AnalysisState.IDLE);
    }
  };

  const handleGenerateVideo = async () => {
    setMediaState(AnalysisState.GENERATING_VIDEO);
    setVideoStatus('Consulting the AI strategy engine...');
    try {
      setTimeout(() => setVideoStatus('Rendering high-fidelity consultation visuals...'), 15000);
      setTimeout(() => setVideoStatus('Finalizing AI business pitch...'), 35000);
      const vid = await gemini.generateExplanationVideo(business.name, report.summary, videoRatio);
      setGeneratedVideo(vid);
    } catch (e) {
      console.error(e);
    } finally {
      setMediaState(AnalysisState.IDLE);
      setVideoStatus('');
    }
  };

  const exportToPDF = () => {
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    const addText = (text: string, size: number = 10, isBold: boolean = false) => {
      doc.setFontSize(size); doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, 170); doc.text(lines, 20, y);
      y += (lines.length * (size / 2)) + 5;
      if (y > 270) { doc.addPage(); y = 20; }
    };
    addText(`The Biz-Niz Pro: ${business.name}`, 18, true);
    addText(`Analysis for ${business.location}`, 10);
    addText("Summary", 14, true); addText(report.summary);
    doc.save(`Analysis_${business.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between no-print">
        <button onClick={onBack} className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Back to Results
        </button>
        <div className="flex gap-2">
          <button onClick={exportToPDF} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-all flex items-center gap-2">
            PDF Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">{business.name}</h2>
              <p className="text-slate-400 mt-1">{business.location}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Impact Potential</p>
              <p className="text-2xl font-bold text-indigo-400">High Turnaround</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Media Lab Section */}
          <section className="mb-12">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              AI Media Lab
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Visual Report Box */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                  <span className="font-bold text-slate-700 text-sm">Visual Brand Concept</span>
                  <select 
                    value={imageSize} 
                    onChange={(e) => setImageSize(e.target.value as ImageSize)}
                    className="text-xs bg-slate-100 border-none rounded px-2 py-1 outline-none"
                  >
                    <option value="1K">1K Res</option>
                    <option value="2K">2K High</option>
                    <option value="4K">4K Ultra</option>
                  </select>
                </div>
                <div className="flex-grow aspect-video bg-slate-200 flex items-center justify-center relative">
                  {generatedImage ? (
                    <img src={generatedImage} alt="Brand Concept" className="w-full h-full object-cover" />
                  ) : mediaState === AnalysisState.GENERATING_IMAGE ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                      <p className="text-xs text-slate-500 font-medium">Generating 8K Concept...</p>
                    </div>
                  ) : (
                    <button 
                      onClick={handleGenerateImage}
                      className="bg-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      Generate Concept Image
                    </button>
                  )}
                </div>
              </div>

              {/* Video Summary Box */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                  <span className="font-bold text-slate-700 text-sm">AI Video Pitch</span>
                  <select 
                    value={videoRatio} 
                    onChange={(e) => setVideoRatio(e.target.value as AspectRatio)}
                    className="text-xs bg-slate-100 border-none rounded px-2 py-1 outline-none"
                  >
                    <option value="16:9">Landscape</option>
                    <option value="9:16">Portrait</option>
                  </select>
                </div>
                <div className={`flex-grow ${videoRatio === '9:16' ? 'aspect-[9/16] h-[300px] mx-auto' : 'aspect-video'} bg-slate-200 flex items-center justify-center relative overflow-hidden`}>
                  {generatedVideo ? (
                    <video src={generatedVideo} controls className="w-full h-full object-cover" />
                  ) : mediaState === AnalysisState.GENERATING_VIDEO ? (
                    <div className="text-center p-6">
                      <div className="animate-pulse flex space-x-2 justify-center mb-4">
                        <div className="h-3 w-3 bg-indigo-600 rounded-full"></div>
                        <div className="h-3 w-3 bg-indigo-600 rounded-full"></div>
                        <div className="h-3 w-3 bg-indigo-600 rounded-full"></div>
                      </div>
                      <p className="text-sm font-bold text-indigo-700 mb-1">Veo 3 Generating Video</p>
                      <p className="text-xs text-slate-500 max-w-[200px] mx-auto">{videoStatus}</p>
                    </div>
                  ) : (
                    <button 
                      onClick={handleGenerateVideo}
                      className="bg-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      Generate Video Pitch
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Executive Turnaround Strategy</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{report.summary}</p>
              </section>

              <section className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-4">Core Improvement Themes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.recurringThemes.map((theme, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-indigo-50">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="text-slate-700 font-medium">{theme}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-6">Action Plan</h3>
                <div className="space-y-4">
                  {report.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">{i + 1}</span>
                      <p className="text-slate-700 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">Sentiment Profile</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Radar name="Score" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
