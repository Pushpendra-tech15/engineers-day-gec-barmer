import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  ExternalLink,
  X,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const isConfigured = isSupabaseConfigured();
  const config = getSupabaseConfig();

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRunDiagnostic = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection();
      setTestResult({
        tested: true,
        ok: result.ok,
        message: result.message,
        details: result.details,
      });
    } catch (e: any) {
      setTestResult({
        tested: true,
        ok: false,
        message: 'Connection diagnostic failed',
        details: e?.message || 'Check network or console.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close guide"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900">Supabase Connection Diagnostic & Setup</h3>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isConfigured
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {isConfigured ? '✓ Keys Detected' : 'Keys Not Detected'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Check live status, diagnose why data isn't reaching Supabase, and fix step-by-step.
            </p>
          </div>
        </div>

        {/* Live Diagnostics Card */}
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              Live Diagnostic Check (कनेक्शन जांचें)
            </span>
            <button
              onClick={handleRunDiagnostic}
              disabled={testing}
              className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {testing ? 'Testing...' : 'Test Connection Now'}
            </button>
          </div>

          {/* Current detected environment values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono mb-3">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">VITE_SUPABASE_URL</span>
              <span className="text-slate-800 break-all">
                {config.url ? config.url : <span className="text-rose-600 font-bold">Not detected (Empty)</span>}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">VITE_SUPABASE_ANON_KEY</span>
              <span className="text-slate-800">
                {config.key ? (
                  `${config.key.substring(0, 10)}...${config.key.substring(config.key.length - 6)} (Present)`
                ) : (
                  <span className="text-rose-600 font-bold">Not detected (Empty)</span>
                )}
              </span>
            </div>
          </div>

          {/* Diagnostic Result Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs border flex items-start gap-2.5 ${
                testResult.ok
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-extrabold text-sm">{testResult.message}</div>
                {testResult.details && <p className="mt-1 text-slate-700 leading-relaxed">{testResult.details}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Why Data Doesn't Reach Supabase — 3 Crucial Fixes */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>अगर .env में कीज डालने के बाद भी डेटा नहीं जा रहा, तो ये 3 वजहें चेक करें:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-800 pl-1">
            <li>
              <strong>1. Dev Server Restart किया?</strong>: Vite केवल सर्वर शुरू होते समय <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">.env</code> पढ़ता है। टर्मिनल में <kbd className="bg-slate-200 px-1 rounded">Ctrl + C</kbd> दबाकर बंद करें और फिर से <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">npm run dev</code> चलाएं।
            </li>
            <li>
              <strong>2. Variable Names में 'VITE_' लगा है?</strong>: Vite में आगे <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">VITE_</code> होना अनिवार्य है: <br />
              <code className="bg-slate-900 text-slate-100 px-2 py-0.5 rounded font-mono text-[11px] block mt-1 w-fit">
                VITE_SUPABASE_URL=https://...
              </code>
              <code className="bg-slate-900 text-slate-100 px-2 py-0.5 rounded font-mono text-[11px] block mt-0.5 w-fit">
                VITE_SUPABASE_ANON_KEY=eyJhbG...
              </code>
            </li>
            <li>
              <strong>3. Supabase में 'registrations' Table बनी है?</strong>: सिर्फ Supabase प्रोजेक्ट बनाने से टेबल नहीं बनती। नीचे Step 2 का SQL कोड कॉपी करके Supabase के <strong>SQL Editor</strong> में <strong>"Run"</strong> जरूर करें।
            </li>
          </ol>
        </div>

        {/* Setup Steps */}
        <div className="space-y-4 text-sm text-slate-700">
          {/* Step 1 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <span>Open Supabase Project</span>
            </div>
            <p className="text-xs text-slate-600 ml-8 mb-2">
              Go to your project dashboard on Supabase:
            </p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="ml-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-blue-700 hover:bg-slate-50 transition-colors"
            >
              <span>Open Supabase Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <span>Run SQL Script in Supabase SQL Editor</span>
              </div>
              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 ml-8 mb-2">
              In your Supabase left menu, click <strong>SQL Editor</strong> &gt; <strong>New Query</strong>, paste this script, and click <strong>Run</strong>:
            </p>
            <div className="ml-8 relative">
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-40">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <span>Copy API URL &amp; Anon Key</span>
            </div>
            <p className="text-xs text-slate-600 ml-8 mb-1">
              In Supabase, click <strong>Project Settings (Gear ⚙️)</strong> &gt; <strong>API</strong>.
            </p>
            <ul className="ml-8 list-disc list-inside text-xs text-slate-600 space-y-1">
              <li><strong>Project URL</strong>: e.g. <code className="bg-slate-200 px-1 rounded">https://xyz.supabase.co</code></li>
              <li><strong>Project API Keys</strong>: copy the key labeled <strong>anon</strong> <strong>public</strong>.</li>
            </ul>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center shrink-0">
                4
              </span>
              <span>Save into .env &amp; Restart Dev Server</span>
            </div>
            <p className="text-xs text-slate-600 ml-8 mb-2">
              In project root folder, open or create <code className="bg-slate-200 px-1 rounded">.env</code>:
            </p>
            <div className="ml-8 bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono space-y-1">
              <div>VITE_SUPABASE_URL=https://your-project-id.supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here</div>
            </div>
            <p className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded-lg p-2.5 ml-8 mt-2">
              ⚡ IMPORTANT: File save karne ke baad terminal me server restart karein (Ctrl+C and npm run dev) taaki nayi keys load ho sakein!
            </p>
          </div>
        </div>

        {/* Close button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            Got It (समझ गया)
          </button>
        </div>
      </div>
    </div>
  );
};
