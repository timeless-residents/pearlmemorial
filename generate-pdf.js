const { chromium } = require('playwright');
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

async function generatePDF(mdFile, pdfFile, isJapanese = false) {
    const markdown = fs.readFileSync(mdFile, 'utf-8');

    const fontFamily = isJapanese
        ? "'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', sans-serif"
        : "'Georgia', 'Times New Roman', serif";

    // Check if this is a proposal with SUMMARY_END marker
    const hasSummaryEnd = markdown.includes('<!-- SUMMARY_END -->');
    // Check if this has TWO_COLUMN_START marker (for trackrecord)
    const hasTwoColumnStart = markdown.includes('<!-- TWO_COLUMN_START -->');

    let htmlContent;
    if (hasSummaryEnd) {
        const [summaryMd, detailsMd] = markdown.split('<!-- SUMMARY_END -->');
        const summaryHtml = marked.parse(summaryMd);
        const detailsHtml = marked.parse(detailsMd);

        htmlContent = `
            <div class="summary-page">
                ${summaryHtml}
            </div>
            <div class="details-section">
                ${detailsHtml}
            </div>
        `;
    } else if (hasTwoColumnStart) {
        const [singleColumnMd, twoColumnMd] = markdown.split('<!-- TWO_COLUMN_START -->');
        const singleColumnHtml = marked.parse(singleColumnMd);
        const twoColumnHtml = marked.parse(twoColumnMd);

        htmlContent = `
            <div class="single-column-section">
                ${singleColumnHtml}
            </div>
            <div class="two-column-section">
                ${twoColumnHtml}
            </div>
        `;
    } else {
        htmlContent = marked.parse(markdown);
    }

    const twoColumnStyles = hasSummaryEnd ? `
        .summary-page {
            page-break-after: always;
        }

        .summary-page h1 {
            font-size: 20pt;
            margin-bottom: 15px;
        }

        .summary-page h2 {
            font-size: 13pt;
            margin-top: 18px;
            margin-bottom: 8px;
        }

        .summary-page table {
            font-size: 9pt;
            margin: 8px 0;
        }

        .summary-page th, .summary-page td {
            padding: 5px 8px;
        }

        .summary-page p {
            font-size: 10pt;
            margin: 6px 0;
        }

        .details-section {
            column-count: 2;
            column-gap: 25px;
            column-rule: 1px solid #ddd;
            line-height: 1.4;
        }

        .details-section h2 {
            font-size: 11pt;
            margin-top: 16px;
            margin-bottom: 8px;
            break-after: avoid;
        }

        .details-section h3 {
            font-size: 9pt;
            margin-top: 10px;
            margin-bottom: 4px;
        }

        .details-section h4 {
            font-size: 8pt;
            margin-top: 8px;
        }

        .details-section p {
            font-size: 8pt;
            margin: 4px 0;
            text-align: justify;
        }

        .details-section ul, .details-section ol {
            font-size: 8pt;
            padding-left: 16px;
            margin: 4px 0;
        }

        .details-section li {
            margin: 2px 0;
        }

        .details-section table {
            font-size: 7.5pt;
            break-inside: avoid;
            margin: 6px 0;
        }

        .details-section th, .details-section td {
            padding: 3px 5px;
        }

        .details-section blockquote {
            font-size: 8pt;
            margin: 8px 0;
            padding: 6px 10px;
        }

        .details-section hr {
            margin: 12px 0;
        }
    ` : '';

    const trackRecordTwoColumnStyles = hasTwoColumnStart ? `
        .two-column-section {
            column-count: 2;
            column-gap: 25px;
            column-rule: 1px solid #ddd;
            line-height: 1.25;
        }

        .two-column-section h2 {
            font-size: 12pt;
            margin-top: 16px;
            margin-bottom: 8px;
            break-after: avoid;
            column-span: none;
        }

        .two-column-section h3 {
            font-size: 10pt;
            margin-top: 12px;
            margin-bottom: 6px;
            break-after: avoid;
        }

        .two-column-section h4 {
            font-size: 9pt;
            margin-top: 10px;
            margin-bottom: 4px;
        }

        .two-column-section p {
            font-size: 9pt;
            margin: 6px 0;
        }

        .two-column-section ul, .two-column-section ol {
            font-size: 9pt;
            padding-left: 18px;
            margin: 6px 0;
        }

        .two-column-section li {
            margin: 3px 0;
        }

        .two-column-section table {
            font-size: 8pt;
            break-inside: avoid;
            margin: 8px 0;
        }

        .two-column-section th, .two-column-section td {
            padding: 4px 6px;
        }

        .two-column-section hr {
            margin: 14px 0;
        }

        .two-column-section blockquote {
            font-size: 8pt;
            margin: 8px 0;
            padding: 6px 10px;
        }
    ` : '';

    const html = `<!DOCTYPE html>
<html lang="${isJapanese ? 'ja' : 'en'}">
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');

        body {
            font-family: ${fontFamily};
            font-size: 11pt;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 100%;
            margin: 0;
            padding: 0;
        }

        h1 {
            font-size: 24pt;
            color: #8B7355;
            border-bottom: 2px solid #C9A962;
            padding-bottom: 10px;
            margin-top: 0;
        }

        h2 {
            font-size: 16pt;
            color: #5B4A3A;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
            margin-top: 30px;
            page-break-after: avoid;
        }

        h3 {
            font-size: 13pt;
            color: #6B5A4A;
            margin-top: 20px;
            page-break-after: avoid;
        }

        h4 {
            font-size: 11pt;
            color: #7B6A5A;
            margin-top: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10pt;
            page-break-inside: avoid;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px 10px;
            text-align: left;
        }

        th {
            background: #f5f0e8;
            color: #5B4A3A;
            font-weight: 600;
        }

        tr:nth-child(even) {
            background: #faf8f5;
        }

        blockquote {
            border-left: 3px solid #C9A962;
            margin: 20px 0;
            padding: 10px 20px;
            background: #faf8f5;
            font-style: italic;
            color: #555;
        }

        ul, ol {
            padding-left: 25px;
        }

        li {
            margin: 5px 0;
        }

        strong {
            color: #5B4A3A;
        }

        hr {
            border: none;
            border-top: 1px solid #ddd;
            margin: 30px 0;
        }

        p {
            margin: 10px 0;
        }

        em {
            color: #666;
        }

        @page {
            margin: 15mm 12mm;
        }

        ${twoColumnStyles}
        ${trackRecordTwoColumnStyles}
    </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    const pdfOptions = {
        path: pdfFile,
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', bottom: '18mm', left: '12mm', right: '12mm' }
    };

    // Add page numbers for proposal files (those with SUMMARY_END)
    if (hasSummaryEnd) {
        pdfOptions.displayHeaderFooter = true;
        pdfOptions.headerTemplate = '<div></div>';
        pdfOptions.footerTemplate = `
            <div style="width: 100%; font-size: 9px; color: #999; text-align: center; font-family: sans-serif;">
                <span class="pageNumber"></span> / <span class="totalPages"></span>
            </div>
        `;
    }

    await page.pdf(pdfOptions);
    await browser.close();
    console.log(`Generated: ${pdfFile}`);
}

(async () => {
    await generatePDF('Catalog.md', 'Catalog.pdf', false);
    await generatePDF('Catalog-ja.md', 'Catalog-ja.pdf', true);
    await generatePDF('proposal_generic_en.md', 'proposal_generic_en.pdf', false);
    await generatePDF('proposal_generic_jp.md', 'proposal_generic_jp.pdf', true);
    // Soul Carrier proposals (source in offer/, output to root)
    await generatePDF('offer/soul_carrier_proposal_en.md', 'soul_carrier_proposal_en.pdf', false);
    await generatePDF('offer/soul_carrier_proposal_jp.md', 'soul_carrier_proposal_jp.pdf', true);
    // Track record
    await generatePDF('trackrecord_en.md', 'trackrecord_en.pdf', false);
    await generatePDF('trackrecord_jp.md', 'trackrecord_jp.pdf', true);
})();
