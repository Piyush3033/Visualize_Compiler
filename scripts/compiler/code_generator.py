"""Phase 6: Code Generation - Generates target assembly-like code from optimized IR"""
from typing import List, Dict, Set
from .compilation_types import IRInstruction

class CodeGenerator:
    """Generates assembly-like target code from intermediate code"""
    
    def __init__(self, ir_code: List[IRInstruction]):
        self.ir_code = ir_code
        self.generated_code: List[str] = []
        self.registers: Dict[str, str] = {}
        self.available_registers = ['rax', 'rbx', 'rcx', 'rdx', 'rsi', 'rdi']
        self.register_counter = 0
        self.stack_offset = 0
    
    def generate(self) -> List[str]:
        """Generates assembly code from IR"""
        self.generated_code = []
        
        # Emit header
        self._emit('; Assembly-like Code Generation')
        self._emit('; Generated from intermediate code')
        self._emit('')
        self._emit('section .data')
        self._emit('    global_vars: db 0')
        self._emit('')
        self._emit('section .text')
        self._emit('    global main')
        self._emit('')
        self._emit('main:')
        self._emit('    push rbp')
        self._emit('    mov rbp, rsp')
        self._emit('')
        
        # Generate code for each instruction
        for instr in self.ir_code:
            self._generate_instruction(instr)
        
        # Emit footer
        self._emit('')
        self._emit('    ; Program exit')
        self._emit('    xor eax, eax')
        self._emit('    pop rbp')
        self._emit('    ret')
        
        return self.generated_code
    
    def _emit(self, line: str):
        """Emits a line of assembly code"""
        self.generated_code.append(line)
    
    def _allocate_register(self) -> str:
        """Allocates a register for a variable"""
        reg = self.available_registers[self.register_counter % len(self.available_registers)]
        self.register_counter += 1
        return reg
    
    def _get_register_for_var(self, var: str) -> str:
        """Gets or allocates a register for a variable"""
        if var not in self.registers:
            self.registers[var] = self._allocate_register()
        return self.registers[var]
    
    def _generate_instruction(self, instr: IRInstruction):
        """Generates assembly for a single IR instruction"""
        op = instr.op
        
        if op == '=':
            # Assignment
            if instr.arg1 and instr.result:
                result_reg = self._get_register_for_var(instr.result)
                
                if instr.arg1.isdigit() or (instr.arg1[0].isdigit() if instr.arg1 else False):
                    # Immediate value
                    self._emit(f'    mov {result_reg}, {instr.arg1}')
                else:
                    # Variable
                    arg_reg = self._get_register_for_var(instr.arg1)
                    self._emit(f'    mov {result_reg}, {arg_reg}')
        
        elif op == '+':
            # Addition
            if instr.arg1 and instr.arg2 and instr.result:
                result_reg = self._get_register_for_var(instr.result)
                arg1_reg = self._get_register_for_var(instr.arg1)
                arg2_val = instr.arg2 if instr.arg2.isdigit() else self._get_register_for_var(instr.arg2)
                
                self._emit(f'    mov {result_reg}, {arg1_reg}')
                self._emit(f'    add {result_reg}, {arg2_val}')
        
        elif op == '-':
            # Subtraction
            if instr.arg1 and instr.arg2 and instr.result:
                result_reg = self._get_register_for_var(instr.result)
                arg1_reg = self._get_register_for_var(instr.arg1)
                arg2_val = instr.arg2 if instr.arg2.isdigit() else self._get_register_for_var(instr.arg2)
                
                self._emit(f'    mov {result_reg}, {arg1_reg}')
                self._emit(f'    sub {result_reg}, {arg2_val}')
        
        elif op == '*':
            # Multiplication
            if instr.arg1 and instr.arg2 and instr.result:
                result_reg = self._get_register_for_var(instr.result)
                arg1_reg = self._get_register_for_var(instr.arg1)
                arg2_val = instr.arg2 if instr.arg2.isdigit() else self._get_register_for_var(instr.arg2)
                
                self._emit(f'    mov {result_reg}, {arg1_reg}')
                self._emit(f'    imul {result_reg}, {arg2_val}')
        
        elif op == '/':
            # Division
            if instr.arg1 and instr.arg2 and instr.result:
                self._emit(f'    mov rax, {instr.arg1}')
                self._emit(f'    cqo')
                self._emit(f'    mov rcx, {instr.arg2}')
                self._emit(f'    idiv rcx')
                result_reg = self._get_register_for_var(instr.result)
                self._emit(f'    mov {result_reg}, rax')
        
        elif op == '%':
            # Modulo
            if instr.arg1 and instr.arg2 and instr.result:
                self._emit(f'    mov rax, {instr.arg1}')
                self._emit(f'    cqo')
                self._emit(f'    mov rcx, {instr.arg2}')
                self._emit(f'    idiv rcx')
                result_reg = self._get_register_for_var(instr.result)
                self._emit(f'    mov {result_reg}, rdx')
        
        elif op == '==':
            # Equality comparison
            if instr.arg1 and instr.arg2 and instr.result:
                result_reg = self._get_register_for_var(instr.result)
                arg1_reg = self._get_register_for_var(instr.arg1)
                arg2_val = instr.arg2 if instr.arg2.isdigit() else self._get_register_for_var(instr.arg2)
                
                self._emit(f'    cmp {arg1_reg}, {arg2_val}')
                self._emit(f'    sete al')
                self._emit(f'    movzx {result_reg}, al')
        
        elif op == '!=':
            # Not equal comparison
            if instr.arg1 and instr.arg2 and instr.result:
                result_reg = self._get_register_for_var(instr.result)
                arg1_reg = self._get_register_for_var(instr.arg1)
                arg2_val = instr.arg2 if instr.arg2.isdigit() else self._get_register_for_var(instr.arg2)
                
                self._emit(f'    cmp {arg1_reg}, {arg2_val}')
                self._emit(f'    setne al')
                self._emit(f'    movzx {result_reg}, al')
        
        elif op == '<':
            # Less than comparison
            if instr.arg1 and instr.arg2 and instr.result:
                result_reg = self._get_register_for_var(instr.result)
                arg1_reg = self._get_register_for_var(instr.arg1)
                arg2_val = instr.arg2 if instr.arg2.isdigit() else self._get_register_for_var(instr.arg2)
                
                self._emit(f'    cmp {arg1_reg}, {arg2_val}')
                self._emit(f'    setl al')
                self._emit(f'    movzx {result_reg}, al')
        
        elif op == '>':
            # Greater than comparison
            if instr.arg1 and instr.arg2 and instr.result:
                result_reg = self._get_register_for_var(instr.result)
                arg1_reg = self._get_register_for_var(instr.arg1)
                arg2_val = instr.arg2 if instr.arg2.isdigit() else self._get_register_for_var(instr.arg2)
                
                self._emit(f'    cmp {arg1_reg}, {arg2_val}')
                self._emit(f'    setg al')
                self._emit(f'    movzx {result_reg}, al')
        
        elif op == '<=':
            # Less than or equal comparison
            if instr.arg1 and instr.arg2 and instr.result:
                result_reg = self._get_register_for_var(instr.result)
                arg1_reg = self._get_register_for_var(instr.arg1)
                arg2_val = instr.arg2 if instr.arg2.isdigit() else self._get_register_for_var(instr.arg2)
                
                self._emit(f'    cmp {arg1_reg}, {arg2_val}')
                self._emit(f'    setle al')
                self._emit(f'    movzx {result_reg}, al')
        
        elif op == '>=':
            # Greater than or equal comparison
            if instr.arg1 and instr.arg2 and instr.result:
                result_reg = self._get_register_for_var(instr.result)
                arg1_reg = self._get_register_for_var(instr.arg1)
                arg2_val = instr.arg2 if instr.arg2.isdigit() else self._get_register_for_var(instr.arg2)
                
                self._emit(f'    cmp {arg1_reg}, {arg2_val}')
                self._emit(f'    setge al')
                self._emit(f'    movzx {result_reg}, al')
        
        elif op == 'label':
            # Label
            if instr.arg1:
                self._emit(f'{instr.arg1}:')
        
        elif op == 'goto':
            # Unconditional jump
            if instr.arg1:
                self._emit(f'    jmp {instr.arg1}')
        
        elif op == 'ifFalse':
            # Conditional jump (if false)
            if instr.arg1 and instr.arg2:
                arg_reg = self._get_register_for_var(instr.arg1)
                self._emit(f'    cmp {arg_reg}, 0')
                self._emit(f'    je {instr.arg2}')
        
        elif op == 'return':
            # Return statement
            if instr.arg1:
                arg_reg = self._get_register_for_var(instr.arg1)
                self._emit(f'    mov rax, {arg_reg}')
            else:
                self._emit(f'    xor eax, eax')
        
        elif op == 'call':
            # Function call
            if instr.arg1:
                self._emit(f'    call {instr.arg1}')
                if instr.result:
                    result_reg = self._get_register_for_var(instr.result)
                    self._emit(f'    mov {result_reg}, rax')
        
        elif op == 'param':
            # Function parameter
            if instr.arg1:
                self._emit(f'    push {instr.arg1}')
        
        elif op == 'decl':
            # Variable declaration
            if instr.arg1:
                self._emit(f'    ; declare {instr.arg1}')
