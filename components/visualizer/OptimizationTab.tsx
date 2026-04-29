'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingDown } from 'lucide-react';

interface IRInstruction {
  op: string;
  arg1?: string;
  arg2?: string;
  result?: string;
}

interface OptimizationTabProps {
  compilation: {
    intermediate_code?: IRInstruction[];
    optimized_code?: IRInstruction[];
    optimization_stats?: Record<string, any>;
    optimization_errors?: string[];
  };
}

function formatInstruction(instr: IRInstruction): string {
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

export default function OptimizationTab({ compilation }: OptimizationTabProps) {
  const original = compilation.intermediate_code || [];
  const optimized = compilation.optimized_code || [];
  const stats = compilation.optimization_stats || {};
  const errors = compilation.optimization_errors || [];

  const comparison = useMemo(() => {
    return [
      {
        name: 'Code Size',
        original: original.length,
        optimized: optimized.length,
      },
    ];
  }, [original, optimized]);

  const improvement = useMemo(() => {
    if (original.length === 0) return 0;
    return ((original.length - optimized.length) / original.length) * 100;
  }, [original, optimized]);

  return (
    <div className="h-full flex flex-col overflow-auto p-6">
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Original Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{original.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Instructions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Optimized Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{optimized.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Instructions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-6 w-6 text-green-600" />
                <span className="text-3xl font-bold text-green-600">{improvement.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Instructions Removed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{original.length - optimized.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Dead code eliminated</p>
            </CardContent>
          </Card>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Optimization Errors ({errors.length})</div>
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

        {/* Optimization Stats */}
        {Object.keys(stats).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Optimization Techniques Applied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-muted rounded">
                    <span className="text-sm font-semibold capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-lg font-bold text-blue-600">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Code Size Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="original" fill="#ef4444" name="Original" />
                <Bar dataKey="optimized" fill="#10b981" name="Optimized" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Side by Side Comparison */}
        <div className="grid grid-cols-2 gap-6">
          {/* Original */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Original Code</CardTitle>
              <CardDescription>{original.length} instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto bg-red-950/20">
                <div className="font-mono text-sm">
                  {original.length > 0 ? (
                    original.map((instr, idx) => (
                      <div key={idx} className="px-4 py-2 border-b border-red-200/20 hover:bg-red-900/20 flex gap-4">
                        <span className="text-red-600 w-8 text-right">{idx}</span>
                        <span className="text-red-400 flex-1">{formatInstruction(instr)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-muted-foreground">No code</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optimized */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Optimized Code</CardTitle>
              <CardDescription>{optimized.length} instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto bg-green-950/20">
                <div className="font-mono text-sm">
                  {optimized.length > 0 ? (
                    optimized.map((instr, idx) => (
                      <div key={idx} className="px-4 py-2 border-b border-green-200/20 hover:bg-green-900/20 flex gap-4">
                        <span className="text-green-600 w-8 text-right">{idx}</span>
                        <span className="text-green-400 flex-1">{formatInstruction(instr)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-muted-foreground">No code</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
