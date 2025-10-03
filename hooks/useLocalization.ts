
import { useCallback } from 'react';
import { Language } from '../types';
import { strings } from '../constants/localization';

export const useLocalization = (language: Language) => {
  const t = useCallback((key: string): string => {
    return strings[key]?.[language] || key;
  }, [language]);

  return { t };
};
