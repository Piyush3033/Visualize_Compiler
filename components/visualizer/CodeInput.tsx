'use client';

import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface CodeInputProps {
  code: string;
  onChange: (code: string) => void;
}

export default function CodeInput({ code, onChange }: CodeInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          onChange(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-muted px-4 py-2">
        <h2 className="text-xs sm:text-sm font-semibold text-foreground">Source Code</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUploadClick}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".c,.cpp,.java,.py,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="c"
          value={code}
          onChange={(value) => onChange(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 1.5,
            fontFamily: "'Cascadia Code', 'Fira Code', monospace",
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}
