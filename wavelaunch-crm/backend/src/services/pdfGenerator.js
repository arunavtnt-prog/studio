const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');

/**
 * PDF Generator Service
 *
 * Generates professional, branded PDFs from markdown documents
 * with Wavelaunch Studio branding and styling.
 */
class PDFGenerator {
  constructor() {
    // Wavelaunch brand colors
    this.colors = {
      primary: '#6366F1', // Indigo
      secondary: '#8B5CF6', // Purple
      text: '#1F2937', // Gray 800
      textLight: '#6B7280', // Gray 500
      border: '#E5E7EB', // Gray 200
      background: '#F9FAFB', // Gray 50
    };

    // Typography settings
    this.fonts = {
      heading1: 24,
      heading2: 20,
      heading3: 16,
      body: 11,
      small: 9,
    };

    // Page settings
    this.pageMargins = {
      top: 72, // 1 inch
      bottom: 72,
      left: 72,
      right: 72,
    };

    this.contentWidth = 468; // Letter width - margins (612 - 144)
  }

  /**
   * Generate a PDF from a document
   */
  async generatePDF(documentContent, documentName, clientName, monthNumber, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        // Create PDF document
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: this.pageMargins,
          info: {
            Title: documentName,
            Author: 'Wavelaunch Studio',
            Subject: `Month ${monthNumber} - ${clientName}`,
            Keywords: 'Onboarding, Creator, Brand Transformation',
          },
        });

        // Stream to buffer
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Generate PDF content
        this.addCoverPage(doc, documentName, clientName, monthNumber);
        this.addTableOfContents(doc, documentContent);
        await this.addMarkdownContent(doc, documentContent);
        this.addFooterToAllPages(doc, documentName);

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add cover page with branding
   */
  addCoverPage(doc, documentName, clientName, monthNumber) {
    // Add gradient background effect (simulated with rectangles)
    doc.rect(0, 0, 612, 792).fill('#F9FAFB');

    // Add brand accent
    doc.rect(0, 0, 612, 4).fill(this.colors.primary);

    // Logo placeholder (centered at top)
    doc.fontSize(28)
      .fillColor(this.colors.primary)
      .font('Helvetica-Bold')
      .text('WAVELAUNCH STUDIO', 72, 150, {
        align: 'center',
        width: this.contentWidth,
      });

    doc.fontSize(12)
      .fillColor(this.colors.textLight)
      .font('Helvetica')
      .text('Creator-to-Brand Transformation Program', 72, 190, {
        align: 'center',
        width: this.contentWidth,
      });

    // Divider line
    doc.moveTo(156, 230)
      .lineTo(456, 230)
      .strokeColor(this.colors.border)
      .lineWidth(1)
      .stroke();

    // Document title
    doc.fontSize(this.fonts.heading1)
      .fillColor(this.colors.text)
      .font('Helvetica-Bold')
      .text(documentName, 72, 280, {
        align: 'center',
        width: this.contentWidth,
      });

    // Month badge
    doc.roundedRect(236, 340, 140, 40, 5)
      .fillAndStroke(this.colors.primary, this.colors.primary);

    doc.fontSize(14)
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .text(`Month ${monthNumber}`, 236, 352, {
        align: 'center',
        width: 140,
      });

    // Client name
    doc.fontSize(16)
      .fillColor(this.colors.text)
      .font('Helvetica')
      .text(`Prepared for: ${clientName}`, 72, 420, {
        align: 'center',
        width: this.contentWidth,
      });

    // Date
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.fontSize(12)
      .fillColor(this.colors.textLight)
      .text(date, 72, 460, {
        align: 'center',
        width: this.contentWidth,
      });

    // Confidential notice at bottom
    doc.fontSize(10)
      .fillColor(this.colors.textLight)
      .font('Helvetica-Oblique')
      .text('CONFIDENTIAL & PROPRIETARY', 72, 700, {
        align: 'center',
        width: this.contentWidth,
      });

    doc.fontSize(9)
      .fillColor(this.colors.textLight)
      .font('Helvetica')
      .text(
        'This document contains proprietary information and is intended solely for the use of the individual or entity to whom it is addressed.',
        72,
        720,
        {
          align: 'center',
          width: this.contentWidth,
        }
      );

    // Add new page for content
    doc.addPage();
  }

  /**
   * Add table of contents
   */
  addTableOfContents(doc, documentContent) {
    // Extract headings from markdown
    const headings = this.extractHeadings(documentContent);

    if (headings.length === 0) return;

    // TOC Title
    doc.fontSize(20)
      .fillColor(this.colors.text)
      .font('Helvetica-Bold')
      .text('Table of Contents', 72, 72);

    doc.moveDown(1);

    // List headings
    let yPosition = doc.y;
    headings.forEach((heading, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 72;
      }

      const indent = (heading.level - 1) * 20;
      const fontSize = heading.level === 1 ? 12 : heading.level === 2 ? 11 : 10;

      doc.fontSize(fontSize)
        .fillColor(heading.level === 1 ? this.colors.text : this.colors.textLight)
        .font(heading.level === 1 ? 'Helvetica-Bold' : 'Helvetica')
        .text(
          `${index + 1}. ${heading.text}`,
          72 + indent,
          yPosition,
          { continued: false }
        );

      yPosition = doc.y + 8;
    });

    doc.addPage();
  }

  /**
   * Extract headings from markdown for TOC
   */
  extractHeadings(markdown) {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
      headings.push({
        level: match[1].length,
        text: match[2],
      });
    }

    return headings;
  }

  /**
   * Add markdown content to PDF with styling
   */
  async addMarkdownContent(doc, markdown) {
    // Parse markdown into tokens
    const tokens = marked.lexer(markdown);

    let yPosition = 72;

    for (const token of tokens) {
      // Check if we need a new page
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 72;
      }

      switch (token.type) {
        case 'heading':
          yPosition = this.addHeading(doc, token, yPosition);
          break;

        case 'paragraph':
          yPosition = this.addParagraph(doc, token, yPosition);
          break;

        case 'list':
          yPosition = this.addList(doc, token, yPosition);
          break;

        case 'blockquote':
          yPosition = this.addBlockquote(doc, token, yPosition);
          break;

        case 'code':
          yPosition = this.addCodeBlock(doc, token, yPosition);
          break;

        case 'table':
          yPosition = this.addTable(doc, token, yPosition);
          break;

        case 'space':
          yPosition += 10;
          break;

        default:
          // Skip unsupported token types
          break;
      }
    }
  }

  /**
   * Add heading to PDF
   */
  addHeading(doc, token, yPosition) {
    const fontSize = token.depth === 1
      ? this.fonts.heading1
      : token.depth === 2
      ? this.fonts.heading2
      : this.fonts.heading3;

    const color = token.depth === 1 ? this.colors.primary : this.colors.text;

    // Add spacing before heading
    yPosition += token.depth === 1 ? 30 : 20;

    // Check page break
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 72;
    }

    doc.fontSize(fontSize)
      .fillColor(color)
      .font('Helvetica-Bold')
      .text(token.text, 72, yPosition, {
        width: this.contentWidth,
        align: 'left',
      });

    yPosition = doc.y + 12;

    // Add underline for h1 and h2
    if (token.depth <= 2) {
      doc.moveTo(72, yPosition)
        .lineTo(72 + this.contentWidth, yPosition)
        .strokeColor(token.depth === 1 ? this.colors.primary : this.colors.border)
        .lineWidth(token.depth === 1 ? 2 : 1)
        .stroke();
      yPosition += 10;
    }

    return yPosition;
  }

  /**
   * Add paragraph to PDF
   */
  addParagraph(doc, token, yPosition) {
    // Check page break
    if (yPosition > 680) {
      doc.addPage();
      yPosition = 72;
    }

    doc.fontSize(this.fonts.body)
      .fillColor(this.colors.text)
      .font('Helvetica')
      .text(this.stripMarkdown(token.text), 72, yPosition, {
        width: this.contentWidth,
        align: 'left',
        lineGap: 4,
      });

    return doc.y + 12;
  }

  /**
   * Add list to PDF
   */
  addList(doc, token, yPosition) {
    token.items.forEach((item, index) => {
      // Check page break
      if (yPosition > 680) {
        doc.addPage();
        yPosition = 72;
      }

      const bullet = token.ordered ? `${index + 1}.` : '•';

      doc.fontSize(this.fonts.body)
        .fillColor(this.colors.primary)
        .font('Helvetica-Bold')
        .text(bullet, 72, yPosition, {
          width: 20,
          continued: true,
        })
        .fillColor(this.colors.text)
        .font('Helvetica')
        .text(this.stripMarkdown(item.text), {
          width: this.contentWidth - 30,
        });

      yPosition = doc.y + 6;
    });

    return yPosition + 10;
  }

  /**
   * Add blockquote to PDF
   */
  addBlockquote(doc, token, yPosition) {
    // Check page break
    if (yPosition > 680) {
      doc.addPage();
      yPosition = 72;
    }

    // Draw left border
    doc.rect(72, yPosition, 4, 60)
      .fill(this.colors.primary);

    // Add text
    doc.fontSize(this.fonts.body)
      .fillColor(this.colors.textLight)
      .font('Helvetica-Oblique')
      .text(this.stripMarkdown(token.text), 88, yPosition, {
        width: this.contentWidth - 16,
        align: 'left',
      });

    return doc.y + 15;
  }

  /**
   * Add code block to PDF
   */
  addCodeBlock(doc, token, yPosition) {
    // Check page break
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 72;
    }

    // Background
    const codeHeight = Math.min(100, token.text.split('\n').length * 12 + 20);
    doc.rect(72, yPosition, this.contentWidth, codeHeight)
      .fill('#F3F4F6');

    // Code text
    doc.fontSize(9)
      .fillColor('#374151')
      .font('Courier')
      .text(token.text, 82, yPosition + 10, {
        width: this.contentWidth - 20,
        lineGap: 2,
      });

    return doc.y + 15;
  }

  /**
   * Add table to PDF
   */
  addTable(doc, token, yPosition) {
    // Check page break
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 72;
    }

    const colWidth = this.contentWidth / token.header.length;
    const rowHeight = 30;

    // Header row
    token.header.forEach((cell, i) => {
      doc.rect(72 + i * colWidth, yPosition, colWidth, rowHeight)
        .fillAndStroke('#F3F4F6', this.colors.border);

      doc.fontSize(10)
        .fillColor(this.colors.text)
        .font('Helvetica-Bold')
        .text(this.stripMarkdown(cell.text), 76 + i * colWidth, yPosition + 10, {
          width: colWidth - 8,
          align: 'left',
        });
    });

    yPosition += rowHeight;

    // Data rows
    token.rows.forEach((row) => {
      row.forEach((cell, i) => {
        doc.rect(72 + i * colWidth, yPosition, colWidth, rowHeight)
          .strokeColor(this.colors.border)
          .stroke();

        doc.fontSize(9)
          .fillColor(this.colors.text)
          .font('Helvetica')
          .text(this.stripMarkdown(cell.text), 76 + i * colWidth, yPosition + 10, {
            width: colWidth - 8,
            align: 'left',
          });
      });

      yPosition += rowHeight;
    });

    return yPosition + 15;
  }

  /**
   * Add footer to all pages
   */
  addFooterToAllPages(doc, documentName) {
    const pages = doc.bufferedPageRange();

    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      // Skip footer on cover page
      if (i === 0) continue;

      // Footer line
      doc.moveTo(72, 752)
        .lineTo(540, 752)
        .strokeColor(this.colors.border)
        .lineWidth(1)
        .stroke();

      // Document name (left)
      doc.fontSize(8)
        .fillColor(this.colors.textLight)
        .font('Helvetica')
        .text(documentName, 72, 762, {
          width: 200,
          align: 'left',
        });

      // Confidential (center)
      doc.fontSize(8)
        .fillColor(this.colors.textLight)
        .font('Helvetica-Oblique')
        .text('Confidential & Proprietary', 206, 762, {
          width: 200,
          align: 'center',
        });

      // Page number (right)
      doc.fontSize(8)
        .fillColor(this.colors.textLight)
        .font('Helvetica')
        .text(`Page ${i} of ${pages.count - 1}`, 406, 762, {
          width: 134,
          align: 'right',
        });
    }
  }

  /**
   * Strip markdown formatting from text
   */
  stripMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
      .replace(/\*(.+?)\*/g, '$1') // Italic
      .replace(/`(.+?)`/g, '$1') // Inline code
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
      .replace(/#{1,6}\s+/g, '') // Headings
      .trim();
  }

  /**
   * Save PDF to file
   */
  async savePDF(pdfBuffer, outputPath) {
    await fs.writeFile(outputPath, pdfBuffer);
    return outputPath;
  }
}

module.exports = new PDFGenerator();
