/**
 * docxGenerator.js
 *
 * Proper DOCX generation using the 'docx' library.
 */
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, Media, ImageRun } from 'docx';

export async function exportToDocx(docDefinition, project) {
    const sections = [];

    docDefinition.forEach(item => {
        if (item.type === 'table') {
            const tableRows = item.data.map((rowData, rowIndex) => {
                return new TableRow({
                    children: rowData.map(cellData => new TableCell({
                        children: [new Paragraph({
                            children: [new TextRun({
                                text: cellData,
                                bold: rowIndex === 0, // Bold header row
                                size: 22, // 11pt
                                font: 'Aptos'
                            })]
                        })]
                    }))
                });
            });
            sections.push(new Table({ rows: tableRows, width: { size: 100, type: 'pct' } }));
        } else {
            sections.push(createParagraph(item));
        }
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: sections,
        }],
        styles: {
            paragraphStyles: [
                {
                    id: 'heading',
                    name: 'Heading',
                    basedOn: 'Normal',
                    next: 'Normal',
                    run: {
                        size: 28, // 14pt
                        bold: true,
                    },
                    paragraph: {
                        spacing: { after: 240 },
                    },
                },
                {
                    id: 'list',
                    name: 'List',
                    basedOn: 'Normal',
                    next: 'Normal',
                    paragraph: {
                        indent: { left: 720 }, // 0.5 inch indent
                    },
                }
            ]
        }
    });

    const blob = await Packer.toBlob(doc);
    return blob;
}

function createParagraph(item) {
    let children = [];
    if (item.children) {
        children = item.children.map(child => createTextRun(child));
    } else {
        children = [createTextRun(item)];
    }

    let style;
    if (item.style === 'heading') {
        style = 'heading';
    } else if (item.style === 'list') {
        style = 'list';
    }

    return new Paragraph({ children, style });
}

function createTextRun(item) {
    const runOptions = {
        text: item.text,
        bold: item.bold || false,
        italics: item.italics || false,
        color: item.color || '000000',
        size: item.size || 22, // Default 11pt font size, or custom size
        font: 'Aptos'
    };

    // Handle underline formatting
    if (item.underline !== undefined) {
        runOptions.underline = item.underline;
    }

    // Handle small caps formatting
    if (item.smallCaps) {
        runOptions.smallCaps = true;
    }

    return new TextRun(runOptions);
}

export function downloadWordDocument(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'questionnaire.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}