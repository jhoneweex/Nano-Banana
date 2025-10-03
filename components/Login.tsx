import React, { useState } from 'react';
import { Language } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface LoginProps {
  onLoginSuccess: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<{ language: Language; setLanguage: (lang: Language) => void; }> = ({ language, setLanguage }) => {
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };
  return (
    <button
      onClick={toggleLanguage}
      className="absolute top-4 end-4 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm hover:bg-white/20 transition-colors"
    >
      {language === 'en' ? 'العربية' : 'English'}
    </button>
  );
};


const Login: React.FC<LoginProps> = ({ onLoginSuccess, language, setLanguage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const { t } = useLocalization(language);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (email.toLowerCase().endsWith('@gmail.com')) {
        setStep(2);
        setError('');
      } else {
        setError(t('emailError'));
      }
    }
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 2) {
      if (password) {
        setError('');
        onLoginSuccess();
      } else {
        setError(t('passwordError'));
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <LanguageSwitcher language={language} setLanguage={setLanguage} />
      <div className="flex flex-col items-center gap-8 w-full">
        {/* Promo Banner */}
        <div className="text-center p-4 bg-slate-900/50 backdrop-blur-lg border border-cyan-500/20 rounded-2xl w-full max-w-lg">
            <p className="text-lg">{t('promoTitle')}</p>
            <div className="mt-2 space-x-4 rtl:space-x-reverse">
              <a href="https://www.drabuyahya.com/en" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm break-all">
                https://www.drabuyahya.com/en
              </a>
              <a href="https://x.com/DR_AbuYahya" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm break-all">
                https://x.com/DR_AbuYahya
              </a>
            </div>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-sm p-8 space-y-6 bg-slate-900/50 backdrop-blur-lg border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/10">
          <div className="text-center">
              <svg className="mx-auto h-8 w-auto text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6.202a4.5 4.5 0 0 1 6.798 3.298c0 3.038-2.368 5.5-5.5 5.5H12V9.5h4.5c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5H12"></path><path d="M6 12.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z"></path></svg>
            <h1 className="mt-2 text-2xl font-bold">{t('signIn')}</h1>
            <p className="mt-1 text-sm text-gray-400">{t('signInGoogle')}</p>
          </div>
          
          <form onSubmit={step === 1 ? handleNext : handleLogin} className="space-y-6">
            {step === 1 ? (
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full px-4 py-2 bg-transparent border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition"
                />
              </div>
            ) : (
              <div>
                  <div className="flex items-center justify-between p-2 mb-4 border border-gray-600 rounded-lg">
                      <span className="text-sm text-gray-300">{email}</span>
                      <button type="button" onClick={() => {setStep(1); setPassword('');}} className="text-cyan-400 text-sm">▼</button>
                  </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  autoFocus
                  className="w-full px-4 py-2 bg-transparent border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition"
                />
              </div>
            )}
            
            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition"
              >
                {t('next')}
              </button>
            </div>
          </form>
          <p className="text-xs text-center text-gray-500 pt-4">{t('loginDisclaimer')}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;