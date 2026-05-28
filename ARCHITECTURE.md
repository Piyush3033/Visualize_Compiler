# Architecture Documentation

## System Overview

The Compiler Phases Visualizer is a full-stack web application built with Next.js that provides interactive visualization of the compilation process. The system is divided into three main layers:

1. **Frontend Layer** - React components for user interaction and visualization
2. **API Layer** - Node.js/Next.js API routes for request handling
3. **Compilation Engine** - TypeScript/Python compiler implementation

```
┌─────────────────────────────────────────────────────┐
│                   Browser/Client                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Editor     │  │  Visualizer  │  │  Charts    │ │
│  │  Component   │  │  Components  │  │ Libraries  │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
└────────────────────────┬────────────────────────────┘
                         │ HTTP JSON
         ┌───────────────┴──────────────┐
         │    Next.js API Routes        │
         │  /api/compile (POST)         │
         └───────────────┬──────────────┘
                         │
         ┌───────────────┴──────────────┐
         │  Compilation Engine          │
         │  (TypeScript/Python)         │
         └──────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
page.tsx (Main Page)
├── CodeInput.tsx
│   └── Monaco Editor
├── CompilerPhasesTabs.tsx
│   ├── LexicalAnalysisTab.tsx
│   │   ├── Token Frequency Chart
│   │   ├── Token Distribution
│   │   └── Token List View
│   ├── SyntaxAnalysisTab.tsx
│   │   ├── AST Viewer
│   │   ├── Tree Visualization
│   │   └── Node Details Panel
│   ├── SemanticAnalysisTab.tsx
│   │   ├── Symbol Table
│   │   ├── Type Information
│   │   └── Scope Information
│   ├── IRGenerationTab.tsx
│   │   ├── IR Code View
│   │   ├── Instruction Details
│   │   └── Variable Mapping
│   ├── OptimizationTab.tsx
│   │   ├── Optimized IR
│   │   ├── Optimization Stats
│   │   └── Performance Metrics
│   └── CodeGenerationTab.tsx
│       ├── Assembly Code
│       ├── Register Mapping
│       └── Generated Code Stats
└── SampleCodes.tsx
    └── Pre-loaded Examples
```

### Component Responsibilities

#### CodeInput.tsx
- Provides Monaco Editor instance for code input
- Manages editor state and syntax highlighting
- Handles file uploads
- Communicates with parent component on code changes

**Key Props:**
- `code: string` - Current code content
- `onCodeChange: (code: string) => void` - Callback for code changes

#### CompilerPhasesTabs.tsx
- Main container managing compilation state
- Handles tab switching between phases
- Stores compilation results
- Orchestrates API calls

**State:**
- `code: string` - Source code being compiled
- `compilationResult: CompilationResult` - Full compilation output
- `activeTab: number` - Currently active phase tab
- `isCompiling: boolean` - Loading state

#### Phase-Specific Tab Components
Each tab component (LexicalAnalysisTab, SyntaxAnalysisTab, etc.) is responsible for:
- Displaying data for that compilation phase
- Creating visualizations appropriate to the phase
- Showing error information if present
- Providing phase-specific interactions

### State Management

State is managed locally in the main page component using React hooks:
- `useState` for compilation results and UI state
- `useCallback` for memoized functions
- `useEffect` for side effects (API calls)

Data flows from child components (CodeInput) → parent component (page.tsx) → sibling components (Phase tabs) via callback functions and state updates.

## API Layer

### Next.js API Route: /api/compile

**File:** `/app/api/compile/route.ts`

**Method:** POST

**Request Format:**
```typescript
interface CompileRequest {
  code: string;
}
```

**Response Format:**
```typescript
interface CompilationResult {
  tokens: Token[];
  lexical_errors: string[];
  ast: ASTNode | null;
  syntax_errors: string[];
  symbol_table: Symbol[];
  semantic_errors: string[];
  intermediate_code: IRInstruction[];
  ir_errors: string[];
  optimized_code: IRInstruction[];
  optimization_stats: OptimizationStats;
  optimization_errors: string[];
  generated_code: string[];
  codegen_errors: string[];
}
```

**Implementation Details:**
1. Receives JSON request with source code
2. Validates input (non-empty string)
3. Calls TypeScript compiler implementation
4. Returns structured JSON response
5. Handles errors gracefully with meaningful messages

## Compilation Engine

### Two-Tier Approach

The system supports both TypeScript and Python implementations:

#### 1. TypeScript Implementation (Production - Serverless Compatible)

**File:** `/lib/compiler.ts`

Pure TypeScript implementation of the complete compilation pipeline:

