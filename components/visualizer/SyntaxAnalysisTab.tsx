'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronDown, ChevronRight, ExternalLink, Search, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { generateASTPopupHTML } from '@/lib/ast-popup-html';

interface ASTNode {
  type: string;
  value?: string;
  children?: ASTNode[];
  line?: number;
  column?: number;
}

interface SyntaxAnalysisTabProps {
  compilation: {
    ast?: ASTNode;
    syntax_errors?: string[];
  };
}

// Tree view component for AST
interface ASTViewerProps {
  node: ASTNode | undefined;
  level?: number;
}

interface ASTNodeDisplayProps extends ASTViewerProps {
  searchQuery?: string;
  colorMap?: Record<string, string>;
}

function ASTViewer({ node, level = 0, searchQuery = '', colorMap }: ASTNodeDisplayProps) {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first 2 levels

  if (!node) return null;

  const hasChildren = node.children && node.children.length > 0;
  const matches = !searchQuery || node.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (node.value && node.value.toLowerCase().includes(searchQuery.toLowerCase()));
  
  // Get color based on node type
  const getColor = (type: string) => {
    const defaultColorMap: Record<string, string> = {
      'Declaration': '#3b82f6', 'FunctionDeclaration': '#0ea5e9', 'ClassDeclaration': '#6366f1',
      'IfStatement': '#10b981', 'WhileStatement': '#14b8a6', 'ForStatement': '#06b6d4',
      'ReturnStatement': '#f97316', 'BinaryOp': '#ec4899', 'UnaryOp': '#f43f5e',
      'Identifier': '#06b6d4', 'Block': '#84cc16',
    };
    return (colorMap && colorMap[type]) || defaultColorMap[type] || '#64748b';
  };

  const nodeColor = getColor(node.type);
  
  // Indent based on level (responsive)
  const indentClass = `ml-${Math.min(level * 3, 12)} sm:ml-${Math.min(level * 4, 16)}`;

  return (
    <div className="font-mono text-xs sm:text-sm" style={{ opacity: matches ? 1 : 0.4 }}>
      <div className={`flex items-center gap-2 py-1.5 px-2 rounded transition-all duration-200 hover:bg-primary/10 group ${indentClass}`}>
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="hover:bg-primary/20 p-1 rounded transition-transform duration-200 flex-shrink-0 group-hover:scale-110"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            title={expanded ? 'Collapse (Space)' : 'Expand (Space)'}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" style={{ color: nodeColor }} />
            ) : (
              <ChevronRight className="h-4 w-4" style={{ color: nodeColor }} />
            )}
          </button>
        )}
        {!hasChildren && <span className="w-6 flex-shrink-0" />}
        
        <span className="font-bold" style={{ color: nodeColor }}>
          {node.type}
        </span>
        
        {node.value && (
          <span className="text-green-400 ml-1 truncate text-xs" title={node.value}>
            "{node.value.substring(0, 20)}{node.value.length > 20 ? '...' : ''}"
          </span>
        )}
        
        {node.line && (
          <span className="text-gray-500 text-xs ml-auto flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
            L{node.line}
          </span>
        )}
      </div>
      
      {expanded && hasChildren && (
        <div className="border-l border-primary/20 pl-2 space-y-0">
          {node.children!.map((child, idx) => (
            <ASTViewer 
              key={idx} 
              node={child} 
              level={level + 1} 
              searchQuery={searchQuery}
              colorMap={colorMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SyntaxAnalysisTab({ compilation }: SyntaxAnalysisTabProps) {
  const ast = compilation.ast;
  const errors = compilation.syntax_errors || [];

  // Color mapping for different AST node types
  const getNodeColorMap = (): Record<string, string> => ({
    // Declarations and definitions
    'Declaration': '#3b82f6',
    'FunctionDeclaration': '#0ea5e9',
    'ClassDeclaration': '#6366f1',
    'NamespaceDeclaration': '#7c3aed',
    'StructDeclaration': '#8b5cf6',
    'TemplateDeclaration': '#a78bfa',
    'UnionDeclaration': '#c084fc',
    'EnumDeclaration': '#d946ef',
    
    // Statements
    'IfStatement': '#10b981',
    'WhileStatement': '#14b8a6',
    'ForStatement': '#06b6d4',
    'ReturnStatement': '#f97316',
    'Block': '#84cc16',
    'ExpressionStatement': '#eab308',
    'SwitchStatement': '#22c55e',
    'CaseStatement': '#4ade80',
    'BreakStatement': '#fb7185',
    'ContinueStatement': '#fb923c',
    'ThrowStatement': '#f87171',
    'TryStatement': '#fbbf24',
    
    // Expressions
    'BinaryOp': '#ec4899',
    'UnaryOp': '#f43f5e',
    'CallExpression': '#e11d48',
    'AssignmentExpression': '#d946ef',
    'ConditionalExpression': '#c2410c',
    'ArrayAccess': '#8b5cf6',
    'MemberAccess': '#a78bfa',
    
    // Types and identifiers
    'Identifier': '#06b6d4',
    'TypeName': '#f59e0b',
    'ArrayDeclarator': '#8b5cf6',
    'PointerDeclarator': '#ec4899',
    'ReferenceDeclarator': '#f43f5e',
    'Parameter': '#a78bfa',
    'Variable': '#3b82f6',
    
    // Keywords and literals
    'Keyword': '#f97316',
    'Number': '#10b981',
    'String': '#06b6d4',
    'Character': '#059669',
    'Boolean': '#0d9488',
    
    // Default
    'default': '#64748b',
  });

  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenASTWindow = () => {
    const astWindow = window.open('', 'ASTViewer', 'width=1920,height=1200');
    if (astWindow) {
      const htmlContent = generateASTPopupHTML(ast, getNodeColorMap());
      astWindow.document.write(htmlContent);
      astWindow.document.close();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Syntax Errors ({errors.length})</div>
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

      {/* AST Content */}
      {ast ? (
        <div className="flex flex-col gap-4 h-full">
          <div 
            className="flex items-center justify-between gap-3 flex-wrap border-b px-4 py-2 rounded-lg"
            style={{
              background: "linear-gradient(163deg, #2841be 0%, #ffffff 100%)",
              backgroundColor: "transparent"
            }}
          >
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">Abstract Syntax Tree</h2>
              <p className="text-sm text-muted-foreground mt-1">Interactive hierarchical tree structure with node search and filtering</p>
            </div>
            <Button
              onClick={handleOpenASTWindow}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md whitespace-nowrap"
              size="sm"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Expand View</span>
              <span className="sm:hidden">Expand</span>
            </Button>
          </div>
          
          <Card className="flex-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle className="text-base">Tree Viewer</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Expandable nodes with color-coded types</CardDescription>
                </div>
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-3 sm:p-4 space-y-0.5">
              <ASTViewer 
                node={ast} 
                searchQuery={searchQuery}
                colorMap={getNodeColorMap()}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-base font-medium">No AST Generated</p>
            <p className="text-sm mt-2">Compile code to view the Abstract Syntax Tree</p>
          </div>
        </div>
      )}
    </div>
  );
}
