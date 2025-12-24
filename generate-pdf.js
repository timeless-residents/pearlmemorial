const { chromium } = require('playwright');
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

async function generatePDF(mdFile, pdfFile, isJapanese = false) {
    const markdown = fs.readFileSync(mdFile, 'utf-8');
    const htmlContent = marked.parse(markdown);

    const fontFamily = isJapanese
        ? "'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', sans-serif"
        : "'Georgia', 'Times New Roman', serif";

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
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
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
            margin: 20mm 15mm;
        }
    </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.pdf({
        path: pdfFile,
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    });
    await browser.close();
    console.log(`Generated: ${pdfFile}`);
}

(async () => {
    await generatePDF('Catalog.md', 'Catalog.pdf', false);
    await generatePDF('Catalog-ja.md', 'Catalog-ja.pdf', true);
})();
