import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { Language, HistoryItem, View } from '../types';

interface HistoryProps {
  language: Language;
  setView: (view: View) => void;
}

const History: React.FC<HistoryProps> = ({ language, setView }) => {
  const { t } = useLocalization(language);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    try {
        const storedHistory = JSON.parse(localStorage.getItem('generationHistory') || '[]') as HistoryItem[];
        setHistory(storedHistory);
    } catch (e) {
        console.error("Failed to parse history from localStorage", e);
        setHistory([]);
    }
  }, []);

  const handleDelete = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('generationHistory', JSON.stringify(updatedHistory));
  };

  const handleCopy = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wider">{t('historyTitle')}</h1>
          <button onClick={() => setView('generator')} className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm hover:bg-white/20 transition-colors">
            {t('backToGenerator')}
          </button>
        </header>

        {history.length === 0 ? (
          <div className="flex items-center justify-center h-[60vh]">
              <p className="text-gray-400 text-lg text-center">{t('noHistory')}</p>
          </div>
        ) : (
          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {history.map(item => (
                  <div key={item.id} className="bg-slate-900/50 backdrop-blur-lg border border-cyan-500/20 rounded-2xl overflow-hidden flex flex-col shadow-lg shadow-cyan-500/5">
                      <div className="relative group">
                          <img src={item.imageDataUrl} alt="Generated image" className="w-full h-auto aspect-square object-cover"/>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => setSelectedImage(item.imageDataUrl)} className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30" title={t('viewImage')}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </button>
                          </div>
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                          <p className="text-sm text-gray-300 mb-4 flex-grow font-light leading-relaxed">{item.prompt}</p>
                          <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-cyan-500/10">
                              <a href={item.imageDataUrl} download={`generated-image-${item.id}.jpg`} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 transition-colors" title={t('download')}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                              </a>
                              <button onClick={() => handleCopy(item.prompt, item.id)} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 transition-colors relative" title={t('copyPrompt')}>
                                  {copiedId === item.id ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                  ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" /><path d="M4 3a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V3z" /></svg>
                                  )}
                                  {copiedId === item.id && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded shadow-lg">{t('promptCopied')}</span>}
                              </button>
                               <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors" title={t('delete')}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </main>
        )}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in {
              animation: fade-in 0.2s ease-out;
            }
          `}</style>
          <div 
            className="relative max-w-4xl max-h-[90vh] p-4" 
            onClick={e => e.stopPropagation()} // Prevent closing when clicking on the image container
          >
            <img src={selectedImage} alt="Enlarged view" className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"/>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-0 right-0 m-2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
              aria-label="Close"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default History;