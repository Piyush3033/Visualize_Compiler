# Contributing Guide

Thank you for your interest in contributing to the Advanced AST Visualizer! This guide will help you understand the codebase and development workflow.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Documentation](#documentation)
7. [Pull Request Process](#pull-request-process)
8. [Issue Reporting](#issue-reporting)

## Code of Conduct

By participating in this project, you agree to uphold a respectful and inclusive environment. We are committed to providing a welcoming space for all contributors regardless of background.

### Expected Behavior
- Use welcoming and inclusive language
- Be respectful of different opinions and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other members

### Unacceptable Behavior
- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Spam or self-promotion
- Sharing private information without consent

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended): `npm install -g pnpm`
- Git
- A fork of the repository
- A text editor (VS Code recommended)

### Setup Development Environment

1. **Fork the Repository**
   ```bash
   # On GitHub, click "Fork"
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/Visualize_Compiler.git
   cd Visualize_Compiler
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/Piyush3033/Visualize_Compiler.git
   ```

4. **Install Dependencies**
   ```bash
   pnpm install
   ```

5. **Create Environment File**
   ```bash
   cp .env.example .env.local
   # Edit .env.local as needed
   ```

6. **Start Development Server**
   ```bash
   pnpm dev
   # Visit http://localhost:3000
   ```

## Development Workflow

### Creating a Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Example branches:
# feature/add-java-support
# fix/parser-memory-leak
# docs/improve-readme
# chore/update-dependencies
```

### During Development

```bash
# Run development server
pnpm dev

# Run linter
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

### Committing Changes

Write clear, descriptive commit messages:

```bash
# Good commit messages
git commit -m "feat: add C++ template support to parser"
git commit -m "fix: correct type inference for pointer dereference"
git commit -m "docs: update API documentation with examples"
git commit -m "chore: update dependencies to latest versions"
```

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** feat, fix, docs, style, refactor, perf, test, chore, ci

**Example:**
```
feat(parser): add support for C++ class declarations

Implement parsing of class definitions including:
- Access modifiers (public, private, protected)
- Constructor and destructor syntax
- Member function declarations
- Inheritance specification

Fixes #123
```

### Keeping Your Branch Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Rebase your branch on main
git rebase upstream/main

# If conflicts occur, resolve them and continue
git rebase --continue
```

## Coding Standards

### TypeScript/JavaScript

**Naming Conventions:**
```typescript
// Constants: UPPER_SNAKE_CASE
const MAX_TREE_DEPTH = 100;

// Variables/Functions: camelCase
const myVariable = "value";
function myFunction() {}

// Classes/Types: PascalCase
class ASTNode {}
interface CompileResult {}

// Private properties: _prefix
class Parser {
    private _currentToken: Token;
}
```

**Code Style:**
```typescript
// Use type annotations
function compile(code: string): CompileResult {
    // ...
}

// Prefer const over let
const config = { /* ... */ };

// Use template literals
const message = `Error at line ${line}: ${error}`;

// Arrow functions for callbacks
array.map(item => item.value);

// Destructuring
const { type, value } = node;
```

### Python

**Naming Conventions:**
```python
# Constants: UPPER_SNAKE_CASE
MAX_TREE_DEPTH = 100

# Functions/Variables: snake_case
def parse_expression():
    local_var = "value"

# Classes: PascalCase
class ASTNode:
    pass

# Private methods: _prefix
class Parser:
    def _parse_type(self):
        pass
```

**Code Style:**
```python
# Type hints (Python 3.9+)
def tokenize(code: str) -> List[Token]:
    pass

# Docstrings for modules, classes, functions
def compile(code: str) -> Dict[str, Any]:
    """
    Compile source code to AST.
    
    Args:
        code: Source code string
        
    Returns:
        Dictionary with AST, errors, and metadata
    """
    pass

# Use f-strings
error_msg = f"Error at line {line}: {message}"

# Prefer list comprehensions
filtered = [x for x in items if x.active]
```

### React Components

```typescript
// Functional components with hooks
export function MyComponent({ prop1, prop2 }: Props) {
    const [state, setState] = useState(initialValue);
    
    useEffect(() => {
        // Side effects
    }, [dependencies]);
    
    return <div>{content}</div>;
}

// Props interface
interface MyComponentProps {
    title: string;
    onSubmit: (value: string) => void;
}

// Memoization for performance
const MyList = React.memo(function MyList({ items }) {
    return <div>{items.map(item => <Item key={item.id} />)}</div>;
});
```

### File Organization

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/
│   ├── visualizer/     # Visualizer components
│   └── ui/             # Reusable UI components
├── lib/                # Utilities and helpers
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Writing Tests

```typescript
// Example: Component test
import { render, screen } from '@testing-library/react';
import ASTViewer from './ASTViewer';

describe('ASTViewer', () => {
    it('renders AST nodes correctly', () => {
        const ast = { type: 'Program', children: [] };
        render(<ASTViewer ast={ast} />);
        
        expect(screen.getByText('Program')).toBeInTheDocument();
    });
    
    it('handles null AST gracefully', () => {
        render(<ASTViewer ast={null} />);
        
        expect(screen.getByText('No AST available')).toBeInTheDocument();
    });
});
```

```python
# Example: Parser test
import pytest
from parser import Parser

class TestParser:
    def test_parse_simple_function(self):
        code = "int main() { return 0; }"
        ast = Parser(code).parse()
        
        assert ast.type == "Program"
        assert len(ast.children) == 1
        assert ast.children[0].value == "main"
    
    def test_parse_struct_definition(self):
        code = "struct Point { int x; int y; };"
        ast = Parser(code).parse()
        
        assert ast.children[0].type == "StructDeclaration"
```

### Test Coverage Goals

- Overall: > 80%
- Critical paths: > 90%
- UI components: > 70%

## Documentation

### Commenting Code

```typescript
// Good: explains WHY, not WHAT
// We use a custom layout algorithm because D3 doesn't handle
// large trees efficiently
function layoutAST(ast: ASTNode): LayoutNode {
    // ...
}

// Bad: restates the obvious
// Set x to 0
let x = 0;
```

### Writing Documentation

1. **Function/Method Documentation:**
```python
def compile_code(code: str, language: str = 'c') -> CompileResult:
    """
    Compile source code and generate AST.
    
    Args:
        code: Source code to compile
        language: Programming language (c, cpp)
        
    Returns:
        CompileResult containing AST, errors, and metadata
        
    Raises:
        ValueError: If code exceeds size limit
        TimeoutError: If compilation exceeds time limit
        
    Example:
        >>> result = compile_code('int main() {}')
        >>> print(result.ast.type)
        'Program'
    """
```

2. **Module Documentation:**
```python
"""
AST Semantic Analyzer

This module performs semantic analysis on the Abstract Syntax Tree,
including type checking, symbol table construction, and validation.

Classes:
    SemanticAnalyzer: Main analyzer class
    Symbol: Represents a declared symbol
    
Functions:
    analyze: Main entry point for analysis
"""
```

3. **README/Guide Updates:**
- Use clear, concise language
- Include examples
- Add diagrams for complex concepts
- Keep documentation in sync with code

## Pull Request Process

### Before Submitting

1. **Update Your Branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run All Checks**
   ```bash
   pnpm lint
   pnpm build
   pnpm test
   ```

3. **Clean Up Commits**
   ```bash
   # If needed, squash related commits
   git rebase -i HEAD~3  # Last 3 commits
   ```

### Creating a Pull Request

1. **Push Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**
   - Use a clear title: `feat: add C++ template support`
   - Reference related issues: `Fixes #123`
   - Describe changes comprehensively
   - Include screenshots if UI changes

3. **PR Description Template**
   ```markdown
   ## Description
   Brief explanation of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Related Issues
   Fixes #123
   
   ## Testing
   How to test these changes
   
   ## Checklist
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

### Review Process

- Maintainers will review your PR
- Address feedback constructively
- Update your branch as requested
- Rebase on main if needed

### After Merge

```bash
# Clean up local branch
git checkout main
git pull upstream main
git branch -d feature/your-feature-name
```

## Issue Reporting

### Bug Reports

Include:
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node version, browser)
- Code sample if applicable

**Template:**
```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Do this
2. Then this
3. Then this

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: macOS/Linux/Windows
- Node: v18.x.x
- Browser: Chrome/Firefox/Safari
```

### Feature Requests

Include:
- Clear description
- Motivation and use case
- Proposed solution (optional)
- Alternative approaches

## Getting Help

- **Questions:** Open a GitHub Discussion
- **Bugs:** File a GitHub Issue
- **Security:** Email security@example.com (don't use public issues)
- **Chat:** Join our Discord community (link in README)

## Recognition

Contributors are recognized in:
- README.md contributors section
- GitHub contributors page
- Release notes

---

Thank you for contributing! Your efforts help make this project better for everyone.
