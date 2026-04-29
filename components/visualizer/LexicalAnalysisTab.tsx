'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

interface Token {
  type: string;
  value: string;
  line: number;
  column: number;
}

interface LexicalAnalysisTabProps {
  compilation: {
    tokens?: Token[];
    lexical_errors?: string[];
  };
}

export default function LexicalAnalysisTab({ compilation }: LexicalAnalysisTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'line' | 'type' | 'value'>('line');

  const tokens = compilation.tokens || [];
  const errors = compilation.lexical_errors || [];

  // Filter and sort tokens
  const filteredTokens = useMemo(() => {
    let filtered = tokens.filter((t) =>
      t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'type') {
      filtered.sort((a, b) => a.type.localeCompare(b.type));
    } else if (sortBy === 'value') {
      filtered.sort((a, b) => a.value.localeCompare(b.value));
    } else {
      filtered.sort((a, b) => a.line - b.line);
    }

    return filtered;
  }, [tokens, searchTerm, sortBy]);

  // Calculate token frequency
  const tokenFrequency = useMemo(() => {
    const freq: Record<string, number> = {};
    tokens.forEach((t) => {
      freq[t.type] = (freq[t.type] || 0) + 1;
    });
    return Object.entries(freq).map(([type, count]) => ({
      name: type,
      value: count,
    }));
  }, [tokens]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className="h-full flex flex-col overflow-auto p-6">
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tokens.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Unique types: {tokenFrequency.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Most Common</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {tokenFrequency[0]?.name || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{tokenFrequency[0]?.value} occurrences</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Lexical Errors</CardTitle>
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
              <div className="font-semibold mb-2">Lexical Errors ({errors.length})</div>
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

        {/* Charts */}
        {tokenFrequency.length > 0 && (
          <div className="grid grid-cols-2 gap-6">
            {/* Token Frequency Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Token Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tokenFrequency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Token Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Token Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tokenFrequency}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tokenFrequency.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Token Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Token List</CardTitle>
            <CardDescription>Detailed view of all tokens</CardDescription>
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'line' | 'type' | 'value')}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="line">Sort by Line</option>
                <option value="type">Sort by Type</option>
                <option value="value">Sort by Value</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted sticky top-0">
                  <TableRow>
                    <TableHead className="w-20">Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="w-16">Line</TableHead>
                    <TableHead className="w-16">Column</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTokens.length > 0 ? (
                    filteredTokens.map((token, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-xs font-semibold text-blue-600">
                          {token.type}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{token.value}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{token.line}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{token.column}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No tokens match the search
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
