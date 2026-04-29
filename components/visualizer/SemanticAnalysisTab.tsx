'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface Symbol {
  name: string;
  type: string;
  scope: string;
  line: number;
  attributes: Record<string, any>;
}

interface SemanticAnalysisTabProps {
  compilation: {
    symbol_table?: Symbol[];
    semantic_errors?: string[];
  };
}

export default function SemanticAnalysisTab({ compilation }: SemanticAnalysisTabProps) {
  const symbols = compilation.symbol_table || [];
  const errors = compilation.semantic_errors || [];

  // Group symbols by scope
  const symbolsByScope = symbols.reduce((acc, symbol) => {
    if (!acc[symbol.scope]) {
      acc[symbol.scope] = [];
    }
    acc[symbol.scope].push(symbol);
    return acc;
  }, {} as Record<string, Symbol[]>);

  const scopes = Object.keys(symbolsByScope).sort();

  return (
    <div className="h-full flex flex-col overflow-auto p-6">
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Symbols</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{symbols.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Scopes: {scopes.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Semantic Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {errors.length === 0 ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span className="text-xl font-bold text-green-600">Valid</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <span className="text-xl font-bold text-red-600">Errors</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Semantic Errors</CardTitle>
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
              <div className="font-semibold mb-2">Semantic Errors ({errors.length})</div>
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

        {/* Symbol Table by Scope */}
        {scopes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Symbol Table</h2>
            {scopes.map((scope) => (
              <Card key={scope}>
                <CardHeader>
                  <CardTitle className="text-base">Scope: {scope}</CardTitle>
                  <CardDescription>{symbolsByScope[scope].length} symbols</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-muted sticky top-0">
                        <TableRow>
                          <TableHead className="w-32">Name</TableHead>
                          <TableHead className="w-24">Type</TableHead>
                          <TableHead className="w-16">Line</TableHead>
                          <TableHead>Attributes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {symbolsByScope[scope].map((symbol, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/50">
                            <TableCell className="font-mono font-semibold">{symbol.name}</TableCell>
                            <TableCell className="font-mono text-sm text-blue-600">{symbol.type}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{symbol.line}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {Object.entries(symbol.attributes)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(', ')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
