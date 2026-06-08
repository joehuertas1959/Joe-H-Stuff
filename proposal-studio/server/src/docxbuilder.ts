import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import type { Proposal, TemplateSection } from './types.js';

// Split a line into runs, flagging [bracketed placeholders] in red/bold so the
// bidder can see exactly what still needs to be filled in.
function lineRuns(line: string, opts: { bold?: boolean } = {}): TextRun[] {
  const parts = line.split(/(\[[^\]]*\])/g).filter((s) => s.length > 0);
  if (parts.length === 0) return [new TextRun({ text: '', bold: opts.bold })];
  return parts.map((part) => {
    const isPlaceholder = /^\[[^\]]*\]$/.test(part);
    return new TextRun({
      text: part,
      bold: opts.bold || isPlaceholder,
      color: isPlaceholder ? 'C00000' : undefined,
    });
  });
}

// Convert a section's draft text into Word paragraphs. Supports blank-line
// paragraph breaks and "- "/"* " bullet lines.
function renderDraft(text: string): Paragraph[] {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return [
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: '[Response not yet drafted]', bold: true, color: 'C00000' }),
        ],
      }),
    ];
  }

  const paras: Paragraph[] = [];
  for (const raw of trimmed.split(/\n/)) {
    const line = raw.replace(/\s+$/, '');
    if (line.trim() === '') {
      paras.push(new Paragraph({ children: [new TextRun('')] }));
      continue;
    }
    const bullet = /^\s*[-*]\s+/.test(line);
    const content = bullet ? line.replace(/^\s*[-*]\s+/, '') : line;
    paras.push(
      new Paragraph({
        spacing: { after: 80 },
        bullet: bullet ? { level: 0 } : undefined,
        children: lineRuns(content),
      }),
    );
  }
  return paras;
}

function labelValueRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun(value)] })],
      }),
    ],
  });
}

function sectionHeading(index: number, s: TemplateSection): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    children: [new TextRun({ text: `${index + 1}. ${s.heading}`, bold: true })],
  });
}

export async function buildBidderResponseDocx(p: Proposal): Promise<Buffer> {
  const t = p.template!;
  const today = new Date().toLocaleDateString();

  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "BIDDER'S RESPONSE FORM", bold: true, size: 32 })],
    }),
  );
  if (t.title) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: t.title, italics: true, size: 24 })],
      }),
    );
  }

  // Header / identification block
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        labelValueRow('Solicitation', p.rfp?.name || '—'),
        labelValueRow('Opportunity', p.name),
        labelValueRow('Bidder / Offeror', '__________________________________'),
        labelValueRow('Prepared by', '__________________________________'),
        labelValueRow('Date', today),
      ],
    }),
  );

  if (t.overview) {
    children.push(
      new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: 'Overview', bold: true })] }),
      new Paragraph({ spacing: { after: 120 }, children: lineRuns(t.overview) }),
    );
  }

  children.push(
    new Paragraph({
      spacing: { before: 120, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '888888', space: 1 } },
      children: [new TextRun('')],
    }),
  );

  // Sections with responses
  t.sections.forEach((s, i) => {
    children.push(sectionHeading(i, s));
    if (s.pageOrFormatLimits) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: `Format/limit: ${s.pageOrFormatLimits}`, italics: true, color: '666666', size: 18 })],
        }),
      );
    }
    for (const para of renderDraft(s.draft)) children.push(para);
  });

  // Certification / signature block
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 360, after: 100 },
      children: [new TextRun({ text: 'Certification', bold: true })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun(
          'The undersigned certifies that the information provided in this response is true and accurate ' +
            'to the best of their knowledge and that the bidder agrees to the terms and conditions of the ' +
            'solicitation.',
        ),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        labelValueRow('Authorized Signature', '__________________________________'),
        labelValueRow('Printed Name', '__________________________________'),
        labelValueRow('Title', '__________________________________'),
        labelValueRow('Date', '__________________________________'),
      ],
    }),
  );

  const doc = new Document({
    creator: 'Proposal Studio',
    title: `${p.name} — Bidder's Response Form`,
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22 } },
      },
    },
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
