# Architecture Documentation

## System Overview

The Advanced AST Visualizer is a full-stack application that compiles code to an Abstract Syntax Tree (AST) and provides interactive visualization.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   React Components                      │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │         SyntaxAnalysisTab.tsx                    │  │ │
│  │  │  - Code Editor (Monaco)                          │  │ │
│  │  │  - AST Viewer (Tree + SVG)                       │  │ │
│  │  │  - Error Display                                 │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │         Interactive Visualizer                    │  │ │
│  │  │  - SVG Rendering (ast-popup-html.ts)             │  │ │
│  │  │  - Zoom/Pan Controls                             │  │ │
│  │  │  - Search/Filter                                 │  │ │
│  │  │  - Export Capabilities                           │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ▲                                   │
│                           │ HTTP/JSON                         │
│                           ▼                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Next.js Backend (Server)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              API Routes (app/api/*)                    │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  /api/compile                                    │  │ │
│  │  │  POST: code → Python compiler → JSON response   │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  /api/compile-file                               │  │ │
│  │  │  POST: file upload → parse → response            │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ▲                                   │
│                           │ execSync                          │
│                           ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Python Compilation Pipeline                     │ │
│  │  /scripts/compiler/                                    │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ 1. Lexer (lexer.py)                              │  │ │
│  │  │    Input: Source Code                            │  │ │
│  │  │    Output: Tokens                                │  │ │
│  │  │    - Tokenization                                │  │ │
│  │  │    - Keyword identification                      │  │ │
│  │  │    - Operator/punctuation detection              │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                    ▼                                     │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ 2. Parser (parser.py)                            │  │ │
│  │  │    Input: Tokens                                 │  │ │
│  │  │    Output: AST                                   │  │ │
│  │  │    - Syntax analysis                             │  │ │
│  │  │    - Grammar validation                          │  │ │
│  │  │    - Tree building                               │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                    ▼                                     │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ 3. Semantic Analyzer (semantic_analyzer.py)      │  │ │
│  │  │    Input: AST                                    │  │ │
│  │  │    Output: Validated AST + Errors                │  │ │
│  │  │    - Type checking                               │  │ │
│  │  │    - Symbol table building                       │  │ │
│  │  │    - Semantic validation                         │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

#### SyntaxAnalysisTab.tsx
The main component that orchestrates the entire UI.

```typescript
SyntaxAnalysisTab
├── CodeEditor (Monaco)
│   ├── Language selection
│   ├── Theme toggle
│   └── Code input
├── ASTViewer (Main)
│   ├── Tree structure display
│   ├── Expand/collapse controls
│   └── Error highlighting
└── PopupViewer (Expand Window)
    ├── Full-screen SVG canvas
    ├── Interactive controls
    ├── Search/filter
    └── Export options
```

#### ASTViewer.tsx
Displays the AST in a collapsible tree format with syntax highlighting.

**Props:**
```typescript
interface ASTViewerProps {
  ast: ASTNode | null;
  errors: string[];
  onNodeSelect?: (node: ASTNode) => void;
}

interface ASTNode {
  type: string;
  value?: string;
  children?: ASTNode[];
  line?: number;
}
```

**Features:**
- Recursive tree rendering
- Memoized components for performance
- Color-coded node types
- Click to expand/collapse
- Copy tree functionality

#### Popup Visualizer
Interactive SVG-based AST visualization with pan, zoom, and search.

**Key Features:**
- D3-inspired hierarchical layout
- Bezier curve connections
- Node badges with child counts
- Gradient fills and glow effects
- Real-time search highlighting

### Backend Components

#### Lexer (lexer.py)
Tokenizes source code into a stream of tokens.

**Classes:**
```python
class Token:
    type: str          # KEYWORD, IDENTIFIER, NUMBER, etc.
    value: str         # Token content
    line: int          # Line number
    column: int        # Column number

class Lexer:
    def tokenize(code: str) -> List[Token]
    def _match_number(self) -> Token
    def _match_identifier(self) -> Token
    def _match_string(self) -> Token
```

**Supported Token Types:**
- KEYWORD: Reserved words (int, if, while, etc.)
- IDENTIFIER: Variable/function names
- NUMBER: Integer or floating-point literals
- STRING: Quoted strings
- OPERATOR: Arithmetic, logical, bitwise operators
- PUNCTUATION: Semicolons, braces, parentheses
- COMMENT: Single/multi-line comments

#### Parser (parser.py)
Builds an Abstract Syntax Tree from tokens.

**Grammar (Simplified BNF):**
```
program         : declaration* | statement*
declaration     : type IDENTIFIER (= expr)? ;
                | type IDENTIFIER ( parameters ) block
function_call   : IDENTIFIER ( arguments )
statement       : declaration
                | assignment
                | if_stmt
                | while_stmt
                | for_stmt
                | block
                | return_stmt
                | break_stmt
                | continue_stmt
expression      : assignment_expr
assignment_expr : logical_or_expr (= | += | -= | ...) logical_or_expr
logical_or_expr : logical_and_expr (|| logical_and_expr)*
logical_and_expr: bitwise_or_expr (&& bitwise_or_expr)*
...
```

**Key Methods:**
```python
class Parser:
    def parse(tokens: List[Token]) -> ASTNode
    def _parse_statement(self) -> ASTNode
    def _parse_expression(self) -> ASTNode
    def _parse_function_declaration(self) -> ASTNode
    def _parse_block(self) -> ASTNode
```

#### Semantic Analyzer (semantic_analyzer.py)
Performs type checking and semantic validation on the AST.

**Capabilities:**
- Symbol table management with scope tracking
- Type inference from declarations and assignments
- Type compatibility checking
- Function call validation
- Standard library function definitions (40+ functions)

**Key Methods:**
```python
class SemanticAnalyzer:
    def analyze(ast: ASTNode) -> Tuple[List[Symbol], List[str]]
    def _analyze_declaration(node: ASTNode) -> None
    def _analyze_function_call(node: ASTNode) -> None
    def _get_expression_type(expr: ASTNode) -> Optional[str]
    def _find_symbol(name: str) -> Optional[Symbol]
```

### Data Structures

#### ASTNode
Represents a node in the Abstract Syntax Tree.

```python
class ASTNode:
    type: str              # Node type (Statement, Expression, etc.)
    value: Optional[str]   # Optional value (operator, keyword, etc.)
    children: List[ASTNode] = []  # Child nodes
    line: int = 0          # Source line number
    column: int = 0        # Source column number
```

#### Symbol
Represents a declared identifier (variable, function).

```python
class Symbol:
    name: str              # Symbol name
    type: str              # Data type
    scope: str             # Scope name (global, function_name, etc.)
    line: int              # Declaration line
    attributes: Dict       # Additional properties
```

## Compilation Pipeline

### Step 1: Lexical Analysis (Lexer)

**Input:** Source code string

**Process:**
1. Initialize position at start of code
2. Iterate through characters
3. Match patterns (keywords, operators, literals, identifiers)
4. Create tokens with metadata
5. Handle whitespace and comments

**Output:** List of Token objects

**Example:**
```c
Input:  int x = 5;
Tokens: [
    Token(KEYWORD, "int"),
    Token(IDENTIFIER, "x"),
    Token(OPERATOR, "="),
    Token(NUMBER, "5"),
    Token(PUNCTUATION, ";")
]
```

### Step 2: Syntax Analysis (Parser)

**Input:** List of tokens

**Process:**
1. Initialize token pointer at position 0
2. Parse top-level program structure
3. For each statement/declaration:
   - Match patterns against grammar rules
   - Recursively parse nested structures
   - Build tree of ASTNode objects
4. Track errors for syntax violations

**Output:** Root ASTNode (type='Program')

**Example AST:**
```
Program
├── Declaration (int x)
│   ├── Type: int
│   ├── Identifier: x
│   └── Assignment: 5
└── FunctionCall (printf)
    ├── Identifier: printf
    └── Argument: "Hello"
```

### Step 3: Semantic Analysis

**Input:** AST + Token list

**Process:**
1. Initialize symbol table with stdlib functions
2. Traverse AST recursively
3. For each node:
   - Check for undefined symbols
   - Track variable types
   - Validate type operations
   - Build symbol table
4. Collect errors and warnings

**Output:** Validated AST + Semantic errors

## Type System

### Type Inference

The system automatically infers types from context:

```c
int x = 5;           // x: int (from literal)
double y = 3.14;    // y: double (from literal)
int z = x + 5;      // z: int (from x type)
z += 2;             // z: int (unchanged)
double w = (double)x / 2;  // w: double (from cast)
```

### Type Compatibility

Numeric types are compatible:
```c
int x = 5;
float y = x;  // OK: int → float implicit conversion
double z = y; // OK: float → double implicit conversion
char c = x;   // Warning: int → char (data loss possible)
```

### Member Type Inference

```c
struct Point { int x; int y; };
Point p;
p.x = 5;      // p.x: int (from struct definition)
int val = p.x; // val: int
```

## API Routes

### POST /api/compile

Compiles code and returns AST with errors.

**Request:**
```json
{
    "code": "int main() { return 0; }",
    "language": "c"  // Optional: c, cpp
}
```

**Response (Success):**
```json
{
    "success": true,
    "ast": {
        "type": "Program",
        "children": [...]
    },
    "tokens": [...],
    "syntax_errors": [],
    "semantic_errors": []
}
```

**Response (Error):**
```json
{
    "success": false,
    "error": "Compilation failed",
    "syntax_errors": [
        "Unexpected token '+=' at line 5"
    ],
    "semantic_errors": [
        "Undefined variable 'x' at line 10"
    ]
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request
- 500: Server error

## Performance Characteristics

### Time Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Lexing | O(n) | Single pass through code |
| Parsing | O(n) | Single pass through tokens |
| Type inference | O(n) | Tree traversal |
| Visualization | O(n log n) | Layout algorithm |

where n = code length or number of nodes

### Space Complexity

| Component | Complexity | Notes |
|-----------|-----------|-------|
| Token list | O(n) | Linear with code length |
| AST | O(h) | h = tree depth (typically 10-30) |
| Symbol table | O(s) | s = number of symbols |
| Total | O(n) | Dominated by tokens and AST |

### Optimization Strategies

1. **Lazy Rendering**: Only render visible nodes in large trees
2. **Memoization**: Cache node type colors and styles
3. **Virtual Scrolling**: Efficient list rendering for large trees
4. **Canvas Optimization**: Use requestAnimationFrame for smooth interactions
5. **Code Splitting**: Load parser/semantic analyzer on demand

## Extensibility

### Adding Language Support

1. **Extend Lexer:**
   - Add keywords to KEYWORDS dict
   - Add token patterns

2. **Extend Parser:**
   - Add new statement/expression types
   - Update production rules
   - Handle language-specific syntax

3. **Update Semantic Analyzer:**
   - Add type checking rules
   - Add built-in functions
   - Handle language semantics

### Adding Compiler Passes

```python
# Add new compilation pass
class OptimizationPass(CompilerPass):
    def visit(self, node: ASTNode) -> ASTNode:
        # Transform AST
        pass

# Register in compile pipeline
compiler.add_pass(OptimizationPass())
```

## Security Considerations

### Input Validation
- Code size limits (prevent DoS)
- Timeout for compilation (prevent infinite loops)
- Sanitize user input before processing

### Output Sanitization
- Escape special characters in error messages
- Validate JSON responses
- Content Security Policy headers

### Resource Limits
- Maximum AST depth (prevent stack overflow)
- Maximum node count (prevent memory exhaustion)
- Compilation timeout (prevent hanging)

## Monitoring & Debugging

### Debug Logging
```python
# Enable debug output
export DEBUG=ast-visualizer:*
pnpm dev
```

### Performance Profiling
```javascript
// Browser DevTools
Performance tab → Record → Analyze timeline
```

### Error Tracking
```
Sentry → Error grouping → Stack trace analysis
```

---

For implementation details, see individual source files or [README.md](./README.md).
