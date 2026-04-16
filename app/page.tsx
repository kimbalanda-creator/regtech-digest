'use client';

import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runDigest() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/digest', { method: 'POST', headers: { 'x-cron-secret': '' } });
      const data = await res.json();
      setStatus(data.success
        ? `✓ Done — ${data.items} items written to Notion`
        : `✗ Error: ${data.error}`);
    } catch (e) {
      setStatus(`✗ ${e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center gap-8 p-8">
      <div className="max-w-lg w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RegTech Digest</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Daily intelligence on identity, fraud, and regulatory tech. Runs automatically at 8am AEST.
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 space-y-3 border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Sources</h2>
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Regulatory</p>
            <div className="flex flex-wrap gap-2">
              {['AUSTRAC', 'APRA', 'ASIC', 'FATF', 'FinCEN'].map(s => (
                <span key={s} className="px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded text-xs">{s}</span>
              ))}
            </div>
            <p className="text-xs text-gray-500 font-medium pt-1">Vendors</p>
            <div className="flex flex-wrap gap-2">
              {['FrankieOne', 'Sardine', 'Persona', 'ComplyAdvantage', 'Onfido'].map(s => (
                <span key={s} className="px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded text-xs">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={runDigest}
            disabled={loading}
            className="w-full bg-white text-gray-950 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading ? 'Running…' : 'Run digest now'}
          </button>
          {status && (
            <p className={`text-sm text-center ${status.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
              {status}
            </p>
          )}
        </div>

        <p className="text-xs text-gray-600 text-center">
          Output →{' '}
          <a
            href="https://www.notion.so/RegTech-Identity-Daily-Digest-344b326553d881adaccbea4616911fa1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-200 underline underline-offset-2"
          >
            Notion page
          </a>
        </p>
      </div>
    </main>
  );
}
