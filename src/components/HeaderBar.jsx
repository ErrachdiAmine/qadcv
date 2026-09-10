import React from 'react';
import { Sparkles, Printer, Download, Upload, RotateCcw, Check, Zap, FileText, Globe } from 'lucide-react';
import { PRESETS } from '../data/presets';
import { calculateATSMetrics } from '../services/aiEngine';

export default function HeaderBar({
  template,
  setTemplate,
  direction,
  setDirection,
  formData,
  setFormData,
}) {
  const ats = calculateATSMetrics(formData);

  const handlePresetSelect = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setFormData(preset.data);
      setDirection(preset.direction);
      if (preset.direction === 'rtl') {
        setTemplate('andalus');
      } else {
        setTemplate('linear');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(formData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `qadcv-${formData.name?.toLowerCase().replace(/\s+/g, '-') || 'resume'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && typeof parsed === 'object') {
            setFormData(parsed);
          }
        } catch (err) {
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="no-print w-full glass-panel border-b border-white/10 px-4 sm:px-6 py-3.5 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5 font-mono">
                QadCV <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">STUDIO</span>
              </span>
            </div>
          </div>

          {/* ATS Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${ats.score >= 80 ? 'bg-emerald-400' : 'bg-yellow-400'} animate-pulse`} />
            <span className="text-neutral-400">ATS Score:</span>
            <span className="text-white font-bold">{ats.score}% ({ats.grade})</span>
          </div>
        </div>

        {/* Center: Template & Language Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Template Switcher */}
          <div className="flex items-center rounded-xl bg-white/[0.03] border border-white/10 p-1 text-xs font-medium">
            <button
              onClick={() => setTemplate('linear')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                template === 'linear' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Linear Tech
            </button>
            <button
              onClick={() => setTemplate('executive')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                template === 'executive' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Executive
            </button>
            <button
              onClick={() => setTemplate('andalus')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                template === 'andalus' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Al-Andalus / RTL
            </button>
          </div>

          {/* Direction toggle */}
          <button
            onClick={() => setDirection(direction === 'ltr' ? 'rtl' : 'ltr')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle LTR / RTL Arabic Direction"
          >
            <Globe size={13} className="text-cyan-400" />
            <span className="font-mono">{direction === 'ltr' ? 'LTR (EN)' : 'RTL (عربي)'}</span>
          </button>

          {/* Preset Selector */}
          <select
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="glass-input rounded-xl px-2.5 py-1.5 text-xs text-neutral-300 cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Presets...</option>
            <option value="fullstack_en">⚡ Full-Stack Pro (EN)</option>
            <option value="fullstack_ar">⚡ مهندس برمجيات (عربي)</option>
            <option value="blank">📄 Blank Canvas</option>
          </select>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportJSON}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 transition-all cursor-pointer"
            title="Export JSON Data"
          >
            <Download size={14} />
          </button>

          <label
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 transition-all cursor-pointer"
            title="Import JSON Data"
          >
            <Upload size={14} />
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Printer size={14} />
            <span>Export PDF / Print</span>
          </button>
        </div>
      </div>
    </header>
  );
}
