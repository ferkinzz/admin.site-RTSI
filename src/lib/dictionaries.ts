// import type { Locale } from '@/types';

const dictionaries = {
  en: () => import('@/dictionaries/en').then((module) => module.dictionary),
  es: () => import('@/dictionaries/es').then((module) => module.dictionary),
};

export const getDictionary = async (locale: 'es' | 'en') => {
    return dictionaries[locale]();
}
