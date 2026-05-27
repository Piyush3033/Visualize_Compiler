# API Documentation

Complete reference for the Advanced AST Visualizer API endpoints.

## Base URL

```
Development:  http://localhost:3000/api
Production:   https://ast-visualizer.your-domain.com/api
```

## Authentication

Currently, all endpoints are publicly accessible. For production, implement authentication:

```javascript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.headers.get('authorization');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Validate token
}
```

## Endpoints

### POST /compile

Compiles source code and generates an Abstract Syntax Tree.

**Endpoint:** `POST /api/compile`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "code": "int main() { return 0; }",
    "language": "c"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | Source code to compile (max 100KB) |
| `language` | string | No | Programming language: `c`, `cpp` (default: auto-detect) |

**Response (200 - Success):**
```json
{
    "success": true,
    "ast": {
        "type": "Program",
        "children": [
            {
                "type": "FunctionDeclaration",
                "value": "main",
                "line": 1,
                "children": [
                    {
                        "type": "Type",
                        "value": "int"
                    },
                    {
                        "type": "Block",
                        "children": [
                            {
                                "type": "ReturnStatement",
                                "children": [
                                    {
                                        "type": "Number",
                                        "value": "0"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "tokens": [
        {
            "type": "KEYWORD",
            "value": "int",
            "line": 1,
            "column": 1
        },
        {
            "type": "IDENTIFIER",
            "value": "main",
            "line": 1,
            "column": 5
        },
        // ... more tokens
    ],
    "syntax_errors": [],
    "semantic_errors": [],
    "metadata": {
        "compilation_time_ms": 45,
        "node_count": 12,
        "tree_depth": 4
    }
}
```

**Response (400 - Bad Request):**
```json
{
    "success": false,
    "error": "Invalid request",
    "details": "Code parameter is required"
}
```

**Response (413 - Payload Too Large):**
```json
{
    "success": false,
    "error": "Code size exceeds maximum (100KB)"
}
```

**Response (500 - Server Error):**
```json
{
    "success": false,
    "error": "Compilation failed",
    "syntax_errors": [
        "Unexpected token '+=' at line 5, column 8"
    ],
    "semantic_errors": [
        "Undefined function 'unknownFunc' at line 10"
    ]
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/compile \
  -H "Content-Type: application/json" \
  -d '{
    "code": "int main() { printf(\"Hello\"); return 0; }",
    "language": "c"
  }'
```

**Example JavaScript:**
```javascript
async function compileCode(code) {
    const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    });
    
    if (!response.ok) {
        throw new Error(`Compilation failed: ${response.statusText}`);
    }
    
    return response.json();
}

// Usage
try {
    const result = await compileCode('int x = 5;');
    console.log('AST:', result.ast);
    console.log('Errors:', result.syntax_errors);
} catch (error) {
    console.error(error);
}
```

**Example Python:**
```python
import requests
import json

def compile_code(code, language='c'):
    response = requests.post('http://localhost:3000/api/compile', 
        json={'code': code, 'language': language}
    )
    return response.json()

result = compile_code('int main() { return 0; }')
print(json.dumps(result['ast'], indent=2))
```

---

## Data Types

### AST Node Structure

```typescript
interface ASTNode {
    type: string;                    // Node type (e.g., "FunctionDeclaration")
    value?: string;                  // Optional value (operator, identifier, etc.)
    children?: ASTNode[];            // Child nodes
    line?: number;                   // Source code line number
    column?: number;                 // Source code column number
    attributes?: Record<string, any>;// Additional metadata
}
```

### Token Structure

```typescript
interface Token {
    type: string;   // KEYWORD | IDENTIFIER | NUMBER | STRING | OPERATOR | PUNCTUATION | COMMENT
    value: string;  // Token text
    line: number;   // Line number
    column: number; // Column number
}
```

### Node Types

#### Declaration Nodes
- `VariableDeclaration`: Variable declaration with optional initializer
- `FunctionDeclaration`: Function declaration with parameters and body
- `StructDeclaration`: Struct definition with fields
- `TypeDef`: Type definition

#### Statement Nodes
- `Block`: Compound statement with multiple statements
- `ExpressionStatement`: Expression followed by semicolon
- `IfStatement`: Conditional statement
- `WhileStatement`: While loop
- `DoWhileStatement`: Do-while loop
- `ForStatement`: For loop with init, condition, increment
- `ReturnStatement`: Return from function
- `BreakStatement`: Break from loop
- `ContinueStatement`: Continue to next iteration
- `Declaration`: Variable/function declaration

