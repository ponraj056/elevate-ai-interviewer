import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = file.name.toLowerCase()
    let extractedText = ''

    if (filename.endsWith('.pdf')) {
      const pdfModule = (await import('pdf-parse')) as any
      const pdf = typeof pdfModule === 'function' ? pdfModule : pdfModule.default || pdfModule
      const pdfResult = await pdf(buffer)
      extractedText = pdfResult.text || ''
    } else if (filename.endsWith('.docx')) {
      const docxResult = await mammoth.extractRawText({ buffer })
      extractedText = docxResult.value || ''
    } else {
      // Default fallback to UTF-8 plain text
      extractedText = buffer.toString('utf-8')
    }

    // Clean up empty lines or double spacings for cleaner display
    const cleanedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    if (!cleanedText) {
      return NextResponse.json({ error: 'No readable text content found in the file' }, { status: 422 })
    }

    return NextResponse.json({ text: cleanedText })
  } catch (error) {
    console.error('[Extract Text Error]:', error)
    return NextResponse.json(
      { error: `Text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
