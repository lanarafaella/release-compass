// Turns the Markdown report into a Word document. Loaded only when the user asks for .docx,
// so the library does not slow down the first page load.
export async function reportToDocx(markdown) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')

  // **bold** spans become bold runs; everything else stays plain text.
  const runs = (text) =>
    text
      .split(/(\*\*[^*]+\*\*)/)
      .filter(Boolean)
      .map((part) =>
        part.startsWith('**') && part.endsWith('**')
          ? new TextRun({ text: part.slice(2, -2), bold: true })
          : new TextRun(part),
      )

  const headings = { '# ': HeadingLevel.TITLE, '## ': HeadingLevel.HEADING_1, '### ': HeadingLevel.HEADING_2 }
  const children = []
  for (const line of markdown.split('\n')) {
    if (!line.trim()) continue
    const h = Object.keys(headings).find((k) => line.startsWith(k))
    if (h) {
      children.push(new Paragraph({ heading: headings[h], children: runs(line.slice(h.length)) }))
    } else if (/^ {2,}- /.test(line)) {
      children.push(new Paragraph({ bullet: { level: 1 }, children: runs(line.replace(/^ +- /, '')) }))
    } else if (line.startsWith('- ')) {
      children.push(new Paragraph({ bullet: { level: 0 }, children: runs(line.slice(2)) }))
    } else {
      children.push(new Paragraph({ children: runs(line), spacing: { after: 120 } }))
    }
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [{ children }],
  })
  return Packer.toBlob(doc)
}
