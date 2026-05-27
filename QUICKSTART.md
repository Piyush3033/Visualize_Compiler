# Quick Start Guide

Get the Advanced AST Visualizer running in 5 minutes.

## Installation

### 1. Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- pnpm 8+ ([Install](https://pnpm.io/installation))

### 2. Clone & Install

```bash
# Clone the repository
git clone https://github.com/Piyush3033/Visualize_Compiler.git
cd Visualize_Compiler

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
```

### 3. Start Development Server

```bash
pnpm dev
```

Visit **http://localhost:3000** in your browser.

## Usage

### 1. Write or Paste Code
- Select language (C/C++)
- Enter code in the editor
- Code is compiled in real-time

### 2. View AST
- **Tree View** (default): Expandable/collapsible syntax tree
- **Graph View** (expand): Full-screen interactive visualization
- **Error List**: Syntax and semantic errors

### 3. Explore AST

**Tree View:**
- Click items to expand/collapse
- Click "Expand" button for full-screen view
- Copy button to copy tree as text

**Graph View:**
- **Drag** to pan the canvas
- **Scroll** to zoom in/out
- **Search** to highlight nodes
- **Fit** button to reset view

## Example Codes

### Basic C Program

```c
#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}
```

### Struct with Functions

```c
#include <stdio.h>

struct Point {
    int x;
    int y;
};

int distance(struct Point p1, struct Point p2) {
    return 0;
}

int main() {
    struct Point a = {0, 0};
    struct Point b = {3, 4};
    
    int d = distance(a, b);
    printf("Distance: %d\n", d);
    
    return 0;
}
```

### Sorting with Function Pointers

```c
#include <stdlib.h>

int compare(const void *a, const void *b) {
    int x = *(int *)a;
    int y = *(int *)b;
    return x - y;
}

int main() {
    int arr[] = {5, 2, 8, 1, 9};
    qsort(arr, 5, sizeof(int), compare);
    return 0;
}
```

## Supported Features

### Data Types
- `int`, `float`, `double`, `char`, `void`, `bool`
- Pointers: `int *`, `char **`
- Structs: `struct Name { ... }`
- Type qualifiers: `const`, `volatile`, `unsigned`, `signed`

### Control Flow
- if/else statements
- while, do-while, for loops
- break, continue statements
- return statements

### Functions
- Function declarations and definitions
- Parameters with types
- Return types
- Function pointers (callbacks)

### Operators
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Logical: `&&`, `||`, `!`
- Bitwise: `&`, `|`, `^`, `~`, `<<`, `>>`
- Assignment: `=`, `+=`, `-=`, `*=`, `/=`, etc.
- Unary: `++`, `--`, `!`, `~`, `-`, `+`, `&`, `*`
- Type casting: `(type) expr`
- Member access: `.`, `->`
- Array access: `[]`

### Standard Library (40+ functions)
- I/O: `printf`, `scanf`, `fprintf`, `fscanf`
- Memory: `malloc`, `calloc`, `free`, `realloc`
- String: `strlen`, `strcpy`, `strcmp`, `memcpy`
- Math: `sin`, `cos`, `sqrt`, `pow`, `abs`
- Utility: `qsort`, `rand`, `exit`, `getchar`

## Common Tasks

### Export AST as JSON

```javascript
// In browser console
const treeElement = document.querySelector('[data-testid="ast-tree"]');
const copyButton = treeElement.querySelector('button:contains("Copy")');
copyButton?.click();
```

### Share Code Sample

1. Write code in editor
2. Copy URL (auto-saved in query params)
3. Share with others

### Debug Compilation

Check the **Errors** section for:
- **Syntax Errors**: Invalid grammar (e.g., missing semicolon)
- **Semantic Errors**: Type issues or undefined symbols

### Performance Tips

- **Large Files**: Tree rendering is optimized for 100-5000+ nodes
- **Deep Nesting**: Deeply nested code may be slow to render
- **Export**: Exporting large trees as JSON may take a few seconds

## Troubleshooting

### Port 3000 Already in Use

```bash
# Use a different port
pnpm dev -- -p 3001
```

### Dependencies Not Installing

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Errors

```bash
# Clear build cache
rm -rf .next
pnpm build
```

### Code Not Compiling

Check:
1. Is the language correct? (C or C++)
2. Are there syntax errors?
3. Is the code using supported features?
4. Check the Errors panel for details

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [API.md](./API.md) for API endpoints
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Visit [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute

## Deployment

### To Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod
```

### To Docker

```bash
docker build -t ast-visualizer .
docker run -p 3000:3000 ast-visualizer
```

### To Your Server

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/Piyush3033/Visualize_Compiler/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Piyush3033/Visualize_Compiler/discussions)
- **Email**: contact@example.com

---

**Ready to go!** Happy coding! 🚀
