"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-bash";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "yaml" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      Prism.highlightElement(preRef.current);
    }
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border bg-surface">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/50">
        <span className="text-xs font-mono text-text-muted uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs text-text-muted hover:text-primary transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre ref={preRef} className="!bg-surface !m-0 overflow-x-auto max-h-[500px]">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
