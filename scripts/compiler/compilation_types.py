"""Shared data structures for the compiler"""
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
import json

@dataclass
class Token:
    """Represents a single token from lexical analysis"""
    type: str
    value: str
    line: int
    column: int
    
    def to_dict(self):
        return asdict(self)

@dataclass
class ASTNode:
    """Represents a node in the Abstract Syntax Tree"""
    type: str
    value: Optional[str] = None
    children: Optional[List['ASTNode']] = None
    attributes: Optional[Dict[str, Any]] = None
    line: int = 0
    column: int = 0
    
    def to_dict(self):
        return {
            'type': self.type,
            'value': self.value,
            'children': [child.to_dict() for child in (self.children or [])],
            'attributes': self.attributes or {},
            'line': self.line,
            'column': self.column
        }

@dataclass
class Symbol:
    """Represents a symbol in the symbol table"""
    name: str
    type: str
    scope: str
    line: int
    attributes: Dict[str, Any]
    
    def to_dict(self):
        return asdict(self)

@dataclass
class IRInstruction:
    """Represents a three-address intermediate code instruction"""
    op: str  # Operation: +, -, *, /, =, if, goto, label, etc.
    arg1: Optional[str] = None
    arg2: Optional[str] = None
    result: Optional[str] = None
    
    def to_dict(self):
        return {
            'op': self.op,
            'arg1': self.arg1,
            'arg2': self.arg2,
            'result': self.result
        }
    
    def __str__(self):
        if self.arg2 and self.result:
            return f"{self.result} = {self.arg1} {self.op} {self.arg2}"
        elif self.arg1 and self.result:
            return f"{self.result} = {self.op} {self.arg1}"
        elif self.arg1:
            return f"{self.op} {self.arg1}"
        elif self.result:
            return f"{self.op}: {self.result}"
        else:
            return str(self.op)

@dataclass
class CompilationResult:
    """Complete compilation result with all 6 phases"""
    
    # Phase 1: Lexical Analysis
    tokens: List[Token]
    lexical_errors: List[str]
    
    # Phase 2: Syntax Analysis
    ast: Optional[ASTNode]
    syntax_errors: List[str]
    
    # Phase 3: Semantic Analysis
    symbol_table: List[Symbol]
    semantic_errors: List[str]
    
    # Phase 4: Intermediate Code Generation
    intermediate_code: List[IRInstruction]
    ir_errors: List[str]
    
    # Phase 5: Code Optimization
    optimized_code: List[IRInstruction]
    optimization_stats: Dict[str, Any]
    optimization_errors: List[str]
    
    # Phase 6: Code Generation
    generated_code: List[str]
    codegen_errors: List[str]
    
    def to_dict(self):
        return {
            'tokens': [t.to_dict() for t in self.tokens],
            'lexical_errors': self.lexical_errors,
            'ast': self.ast.to_dict() if self.ast else None,
            'syntax_errors': self.syntax_errors,
            'symbol_table': [s.to_dict() for s in self.symbol_table],
            'semantic_errors': self.semantic_errors,
            'intermediate_code': [ir.to_dict() for ir in self.intermediate_code],
            'ir_errors': self.ir_errors,
            'optimized_code': [ir.to_dict() for ir in self.optimized_code],
            'optimization_stats': self.optimization_stats,
            'optimization_errors': self.optimization_errors,
            'generated_code': self.generated_code,
            'codegen_errors': self.codegen_errors
        }
    
    def to_json(self):
        return json.dumps(self.to_dict(), indent=2)
