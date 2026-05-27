#!/usr/bin/env python3
"""Entry point for the compiler - called from the Node.js API"""
import sys
import json
import os

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

from compiler.compiler import Compiler

def main():
    """Main entry point - reads source code from stdin or command line"""
    
    source_code = None
    
    # Try to read from stdin first (for production/pipe usage)
    if not sys.stdin.isatty():
        source_code = sys.stdin.read()
    
    # Fall back to command line argument if no stdin
    if not source_code and len(sys.argv) > 1:
        source_code = sys.argv[1]
    
    if not source_code:
        print(json.dumps({
            'error': 'No source code provided',
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
    
    try:
        compiler = Compiler(source_code)
        result = compiler.compile()
        
        # Convert to JSON and print
        output = result.to_dict()
        print(json.dumps(output))
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback._print_exc()  # Print to stderr for debugging
        
        print(json.dumps({
            'error': error_msg,
            'tokens': [],
            'lexical_errors': [error_msg],
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
