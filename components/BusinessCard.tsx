
import React from 'react';
import { Business } from '../types';

interface BusinessCardProps {
  business: Business;
  onAnalyze: (business: Business) => void;
  isAnalyzing: boolean;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, onAnalyze, isAnalyzing }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-800 leading-tight">{business.name}</h3>
          <span className="flex items-center bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-sm font-semibold border border-red-100">
            ★ {business.rating}
          </span>
        </div>
        <p className="text-slate-500 text-sm mb-4 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {business.location}
        </p>
        
        <div className="space-y-2 mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Complaints</p>
          {business.complaints.map((complaint, i) => (
            <div key={i} className="flex items-start text-slate-600 text-sm">
              <span className="text-red-400 mr-2">•</span>
              {complaint}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onAnalyze(business)}
        disabled={isAnalyzing}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
          isAnalyzing 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
        }`}
      >
        {isAnalyzing ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Full Analysis
          </>
        )}
      </button>
    </div>
  );
};

export default BusinessCard;
