'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CodeGenerationTabProps {
  compilation: {
    generated_code?: string[];
    codegen_errors?: string[];
  };
}

function categorizeInstruction(line: string): string {
  if (line.includes('push') || line.includes('pop')) return 'stack';
  if (line.includes('mov') || line.includes('lea')) return 'move';
  if (line.includes('add') || line.includes('sub') || line.includes('mul') || line.includes('div')) return 'arithmetic';
  if (line.includes('cmp') || line.includes('set')) return 'compare';
  if (line.includes('jmp') || line.includes('je') || line.includes('jne')) return 'jump';
  if (line.includes('call') || line.includes('ret')) return 'call';
  if (line.includes('xor') || line.includes('and') || line.includes('or')) return 'logic';
  if (line.startsWith(';') || line.trim() === '') return 'comment';
  if (line.includes(':')) return 'label';
  return 'other';
}

export default function CodeGenerationTab({ compilation }: CodeGenerationTabProps) {
  const code = compilation.generated_code || [];
  const errors = compilation.codegen_errors || [];
  const [copied, setCopied] = useState(false);

  const instructionStats = useMemo(() => {
    const stats: Record<string, number> = {};
    code.forEach((line) => {
      const category = categorizeInstruction(line);
      stats[category] = (stats[category] || 0) + 1;
    });
    return stats;
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      stack: 'text-purple-400',
      move: 'text-blue-400',
      arithmetic: 'text-green-400',
      compare: 'text-yellow-400',
      jump: 'text-red-400',
      call: 'text-pink-400',
      logic: 'text-cyan-400',
      label: 'text-amber-400',
      comment: 'text-gray-500',
      other: 'text-white',
    };
    return colors[category] || 'text-white';
  };

  return (
    <div className="h-full flex flex-col overflow-auto p-6">
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{code.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Assembly lines</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Instruction Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Object.keys(instructionStats).length}</div>
              <p className="text-xs text-muted-foreground mt-1">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Codegen Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{errors.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Issues found</p>
            </CardContent>
          </Card>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Code Generation Errors ({errors.length})</div>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Instruction Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instruction Breakdown</CardTitle>
            <CardDescription>Distribution by instruction type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(instructionStats)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-muted rounded">
                    <span className={`text-sm font-semibold capitalize ${getCategoryColor(category)}`}>
                      {category}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Assembly Code */}
        <Card>
          <div className="flex items-center justify-between border-b p-6">
            <div>
              <CardTitle className="text-base">Assembly Code (x86-64)</CardTitle>
              <CardDescription>Final generated code</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
          <CardContent className="p-0">
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto bg-slate-950">
              <div className="font-mono text-sm">
                {code.length > 0 ? (
                  code.map((line, idx) => {
                    const category = categorizeInstruction(line);
                    const colorClass = getCategoryColor(category);
                    return (
                      <div
                        key={idx}
                        className={`px-4 py-2 border-b border-slate-800 hover:bg-slate-900 flex gap-4 ${colorClass}`}
                      >
                        <span className="text-slate-500 w-8 text-right">{idx}</span>
                        <span className="flex-1">{line}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-slate-500">No assembly code generated</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
