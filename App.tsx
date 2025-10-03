
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Generator from './components/Generator';
import AnimatedBackground from './components/AnimatedBackground';
import History from './components/History';
import { Language, View } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [view, setView] = useState<View>('generator');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.className = language === 'ar' ? 'font-tajawal' : '';
  }, [language]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      return <Login onLoginSuccess={handleLoginSuccess} language={language} setLanguage={setLanguage} />;
    }
    switch (view) {
      case 'history':
        return <History language={language} setView={setView} />;
      case 'generator':
      default:
        return <Generator language={language} setLanguage={setLanguage} setView={setView} />;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a041c] text-white overflow-x-hidden">
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
