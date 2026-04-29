"""Phase 5: Code Optimization - Optimizes intermediate code"""
from typing import List, Dict, Set
from .compilation_types import IRInstruction

class CodeOptimizer:
    """Optimizes intermediate code through various techniques"""
    
    def __init__(self, ir_code: List[IRInstruction]):
        self.ir_code = ir_code
        self.optimized_code: List[IRInstruction] = []
        self.stats: Dict[str, int] = {
            'original_instructions': len(ir_code),
            'dead_code_removed': 0,
            'constant_folding_applied': 0,
            'unused_variables_removed': 0,
            'optimized_instructions': 0
        }
    
    def optimize(self) -> tuple[List[IRInstruction], Dict[str, int]]:
        """Applies multiple optimization passes"""
        # Start with the original code
        self.optimized_code = [instr for instr in self.ir_code]
        
        # Apply optimization passes
        self._constant_folding()
        self._dead_code_elimination()
        self._remove_unreachable_code()
        self._common_subexpression_elimination()
        self._unused_variable_elimination()
        
        # Calculate optimization stats
        self.stats['optimized_instructions'] = len(self.optimized_code)
        self.stats['instructions_eliminated'] = (
            self.stats['original_instructions'] - self.stats['optimized_instructions']
        )
        self.stats['optimization_ratio'] = (
            self.stats['instructions_eliminated'] / self.stats['original_instructions'] * 100
            if self.stats['original_instructions'] > 0 else 0
        )
        
        return self.optimized_code, self.stats
    
    def _constant_folding(self):
        """Constant Folding - Evaluates constant expressions at compile time"""
        i = 0
        while i < len(self.optimized_code):
            instr = self.optimized_code[i]
            
            # Try to fold binary operations with constants
            if instr.op in ('+', '-', '*', '/', '%', '==', '!=', '<', '>', '<=', '>='):
                try:
                    if instr.arg1 and instr.arg2:
                        arg1_val = self._try_parse_number(instr.arg1)
                        arg2_val = self._try_parse_number(instr.arg2)
                        
                        if arg1_val is not None and arg2_val is not None:
                            result = self._evaluate_op(instr.op, arg1_val, arg2_val)
                            if result is not None:
                                # Replace with constant assignment
                                new_instr = IRInstruction(op='=', arg1=str(result), result=instr.result)
                                self.optimized_code[i] = new_instr
                                self.stats['constant_folding_applied'] += 1
                except:
                    pass
            
            i += 1
    
    def _dead_code_elimination(self):
        """Dead Code Elimination - Removes unreachable code and unused assignments"""
        # Find all variables that are actually used
        used_vars = self._find_used_variables()
        
        i = 0
        while i < len(self.optimized_code):
            instr = self.optimized_code[i]
            
            # Remove assignments to variables that are never read
            if instr.op == '=' and instr.result:
                if instr.result not in used_vars and not instr.result.startswith('t'):
                    self.optimized_code.pop(i)
                    self.stats['dead_code_removed'] += 1
                    continue
            
            i += 1
    
    def _remove_unreachable_code(self):
        """Remove unreachable code after return statements"""
        i = 0
        while i < len(self.optimized_code):
            if self.optimized_code[i].op in ('return', 'goto'):
                # Remove instructions until next label
                j = i + 1
                while j < len(self.optimized_code) and self.optimized_code[j].op != 'label':
                    self.optimized_code.pop(j)
                    self.stats['dead_code_removed'] += 1
            i += 1
    
    def _common_subexpression_elimination(self):
        """Common Subexpression Elimination - Eliminates redundant computations"""
        seen_exprs: Dict[str, str] = {}
        i = 0
        
        while i < len(self.optimized_code):
            instr = self.optimized_code[i]
            
            # Create a key for the expression
            if instr.op not in ('label', 'goto', 'ifFalse', 'return', '=', 'call', 'param'):
                expr_key = f"{instr.arg1} {instr.op} {instr.arg2}"
                
                if expr_key in seen_exprs:
                    # Replace with previously computed value
                    prev_result = seen_exprs[expr_key]
                    # Update any references to this result
                    new_instr = IRInstruction(op='=', arg1=prev_result, result=instr.result)
                    self.optimized_code[i] = new_instr
                else:
                    seen_exprs[expr_key] = instr.result
            
            i += 1
    
    def _unused_variable_elimination(self):
        """Removes declarations of variables that are never used"""
        # Find all variables that are actually used
        used_vars = self._find_used_variables()
        
        i = 0
        while i < len(self.optimized_code):
            instr = self.optimized_code[i]
            
            if instr.op == 'decl' and instr.arg1:
                if instr.arg1 not in used_vars:
                    self.optimized_code.pop(i)
                    self.stats['unused_variables_removed'] += 1
                    continue
            
            i += 1
    
    def _find_used_variables(self) -> Set[str]:
        """Finds all variables that are actually used"""
        used = set()
        
        for instr in self.optimized_code:
            if instr.arg1 and not instr.arg1.startswith('L'):
                used.add(instr.arg1)
            if instr.arg2 and not instr.arg2.startswith('L'):
                used.add(instr.arg2)
            if instr.result:
                used.add(instr.result)
        
        return used
    
    def _try_parse_number(self, value: str) -> int | float | None:
        """Tries to parse a value as a number"""
        try:
            if '.' in value:
                return float(value)
            else:
                return int(value)
        except (ValueError, AttributeError):
            return None
    
    def _evaluate_op(self, op: str, arg1: int | float, arg2: int | float) -> int | float | None:
        """Evaluates a binary operation"""
        try:
            if op == '+':
                return arg1 + arg2
            elif op == '-':
                return arg1 - arg2
            elif op == '*':
                return arg1 * arg2
            elif op == '/':
                if arg2 != 0:
                    return arg1 / arg2
            elif op == '%':
                return int(arg1) % int(arg2)
            elif op == '==':
                return 1 if arg1 == arg2 else 0
            elif op == '!=':
                return 1 if arg1 != arg2 else 0
            elif op == '<':
                return 1 if arg1 < arg2 else 0
            elif op == '>':
                return 1 if arg1 > arg2 else 0
            elif op == '<=':
                return 1 if arg1 <= arg2 else 0
            elif op == '>=':
                return 1 if arg1 >= arg2 else 0
        except:
            pass
        
        return None
