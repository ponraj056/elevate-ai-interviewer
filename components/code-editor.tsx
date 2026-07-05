'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { EditorState, Compartment } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark'
import { Button } from '@/components/ui/button'
import { executeCode } from '@/lib/executeCode'
import { motion } from 'framer-motion'
import { Loader2, Copy, Check } from 'lucide-react'

export type EditorLanguage = 'c' | 'cpp' | 'csharp' | 'python' | 'java' | 'javascript'

interface CodeEditorProps {
  value: string
  onChange: (code: string) => void
  language: EditorLanguage
  onLanguageChange: (lang: EditorLanguage) => void
  onSubmit: (code: string, output: string) => void
}

export function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  onSubmit,
}: CodeEditorProps) {
  const { theme } = useTheme()
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<string>('')
  const [showOutput, setShowOutput] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const languageConf = useRef(new Compartment())
  const themeConf = useRef(new Compartment())

  // Initialize CodeMirror editor
  useEffect(() => {
    if (!editorRef.current) return

    const getLanguageExtension = (lang: EditorLanguage) => {
      switch (lang) {
        case 'javascript': return javascript()
        case 'python': return python()
        case 'c':
        case 'cpp': return cpp()
        case 'csharp':
        case 'java': return java()
        default: return javascript()
      }
    }

    const languageExtension = getLanguageExtension(language)
    const themeExtension = theme === 'dark' ? oneDark : []

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        languageConf.current.of(languageExtension),
        themeConf.current.of(themeExtension),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
      dispatch: (transaction) => {
        view.update([transaction])
        if (transaction.docChanged) {
          const newCode = view.state.doc.toString()
          onChange(newCode)
        }
      },
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [language, onChange])

  // Update editor language and theme
  useEffect(() => {
    if (!viewRef.current) return

    const getLanguageExtension = (lang: EditorLanguage) => {
      switch (lang) {
        case 'javascript': return javascript()
        case 'python': return python()
        case 'c':
        case 'cpp': return cpp()
        case 'csharp':
        case 'java': return java()
        default: return javascript()
      }
    }

    const languageExtension = getLanguageExtension(language)
    const themeExtension = theme === 'dark' ? oneDark : []

    viewRef.current.dispatch({
      effects: [
        languageConf.current.reconfigure(languageExtension),
        themeConf.current.reconfigure(themeExtension),
      ],
    })
  }, [language, theme])

  const handleRunCode = async () => {
    setIsRunning(true)
    setShowOutput(true)
    setOutput('Running code...')

    const result = await executeCode(language, value)

    setOutput(result.error || result.output || '(no output)')
    setIsRunning(false)
  }

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Controls */}
      <div className="flex gap-2 items-center justify-between flex-wrap">
        <div className="flex gap-2">
          <select
            value={language}
            onChange={(e) =>
              onLanguageChange(e.target.value as EditorLanguage)
            }
            className="px-3 py-1 rounded-md bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
            <option value="java">Java</option>
          </select>
        </div>

        <Button
          onClick={handleRunCode}
          disabled={isRunning}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            'Run Code'
          )}
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="border border-border rounded-lg overflow-hidden h-[300px]"
      />

      {/* Output */}
      {showOutput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Output</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyOutput}
              className="text-xs"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="bg-black/80 border border-border rounded-lg p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
            <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap break-words">
              {output}
            </pre>
          </div>

          <Button
            onClick={() => onSubmit(value, output)}
            disabled={isRunning}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Submit for Review
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
