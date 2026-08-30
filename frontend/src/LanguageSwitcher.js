import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const languages = [
    { code: 'en', name: '🇬🇧 English' },
    { code: 'es', name: '🇪🇸 Español' },
    { code: 'fr', name: '🇫🇷 Français' },
    { code: 'pt', name: '🇧🇷 Português' },
  ];

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
            i18n.language === lang.code
              ? 'bg-rose-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;