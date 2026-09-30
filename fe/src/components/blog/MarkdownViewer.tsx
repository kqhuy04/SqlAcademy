import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  return (
    <div className="prose prose-stone max-w-none font-serif leading-relaxed text-noir-ink text-base">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-noir-ink border-b-2 border-noir-borderDark pb-2 mt-8 mb-4 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-black font-serif text-noir-blood border-b border-noir-borderDark/50 pb-1.5 mt-7 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-bold font-serif text-noir-ink mt-6 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-4 leading-7 text-noir-ink selection:bg-noir-wax/20">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-5 pl-4 py-2 border-l-4 border-noir-wax bg-noir-card/40 rounded-r-md text-noir-inkMuted italic font-typewriter text-sm">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside my-4 space-y-1.5 pl-2 text-noir-ink">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-4 space-y-1.5 pl-2 text-noir-ink">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-noir-blood underline hover:text-noir-bloodDark transition-colors font-medium"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <div className="my-6 rounded-md overflow-hidden border-2 border-noir-borderDark shadow-md bg-noir-card">
              <img src={src} alt={alt} className="w-full max-h-[500px] object-cover" />
              {alt && (
                <div className="p-2 text-center text-xs font-typewriter text-noir-inkMuted bg-noir-paperDark/60 border-t border-noir-borderDark/40">
                  {alt}
                </div>
              )}
            </div>
          ),
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            const codeString = String(children).replace(/\n$/, '');

            if (isInline) {
              return (
                <code
                  className="bg-noir-card/80 text-noir-blood font-mono text-[0.875em] px-1.5 py-0.5 rounded border border-noir-borderDark/40"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock code={codeString} language={match ? match[1] : 'sql'} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Đã sao chép mã lệnh vào clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-md border-2 border-noir-borderDark overflow-hidden bg-[#1E1A17] text-[#EDE3C9] shadow-lg">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#2B2520] border-b border-noir-borderDark/40 text-xs font-mono text-noir-border">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-noir-candle" />
          <span className="uppercase text-[11px] font-bold tracking-wider">{language || 'SQL'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-white transition-colors px-2 py-0.5 rounded bg-black/30 hover:bg-black/50"
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed selection:bg-noir-wax/40">
        <code>{code}</code>
      </pre>
    </div>
  );
};
