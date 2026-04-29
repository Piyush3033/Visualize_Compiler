'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeInput from '@/components/visualizer/CodeInput';
import LexicalAnalysisTab from '@/components/visualizer/LexicalAnalysisTab';
import SyntaxAnalysisTab from '@/components/visualizer/SyntaxAnalysisTab';
import SemanticAnalysisTab from '@/components/visualizer/SemanticAnalysisTab';
import IntermediateCodeTab from '@/components/visualizer/IntermediateCodeTab';
import OptimizationTab from '@/components/visualizer/OptimizationTab';
import CodeGenerationTab from '@/components/visualizer/CodeGenerationTab';
import { Button } from '@/components/ui/button';
import { Loader2, Code2 } from 'lucide-react';

const SAMPLE_CODES = {
  basic: {
    name: 'Basic Program',
    code: `// Basic C program with variables
int main() {
  int x = 10;
  int y = 20;
  int result = x + y;
  return result;
}`,
  },
  withLoop: {
    name: 'Loop Program',
    code: `// Program with a for loop
int main() {
  int sum = 0;
  int i = 0;
  while (i < 10) {
    sum = sum + i;
    i = i + 1;
  }
  return sum;
}`,
  },
  withIfElse: {
    name: 'Conditional Logic',
    code: `// Program with if-else
int main() {
  int age = 25;
  if (age >= 18) {
    int status = 1;
  } else {
    int status = 0;
  }
  return 0;
}`,
  },
  syntaxError: {
    name: 'Syntax Error Demo',
    code: `// This has a syntax error
int main() {
  int x = 10
  return x;
}`,
  },
  semanticError: {
    name: 'Semantic Error Demo',
    code: `// This has type mismatch
int main() {
  int x = 10;
  float y = x;
  char c = y;
  return 0;
}`,
  },
  complexProgram: {
    name: 'Complex Program',
    code: `// More complex program
int main() {
  int a = 5;
  int b = 3;
  int result = 0;
  
  if (a > b) {
    result = a - b;
  } else {
    result = b - a;
  }
  
  return result;
}`,
  },
};

interface CompilationResult {
  tokens?: Array<{ type: string; value: string; line: number; column: number }>;
  lexical_errors?: string[];
  ast?: any;
  syntax_errors?: string[];
  symbol_table?: Array<any>;
  semantic_errors?: string[];
  intermediate_code?: Array<any>;
  ir_errors?: string[];
  optimized_code?: Array<any>;
  optimization_stats?: Record<string, any>;
  generated_code?: string[];
  codegen_errors?: string[];
  error?: string;
}