```typescript
export function compileC(code: string): CompilationResult {
  // Phase 1: Lexical Analysis
  const { tokens, lexical_errors } = lexicalAnalysis(code);
  
  // Phase 2: Syntax Analysis
  const { ast, syntax_errors } = syntaxAnalysis(tokens);
  
  // Phase 3: Semantic Analysis
  const { symbol_table, semantic_errors } = semanticAnalysis(ast);
  
  // Phase 4: IR Generation
  const { intermediate_code, ir_errors } = irGeneration(ast, symbol_table);
  
  // Phase 5: Optimization
  const { optimized_code, stats } = optimize(intermediate_code);
  
  // Phase 6: Code Generation
  const { generated_code, codegen_errors } = codeGeneration(optimized_code);
  
  return {
    tokens, lexical_errors,
    ast, syntax_errors,
    symbol_table, semantic_errors,
    intermediate_code, ir_errors,
    optimized_code, optimization_stats: stats, optimization_errors: [],
    generated_code, codegen_errors
  };
}
```

**Advantages:**
- Works in serverless environments (Vercel)
- No external dependencies (Python3 not required)
- Fast execution
- Easy to debug and maintain
- Type-safe with TypeScript

#### 2. Python Implementation (Development - Full-Featured)

**Files:** `/scripts/compiler/`
- `lexer.py` - Tokenization
- `parser.py` - AST generation
- `semantic_analyzer.py` - Type checking and symbol resolution
- `ir_generator.py` - Intermediate code generation
- `optimizer.py` - Code optimization
- `codegen.py` - Assembly code generation

**Advantages:**
- More comprehensive language support
- Better error handling
- Reference implementation
- Educational value

### Compilation Pipeline Phases

#### Phase 1: Lexical Analysis (Tokenization)

**Input:** Source code string
**Output:** Array of tokens

**Process:**
1. Scan source code character by character
2. Identify token patterns (keywords, identifiers, operators, literals)
3. Create Token objects with type, value, line, column
4. Report lexical errors (invalid characters, unterminated strings)

**Token Types:**
```typescript
enum TokenType {
  KEYWORD, IDENTIFIER, NUMBER, STRING, OPERATOR,
  PUNCTUATION, COMMENT, WHITESPACE, EOF, UNKNOWN
}
```

#### Phase 2: Syntax Analysis (Parsing)

**Input:** Token array
**Output:** Abstract Syntax Tree (AST)

**Process:**
1. Use recursive descent parser
2. Match token patterns against grammar rules
3. Build hierarchical AST nodes
4. Report syntax errors with position information
5. Handle operator precedence and associativity

**AST Node Types:**
```typescript
interface ASTNode {
  type: string;  // Declaration, Statement, Expression, Type, etc.
  value?: string; // Keyword, identifier, literal value
  children?: ASTNode[];
  line?: number;
  column?: number;
}
```

#### Phase 3: Semantic Analysis

**Input:** AST and lexical tokens
**Output:** Symbol table and semantic validation

**Process:**
1. Traverse AST collecting declarations
2. Build symbol table (variables, functions, types)
3. Check type compatibility
4. Verify symbol references
5. Report semantic errors (undefined variables, type mismatches)

**Symbol Table Entry:**
```typescript
interface Symbol {
  name: string;
  type: string;
  scope: string;
  line: number;
  attributes: Record<string, any>;
}
```

#### Phase 4: Intermediate Representation Generation

**Input:** AST and symbol table
**Output:** IR instructions (three-address code)

**Process:**
1. Convert AST to intermediate representation
2. Generate temporary variables as needed
3. Create IR instructions (load, store, arithmetic, jumps)
4. Build control flow graph
5. Track variable live ranges

**IR Instruction Format:**
```typescript
interface IRInstruction {
  opcode: string;      // ADD, SUB, LOAD, STORE, JUMP, etc.
  result?: string;     // Destination variable
  operand1?: string;   // First operand
  operand2?: string;   // Second operand
  label?: string;      // Jump target
}
```

#### Phase 5: Code Optimization

**Input:** IR code
**Output:** Optimized IR code with statistics

**Process:**
1. Eliminate dead code
2. Perform constant folding
3. Optimize temporary variables
4. Simplify control flow
5. Calculate optimization metrics

**Optimizations Applied:**
- Dead code elimination
- Constant folding
- Algebraic simplifications
- Jump eliminations
- Redundant load/store removal

#### Phase 6: Code Generation

**Input:** Optimized IR
**Output:** Assembly-like code

**Process:**
1. Allocate registers
2. Generate instructions for each IR operation
3. Handle function calls and returns
4. Generate data sections
5. Create output assembly code

**Generated Code Format:**
```
main:
  PUSH ebp
  MOV ebp, esp
  MOV eax, 0
  JMP return
return:
  POP ebp
  RET
```

