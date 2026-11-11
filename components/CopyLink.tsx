'use client';

import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { getBaseUrl } from '@/lib/url';

/** Shows a site link built from the current origin, with a copy button. */
export default function CopyLink({ path }: { path: string }) {
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);
  useEffect(() => setUrl(`${getBaseUrl()}${path}`), [path]);
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 p-2 pl-3">
      <span className="flex-1 truncate font-mono text-xs text-ink-soft">{url}</span>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="btn-icon size-8"
        title="Copy link"
      >
        {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
      </button>
    </div>
  );
}