export default function VisualizerPage() {
  const [code, setCode] = useState(
    `// Sample C-like code
int main() {
  int x = 10;
  int y = 20;
  int result = x + y;
  return result;
}`
  );
  const [compilation, setCompilation] = useState<CompilationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('lexical');

  // Return early if no compilation result yet
  const hasCompiled = !!compilation && !compilation.error;

  const handleCompile = async () => {
    if (!code.trim()) {
      alert('Please enter some code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();
      setCompilation(result);
    } catch (error) {
      console.error('Compilation error:', error);
      setCompilation({
        error: error instanceof Error ? error.message : 'Compilation failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen flex-col bg-gradient-to-br from-background via-background to-slate-50 dark:to-slate-900">
      {/* Header with Gradient */}
      <div className="gradient-card border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4 sm:py-6 shadow-sm">
        <div className="animate-fade-in-down">
          <h1 className="gradient-text text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">Compiler Phases Visualizer</h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Watch code compile through all 6 phases: Lexical, Syntax, Semantic, IR Generation, Optimization, and Code Generation
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden gap-2 sm:gap-4 p-2 sm:p-4 flex-col lg:flex-row">
        {/* Code Editor Panel */}
        <div className="flex w-full lg:w-1/3 flex-col gradient-card rounded-lg sm:rounded-xl shadow-lg overflow-hidden animate-fade-in-up">
          <div className="flex-1 overflow-hidden">
            <CodeInput code={code} onChange={setCode} />
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 p-2 sm:p-4 bg-gradient-to-t from-slate-50 dark:from-slate-900 space-y-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Sample Codes:</p>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(SAMPLE_CODES).map(([key, sample]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => setCode(sample.code)}
                    className="text-xs h-8"
                  >
                    <Code2 className="h-3 w-3 mr-1" />
                    {sample.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button
              onClick={handleCompile}
              disabled={isLoading}
              className="w-full gradient-brand hover:opacity-90 transition-opacity shadow-md text-white font-semibold text-sm sm:text-base"
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Compiling...
                </>
              ) : (
                'Compile Code'
              )}
            </Button>
          </div>
        </div>

        {/* Visualization Tabs Panel */}
        <div className="flex-1 overflow-hidden gradient-card rounded-lg sm:rounded-xl shadow-lg animate-fade-in-up flex flex-col" style={{ animationDelay: '100ms' }}>
          {compilation ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto flex-shrink-0 min-w-max sm:min-w-0">
                  <TabsTrigger value="lexical" className="rounded-none text-xs sm:text-sm border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 px-2 sm:px-4 py-2">
                    <span className="hidden sm:inline">Phase 1: </span>Lexical
                  </TabsTrigger>
                  <TabsTrigger value="syntax" className="rounded-none text-xs sm:text-sm border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 px-2 sm:px-4 py-2">
                    <span className="hidden sm:inline">Phase 2: </span>Syntax
                  </TabsTrigger>
                  <TabsTrigger value="semantic" className="rounded-none text-xs sm:text-sm border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 px-2 sm:px-4 py-2">
                    <span className="hidden sm:inline">Phase 3: </span>Semantic
                  </TabsTrigger>
                  <TabsTrigger value="ir" className="rounded-none text-xs sm:text-sm border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 px-2 sm:px-4 py-2">
                    <span className="hidden sm:inline">Phase 4: </span>IR
                  </TabsTrigger>
                  <TabsTrigger value="optimization" className="rounded-none text-xs sm:text-sm border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 px-2 sm:px-4 py-2">
                    <span className="hidden sm:inline">Phase 5: </span>Opt
                  </TabsTrigger>
                  <TabsTrigger value="codegen" className="rounded-none text-xs sm:text-sm border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 px-2 sm:px-4 py-2">
                    <span className="hidden sm:inline">Phase 6: </span>Codegen
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-auto">
                <TabsContent value="lexical" className="h-full m-0 p-2 sm:p-4">
                  <LexicalAnalysisTab compilation={compilation} />
                </TabsContent>
                <TabsContent value="syntax" className="h-full m-0 p-2 sm:p-4">
                  <SyntaxAnalysisTab compilation={compilation} />
                </TabsContent>
                <TabsContent value="semantic" className="h-full m-0 p-2 sm:p-4">
                  <SemanticAnalysisTab compilation={compilation} />
                </TabsContent>
                <TabsContent value="ir" className="h-full m-0 p-2 sm:p-4">
                  <IntermediateCodeTab compilation={compilation} />
                </TabsContent>
                <TabsContent value="optimization" className="h-full m-0 p-2 sm:p-4">
                  <OptimizationTab compilation={compilation} />
                </TabsContent>
                <TabsContent value="codegen" className="h-full m-0 p-2 sm:p-4">
                  <CodeGenerationTab compilation={compilation} />
                </TabsContent>
              </div>
            </Tabs>
          ) : (
            <div className="flex h-full items-center justify-center flex-col gap-4 p-4">
              <div className="text-center">
                <div className="text-4xl sm:text-6xl mb-2 sm:mb-4 opacity-20">⚙️</div>
                <p className="text-base sm:text-lg font-semibold gradient-text">Ready to Compile</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Click "Compile Code" to see the visualization</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
