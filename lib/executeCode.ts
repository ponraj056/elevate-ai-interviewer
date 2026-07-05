interface ExecutionResult {
  success: boolean
  output: string
  error?: string
}

export async function executeCode(
  language: 'c' | 'cpp' | 'csharp' | 'python' | 'java' | 'javascript',
  code: string
): Promise<ExecutionResult> {
  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: language,
        version: '*',
        files: [
          {
            content: code,
          },
        ],
      }),
    })

    if (!response.ok) {
      return {
        success: false,
        output: '',
        error: `API error: ${response.status} ${response.statusText}`,
      }
    }

    const data = await response.json()

    // Handle Piston API response format
    const stdout = data.run?.stdout || ''
    const stderr = data.run?.stderr || ''
    const compile = data.compile

    let output = ''
    let hasError = false

    if (compile?.stderr) {
      output += `Compilation Error:\n${compile.stderr}\n`
      hasError = true
    }

    if (stderr) {
      output += `Runtime Error:\n${stderr}\n`
      hasError = true
    }

    if (stdout) {
      output += stdout
    }

    if (!output) {
      output = '(no output)'
    }

    return {
      success: !hasError && data.run?.code === 0,
      output: output.trim(),
      error: hasError ? output : undefined,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      output: '',
      error: `Execution failed: ${errorMessage}`,
    }
  }
}