## Data Flow

### Compilation Request Flow

```
1. User enters code in CodeInput
   ↓
2. Calls handleCompile callback
   ↓
3. Makes POST request to /api/compile
   ↓
4. Server receives request in route.ts
   ↓
5. Calls compileC(code) from lib/compiler.ts
   ↓
6. Compilation pipeline executes 6 phases
   ↓
7. Returns structured CompilationResult
   ↓
8. Route returns JSON response
   ↓
9. Client receives response
   ↓
10. Updates state with results
   ↓
11. Phase tabs re-render with new data
```

### State Update Pattern

```
[Code Change] → [handleCodeChange] → [setState(code)]
                                         ↓
                          [User clicks Compile]
                                         ↓
                       [POST /api/compile]
                                         ↓
                       [Receive response]
                                         ↓
                  [setState(compilationResult)]
                                         ↓
                    [Phase tabs re-render]
```

## Type Definitions

### Core Types

```typescript
// Token representation
interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

// AST Node representation
interface ASTNode {
  type: string;
  value?: string;
  children?: ASTNode[];
  line?: number;
  column?: number;
}

// Symbol table entry
interface Symbol {
  name: string;
  type: string;
  scope: string;
  line: number;
  attributes: Record<string, any>;
}

// Compilation result
interface CompilationResult {
  tokens: Token[];
  lexical_errors: string[];
  ast: ASTNode | null;
  syntax_errors: string[];
  symbol_table: Symbol[];
  semantic_errors: string[];
  intermediate_code: IRInstruction[];
  ir_errors: string[];
  optimized_code: IRInstruction[];
  optimization_stats: OptimizationStats;
  optimization_errors: string[];
  generated_code: string[];
  codegen_errors: string[];
}
```

## Performance Considerations

### Client-Side Optimizations

1. **Component Memoization** - Use React.memo for expensive components
2. **Lazy Loading** - Load tabs on demand
3. **Virtual Lists** - For large token/instruction lists
4. **Debouncing** - Delay API calls while user is typing

### Server-Side Optimizations

1. **Caching** - Cache compilation results for identical code
2. **Timeouts** - 30-second timeout on compilation
3. **Input Validation** - Quick validation before processing
4. **Async Processing** - Non-blocking compilation

### Scalability Limits

- **File Size**: Up to 1MB of source code
- **Complexity**: Up to 10,000 tokens per file
- **Tree Depth**: Up to 100 AST node depth
- **Processing Time**: < 200ms for typical code

## Security Considerations

1. **Input Validation** - Validate all user input
2. **Error Handling** - Don't expose stack traces to users
3. **Resource Limits** - Enforce timeouts and size limits
4. **Sandbox Execution** - Python execution in isolated process
5. **CORS** - Restrict API access if needed

## Extension Points

### Adding New Language Support

1. Add language detection in route.ts
2. Create language-specific compiler in lib/compiler.ts
3. Extend lexer with language keywords
4. Extend parser with language syntax
5. Update semantic analyzer for language types

### Adding New Compiler Phases

1. Create new tab component in components/visualizer/
2. Add phase output type to CompilationResult
3. Implement phase function in compiler
4. Update API response handling
5. Add visualization for new phase

### Adding New Visualizations

1. Create visualization component
2. Import charting library (Recharts)
3. Format data for visualization
4. Add to appropriate phase tab
5. Add error handling for edge cases

## Deployment Architecture

### Vercel Deployment

```
GitHub Repository
       ↓
GitHub Actions / Vercel Git Integration
       ↓
Vercel Build Process
  - pnpm install
  - pnpm build
  - Output: .next folder
       ↓
Vercel Serverless Functions
  - /api/compile → Node.js runtime
  - pages/** → Static/SSR
       ↓
CDN Distribution
```

### Environment Variables

Required for production:
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL=https://compiler-phases-visualizer.vercel.app` (optional)

### Build Optimization

- Next.js automatically optimizes output
- Unused code is tree-shaken
- CSS is minified
- JavaScript is minified and split
- Images are optimized

## Monitoring & Debugging

### Development Mode

```bash
pnpm dev
```
- Hot module reloading
- Source maps for debugging
- Detailed error messages
- Network request inspection

### Production Debugging

1. Enable verbose logging in route.ts
2. Use Vercel Analytics
3. Check Vercel Function Logs
4. Monitor error rates

### Common Issues

1. **Slow compilation** - Check input size, profile with DevTools
2. **Memory issues** - Large trees, increase Node heap
3. **API timeouts** - Complex code, increase timeout limit
4. **Type errors** - Run `pnpm type-check`

---

**Last Updated:** May 2026  
**Author:** Piyush Parmar  
**Version:** 1.0.0
