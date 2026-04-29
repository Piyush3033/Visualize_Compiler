import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    // Sanitize the code input to prevent command injection
    const sanitizedCode = code.replace(/'/g, "'\\''");

    // Path to the Python compiler entry point
    const compilerPath = path.join(process.cwd(), 'scripts', 'compile.py');

    // Execute the Python compiler
    const command = `python3 "${compilerPath}" '${sanitizedCode}'`;
    
    let output: string;
    try {
      output = execSync(command, {
        encoding: 'utf-8',
        timeout: 30000, // 30 second timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
    } catch (error: any) {
      console.error('[v0] Python compiler error:', error.message);
      
      // Try to parse the error output if it's JSON
      if (error.stdout) {
        try {
          const parsed = JSON.parse(error.stdout);
          return NextResponse.json(parsed, { status: 200 });
        } catch {
          // Not JSON, return error
          return NextResponse.json(
            { error: 'Compiler execution failed', details: error.message },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Compiler execution failed', details: error.message },
        { status: 500 }
      );
    }

    // Parse the compiler output
    try {
      const result = JSON.parse(output);
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('[v0] Failed to parse compiler output:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse compiler output', details: output },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[v0] API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
