"""Phase 4: Intermediate Code Generation - Converts AST to three-address code"""
from typing import List, Optional, Dict
from .compilation_types import ASTNode, IRInstruction

class IRGenerator:
    """Generates three-address intermediate code from AST"""
    
    def __init__(self, ast: Optional[ASTNode]):
        self.ast = ast
        self.ir_code: List[IRInstruction] = []
        self.temp_counter = 0
        self.label_counter = 0
        self.errors: List[str] = []
    
    def generate(self) -> tuple[List[IRInstruction], List[str]]:
        """Generates intermediate code"""
        if not self.ast:
            self.errors.append("No AST to generate code from")
            return [], self.errors
        
        try:
            self._generate_from_node(self.ast)
            return self.ir_code, self.errors
        except Exception as e:
            self.errors.append(f"IR generation error: {str(e)}")
            return self.ir_code, self.errors
    
    def _new_temp(self) -> str:
        """Generates a new temporary variable"""
        self.temp_counter += 1
        return f"t{self.temp_counter}"
    
    def _new_label(self) -> str:
        """Generates a new label"""
        self.label_counter += 1
        return f"L{self.label_counter}"
    
    def _emit(self, op: str, arg1: Optional[str] = None, arg2: Optional[str] = None, result: Optional[str] = None):
        """Emits a three-address instruction"""
        instruction = IRInstruction(op=op, arg1=arg1, arg2=arg2, result=result)
        self.ir_code.append(instruction)
        return result if result else arg1
    
    def _generate_from_node(self, node: ASTNode) -> Optional[str]:
        """Generates code from AST node"""
        if not node:
            return None
        
        if node.type == 'Program':
            for child in (node.children or []):
                self._generate_from_node(child)
            return None
        
        elif node.type == 'Declaration':
            return self._gen_declaration(node)
        
        elif node.type == 'BinaryOp':
            return self._gen_binary_op(node)
        
        elif node.type == 'UnaryOp':
            return self._gen_unary_op(node)
        
        elif node.type == 'IfStatement':
            return self._gen_if_statement(node)
        
        elif node.type == 'WhileStatement':
            return self._gen_while_statement(node)
        
        elif node.type == 'ForStatement':
            return self._gen_for_statement(node)
        
        elif node.type == 'Block':
            for child in (node.children or []):
                self._generate_from_node(child)
            return None
        
        elif node.type == 'FunctionCall':
            return self._gen_function_call(node)
        
        elif node.type == 'Number':
            return node.value
        
        elif node.type == 'Identifier':
            return node.value
        
        elif node.type == 'String':
            return node.value
        
        elif node.type == 'ExpressionStatement':
            if node.children:
                return self._generate_from_node(node.children[0])
            return None
        
        elif node.type == 'ReturnStatement':
            if node.children:
                value = self._generate_from_node(node.children[0])
                self._emit('return', arg1=value)
            else:
                self._emit('return')
            return None
        
        else:
            # Recursively process children
            for child in (node.children or []):
                self._generate_from_node(child)
            return None
    
    def _gen_declaration(self, node: ASTNode) -> Optional[str]:
        """Generates code for declaration"""
        if not node.children or len(node.children) < 2:
            return None
        
        name = node.children[1].value
        
        if len(node.children) > 2:
            # Has initialization
            init_value = self._generate_from_node(node.children[2])
            self._emit('=', arg1=init_value, result=name)
        else:
            self._emit('decl', arg1=name)
        
        return name
    
    def _gen_binary_op(self, node: ASTNode) -> Optional[str]:
        """Generates code for binary operation"""
        if not node.children or len(node.children) < 2:
            return None
        
        left = self._generate_from_node(node.children[0])
        right = self._generate_from_node(node.children[1])
        result = self._new_temp()
        
        self._emit(node.value, arg1=left, arg2=right, result=result)
        
        return result
    
    def _gen_unary_op(self, node: ASTNode) -> Optional[str]:
        """Generates code for unary operation"""
        if not node.children:
            return None
        
        operand = self._generate_from_node(node.children[0])
        result = self._new_temp()
        
        self._emit(node.value, arg1=operand, result=result)
        
        return result
    
    def _gen_if_statement(self, node: ASTNode) -> Optional[str]:
        """Generates code for if statement"""
        if not node.children:
            return None
        
        condition = self._generate_from_node(node.children[0])
        false_label = self._new_label()
        end_label = self._new_label()
        
        self._emit('ifFalse', arg1=condition, arg2=false_label)
        
        # Then branch
        if len(node.children) > 1:
            self._generate_from_node(node.children[1])
        
        self._emit('goto', arg1=end_label)
        self._emit('label', arg1=false_label)
        
        # Else branch
        if len(node.children) > 2:
            self._generate_from_node(node.children[2])
        
        self._emit('label', arg1=end_label)
        
        return None
    
    def _gen_while_statement(self, node: ASTNode) -> Optional[str]:
        """Generates code for while statement"""
        if not node.children:
            return None
        
        loop_label = self._new_label()
        exit_label = self._new_label()
        
        self._emit('label', arg1=loop_label)
        
        condition = self._generate_from_node(node.children[0])
        self._emit('ifFalse', arg1=condition, arg2=exit_label)
        
        # Body
        if len(node.children) > 1:
            self._generate_from_node(node.children[1])
        
        self._emit('goto', arg1=loop_label)
        self._emit('label', arg1=exit_label)
        
        return None
    
    def _gen_for_statement(self, node: ASTNode) -> Optional[str]:
        """Generates code for for statement"""
        if not node.children:
            return None
        
        # Init
        if len(node.children) > 0:
            self._generate_from_node(node.children[0])
        
        loop_label = self._new_label()
        exit_label = self._new_label()
        update_label = self._new_label()
        
        self._emit('label', arg1=loop_label)
        
        # Condition
        if len(node.children) > 1:
            condition = self._generate_from_node(node.children[1])
            self._emit('ifFalse', arg1=condition, arg2=exit_label)
        
        # Body
        if len(node.children) > 3:
            self._generate_from_node(node.children[3])
        
        self._emit('label', arg1=update_label)
        
        # Update
        if len(node.children) > 2:
            self._generate_from_node(node.children[2])
        
        self._emit('goto', arg1=loop_label)
        self._emit('label', arg1=exit_label)
        
        return None
    
    def _gen_function_call(self, node: ASTNode) -> Optional[str]:
        """Generates code for function call"""
        if not node.children:
            return None
        
        func_name = node.children[0].value if node.children[0].type == 'Identifier' else 'unknown'
        
        # Evaluate arguments
        args = []
        for i in range(1, len(node.children)):
            arg_value = self._generate_from_node(node.children[i])
            args.append(arg_value)
            self._emit('param', arg1=arg_value)
        
        result = self._new_temp()
        self._emit('call', arg1=func_name, result=result)
        
        return result
