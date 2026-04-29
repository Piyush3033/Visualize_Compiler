"""Main Compiler - Orchestrates all 6 phases of compilation"""
import json
import sys
from typing import Dict, Any
from .lexer import Lexer
from .parser import Parser
from .semantic_analyzer import SemanticAnalyzer
from .ir_generator import IRGenerator
from .optimizer import CodeOptimizer
from .code_generator import CodeGenerator
from .compilation_types import CompilationResult, Token, Symbol, IRInstruction

class Compiler:
    """Main compiler that orchestrates all 6 compilation phases"""
    
    def __init__(self, source_code: str):
        self.source_code = source_code
    
    def compile(self) -> CompilationResult:
        """Compiles source code through all 6 phases"""
        
        # Phase 1: Lexical Analysis
        lexer = Lexer(self.source_code)
        tokens, lexical_errors = lexer.tokenize()
        
        # Phase 2: Syntax Analysis
        parser = Parser(tokens)
        ast, syntax_errors = parser.parse()
        
        # Phase 3: Semantic Analysis
        semantic_analyzer = SemanticAnalyzer(ast)
        symbol_table, semantic_errors = semantic_analyzer.analyze()
        
        # Phase 4: Intermediate Code Generation
        ir_generator = IRGenerator(ast)
        intermediate_code, ir_errors = ir_generator.generate()
        
        # Phase 5: Code Optimization
        optimizer = CodeOptimizer(intermediate_code)
        optimized_code, optimization_stats = optimizer.optimize()
        
        # Phase 6: Code Generation
        code_generator = CodeGenerator(optimized_code)
        generated_code = code_generator.generate()
        
        # Build compilation result
        result = CompilationResult(
            tokens=tokens,
            lexical_errors=lexical_errors,
            ast=ast,
            syntax_errors=syntax_errors,
            symbol_table=symbol_table,
            semantic_errors=semantic_errors,
            intermediate_code=intermediate_code,
            ir_errors=ir_errors,
            optimized_code=optimized_code,
            optimization_stats=optimization_stats,
            optimization_errors=[],
            generated_code=generated_code,
            codegen_errors=[]
        )
        
        return result

def main():
    """Main entry point for the compiler"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'error': 'Usage: python compiler.py <source_code>',
            'tokens': [],
            'lexical_errors': [],
            'ast': None,
            'syntax_errors': [],
            'symbol_table': [],
            'semantic_errors': [],
            'intermediate_code': [],
            'ir_errors': [],
            'optimized_code': [],
            'optimization_stats': {},
            'optimization_errors': [],
            'generated_code': [],
            'codegen_errors': []
        }))
        sys.exit(1)
    
    source_code = sys.argv[1]
    
    try:
        compiler = Compiler(source_code)
        result = compiler.compile()
        
        # Convert to JSON and print
        output = result.to_dict()
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({
            'error': str(e),
            'tokens': [],
            'lexical_errors': [str(e)],
            'ast': None,
            'syntax_errors': [],
            'symbol_table': [],
            'semantic_errors': [],
            'intermediate_code': [],
            'ir_errors': [],
            'optimized_code': [],
            'optimization_stats': {},
            'optimization_errors': [],
            'generated_code': [],
            'codegen_errors': []
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()
