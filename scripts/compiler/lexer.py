"""Phase 1: Lexical Analysis - Tokenizes source code"""
import re
from typing import List, Tuple
from .compilation_types import Token

class Lexer:
    """Tokenizes source code into a stream of tokens"""
    
    # Token types - C and C++ keywords
    KEYWORDS = {
        # Control flow
        'if', 'else', 'while', 'for', 'do', 'return', 'break', 'continue', 'switch', 'case', 'default',
        # Types - Basic
        'int', 'float', 'char', 'void', 'bool', 'double', 'long', 'short', 'unsigned', 'signed',
        # Storage classes
        'static', 'const', 'extern', 'volatile', 'mutable', 'register', 'restrict', 'auto',
        # Structure and type definition
        'struct', 'typedef', 'union', 'enum',
        # C++ specific
        'class', 'namespace', 'template', 'virtual', 'public', 'private', 'protected',
        'friend', 'inline', 'operator', 'explicit', 'constexpr', 'consteval', 'requires',
        'concept', 'using', 'override', 'final', 'noexcept', 'decltype', 'auto',
        # Utilities
        'sizeof', 'typeid', 'throw', 'try', 'catch',
        # Boolean and null
        'true', 'false', 'nullptr', 'NULL',
        # Other
        'asm', 'goto', 'alignof', 'alignas'
    }
    
    TOKEN_PATTERNS = [
        ('PREPROCESSOR', r'#\s*(?:include|define|ifdef|endif|pragma|ifndef|if|elif)\b[^\n]*'),
        ('NUMBER', r'0[xX][0-9a-fA-F]+|0[bB][01]+|\d+(\.\d+)?([eE][+-]?\d+)?[fFlLuU]*'),
        ('STRING', r'R"([^(]*)\([\s\S]*?\)\1"|"(?:\\.|[^"\\])*"'),
        ('CHAR', r"'(?:\\.|[^'\\])'"),
        ('IDENTIFIER', r'[a-zA-Z_][a-zA-Z0-9_]*'),
        # C++ operators: ::, ->, ->*, .*, <=>, +=, -=, *=, /=, %=, &=, |=, ^=, <<=, >>=, <=, >=, ==, !=, &&, ||, ++, --
        ('OPERATOR', r'(::|->\*|\.\*|<=>|\+=|-=|\*=|/=|%=|&=|\|=|\^=|<<=|>>=|->|==|!=|<=|>=|&&|\|\||\+\+|--|[+\-*/%=<>!&|^~?:]|\.\.\.)'),
        ('PUNCTUATION', r'[{}()\[\];,.<>:]'),
        ('WHITESPACE', r'[ \t]+'),
        ('NEWLINE', r'\n'),
        ('COMMENT', r'//[^\n]*'),
        ('BLOCK_COMMENT', r'/\*[\s\S]*?\*/'),
    ]
    
    def __init__(self, source: str):
        self.source = source
        self.position = 0
        self.line = 1
        self.column = 1
        self.tokens: List[Token] = []
        self.errors: List[str] = []
    
    def tokenize(self) -> Tuple[List[Token], List[str]]:
        """Tokenizes the entire source code"""
        while self.position < len(self.source):
            self._skip_whitespace_and_comments()
            
            if self.position >= len(self.source):
                break
            
            matched = False
            
            for token_type, pattern in self.TOKEN_PATTERNS:
                regex = re.compile(pattern)
                match = regex.match(self.source, self.position)
                
                if match:
                    value = match.group(0)
                    
                    # Skip whitespace, newlines, comments, and preprocessor directives
                    if token_type in ('WHITESPACE', 'NEWLINE', 'COMMENT', 'BLOCK_COMMENT', 'PREPROCESSOR'):
                        self._advance_position(value)
                        matched = True
                        break
                    
                    # Classify identifiers as keywords or identifiers
                    if token_type == 'IDENTIFIER':
                        if value in self.KEYWORDS:
                            token_type = 'KEYWORD'
                    
                    token = Token(
                        type=token_type,
                        value=value,
                        line=self.line,
                        column=self.column
                    )
                    self.tokens.append(token)
                    self._advance_position(value)
                    matched = True
                    break
            
            if not matched:
                char = self.source[self.position]
                self.errors.append(f"Unexpected character '{char}' at line {self.line}, column {self.column}")
                self._advance_position(char)
        
        return self.tokens, self.errors
    
    def _advance_position(self, text: str):
        """Advances position, line, and column counters"""
        for char in text:
            if char == '\n':
                self.line += 1
                self.column = 1
            else:
                self.column += 1
            self.position += 1
    
    def _skip_whitespace_and_comments(self):
        """Skips whitespace and comments"""
        while self.position < len(self.source):
            # Skip whitespace
            if self.source[self.position] in ' \t\n\r':
                if self.source[self.position] == '\n':
                    self.line += 1
                    self.column = 1
                else:
                    self.column += 1
                self.position += 1
            # Skip line comments
            elif self.position + 1 < len(self.source) and self.source[self.position:self.position+2] == '//':
                while self.position < len(self.source) and self.source[self.position] != '\n':
                    self.position += 1
            # Skip block comments
            elif self.position + 1 < len(self.source) and self.source[self.position:self.position+2] == '/*':
                self.position += 2
                while self.position + 1 < len(self.source):
                    if self.source[self.position:self.position+2] == '*/':
                        self.position += 2
                        break
                    if self.source[self.position] == '\n':
                        self.line += 1
                        self.column = 1
                    else:
                        self.column += 1
                    self.position += 1
            else:
                break
