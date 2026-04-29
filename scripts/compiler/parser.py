"""Phase 2: Syntax Analysis - Builds Abstract Syntax Tree (AST)"""
from typing import List, Optional, Tuple
from .compilation_types import Token, ASTNode

class Parser:
    """Parses tokens into an Abstract Syntax Tree"""
    
    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.position = 0
        self.errors: List[str] = []
    
    def parse(self) -> Tuple[Optional[ASTNode], List[str]]:
        """Parses tokens into an AST"""
        try:
            if not self.tokens:
                self.errors.append("No tokens to parse")
                return None, self.errors
            
            ast = self._parse_program()
            return ast, self.errors
        except Exception as e:
            self.errors.append(f"Parse error: {str(e)}")
            return None, self.errors
    
    def _current_token(self) -> Optional[Token]:
        """Returns current token without advancing"""
        if self.position < len(self.tokens):
            return self.tokens[self.position]
        return None
    
    def _peek_token(self, offset: int = 1) -> Optional[Token]:
        """Peeks ahead at token"""
        pos = self.position + offset
        if pos < len(self.tokens):
            return self.tokens[pos]
        return None
    
    def _advance(self) -> Optional[Token]:
        """Consumes and returns current token"""
        token = self._current_token()
        if token:
            self.position += 1
        return token
    
    def _expect(self, expected_type: str, expected_value: Optional[str] = None) -> Optional[Token]:
        """Expects a token of a specific type/value"""
        token = self._current_token()
        if not token:
            self.errors.append(f"Expected {expected_type} but reached end of input")
            return None
        
        if token.type != expected_type:
            self.errors.append(f"Expected {expected_type} but got {token.type} at line {token.line}")
            return None
        
        if expected_value and token.value != expected_value:
            self.errors.append(f"Expected '{expected_value}' but got '{token.value}' at line {token.line}")
            return None
        
        return self._advance()
    
    def _parse_program(self) -> ASTNode:
        """program : declaration_list | statement_list"""
        children = []
        
        while self._current_token():
            token = self._current_token()
            
            if token.type == 'KEYWORD' and token.value in ('int', 'float', 'char', 'void', 'bool', 'struct'):
                children.append(self._parse_declaration())
            else:
                children.append(self._parse_statement())
        
        return ASTNode(type='Program', children=children)
    
    def _parse_declaration(self) -> ASTNode:
        """declaration : type declarator_list ; | type IDENTIFIER ( parameters ) block"""
        line = self._current_token().line if self._current_token() else 0
        
        type_node = self._parse_type()
        
        # Parse declarators (can be multiple, separated by commas)
        declarators = []
        
        while True:
            name_token = self._expect('IDENTIFIER')
            
            if not name_token:
                return ASTNode(type='Declaration', value='error', line=line)
            
            # Check if this is a function declaration (only for first declarator)
            if len(declarators) == 0 and self._current_token() and self._current_token().value == '(':
                return self._parse_function_declaration(type_node, name_token, line)
            
            # Check for array syntax: int arr[size]
            is_array = False
            array_size = None
            if self._current_token() and self._current_token().value == '[':
                is_array = True
                self._advance()
                if self._current_token() and self._current_token().value != ']':
                    array_size = self._parse_expression()
                self._expect('PUNCTUATION', ']')
            
            # Create declarator node
            declarator = ASTNode(
                type='ArrayDeclarator' if is_array else 'Declarator',
                children=[ASTNode(type='Identifier', value=name_token.value, line=name_token.line)]
            )
            
            if is_array and array_size:
                declarator.children.append(array_size)
            
            # Check for initialization
            if self._current_token() and self._current_token().value == '=':
                self._advance()
                # Handle initializer list: {...}
                if self._current_token() and self._current_token().value == '{':
                    self._advance()
                    init_children = []
                    while self._current_token() and self._current_token().value != '}':
                        init_children.append(self._parse_expression())
                        if self._current_token() and self._current_token().value == ',':
                            self._advance()
                    self._expect('PUNCTUATION', '}')
                    declarator.children.append(ASTNode(type='InitializerList', children=init_children))
                else:
                    declarator.children.append(self._parse_expression())
            
            declarators.append(declarator)
            
            # Check if there's another declarator (comma-separated)
            if self._current_token() and self._current_token().value == ',':
                self._advance()
            else:
                break
        
        self._expect('PUNCTUATION', ';')
        
        # Create declaration node with all declarators
        children = [type_node] + declarators
        return ASTNode(type='Declaration', children=children, line=line)
    
    def _parse_function_declaration(self, type_node: ASTNode, name_token: Token, line: int) -> ASTNode:
        """function_declaration : type IDENTIFIER ( parameters ) block"""
        self._expect('PUNCTUATION', '(')
        
        # Parse parameters
        params = []
        while self._current_token() and self._current_token().value != ')':
            if self._current_token().type == 'KEYWORD' and self._current_token().value in ('int', 'float', 'char', 'void', 'bool'):
                param_type = self._parse_type()
                param_name = self._expect('IDENTIFIER')
                if param_name:
                    params.append(ASTNode(type='Parameter', children=[param_type, ASTNode(type='Identifier', value=param_name.value, line=param_name.line)]))
            
            if self._current_token() and self._current_token().value == ',':
                self._advance()
            else:
                break
        
        self._expect('PUNCTUATION', ')')
        
        # Parse function body
        body = self._parse_block()
        
        children = [type_node, ASTNode(type='Identifier', value=name_token.value, line=name_token.line)]
        children.extend(params)
        children.append(body)
        
        return ASTNode(type='FunctionDeclaration', children=children, line=line)
    
    def _parse_type(self) -> ASTNode:
        """type : int | float | char | void | bool | struct"""
        token = self._current_token()
        if token and token.type == 'KEYWORD' and token.value in ('int', 'float', 'char', 'void', 'bool', 'struct'):
            self._advance()
            return ASTNode(type='Type', value=token.value, line=token.line)
        
        self.errors.append(f"Expected type at line {token.line if token else 'unknown'}")
        return ASTNode(type='Type', value='unknown')
    
    def _parse_statement(self) -> ASTNode:
        """statement : declaration | assignment | if_stmt | while_stmt | for_stmt | block | return_stmt"""
        token = self._current_token()
        
        if not token:
            return ASTNode(type='Statement', value='empty')
        
        if token.type == 'KEYWORD':
            # Check if this is a type declaration (int, float, char, void, bool)
            if token.value in ('int', 'float', 'char', 'void', 'bool'):
                return self._parse_declaration()
            elif token.value == 'if':
                return self._parse_if_statement()
            elif token.value == 'while':
                return self._parse_while_statement()
            elif token.value == 'for':
                return self._parse_for_statement()
            elif token.value == 'return':
                return self._parse_return_statement()
            elif token.value == '{':
                return self._parse_block()
        
        if token.type == 'PUNCTUATION' and token.value == '{':
            return self._parse_block()
        
        # Default to assignment or expression statement
        return self._parse_expression_statement()
    
    def _parse_block(self) -> ASTNode:
        """block : { statement_list }"""
        line = self._current_token().line if self._current_token() else 0
        self._expect('PUNCTUATION', '{')
        
        children = []
        while self._current_token() and self._current_token().value != '}':
            children.append(self._parse_statement())
        
        self._expect('PUNCTUATION', '}')
        
        return ASTNode(type='Block', children=children, line=line)
    
    def _parse_if_statement(self) -> ASTNode:
        """if_stmt : if ( expression ) statement (else statement)?"""
        line = self._current_token().line if self._current_token() else 0
        self._expect('KEYWORD', 'if')
        self._expect('PUNCTUATION', '(')
        
        condition = self._parse_expression()
        self._expect('PUNCTUATION', ')')
        
        then_stmt = self._parse_statement()
        
        children = [condition, then_stmt]
        
        if self._current_token() and self._current_token().value == 'else':
            self._advance()
            else_stmt = self._parse_statement()
            children.append(else_stmt)
        
        return ASTNode(type='IfStatement', children=children, line=line)
    
    def _parse_while_statement(self) -> ASTNode:
        """while_stmt : while ( expression ) statement"""
        line = self._current_token().line if self._current_token() else 0
        self._expect('KEYWORD', 'while')
        self._expect('PUNCTUATION', '(')
        
        condition = self._parse_expression()
        self._expect('PUNCTUATION', ')')
        
        body = self._parse_statement()
        
        return ASTNode(type='WhileStatement', children=[condition, body], line=line)
    
    def _parse_for_statement(self) -> ASTNode:
        """for_stmt : for ( (declaration | expr)? ; expr? ; expr? ) statement"""
        line = self._current_token().line if self._current_token() else 0
        self._expect('KEYWORD', 'for')
        self._expect('PUNCTUATION', '(')
        
        children = []
        
        # Init - can be declaration or expression
        if self._current_token() and self._current_token().value != ';':
            token = self._current_token()
            # Check if it's a declaration (type keyword)
            if token.type == 'KEYWORD' and token.value in ('int', 'float', 'char', 'void', 'bool'):
                children.append(self._parse_declaration_for_loop())
            else:
                children.append(self._parse_expression())
                self._expect('PUNCTUATION', ';')
        else:
            self._expect('PUNCTUATION', ';')
        
        # Condition
        if self._current_token() and self._current_token().value != ';':
            children.append(self._parse_expression())
        self._expect('PUNCTUATION', ';')
        
        # Update
        if self._current_token() and self._current_token().value != ')':
            children.append(self._parse_expression())
        self._expect('PUNCTUATION', ')')
        
        # Body
        children.append(self._parse_statement())
        
        return ASTNode(type='ForStatement', children=children, line=line)
    
    def _parse_declaration_for_loop(self) -> ASTNode:
        """Parse declaration in for loop without consuming the semicolon twice"""
        line = self._current_token().line if self._current_token() else 0
        
        type_node = self._parse_type()
        name_token = self._expect('IDENTIFIER')
        
        if not name_token:
            return ASTNode(type='Declaration', value='error', line=line)
        
        # Check for array syntax
        is_array = False
        array_size = None
        if self._current_token() and self._current_token().value == '[':
            is_array = True
            self._advance()
            if self._current_token() and self._current_token().value != ']':
                array_size = self._parse_expression()
            self._expect('PUNCTUATION', ']')
        
        # Create declarator
        declarator = ASTNode(
            type='ArrayDeclarator' if is_array else 'Declarator',
            children=[ASTNode(type='Identifier', value=name_token.value, line=name_token.line)]
        )
        
        if is_array and array_size:
            declarator.children.append(array_size)
        
        # Check for initialization
        if self._current_token() and self._current_token().value == '=':
            self._advance()
            declarator.children.append(self._parse_expression())
        
        # Expect semicolon
        self._expect('PUNCTUATION', ';')
        
        return ASTNode(type='Declaration', children=[type_node, declarator], line=line)
    
    def _parse_return_statement(self) -> ASTNode:
        """return_stmt : return expression? ;"""
        line = self._current_token().line if self._current_token() else 0
        self._expect('KEYWORD', 'return')
        
        children = []
        if self._current_token() and self._current_token().value != ';':
            children.append(self._parse_expression())
        
        self._expect('PUNCTUATION', ';')
        
        return ASTNode(type='ReturnStatement', children=children, line=line)
    
    def _parse_expression_statement(self) -> ASTNode:
        """expression_statement : expression? ;"""
        if self._current_token() and self._current_token().value != ';':
            expr = self._parse_expression()
        else:
            expr = ASTNode(type='Expression', value='empty')
        
        if self._current_token() and self._current_token().value == ';':
            self._advance()
        
        return ASTNode(type='ExpressionStatement', children=[expr])
    
    def _parse_expression(self) -> ASTNode:
        """expression : assignment_expr"""
        return self._parse_assignment_expr()
    
    def _parse_assignment_expr(self) -> ASTNode:
        """assignment_expr : logical_or_expr (= logical_or_expr)*"""
        left = self._parse_logical_or_expr()
        
        while self._current_token() and self._current_token().value == '=':
            op = self._advance().value
            right = self._parse_logical_or_expr()
            left = ASTNode(type='BinaryOp', value=op, children=[left, right])
        
        return left
    
    def _parse_logical_or_expr(self) -> ASTNode:
        """logical_or_expr : logical_and_expr (|| logical_and_expr)*"""
        left = self._parse_logical_and_expr()
        
        while self._current_token() and self._current_token().value == '||':
            op = self._advance().value
            right = self._parse_logical_and_expr()
            left = ASTNode(type='BinaryOp', value=op, children=[left, right])
        
        return left
    
    def _parse_logical_and_expr(self) -> ASTNode:
        """logical_and_expr : equality_expr (&& equality_expr)*"""
        left = self._parse_equality_expr()
        
        while self._current_token() and self._current_token().value == '&&':
            op = self._advance().value
            right = self._parse_equality_expr()
            left = ASTNode(type='BinaryOp', value=op, children=[left, right])
        
        return left
    
    def _parse_equality_expr(self) -> ASTNode:
        """equality_expr : relational_expr ((== | !=) relational_expr)*"""
        left = self._parse_relational_expr()
        
        while self._current_token() and self._current_token().value in ('==', '!='):
            op = self._advance().value
            right = self._parse_relational_expr()
            left = ASTNode(type='BinaryOp', value=op, children=[left, right])
        
        return left
    
    def _parse_relational_expr(self) -> ASTNode:
        """relational_expr : additive_expr ((< | > | <= | >=) additive_expr)*"""
        left = self._parse_additive_expr()
        
        while self._current_token() and self._current_token().value in ('<', '>', '<=', '>='):
            op = self._advance().value
            right = self._parse_additive_expr()
            left = ASTNode(type='BinaryOp', value=op, children=[left, right])
        
        return left
    
    def _parse_additive_expr(self) -> ASTNode:
        """additive_expr : multiplicative_expr ((+ | -) multiplicative_expr)*"""
        left = self._parse_multiplicative_expr()
        
        while self._current_token() and self._current_token().value in ('+', '-'):
            op = self._advance().value
            right = self._parse_multiplicative_expr()
            left = ASTNode(type='BinaryOp', value=op, children=[left, right])
        
        return left
    
    def _parse_multiplicative_expr(self) -> ASTNode:
        """multiplicative_expr : unary_expr ((* | / | %) unary_expr)*"""
        left = self._parse_unary_expr()
        
        while self._current_token() and self._current_token().value in ('*', '/', '%'):
            op = self._advance().value
            right = self._parse_unary_expr()
            left = ASTNode(type='BinaryOp', value=op, children=[left, right])
        
        return left
    
    def _parse_unary_expr(self) -> ASTNode:
        """unary_expr : (! | - | + | & | *) unary_expr | postfix_expr"""
        token = self._current_token()
        
        if token and token.value in ('!', '-', '+', '++', '--', '&', '*'):
            op = self._advance().value
            operand = self._parse_unary_expr()
            return ASTNode(type='UnaryOp', value=op, children=[operand])
        
        return self._parse_postfix_expr()
    
    def _parse_postfix_expr(self) -> ASTNode:
        """postfix_expr : primary_expr (++ | -- | [ expr ] | ( arguments ))*"""
        expr = self._parse_primary_expr()
        
        while True:
            token = self._current_token()
            if not token:
                break
            
            if token.value in ('++', '--'):
                op = self._advance().value
                expr = ASTNode(type='PostfixOp', value=op, children=[expr])
            elif token.value == '[':
                self._advance()
                index = self._parse_expression()
                self._expect('PUNCTUATION', ']')
                expr = ASTNode(type='ArrayAccess', children=[expr, index])
            elif token.value == '(':
                self._advance()
                args = []
                while self._current_token() and self._current_token().value != ')':
                    args.append(self._parse_expression())
                    if self._current_token() and self._current_token().value == ',':
                        self._advance()
                self._expect('PUNCTUATION', ')')
                expr = ASTNode(type='FunctionCall', children=[expr] + args)
            else:
                break
        
        return expr
    
    def _parse_primary_expr(self) -> ASTNode:
        """primary_expr : NUMBER | IDENTIFIER | ( expression ) | STRING | CHAR"""
        token = self._current_token()
        
        if not token:
            self.errors.append("Unexpected end of input")
            return ASTNode(type='Literal', value='error')
        
        if token.type == 'NUMBER':
            self._advance()
            return ASTNode(type='Number', value=token.value, line=token.line)
        
        elif token.type == 'IDENTIFIER':
            self._advance()
            return ASTNode(type='Identifier', value=token.value, line=token.line)
        
        elif token.type == 'STRING':
            self._advance()
            return ASTNode(type='String', value=token.value, line=token.line)
        
        elif token.type == 'CHAR':
            self._advance()
            return ASTNode(type='Char', value=token.value, line=token.line)
        
        elif token.type == 'KEYWORD' and token.value in ('true', 'false'):
            self._advance()
            return ASTNode(type='Boolean', value=token.value, line=token.line)
        
        elif token.value == '(':
            self._advance()
            expr = self._parse_expression()
            self._expect('PUNCTUATION', ')')
            return expr
        
        else:
            self.errors.append(f"Unexpected token '{token.value}' at line {token.line}")
            self._advance()
            return ASTNode(type='Error', value=token.value, line=token.line)
