'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface IRInstruction {
  op: string;
  arg1?: string;
  arg2?: string;
  result?: string;
}

interface IntermediateCodeTabProps {
  compilation: {
    intermediate_code?: IRInstruction[];
    ir_errors?: string[];
  };
}

function formatInstruction(instr: IRInstruction, index: number): string {
  if (instr.arg2 && instr.result) {
    return `${instr.result} = ${instr.arg1} ${instr.op} ${instr.arg2}`;
  } else if (instr.arg1 && instr.result) {
    return `${instr.result} = ${instr.op} ${instr.arg1}`;
  } else if (instr.arg1) {
    return `${instr.op} ${instr.arg1}`;
  } else if (instr.result) {
    return `${instr.op}: ${instr.result}`;
  }
  return instr.op;
}

export default function IntermediateCodeTab({ compilation }: IntermediateCodeTabProps) {
  const ir = compilation.intermediate_code || [];
  const errors = compilation.ir_errors || [];

  // Count instruction types
  const instructionTypes = ir.reduce((acc, instr) => {
    acc[instr.op] = (acc[instr.op] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
              <div className="text-3xl font-bold">{ir.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Three-address instructions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Instruction Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Object.keys(instructionTypes).length}</div>
              <p className="text-xs text-muted-foreground mt-1">Unique operations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">IR Errors</CardTitle>
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
              <div className="font-semibold mb-2">IR Errors ({errors.length})</div>
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

        {/* Instruction Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instruction Types</CardTitle>
            <CardDescription>Distribution of operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(instructionTypes)
                .sort((a, b) => b[1] - a[1])
                .map(([op, count]) => (
                  <div key={op} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="font-mono text-sm font-semibold text-blue-600">{op}</span>
                    <span className="text-sm font-bold text-muted-foreground">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Three-Address Code</CardTitle>
            <CardDescription>Intermediate representation of the program</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto bg-slate-950">
              <div className="font-mono text-sm">
                {ir.length > 0 ? (
                  ir.map((instr, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 border-b border-slate-800 hover:bg-slate-900 flex gap-4"
                    >
                      <span className="text-slate-500 w-8 text-right">{idx}</span>
                      <span className="text-green-400 flex-1">{formatInstruction(instr, idx)}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-slate-500">No intermediate code generated</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
