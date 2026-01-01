
import React, { useState, useEffect } from 'react';
import { Question, QuizSettings, QuizData, SavedQuizEntry } from './types';
import { DEFAULT_SETTINGS, TRANSLATIONS } from './constants';
import QuizEditor from './components/QuizEditor';
import SettingsMenu from './components/SettingsMenu';
import CloudSettings from './components/CloudSettings';
import QuestionBank from './components/QuestionBank';
import QuizLibrary from './components/QuizLibrary';
import { generateQuizHtml } from './utils/htmlGenerator';

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'editor' | 'bank' | 'library' | 'settings' | 'cloud'>('editor');
  
  // Bank and Library State
  const [bank, setBank] = useState<Question[]>([]);
  const [library, setLibrary] = useState<SavedQuizEntry[]>([]);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quiz_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const lang = settings.language || 'ar';
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Dark Mode Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('quiz_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('quiz_theme', 'light');
    }
  }, [isDarkMode]);

  // Initial Load
  useEffect(() => {
    const savedQuiz = localStorage.getItem('quiz_architect_v1');
    if (savedQuiz) {
      try {
        const parsed = JSON.parse(savedQuiz);
        setQuestions(parsed.questions || []);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      } catch (e) { console.error("Failed to load saved quiz", e); }
    }

    const savedBank = localStorage.getItem('quiz_bank_v1');
    if (savedBank) setBank(JSON.parse(savedBank));

    const savedLibrary = localStorage.getItem('quiz_library_v1');
    if (savedLibrary) setLibrary(JSON.parse(savedLibrary));
  }, []);

  // Autosave current quiz
  useEffect(() => {
    localStorage.setItem('quiz_architect_v1', JSON.stringify({ questions, settings }));
  }, [questions, settings]);

  // Persist Bank/Library
  useEffect(() => {
    localStorage.setItem('quiz_bank_v1', JSON.stringify(bank));
  }, [bank]);

  useEffect(() => {
    localStorage.setItem('quiz_library_v1', JSON.stringify(library));
  }, [library]);

  const handleDownload = () => {
    if (questions.length === 0) return;
    const html = generateQuizHtml({ questions, settings });
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.title.toLowerCase().replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    if (questions.length === 0) return;
    const html = generateQuizHtml({ questions, settings });
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const saveToLibrary = () => {
    const newEntry: SavedQuizEntry = {
      id: crypto.randomUUID(),
      data: { questions, settings },
      savedAt: new Date().toISOString()
    };
    setLibrary([newEntry, ...library]);
    alert(lang === 'ar' ? 'تم الحفظ في المكتبة!' : 'Saved to Library!');
  };

  const exportToBank = (q: Question) => {
    // Inject current classification if missing
    const bankQ = {
      ...q,
      stage: q.stage || settings.defaultStage,
      grade: q.grade || settings.defaultGrade,
      subject: q.subject || settings.subject,
      semester: q.semester || settings.defaultSemester,
      difficulty: q.difficulty // Explicitly ensure difficulty is carried over
    };
    
    // Check if already in bank to avoid simple duplication by ID
    const exists = bank.some(bq => bq.id === q.id);
    if (exists) {
      setBank(bank.map(bq => bq.id === q.id ? bankQ : bq));
    } else {
      setBank([bankQ, ...bank]);
    }
    
    alert(lang === 'ar' ? 'تمت الإضافة لبنك الأسئلة!' : 'Added to Bank!');
  };

  const exportMultipleToBank = (ids: string[]) => {
    const selectedQuestions = questions.filter(q => ids.includes(q.id));
    if (selectedQuestions.length === 0) return;

    const newBank = [...bank];
    selectedQuestions.forEach(q => {
      const bankQ = {
        ...q,
        stage: q.stage || settings.defaultStage,
        grade: q.grade || settings.defaultGrade,
        subject: q.subject || settings.subject,
        semester: q.semester || settings.defaultSemester,
        difficulty: q.difficulty // Preserve individual difficulty levels
      };
      const existingIdx = newBank.findIndex(bq => bq.id === q.id);
      if (existingIdx !== -1) {
        newBank[existingIdx] = bankQ;
      } else {
        newBank.unshift(bankQ);
      }
    });

    setBank(newBank);
    alert(lang === 'ar' ? `تم تصدير ${selectedQuestions.length} سؤال لبنك الأسئلة بنجاح مع حفظ تصنيف المستويات!` : `${selectedQuestions.length} questions exported to the Bank successfully with level classifications!`);
  };

  const importFromBank = (q: Question) => {
    // Generate new UUID for the imported question so it's treated as a fresh instance in the editor
    setQuestions([...questions, { ...q, id: crypto.randomUUID() }]);
    alert(lang === 'ar' ? 'تم الاستيراد بنجاح!' : 'Imported successfully!');
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-slate-50 dark:bg-slate-900 dark:text-slate-200 transition-colors duration-300">
      <header className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between border-b shadow-sm dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-graduation-cap text-lg"></i>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-slate-800 dark:text-slate-100 leading-none">Pro Quiz Architect</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t.dashboard}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            title={lang === 'ar' ? (isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي') : (isDarkMode ? 'Light Mode' : 'Dark Mode')}
          >
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
          </button>

          <button onClick={saveToLibrary} title={t.saveToLibrary} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800 rounded-lg transition-all">
            <i className="fas fa-save text-xl"></i>
          </button>
          <button onClick={handlePreview} disabled={questions.length === 0} className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors">
            {t.preview}
          </button>
          <button onClick={handleDownload} disabled={questions.length === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-indigo-200 dark:shadow-none shadow-lg disabled:opacity-50 transition-all active:scale-95">
            {t.download}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <div className="flex flex-wrap gap-1 bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl mb-8 w-fit mx-auto shadow-inner">
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
            <i className="fas fa-sliders-h"></i> {t.settings}
          </button>
          <button onClick={() => setActiveTab('editor')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'editor' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
            <i className="fas fa-pencil-alt"></i> {t.builder}
          </button>
          <button onClick={() => setActiveTab('bank')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'bank' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
            <i className="fas fa-database"></i> {t.bank}
          </button>
          <button onClick={() => setActiveTab('library')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'library' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
            <i className="fas fa-book"></i> {t.library}
          </button>
          <button onClick={() => setActiveTab('cloud')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'cloud' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
            <i className="fas fa-cloud"></i> {t.cloud}
          </button>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'editor' && (
            <QuizEditor 
              questions={questions} 
              onUpdate={setQuestions} 
              onExportToBank={exportToBank} 
              onExportMultipleToBank={exportMultipleToBank}
              language={lang} 
              bankQuestionIds={bank.map(q => q.id)}
            />
          )}
          {activeTab === 'bank' && <QuestionBank language={lang} bank={bank} onImport={importFromBank} onRemove={(id) => setBank(bank.filter(b => b.id !== id))} />}
          {activeTab === 'library' && <QuizLibrary language={lang} library={library} onLoad={(e) => { setQuestions(e.data.questions); setSettings(e.data.settings); setActiveTab('editor'); }} onRemove={(id) => setLibrary(library.filter(l => l.id !== id))} />}
          {activeTab === 'settings' && <SettingsMenu settings={settings} onUpdate={setSettings} />}
          {activeTab === 'cloud' && <CloudSettings settings={settings} onUpdate={setSettings} />}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t dark:border-slate-800 py-4 px-6 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-600">
        <div><strong>Pro Quiz Architect v3.0</strong> — Designed for Teachers</div>
        <div className="flex gap-4">
          <i className="fas fa-info-circle"></i>
          <i className="fas fa-shield-alt"></i>
        </div>
      </footer>
    </div>
  );
};

export default App;
