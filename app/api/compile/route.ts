import { NextRequest, NextResponse } from 'next/server';
import { compileC } from '@/lib/compiler';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    // Compile using the TypeScript compiler
    const result = compileC(code);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[v0] API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        tokens: [],
        lexical_errors: [],
        ast: null,
        syntax_errors: [],
        symbol_table: [],
        semantic_errors: [error.message || 'Internal server error'],
        intermediate_code: [],
        ir_errors: [],
        optimized_code: [],
        optimization_stats: {},
        optimization_errors: [],
        generated_code: [],
        codegen_errors: []
      },
      { status: 500 }
    );
  }
}
