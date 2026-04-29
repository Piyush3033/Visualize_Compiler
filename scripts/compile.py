#!/usr/bin/env python3
"""Entry point for the compiler - called from the Node.js API"""
import sys
import json

# Add scripts to path for imports
sys.path.insert(0, '/vercel/share/v0-project/scripts')

from compiler.compiler import Compiler

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'error': 'Usage: python compile.py <source_code>',
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
