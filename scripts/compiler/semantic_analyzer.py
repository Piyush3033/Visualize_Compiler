"""Phase 3: Semantic Analysis - Type checking and symbol table building"""
from typing import List, Dict, Optional
from .compilation_types import ASTNode, Symbol

class SemanticAnalyzer:
    """Performs semantic analysis on the AST"""
    
    PRIMITIVE_TYPES = {'int', 'float', 'char', 'void', 'bool', 'double'}
    
    # Standard library functions
    STDLIB_FUNCTIONS = {
        'printf': 'int',
        'scanf': 'int',
        'fprintf': 'int',
        'fscanf': 'int',
        'sprintf': 'int',
        'sscanf': 'int',
        'malloc': 'void *',
        'calloc': 'void *',
        'realloc': 'void *',
        'free': 'void',
        'strlen': 'int',
        'strcpy': 'char *',
        'strcat': 'char *',
        'strcmp': 'int',
        'memcpy': 'void *',
        'memset': 'void *',
        'qsort': 'void',
        'abs': 'int',
        'labs': 'int',
        'rand': 'int',
        'srand': 'void',
        'sin': 'float',
        'cos': 'float',
        'tan': 'float',
        'sqrt': 'float',
        'pow': 'float',
        'exit': 'void',
        'getchar': 'int',
        'putchar': 'int',
        'gets': 'char *',
        'puts': 'int',
        'fopen': 'void *',
        'fclose': 'int',
        'fread': 'int',
        'fwrite': 'int',
        'fputs': 'int',
        'fgets': 'char *',
    }
    
    def __init__(self, ast: Optional[ASTNode]):
        self.ast = ast
        self.symbol_table: List[Symbol] = []
        self.errors: List[str] = []
        self.current_scope = 'global'
        self.scope_stack = ['global']
        self.scope_symbols: Dict[str, List[Symbol]] = {'global': []}
        self.variable_types: Dict[str, str] = {}  # Track variable types
        self._initialize_stdlib()
    
    def _initialize_stdlib(self):
        """Initializes standard library function symbols"""
        for func_name, return_type in self.STDLIB_FUNCTIONS.items():
            symbol = Symbol(
                name=func_name,
                type=return_type,
                scope='global',
                line=0,
                attributes={'is_stdlib': True}
            )
            self.scope_symbols['global'].append(symbol)
            self.symbol_table.append(symbol)
    
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
        
        # Track variable type
        self.variable_types[var_name] = var_type
        
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
        
        # Handle assignment operators - track variable types
        if op in ('=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>='):
            if left.type == 'Identifier':
                # Update variable type tracking
                if right_type:
                    self.variable_types[left.value] = right_type
        
        # Type compatibility checking
        if op in ('==', '!=', '<', '>', '<=', '>='):
            # Only check if we have actual types (not None)
            if left_type and right_type and left_type != right_type:
                # Allow int/float comparison
                numeric_types = {'int', 'float', 'double', 'char'}
                if not (left_type in numeric_types and right_type in numeric_types):
                    self.errors.append(
                        f"Type mismatch in comparison: {left_type} {op} {right_type} "
                        f"at line {node.line}"
                    )
        elif op in ('+', '-', '*', '/', '%', '+=', '-=', '*=', '/=', '%='):
            numeric_types = {'int', 'float', 'double', 'char'}
            # Only report error if both types are known and both are non-numeric
            if left_type and right_type:
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
            # First check variable_types tracking
            if expr.value in self.variable_types:
                return self.variable_types[expr.value]
            # Then check symbol table
            symbol = self._find_symbol(expr.value)
            return symbol.type if symbol else None
        elif expr.type == 'BinaryOp':
            if expr.value in ('==', '!=', '<', '>', '<=', '>=', '&&', '||'):
                return 'bool'
            # For arithmetic operations, return left operand type
            left_type = self._get_expression_type(expr.children[0] if expr.children else None)
            # Handle double type
            if left_type and left_type in ('double', 'float'):
                return left_type
            return left_type
        elif expr.type == 'UnaryOp':
            if expr.value == '!':
                return 'bool'
            return self._get_expression_type(expr.children[0] if expr.children else None)
        elif expr.type == 'TypeCast':
            # Return the type being cast to
            if expr.children and expr.children[0].type == 'Type':
                return expr.children[0].value
            return None
        elif expr.type == 'ArrayAccess':
            # Get type of the array being accessed
            if expr.children:
                array_expr = expr.children[0]
                array_type = self._get_expression_type(array_expr)
                # Remove array brackets/dimension from type
                if array_type and '[' in array_type:
                    return array_type.split('[')[0].strip()
                return array_type
            return None
        elif expr.type == 'FunctionCall':
            # Get return type from function symbol
            if expr.children and expr.children[0].type == 'Identifier':
                func_name = expr.children[0].value
                symbol = self._find_symbol(func_name)
                return symbol.type if symbol else None
            return None
        elif expr.type == 'MemberAccess' or expr.type == 'PointerMemberAccess':
            # For member access, try to infer type from member name
            # This is simplified - a full implementation would track struct definitions
            if expr.children and len(expr.children) >= 2:
                member_name = expr.children[1].value if expr.children[1].type == 'Identifier' else None
                # Check if this member is known in variable types
                # Common struct field types - this is a heuristic
                field_types = {
                    'value': 'int',
                    'weight': 'int',
                    'ratio': 'double',
                    'index': 'int',
                    'count': 'int',
                    'size': 'int',
                }
                return field_types.get(member_name, None)
            return None
        
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
