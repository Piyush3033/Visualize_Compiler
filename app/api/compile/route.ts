import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    // Get the correct path to the Python compiler
    const cwd = process.cwd();
    const compilerPath = path.join(cwd, 'scripts', 'compile.py');
    
    console.log('[v0] Working directory:', cwd);
    console.log('[v0] Compiler path:', compilerPath);
    console.log('[v0] Compiler exists:', fs.existsSync(compilerPath));

    if (!fs.existsSync(compilerPath)) {
      return NextResponse.json(
        { error: 'Compiler not found', path: compilerPath },
        { status: 500 }
      );
    }

    // Write code to a temporary file to avoid shell escaping issues
    const tmpDir = '/tmp';
    const tmpFile = path.join(tmpDir, `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.c`);
    
    fs.writeFileSync(tmpFile, code, 'utf-8');
    console.log('[v0] Wrote code to:', tmpFile);

    // Execute the Python compiler with the temporary file
    const command = `python3 "${compilerPath}" < "${tmpFile}"`;
    
    let output: string;
    try {
      output = execSync(command, {
        encoding: 'utf-8',
        timeout: 30000, // 30 second timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        stdio: ['pipe', 'pipe', 'pipe'], // Capture all streams
      });
      console.log('[v0] Compilation output length:', output.length);
    } catch (error: any) {
      console.error('[v0] Python compiler error:', error.message);
      console.error('[v0] Stderr:', error.stderr?.toString());
      console.error('[v0] Stdout:', error.stdout?.toString());
      
      // Try to parse the error output if it's JSON
      const outputStr = error.stdout?.toString() || '';
      if (outputStr) {
        try {
          const parsed = JSON.parse(outputStr);
          // Clean up temp file
          try { fs.unlinkSync(tmpFile); } catch {}
          return NextResponse.json(parsed, { status: 200 });
        } catch {
          // Not JSON, return error
          try { fs.unlinkSync(tmpFile); } catch {}
          return NextResponse.json(
            { error: 'Compiler execution failed', details: error.message },
            { status: 500 }
          );
        }
      }
      
      try { fs.unlinkSync(tmpFile); } catch {}
      return NextResponse.json(
        { error: 'Compiler execution failed', details: error.message },
        { status: 500 }
      );
    }

    // Clean up temp file
    try {
      fs.unlinkSync(tmpFile);
    } catch (cleanupError) {
      console.warn('[v0] Failed to cleanup temp file:', cleanupError);
    }

    // Parse the compiler output
    try {
      const result = JSON.parse(output);
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('[v0] Failed to parse compiler output:', parseError);
      console.error('[v0] Raw output:', output.substring(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse compiler output', raw: output.substring(0, 1000) },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[v0] API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error', stack: error.stack },
      { status: 500 }
    );
  }
}
