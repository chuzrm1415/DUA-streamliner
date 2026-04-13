import { Injectable } from '@nestjs/common';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
} from 'docx';
import type { DuaField, ConfidenceLevel } from '@/common/types';

// Confidence → hex color (for cell shading)
const CONFIDENCE_COLOR: Record<ConfidenceLevel, string> = {
  high: 'C6EFCE',   // light green
  medium: 'FFEB9C', // light yellow
  low: 'FFC7CE',    // light red
};

/**
 * Adapter Pattern — transforms DuaField[] into a .docx Word document.
 * Each field renders as a table row with a colored confidence cell.
 */
@Injectable()
export class DuaDocumentGenerator {
  /**
   * Generate a .docx buffer from DUA fields.
   */
  async generate(fields: DuaField[], sessionId: string): Promise<Buffer> {
    const doc = new Document({
      sections: [
        {
          children: [
            this.buildTitle(),
            this.buildSubtitle(sessionId),
            this.buildSpacer(),
            this.buildLegend(),
            this.buildSpacer(),
            this.buildFieldsTable(fields),
            this.buildSpacer(),
            this.buildFooter(),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return Buffer.from(buffer);
  }

  // ── Private builders ────────────────────────────────────────────────────

  private buildTitle(): Paragraph {
    return new Paragraph({
      text: 'DOCUMENTO ÚNICO ADUANERO (DUA)',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    });
  }

  private buildSubtitle(sessionId: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: `Session: ${sessionId}  |  Generated: ${new Date().toLocaleString('es-CR')}`,
          size: 20,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
    });
  }

  private buildSpacer(): Paragraph {
    return new Paragraph({ text: '' });
  }

  private buildLegend(): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({ text: 'Confidence: ', bold: true, size: 18 }),
        new TextRun({ text: '  HIGH  ', highlight: 'green', size: 18 }),
        new TextRun({ text: '  ', size: 18 }),
        new TextRun({ text: '  MEDIUM  ', highlight: 'yellow', size: 18 }),
        new TextRun({ text: '  ', size: 18 }),
        new TextRun({ text: '  REVIEW  ', highlight: 'red', size: 18 }),
      ],
    });
  }

  private buildFieldsTable(fields: DuaField[]): Table {
    const headerRow = new TableRow({
      children: [
        this.headerCell('Field'),
        this.headerCell('Value'),
        this.headerCell('Confidence'),
        this.headerCell('Status'),
      ],
      tableHeader: true,
    });

    const dataRows = fields.map((field) =>
      new TableRow({
        children: [
          this.dataCell(field.label, null),
          this.dataCell(field.value || '—', null),
          this.confidenceCell(field.confidence),
          this.dataCell(field.userValidated ? 'Validated' : 'Auto', null),
        ],
      }),
    );

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    });
  }

  private headerCell(text: string): TableCell {
    return new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text, bold: true, size: 20 })],
        }),
      ],
      shading: { fill: '1A3A5C', color: 'FFFFFF' },
    });
  }

  private dataCell(text: string, _fill: string | null): TableCell {
    return new TableCell({
      children: [new Paragraph({ text })],
    });
  }

  private confidenceCell(confidence: ConfidenceLevel): TableCell {
    const labels: Record<ConfidenceLevel, string> = {
      high: 'HIGH',
      medium: 'MEDIUM',
      low: 'REVIEW',
    };
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: labels[confidence], bold: true, size: 18 }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
      shading: { fill: CONFIDENCE_COLOR[confidence] },
    });
  }

  private buildFooter(): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: 'This document was generated automatically by DUA Streamliner. Please verify all fields before submission.',
          italics: true,
          size: 16,
          color: '888888',
        }),
      ],
      alignment: AlignmentType.CENTER,
    });
  }
}
