# Compiler Phases Visualizer

A modern, interactive web application that visualizes how code is compiled through all six phases of the compilation process: Lexical Analysis, Syntax Analysis, Semantic Analysis, Intermediate Code Generation, Code Optimization, and Code Generation.

## Overview

The Compiler Phases Visualizer is an educational tool designed to help developers, students, and computer science enthusiasts understand how compilers transform source code into executable programs. By visualizing each phase of compilation with interactive charts, detailed analysis, and real-time feedback, users gain deeper insights into compiler architecture and language semantics.

## Key Features

### 6-Phase Compilation Pipeline

1. **Phase 1: Lexical Analysis** - Tokenize source code into meaningful lexical units
2. **Phase 2: Syntax Analysis** - Parse tokens into an Abstract Syntax Tree (AST)
3. **Phase 3: Semantic Analysis** - Type checking, symbol resolution, and semantic validation
4. **Phase 4: IR Generation** - Convert AST into intermediate representation
5. **Phase 5: Optimization** - Optimize generated code for performance
6. **Phase 6: Code Generation** - Generate assembly/machine code

### Interactive Visualizations

- **Token Frequency Charts** - Visualize token distribution in the code
- **AST Tree Viewer** - Navigate and explore the abstract syntax tree
- **Detailed Statistics** - Token counts, type information, and coverage metrics
- **Error Highlighting** - Clear identification of lexical, syntax, and semantic errors
- **Sample Code Templates** - Pre-loaded examples including basic programs, loops, conditionals, and complex structures

### Language Support

- **C** - Full support for C language constructs including structs, pointers, and function declarations
- **C++** - Groundwork for C++ language features (ready for expansion)
- **Java/Python** - Foundation for future language support

### Developer-Friendly Features

- Live compilation as you type
- Sample code templates for quick testing
- Code upload functionality
- Detailed error reporting with line and column information
- Export compilation results as JSON
- Responsive design for desktop and tablet use

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Piyush3033/Visualize_Compiler.git
cd Visualize_Compiler

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
Visualize_Compiler/
├── app/
│   ├── api/
│   │   └── compile/
│   │       └── route.ts          # API endpoint for compilation
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   ├── page.tsx                  # Main page component
│   └── favicon.ico
├── components/
│   ├── visualizer/
│   │   ├── CodeInput.tsx         # Code editor component
│   │   ├── LexicalAnalysisTab.tsx # Phase 1 visualization
│   │   ├── SyntaxAnalysisTab.tsx  # Phase 2 visualization (AST viewer)
│   │   ├── SemanticAnalysisTab.tsx # Phase 3 visualization
│   │   ├── IRGenerationTab.tsx    # Phase 4 visualization
│   │   ├── OptimizationTab.tsx    # Phase 5 visualization
│   │   └── CodeGenerationTab.tsx  # Phase 6 visualization
│   └── ...other components
├── lib/
│   └── compiler.ts               # Pure TypeScript compiler implementation
├── scripts/
│   ├── compiler/
│   │   ├── lexer.py              # Lexical analyzer (Python)
│   │   ├── parser.py             # Syntax analyzer (Python)
│   │   ├── semantic_analyzer.py  # Semantic analyzer (Python)
│   │   ├── ir_generator.py       # IR generation (Python)
│   │   ├── optimizer.py          # Code optimizer (Python)
│   │   ├── codegen.py            # Code generator (Python)
│   │   ├── compiler.py           # Main compiler orchestrator
│   │   └── utils.py              # Utility functions
│   └── compile.py                # Entry point script
├── public/                       # Static assets
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
└── vercel.json                   # Vercel deployment config
```

## Technology Stack

### Frontend
- **Next.js 16** - React framework with server-side rendering
- **React 19.2** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **Recharts** - React charting library
- **Monaco Editor** - Advanced code editor

### Backend
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe backend code
- **Next.js API Routes** - Serverless API endpoints

### Compilation
- **Python** - Original compiler implementation (for local development)
- **TypeScript** - Serverless-compatible compiler (for production)

### Deployment
- **Vercel** - Hosting and deployment platform
- **Docker** - Containerization (optional)

## API Reference

### POST /api/compile

Compiles C code and returns detailed analysis for all 6 compiler phases.

**Request:**
```json
{
  "code": "int main() { return 0; }"
}
```

**Response:**
```json
{
  "tokens": [...],                    // Lexical tokens
  "lexical_errors": [],               // Lexical analysis errors
  "ast": {...},                       // Abstract syntax tree
  "syntax_errors": [],                // Syntax analysis errors
  "symbol_table": [...],              // Symbol definitions and types
  "semantic_errors": [],              // Semantic analysis errors
  "intermediate_code": [...],         // IR instructions
  "ir_errors": [],                    // IR generation errors
  "optimized_code": [...],            // Optimized IR
  "optimization_stats": {...},        // Optimization statistics
  "optimization_errors": [],          // Optimization errors
  "generated_code": [...],            // Assembly code
  "codegen_errors": []                // Code generation errors
}
```

## Sample Code

The application includes several pre-loaded sample programs:

- **Basic Program** - Simple integer operations
- **Loop Program** - For loop implementation
- **Conditional Logic** - If-else statements
- **Semantic Error Demo** - Examples of type mismatches
- **Syntax Error Demo** - Examples of syntax violations
- **Complex Program** - Advanced language features

## Development

### Building Components

Components are organized in `/components/visualizer/` with each phase having its own tab component. To add a new feature:

1. Create the component in `/components/visualizer/`
2. Import it in the main page
3. Add styling using Tailwind CSS
4. Test with sample code

### Running Tests

```bash
# Type checking
pnpm type-check

# Build verification
pnpm build
```

### Code Style

- Follow TypeScript best practices
- Use semantic HTML elements
- Implement ARIA labels for accessibility
- Use Tailwind CSS for styling (no inline styles)
- Maintain component modularity

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
docker build -t compiler-visualizer .
docker run -p 3000:3000 compiler-visualizer
```

### Manual Deployment

```bash
# Build
pnpm build

# Start production server
pnpm start
```

## Performance Considerations

- **Token Parsing**: Optimized for files up to 10,000 tokens
- **AST Rendering**: Efficient virtual rendering for large trees
- **Visualization**: Client-side rendering for fast interactivity
- **API Response**: Typical compilation completes in < 100ms

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Add C++ full support (classes, templates, namespaces)
- [ ] Add Java support
- [ ] Add Python support
- [ ] Enhanced AST visualization with zoom/pan
- [ ] Export features (SVG, PDF, PNG)
- [ ] Dark/Light theme toggle
- [ ] Keyboard shortcuts for navigation
- [ ] Plugin system for custom languages
- [ ] Performance profiling tools
- [ ] Compilation metrics and analytics

## License

MIT License - See LICENSE file for details

## Author

**Piyush Parmar**

- GitHub: [@Piyush3033](https://github.com/Piyush3033)
- Email: piyush.parmar@example.com

## Acknowledgments

- Built with Next.js and React
- Inspired by modern compiler design principles
- Educational resource for computer science students
- Thanks to all contributors and users

## Support

For issues, feature requests, or questions:
- GitHub Issues: [Open an issue](https://github.com/Piyush3033/Visualize_Compiler/issues)
- Discussions: [Join the discussion](https://github.com/Piyush3033/Visualize_Compiler/discussions)

---

**Live Demo**: [https://compiler-phases-visualizer.vercel.app](https://compiler-phases-visualizer.vercel.app)

**Repository**: [https://github.com/Piyush3033/Visualize_Compiler](https://github.com/Piyush3033/Visualize_Compiler)
