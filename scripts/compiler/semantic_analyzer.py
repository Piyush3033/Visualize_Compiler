"""Phase 3: Semantic Analysis - Type checking and symbol table building"""
from typing import List, Dict, Optional
from .compilation_types import ASTNode, Symbol

class SemanticAnalyzer:
    """Performs semantic analysis on the AST"""
    
    PRIMITIVE_TYPES = {'int', 'float', 'char', 'void', 'bool'}
    
    def __init__(self, ast: Optional[ASTNode]):
        self.ast = ast
        self.symbol_table: List[Symbol] = []
        self.errors: List[str] = []
        self.current_scope = 'global'
        self.scope_stack = ['global']
        self.scope_symbols: Dict[str, List[Symbol]] = {'global': []}
    
    def analyze(self) -> tuple[List[Symbol], List[str]]:
        """Analyzes the AST and builds symbol table"""
        if not self.ast:
            self.errors.append("No AST to analyze")
            return [], self.errors
        
        try:
            self._analyze_node(self.ast)
            
            # Flatten symbol table
            for scope in self.scope_symbols.values():
                self.symbol_table.extend(scope)
            
            return self.symbol_table, self.errors
        except Exception as e:
            self.errors.append(f"Semantic analysis error: {str(e)}")
            return self.symbol_table, self.errors
    
    def _analyze_node(self, node: ASTNode):
        """Recursively analyzes AST nodes"""
        if not node:
            return
        
        if node.type == 'Program':
            for child in (node.children or []):
                self._analyze_node(child)
        
        elif node.type == 'Declaration':
            self._analyze_declaration(node)
        
        elif node.type == 'IfStatement':
            self._analyze_if_statement(node)
        
        elif node.type == 'WhileStatement':
            self._analyze_while_statement(node)
        
        elif node.type == 'ForStatement':
            self._analyze_for_statement(node)
        
        elif node.type == 'Block':
            self._enter_scope('block')
            for child in (node.children or []):
                self._analyze_node(child)
            self._exit_scope()
        
        elif node.type == 'BinaryOp':
            self._analyze_binary_op(node)
        
        elif node.type == 'FunctionCall':
            self._analyze_function_call(node)
        
        else:
            # Recursively analyze children
            for child in (node.children or []):
                self._analyze_node(child)
    
    def _analyze_declaration(self, node: ASTNode):
        """Analyzes variable/function declaration"""
        if not node.children or len(node.children) < 2:
            return
        
        type_node = node.children[0]
        name_node = node.children[1]
        
        if type_node.type != 'Type' or name_node.type != 'Identifier':
            return
        
        var_type = type_node.value
        var_name = name_node.value
        
        # Check for duplicate symbols in current scope
        if self._symbol_exists_in_current_scope(var_name):
            self.errors.append(
                f"Symbol '{var_name}' already declared in scope '{self.current_scope}' "
                f"at line {name_node.line}"
            )
            return
        
        # Create and add symbol
        symbol = Symbol(
            name=var_name,
            type=var_type,
            scope=self.current_scope,
            line=name_node.line,
            attributes={'initialized': len(node.children) > 2}
        )
        
        self.scope_symbols[self.current_scope].append(symbol)
        self.symbol_table.append(symbol)
        
        # Analyze initialization expression if present
        if len(node.children) > 2:
            init_expr = node.children[2]
            self._analyze_expression_type(init_expr, var_type)
    
    def _analyze_if_statement(self, node: ASTNode):
        """Analyzes if statement"""
        if not node.children:
            return
        
        condition = node.children[0]
        self._analyze_expression_type(condition, 'bool')
        
        # Analyze then branch
        if len(node.children) > 1:
            self._analyze_node(node.children[1])
        
        # Analyze else branch if present
        if len(node.children) > 2:
            self._analyze_node(node.children[2])
    
    def _analyze_while_statement(self, node: ASTNode):
        """Analyzes while statement"""
        if not node.children:
            return
        
        condition = node.children[0]
        self._analyze_expression_type(condition, 'bool')
        
        if len(node.children) > 1:
            self._analyze_node(node.children[1])
    
    def _analyze_for_statement(self, node: ASTNode):
        """Analyzes for statement"""
        if not node.children:
            return
        
        # For now, just analyze children
        for child in node.children:
            self._analyze_node(child)
    
    def _analyze_binary_op(self, node: ASTNode):
        """Analyzes binary operations for type checking"""
        if not node.children or len(node.children) < 2:
            return
        
        left = node.children[0]
        right = node.children[1]
        op = node.value
        
        left_type = self._get_expression_type(left)
        right_type = self._get_expression_type(right)
        
        # Type compatibility checking
        if op in ('==', '!=', '<', '>', '<=', '>='):
            if left_type and right_type and left_type != right_type:
                self.errors.append(
                    f"Type mismatch in comparison: {left_type} {op} {right_type} "
                    f"at line {node.line}"
                )
        elif op in ('+', '-', '*', '/', '%'):
            numeric_types = {'int', 'float', 'char'}
            if left_type not in numeric_types or right_type not in numeric_types:
                self.errors.append(
                    f"Type error in arithmetic: {left_type} {op} {right_type} "
                    f"at line {node.line}"
                )
        
        # Recursively analyze children
        self._analyze_node(left)
        self._analyze_node(right)
    
    def _analyze_function_call(self, node: ASTNode):
        """Analyzes function calls"""
        if not node.children:
            return
        
        func_expr = node.children[0]
        
        if func_expr.type == 'Identifier':
            func_name = func_expr.value
            if not self._symbol_exists(func_name):
                self.errors.append(
                    f"Undefined function '{func_name}' at line {func_expr.line}"
                )
    
    def _analyze_expression_type(self, expr: ASTNode, expected_type: str):
        """Analyzes expression and checks type compatibility"""
        actual_type = self._get_expression_type(expr)
        
        if actual_type and actual_type != expected_type:
            if not (expected_type in ('int', 'float') and actual_type in ('int', 'float')):
                self.errors.append(
                    f"Type error: expected {expected_type}, got {actual_type} "
                    f"at line {expr.line}"
                )
    
    def _get_expression_type(self, expr: Optional[ASTNode]) -> Optional[str]:
        """Gets the type of an expression"""
        if not expr:
            return None
        
        if expr.type == 'Number':
            return 'int' if '.' not in expr.value else 'float'
        elif expr.type == 'String':
            return 'char*'
        elif expr.type == 'Char':
            return 'char'
        elif expr.type == 'Boolean':
            return 'bool'
        elif expr.type == 'Identifier':
            symbol = self._find_symbol(expr.value)
            return symbol.type if symbol else None
        elif expr.type == 'BinaryOp':
            if expr.value in ('==', '!=', '<', '>', '<=', '>=', '&&', '||'):
                return 'bool'
            left_type = self._get_expression_type(expr.children[0] if expr.children else None)
            return left_type
        elif expr.type == 'UnaryOp':
            if expr.value == '!':
                return 'bool'
            return self._get_expression_type(expr.children[0] if expr.children else None)
        elif expr.type == 'ArrayAccess':
            return 'unknown'  # Simplified
        
        return None
    
    def _enter_scope(self, scope_name: str):
        """Enters a new scope"""
        scope_id = f"{self.current_scope}:{scope_name}"
        self.scope_stack.append(scope_id)
        self.current_scope = scope_id
        if scope_id not in self.scope_symbols:
            self.scope_symbols[scope_id] = []
    
    def _exit_scope(self):
        """Exits the current scope"""
        if len(self.scope_stack) > 1:
            self.scope_stack.pop()
            self.current_scope = self.scope_stack[-1]
    
    def _symbol_exists(self, name: str) -> bool:
        """Checks if symbol exists in any accessible scope"""
        for scope_id in reversed(self.scope_stack):
            for symbol in self.scope_symbols.get(scope_id, []):
                if symbol.name == name:
                    return True
        return False
    
    def _symbol_exists_in_current_scope(self, name: str) -> bool:
        """Checks if symbol exists in current scope"""
        for symbol in self.scope_symbols.get(self.current_scope, []):
            if symbol.name == name:
                return True
        return False
    
    def _find_symbol(self, name: str) -> Optional[Symbol]:
        """Finds symbol in accessible scopes"""
        for scope_id in reversed(self.scope_stack):
            for symbol in self.scope_symbols.get(scope_id, []):
                if symbol.name == name:
                    return symbol
        return None
