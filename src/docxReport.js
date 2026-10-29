// Turns the Markdown report into a Word document. Loaded only when the user asks for .docx,
// so the library does not slow down the first page load.
export async function reportToDocx(markdown) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } = await import('docx')

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
  // Markdown table rows ("| a | b |") are collected and written as one Word table.
  const border = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
  const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border }
  const makeTable = (rows) =>
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders,
      rows: rows.map(
        (cells, i) =>
          new TableRow({
            tableHeader: i === 0,
            children: cells.map(
              (c) =>
                new TableCell({
                  children: [new Paragraph({ children: i === 0 ? [new TextRun({ text: c, bold: true })] : runs(c) })],
                }),
            ),
          }),
      ),
    })

  const children = []
  let tableRows = []
  const flushTable = () => {
    if (tableRows.length) children.push(makeTable(tableRows), new Paragraph({}))
    tableRows = []
  }
  for (const line of markdown.split('\n')) {
    if (line.startsWith('|')) {
      const cells = line.slice(1, -1).split('|').map((c) => c.trim())
      // Skip the Markdown separator row (---, ---:).
      if (!cells.every((c) => /^-+:?$/.test(c))) tableRows.push(cells)
      continue
    }
    flushTable()
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

  flushTable()

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [{ children }],
  })
  return Packer.toBlob(doc)
}
