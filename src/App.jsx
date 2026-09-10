import React, { useState, useEffect } from 'react';
import './App.css';
import HeaderBar from './components/HeaderBar';
import EditorPane from './components/EditorPane';
import ResumePreview from './components/ResumePreview';
import { PRESETS } from './data/presets';
import { Eye, Edit3 } from 'lucide-react';

const STORAGE_KEY = 'qadcv_studio_data_v2';

export default function App() {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load storage:', e);
    }
    return PRESETS.fullstack_en.data;
  });

  const [template, setTemplate] = useState('linear');
  const [direction, setDirection] = useState('ltr');
  const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'preview'

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  }, [formData]);

  return (
    <div className="min-h-screen bg-[#0b0c13] text-neutral-100 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <HeaderBar
        template={template}
        setTemplate={setTemplate}
        direction={direction}
        setDirection={setDirection}
        formData={formData}
        setFormData={setFormData}
      />

      {/* Mobile Toggle Bar */}
      <div className="no-print lg:hidden flex items-center justify-center p-2 bg-[#12141f] border-b border-white/5">
        <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setMobileView('editor')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all ${
              mobileView === 'editor'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-neutral-400'
            }`}
          >
            <Edit3 size={13} />
            <span>Editor</span>
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all ${
              mobileView === 'preview'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-neutral-400'
            }`}
          >
            <Eye size={13} />
            <span>Live Document</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Editor */}
        <div
          className={`lg:col-span-6 h-[calc(100vh-120px)] sticky top-24 ${
            mobileView === 'editor' ? 'block' : 'hidden lg:block'
          }`}
        >
          <EditorPane
            formData={formData}
            setFormData={setFormData}
            direction={direction}
          />
        </div>

        {/* Right Pane: Live Document Preview */}
        <div
          className={`lg:col-span-6 min-h-[calc(100vh-120px)] overflow-y-auto ${
            mobileView === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="sticky top-24">
            <ResumePreview
              formData={formData}
              template={template}
              direction={direction}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
