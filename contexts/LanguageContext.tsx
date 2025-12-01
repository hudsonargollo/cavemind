import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Toolbar
    'toolbar.login': 'Login',
    'toolbar.clear': 'Limpar',
    'toolbar.summarize': 'Resumir Caminho',
    
    // Node types
    'node.untitled': 'NOTA SEM TÍTULO',
    'node.placeholder': 'Digite o texto redimensionável...',
    
    // Context menu
    'menu.delete': 'Deletar',
    'menu.duplicate': 'Duplicar',
    'menu.changeShape': 'Mudar Forma',
    'menu.changeColor': 'Mudar Cor',
    'menu.bringToFront': 'Trazer para Frente',
    'menu.sendToBack': 'Enviar para Trás',
    
    // Shapes
    'shape.process': 'Processo',
    'shape.decision': 'Decisão',
    'shape.circle': 'Círculo',
    'shape.parallelogram': 'Paralelogramo',
    
    // Password modal
    'password.title': 'Proteger Documento',
    'password.subtitle': 'Defina uma senha para proteger seu documento',
    'password.placeholder': 'Digite a senha',
    'password.confirm': 'Confirme a senha',
    'password.set': 'Definir Senha',
    'password.cancel': 'Cancelar',
    'password.unlock': 'Desbloquear Documento',
    'password.unlockSubtitle': 'Digite a senha para acessar',
    'password.unlock.button': 'Desbloquear',
    'password.error.match': 'As senhas não coincidem',
    'password.error.incorrect': 'Senha incorreta',
    
    // General
    'rightclick.options': 'Clique com o botão direito para opções.',
  },
  en: {
    // Toolbar
    'toolbar.login': 'Login',
    'toolbar.clear': 'Clear',
    'toolbar.summarize': 'Summarize Path',
    
    // Node types
    'node.untitled': 'UNTITLED NOTE',
    'node.placeholder': 'Enter resizable text...',
    
    // Context menu
    'menu.delete': 'Delete',
    'menu.duplicate': 'Duplicate',
    'menu.changeShape': 'Change Shape',
    'menu.changeColor': 'Change Color',
    'menu.bringToFront': 'Bring to Front',
    'menu.sendToBack': 'Send to Back',
    
    // Shapes
    'shape.process': 'Process',
    'shape.decision': 'Decision',
    'shape.circle': 'Circle',
    'shape.parallelogram': 'Parallelogram',
    
    // Password modal
    'password.title': 'Protect Document',
    'password.subtitle': 'Set a password to protect your document',
    'password.placeholder': 'Enter password',
    'password.confirm': 'Confirm password',
    'password.set': 'Set Password',
    'password.cancel': 'Cancel',
    'password.unlock': 'Unlock Document',
    'password.unlockSubtitle': 'Enter password to access',
    'password.unlock.button': 'Unlock',
    'password.error.match': 'Passwords do not match',
    'password.error.incorrect': 'Incorrect password',
    
    // General
    'rightclick.options': 'Right-click for options.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('cavemind-language');
    return (saved as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('cavemind-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['pt']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
