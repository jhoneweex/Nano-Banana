
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { generateImage, fileToBase64 } from '../services/geminiService';
import { Language, AspectRatio, UploadedImage, View, HistoryItem } from '../types';
import Spinner from './Spinner';

// Add types for Web Speech API to fix TypeScript errors.
// The Web Speech API is not part of the standard TypeScript DOM library definitions.
// These interfaces provide the necessary types for the component to compile.
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface GeneratorProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  setView: (view: View) => void;
}

const Generator: React.FC<GeneratorProps> = ({ language, setLanguage, setView }) => {
  const { t } = useLocalization(language);
  const [prompt, setPrompt] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<{prompt: string, images: UploadedImage[], aspectRatio: AspectRatio} | null>(null);

  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isSpeechRecognitionSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(prev => (prev ? prev + ' ' : '') + transcript);
      setTimeout(() => {
        if (promptTextareaRef.current) {
          promptTextareaRef.current.style.height = 'auto';
          promptTextareaRef.current.style.height = `${promptTextareaRef.current.scrollHeight}px`;
        }
      }, 0);
    };
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [language, isSpeechRecognitionSupported]);


  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files) return;
    const filePromises = Array.from(files).map(async (file) => {
      const { base64, mimeType } = await fileToBase64(file);
      return {
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        base64,
        mimeType
      };
    });
    const newImages = await Promise.all(filePromises);
    setUploadedImages(prev => [...prev, ...newImages]);
  };
  
  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = useCallback(async (request: {prompt: string, images: UploadedImage[], aspectRatio: AspectRatio}) => {
    if (!request.prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setResultImage(null);
    
    if (!process.env.API_KEY) {
      setError(t('errorNoApiKey'));
      setIsLoading(false);
      return;
    }

    setLastRequest(request);

    try {
      const generatedImageBase64 = await generateImage(request.prompt, request.images, request.aspectRatio);
      setResultImage(generatedImageBase64);
      
      const newHistoryItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        prompt: request.prompt,
        imageDataUrl: `data:image/jpeg;base64,${generatedImageBase64}`,
        timestamp: Date.now(),
      };
      const currentHistory = JSON.parse(localStorage.getItem('generationHistory') || '[]') as HistoryItem[];
      const updatedHistory = [newHistoryItem, ...currentHistory].slice(0, 50); // Keep max 50 items
      localStorage.setItem('generationHistory', JSON.stringify(updatedHistory));

    } catch (err) {
      setError(t('errorGeneration'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [t]);
  
  const handleRegenerate = () => {
      if(lastRequest) {
          handleSubmit(lastRequest);
      }
  }

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Error starting speech recognition:", e);
      }
    }
  };

  const handleFileUploadClick = () => {
    document.getElementById('file-upload')?.click();
  };

  const handlePromptSubmit = () => {
    if (!prompt.trim() || isLoading) return;
    handleSubmit({prompt, images: uploadedImages, aspectRatio});
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };


  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wider">{t('title')}</h1>
        <div className="flex items-center gap-4">
            <button onClick={() => setView('history')} className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm hover:bg-white/20 transition-colors">
                {t('history')}
            </button>
            <button onClick={toggleLanguage} className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm hover:bg-white/20 transition-colors">
              {language === 'en' ? 'العربية' : 'English'}
            </button>
        </div>
      </header>

      <div className="text-center p-4 mb-8 bg-slate-900/50 backdrop-blur-lg border border-cyan-500/20 rounded-2xl max-w-4xl mx-auto">
        {language === 'ar' ? (
          <>
            <p className="text-lg font-tajawal">🌿💐زورونا على الموقع الرسمي للطب البديل والظواهر الخارقة🍄🌴</p>
            <div className="mt-2 space-x-4 rtl:space-x-reverse">
              <a href="https://www.drabuyahya.com/en" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                https://www.drabuyahya.com/en
              </a>
              <a href="https://x.com/DR_AbuYahya" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                https://x.com/DR_AbuYahya
              </a>
            </div>
          </>
        ) : (
          <>
            <p className="text-lg">🌿💐 Visit our official website for Alternative Medicine & Paranormal Phenomena 🍄🌴</p>
            <div className="mt-2 space-x-4">
              <a href="https://www.drabuyahya.com/en" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                https://www.drabuyahya.com/en
              </a>
              <a href="https://x.com/DR_AbuYahya" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                https://x.com/DR_AbuYahya
              </a>
            </div>
          </>
        )}
      </div>
      
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Left Column: Inputs */}
        <div className="space-y-8">
          {/* Prompt */}
          <div className="p-1 bg-slate-900/50 backdrop-blur-lg border border-cyan-500/20 rounded-2xl">
            <div className="flex items-end gap-2 p-2 bg-gray-800/20 rounded-xl">
              <textarea
                ref={promptTextareaRef}
                rows={1}
                value={prompt}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder={t('promptPlaceholder')}
                className="flex-1 bg-transparent resize-none outline-none text-gray-200 placeholder-gray-400 p-2"
                style={{ maxHeight: '200px' }}
              />
              {isSpeechRecognitionSupported && (
                 <button 
                    onClick={handleMicClick} 
                    className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-700 text-gray-400'}`} 
                    aria-label={isListening ? "Stop listening" : "Start listening"}
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                        <path fillRule="evenodd" d="M5.5 10.5a.5.5 0 01.5.5v1a4 4 0 004 4h0a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-4.5 4.975V19h2.5a.5.5 0 010 1h-6a.5.5 0 010-1H9v-1.525A5 5 0 014.5 11.5v-1a.5.5 0 01.5-.5z" clipRule="evenodd" />
                    </svg>
                </button>
              )}
              <button onClick={handleFileUploadClick} className="p-2 rounded-full hover:bg-gray-700 text-gray-400 transition-colors" aria-label="Upload image">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button onClick={handlePromptSubmit} disabled={!prompt.trim() || isLoading} className="p-2 rounded-lg bg-gray-700/50 border border-gray-600 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a.75.75 0 01-.75-.75V4.66L5.22 8.72a.75.75 0 01-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l5.25 5.25a.75.75 0 11-1.06 1.06L10.75 4.66v12.59A.75.75 0 0110 18z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>


          {/* Image Upload */}
          <div className="p-6 bg-slate-900/50 backdrop-blur-lg border border-cyan-500/20 rounded-2xl">
            <h2 className="font-semibold mb-3">{t('uploadImages')}</h2>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-500 px-6 py-10">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" /></svg>
                <div className="mt-4 flex text-sm leading-6 text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-cyan-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 hover:text-cyan-300">
                    <span>{t('uploadBtn')}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e.target.files)} />
                  </label>
                  <p className="ps-1">{t('dragDrop')}</p>
                </div>
                <p className="text-xs leading-5 text-gray-500">{t('imageTypes')}</p>
              </div>
            </div>
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-300 mb-2">{t('uploadedImages')}:</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {uploadedImages.map(image => (
                    <div key={image.id} className="relative group">
                      <img src={`data:${image.mimeType};base64,${image.base64}`} alt={image.name} className="rounded-lg object-cover aspect-square" />
                      <button onClick={() => removeImage(image.id)} className="absolute top-0 right-0 m-1 p-0.5 bg-red-600/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Aspect Ratio & Generate Button */}
          <div className="p-6 bg-slate-900/50 backdrop-blur-lg border border-cyan-500/20 rounded-2xl">
            <h2 className="font-semibold mb-3">{t('aspectRatio')}</h2>
            <div className="flex space-x-2 rtl:space-x-reverse mb-6">
              {(['1:1', '9:16', '16:9'] as AspectRatio[]).map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aspectRatio === ratio ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                  disabled={uploadedImages.length > 0}
                >
                  {ratio}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleSubmit({prompt, images: uploadedImages, aspectRatio})}
              disabled={isLoading || !prompt.trim()}
              className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <Spinner />}
              {isLoading ? t('generating') : t('generate')}
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="p-6 bg-slate-900/50 backdrop-blur-lg border border-cyan-500/20 rounded-2xl flex flex-col items-center justify-center min-h-[300px] lg:min-h-full">
            <h2 className="text-xl font-semibold mb-4 self-start">{t('result')}</h2>
            <div className="w-full flex-grow flex flex-col items-center justify-center">
                {isLoading && <Spinner large={true} />}
                {error && (
                    <div className="text-center text-red-400">
                        <h3 className="font-bold text-lg">{t('errorTitle')}</h3>
                        <p>{error}</p>
                    </div>
                )}
                {resultImage && !isLoading && (
                    <div className="w-full text-center">
                        <img src={`data:image/jpeg;base64,${resultImage}`} alt="Generated result" className="rounded-lg max-w-full max-h-[60vh] mx-auto mb-4 shadow-2xl shadow-black"/>
                        <div className="space-y-3 mt-4">
                            <button onClick={handleRegenerate} disabled={isLoading} className="w-full max-w-xs mx-auto py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50">
                                {t('regenerate')}
                            </button>
                            <a href={`data:image/jpeg;base64,${resultImage}`} download="generated-image.jpg" className="block w-full max-w-xs mx-auto py-2 px-4 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors">
                                {t('download')}
                            </a>
                        </div>
                    </div>
                )}
                {!isLoading && !error && !resultImage && (
                    <div className="text-center text-gray-500">
                        <p>{t('promptPlaceholder')}</p>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Generator;