#### Expression Nodes
- `BinaryOp`: Binary operation (a + b)
- `UnaryOp`: Unary operation (!a, -a)
- `TypeCast`: Type casting ((int)x)
- `FunctionCall`: Function call with arguments
- `ArrayAccess`: Array element access (a[i])
- `MemberAccess`: Struct member access (a.b)
- `PointerMemberAccess`: Pointer member access (a->b)
- `Identifier`: Variable/function name
- `Number`: Numeric literal
- `String`: String literal
- `Char`: Character literal
- `Boolean`: Boolean literal (true/false)

#### Type Nodes
- `Type`: Type specification (int, float, char, void, double, struct Name, etc.)
- `Parameter`: Function parameter with type and name

---

## Error Handling

### Syntax Errors

Occur during lexical or syntactic analysis.

```json
{
    "type": "SyntaxError",
    "message": "Unexpected token '+=' at line 5",
    "line": 5,
    "column": 8,
    "context": "totalValue += items[i].value;"
}
```

### Semantic Errors

Occur during semantic analysis (type checking, undefined symbols).

```json
{
    "type": "SemanticError",
    "message": "Undefined function 'unknownFunc'",
    "line": 10,
    "context": "unknownFunc();"
}
```

### Runtime Errors

```json
{
    "type": "RuntimeError",
    "message": "Compilation timeout (exceeded 5000ms)"
}
```

---

## Rate Limiting

Currently not enforced. For production, implement rate limiting:

```javascript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
}
```

---

## Caching

Enable caching for frequently compiled code:

```javascript
// app/api/compile/route.ts
import { unstable_cache } from 'next/cache';

const cachedCompile = unstable_cache(
  async (code: string) => {
    // Compilation logic
    return compileCode(code);
  },
  ['compile'],
  { revalidate: 3600 } // Cache for 1 hour
);
```

---

## Versioning

API versioning strategy (for future versions):

```
/api/v1/compile  → Current version (v1)
/api/v2/compile  → Future version (v2)
```

Current API version: **v1.0.0**

---

## WebSocket Support (Future)

Real-time compilation streaming:

```javascript
const ws = new WebSocket('ws://localhost:3000/api/compile-stream');

ws.onmessage = (event) => {
    const { type, data } = JSON.parse(event.data);
    if (type === 'ast') {
        console.log('AST:', data);
    } else if (type === 'error') {
        console.log('Error:', data);
    }
};

ws.send(JSON.stringify({
    action: 'compile',
    code: 'int main() { return 0; }'
}));
```

---

## Health Check

```
GET /api/health

Response:
{
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2026-05-27T12:00:00Z"
}
```

---

## Best Practices

### Input Validation
```javascript
// Validate code size
if (code.length > 100 * 1024) {
    throw new Error('Code exceeds 100KB limit');
}

// Validate language
const validLanguages = ['c', 'cpp'];
if (!validLanguages.includes(language)) {
    throw new Error(`Invalid language: ${language}`);
}
```

### Error Handling
```javascript
try {
    const result = await fetch('/api/compile', {
        method: 'POST',
        body: JSON.stringify({ code })
    });
    
    if (!result.ok) {
        const error = await result.json();
        console.error('Compilation failed:', error);
        return null;
    }
    
    return result.json();
} catch (error) {
    console.error('Network error:', error);
}
```

### Timeout Handling
```javascript
// Set timeout for compilation
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

try {
    const response = await fetch('/api/compile', {
        method: 'POST',
        body: JSON.stringify({ code }),
        signal: controller.signal
    });
    return response.json();
} finally {
    clearTimeout(timeoutId);
}
```

### Batch Compilation
```javascript
async function compileBatch(codeSnippets) {
    const promises = codeSnippets.map(code =>
        fetch('/api/compile', {
            method: 'POST',
            body: JSON.stringify({ code })
        }).then(r => r.json())
    );
    
    return Promise.all(promises);
}
```

---

## Testing the API

### Using Postman

1. Create new POST request
2. Set URL: `http://localhost:3000/api/compile`
3. Set Body (raw JSON):
   ```json
   {
       "code": "int main() { return 0; }"
   }
   ```
4. Send request

### Using VS Code REST Client

Create `test.http`:
```http
POST http://localhost:3000/api/compile
Content-Type: application/json

{
    "code": "int main() { printf(\"Hello, World!\"); return 0; }"
}
```

---

For implementation details, see [ARCHITECTURE.md](./ARCHITECTURE.md).
