#!/usr/bin/env python3
"""
トキコエニュースレター PDF生成スクリプト
にほしまスタイルの新聞型レイアウト（横書き・段組・ヘッダー・フッター）

使い方: python3 generate-newsletter-pdf.py 2026-spring-vol01.md -o 2026-spring-vol01.pdf
"""
import argparse
import re
import os
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.units import mm
from reportlab.lib.colors import Color, HexColor, black, white
from reportlab.pdfgen.canvas import Canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    KeepTogether, HRFlowable, BaseDocTemplate, Frame, PageTemplate,
    FrameBreak, NextPageTemplate
)
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet

# ── Fonts ──
MINCHO_PATH = '/usr/share/fonts/opentype/ipafont-mincho/ipam.ttf'
GOTHIC_PATH = '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'

if os.path.exists(MINCHO_PATH):
    pdfmetrics.registerFont(TTFont('IPAMincho', MINCHO_PATH))
if os.path.exists(GOTHIC_PATH):
    pdfmetrics.registerFont(TTFont('IPAGothic', GOTHIC_PATH))

FONT_MINCHO = 'IPAMincho' if os.path.exists(MINCHO_PATH) else 'Helvetica'
FONT_GOTHIC = 'IPAGothic' if os.path.exists(GOTHIC_PATH) else 'Helvetica-Bold'

# ── Colors ──
DARK_GREEN = HexColor('#2D4A2D')
CREAM = HexColor('#F5F0E8')
LIGHT_CREAM = HexColor('#FAF8F5')
DARK_BROWN = HexColor('#5B4A3A')
GOLD = HexColor('#C9A962')
RULE_COLOR = HexColor('#CCCCCC')

# ── Page setup: A3 landscape (front & back on one sheet) ──
PAGE_W, PAGE_H = landscape(A3)  # 420mm x 297mm
MARGIN_TOP = 10 * mm
MARGIN_BOTTOM = 8 * mm
MARGIN_LEFT = 10 * mm
MARGIN_RIGHT = 10 * mm
COL_GAP = 6 * mm


# ── Markdown parser ──
def parse_markdown(filepath):
    """Parse markdown into structured elements."""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    elements = []
    i = 0
    in_table = False
    table_rows = []
    in_blockquote = False
    blockquote_text = []
    in_data_box = False
    data_box_elements = []
    in_list = False
    list_items = []

    def flush_list():
        nonlocal in_list, list_items
        if list_items:
            elements.append(('list', list_items[:]))
            list_items.clear()
        in_list = False

    def flush_blockquote():
        nonlocal in_blockquote, blockquote_text
        if blockquote_text:
            elements.append(('blockquote', '\n'.join(blockquote_text)))
            blockquote_text.clear()
        in_blockquote = False

    def flush_table():
        nonlocal in_table, table_rows
        if table_rows:
            elements.append(('table', table_rows[:]))
            table_rows.clear()
        in_table = False

    while i < len(lines):
        line = lines[i].rstrip('\n')

        # Data box markers
        if '<!-- DATA_BOX_START -->' in line:
            flush_list()
            flush_blockquote()
            flush_table()
            in_data_box = True
            data_box_elements = []
            i += 1
            continue
        if '<!-- DATA_BOX_END -->' in line:
            in_data_box = False
            elements.append(('data_box', data_box_elements[:]))
            data_box_elements = []
            i += 1
            continue

        target = data_box_elements if in_data_box else elements

        # Skip HTML comments
        if line.strip().startswith('<!--'):
            i += 1
            continue

        # Horizontal rule
        if line.strip() == '---':
            flush_list()
            flush_blockquote()
            flush_table()
            target.append(('hr',))
            i += 1
            continue

        # Headings
        m = re.match(r'^(#{1,4})\s+(.+)', line)
        if m:
            flush_list()
            flush_blockquote()
            flush_table()
            level = len(m.group(1))
            target.append(('heading', level, m.group(2)))
            i += 1
            continue

        # Blockquote
        if line.startswith('>'):
            flush_list()
            flush_table()
            text = line.lstrip('>').strip()
            if text:
                blockquote_text.append(text)
            in_blockquote = True
            i += 1
            continue
        elif in_blockquote:
            flush_blockquote()

        # Table
        if '|' in line and line.strip().startswith('|'):
            flush_list()
            flush_blockquote()
            cells = [c.strip() for c in line.split('|')[1:-1]]
            # Skip separator rows
            if cells and all(re.match(r'^[-:]+$', c) for c in cells):
                i += 1
                continue
            table_rows.append(cells)
            in_table = True
            i += 1
            continue
        elif in_table:
            flush_table()

        # List items
        if re.match(r'^[-*]\s', line.strip()):
            flush_blockquote()
            flush_table()
            text = re.sub(r'^[-*]\s+', '', line.strip())
            list_items.append(text)
            in_list = True
            i += 1
            continue
        elif in_list and line.strip() == '':
            flush_list()
            i += 1
            continue
        elif in_list:
            flush_list()

        # Paragraph
        if line.strip():
            flush_blockquote()
            flush_table()
            flush_list()
            target.append(('paragraph', line.strip()))
        else:
            flush_list()
            flush_blockquote()
            flush_table()

        i += 1

    flush_list()
    flush_blockquote()
    flush_table()
    return elements


def md_to_rich(text):
    """Convert markdown inline formatting to ReportLab XML."""
    # Bold
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    # Italic
    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
    # Escape ampersands (but not existing XML entities)
    text = text.replace('&', '&amp;').replace('&amp;amp;', '&amp;')
    # Fix double-escaped
    text = re.sub(r'&amp;(#\d+|[a-zA-Z]+);', r'&\1;', text)
    return text


def build_styles():
    """Build paragraph styles for the newsletter."""
    styles = {}

    styles['title'] = ParagraphStyle(
        'Title', fontName=FONT_GOTHIC, fontSize=22, leading=28,
        textColor=white, alignment=TA_LEFT, spaceAfter=0,
    )
    styles['subtitle'] = ParagraphStyle(
        'Subtitle', fontName=FONT_MINCHO, fontSize=8, leading=11,
        textColor=HexColor('#CCCCCC'), alignment=TA_LEFT,
    )
    styles['issue_info'] = ParagraphStyle(
        'IssueInfo', fontName=FONT_MINCHO, fontSize=7, leading=10,
        textColor=HexColor('#999999'), alignment=TA_LEFT,
    )
    styles['h2'] = ParagraphStyle(
        'H2', fontName=FONT_GOTHIC, fontSize=9, leading=12,
        textColor=white, alignment=TA_LEFT, spaceAfter=2,
    )
    styles['h3'] = ParagraphStyle(
        'H3', fontName=FONT_GOTHIC, fontSize=7.5, leading=10,
        textColor=DARK_BROWN, alignment=TA_LEFT,
        spaceBefore=3, spaceAfter=1.5,
        borderWidth=0, borderPadding=0,
    )
    styles['h4'] = ParagraphStyle(
        'H4', fontName=FONT_GOTHIC, fontSize=6.5, leading=9,
        textColor=DARK_BROWN, alignment=TA_LEFT,
        spaceBefore=2, spaceAfter=1,
    )
    styles['body'] = ParagraphStyle(
        'Body', fontName=FONT_MINCHO, fontSize=6, leading=8.5,
        textColor=black, alignment=TA_JUSTIFY,
        spaceBefore=0.5, spaceAfter=1,
    )
    styles['body_small'] = ParagraphStyle(
        'BodySmall', fontName=FONT_MINCHO, fontSize=5.5, leading=7.5,
        textColor=black, alignment=TA_JUSTIFY,
        spaceBefore=0.5, spaceAfter=0.5,
    )
    styles['blockquote'] = ParagraphStyle(
        'Blockquote', fontName=FONT_MINCHO, fontSize=5.5, leading=7.5,
        textColor=HexColor('#666666'), alignment=TA_LEFT,
        leftIndent=4, spaceBefore=1, spaceAfter=1,
    )
    styles['list_item'] = ParagraphStyle(
        'ListItem', fontName=FONT_MINCHO, fontSize=5.5, leading=7.5,
        textColor=black, alignment=TA_LEFT,
        leftIndent=6, bulletIndent=0,
        spaceBefore=0.3, spaceAfter=0.3,
    )
    styles['data_heading'] = ParagraphStyle(
        'DataHeading', fontName=FONT_GOTHIC, fontSize=6, leading=8,
        textColor=DARK_BROWN, alignment=TA_LEFT,
        spaceBefore=1, spaceAfter=1,
    )
    styles['footer'] = ParagraphStyle(
        'Footer', fontName=FONT_MINCHO, fontSize=5.5, leading=8,
        textColor=HexColor('#666666'), alignment=TA_LEFT,
    )
    styles['colophon'] = ParagraphStyle(
        'Colophon', fontName=FONT_MINCHO, fontSize=6, leading=8.5,
        textColor=HexColor('#444444'), alignment=TA_LEFT,
        spaceBefore=1, spaceAfter=1,
    )
    return styles


def build_flowables(elements, styles, col_width):
    """Convert parsed elements into ReportLab flowables."""
    flowables = []
    skip_title_block = True  # Skip the initial title/header block (rendered separately)

    for elem in elements:
        if elem[0] == 'heading':
            level = elem[1]
            text = md_to_rich(elem[2])

            if level == 1:
                # Main title - skip (rendered in header)
                skip_title_block = True
                continue
            elif level == 2:
                # Section header with dark background bar
                section_title = text
                # Create a dark bar with white text
                tbl = Table(
                    [[Paragraph(section_title, styles['h2'])]],
                    colWidths=[col_width],
                    rowHeights=[14]
                )
                tbl.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), DARK_GREEN),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                    ('TOPPADDING', (0, 0), (-1, -1), 2),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
                ]))
                flowables.append(Spacer(1, 2))
                flowables.append(tbl)
                flowables.append(Spacer(1, 1.5))
            elif level == 3:
                flowables.append(Paragraph(text, styles['h3']))
            elif level == 4:
                flowables.append(Paragraph(text, styles['h4']))

        elif elem[0] == 'paragraph':
            text = md_to_rich(elem[1])
            if skip_title_block and ('**発行**' in elem[1] or '**発行日**' in elem[1] or '**発行人**' in elem[1]):
                continue  # Skip header info paragraphs
            skip_title_block = False
            flowables.append(Paragraph(text, styles['body']))

        elif elem[0] == 'blockquote':
            text = md_to_rich(elem[1])
            # Indented with left border effect
            tbl = Table(
                [[Paragraph(text, styles['blockquote'])]],
                colWidths=[col_width - 4],
            )
            tbl.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), LIGHT_CREAM),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LINEBEFORESTYLE', (0, 0), (0, -1), 2, GOLD),
                ('LINEBEFORE', (0, 0), (0, -1), 2, GOLD),
            ]))
            flowables.append(tbl)
            flowables.append(Spacer(1, 2))

        elif elem[0] == 'list':
            for item_text in elem[1]:
                text = md_to_rich(item_text)
                flowables.append(Paragraph(f'・{text}', styles['list_item']))

        elif elem[0] == 'table':
            rows = elem[1]
            if not rows:
                continue
            # Build table
            table_data = []
            for row in rows:
                table_data.append([
                    Paragraph(md_to_rich(cell), styles['body_small'])
                    for cell in row
                ])

            num_cols = len(rows[0]) if rows else 1
            col_w = col_width / num_cols

            tbl = Table(table_data, colWidths=[col_w] * num_cols)
            style_cmds = [
                ('FONTNAME', (0, 0), (-1, -1), FONT_MINCHO),
                ('FONTSIZE', (0, 0), (-1, -1), 5),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 2),
                ('RIGHTPADDING', (0, 0), (-1, -1), 2),
                ('TOPPADDING', (0, 0), (-1, -1), 1.5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5),
                ('GRID', (0, 0), (-1, -1), 0.4, RULE_COLOR),
            ]
            # First row as header
            if len(table_data) > 1:
                style_cmds.append(('BACKGROUND', (0, 0), (-1, 0), CREAM))
                style_cmds.append(('FONTNAME', (0, 0), (-1, 0), FONT_GOTHIC))
            tbl.setStyle(TableStyle(style_cmds))
            flowables.append(Spacer(1, 2))
            flowables.append(tbl)
            flowables.append(Spacer(1, 2))

        elif elem[0] == 'data_box':
            # Data box with cream background
            box_flowables = []
            for sub in elem[1]:
                if sub[0] == 'heading':
                    box_flowables.append(
                        Paragraph(md_to_rich(sub[2]), styles['data_heading'])
                    )
                elif sub[0] == 'paragraph':
                    box_flowables.append(
                        Paragraph(md_to_rich(sub[1]), styles['body_small'])
                    )
                elif sub[0] == 'table':
                    rows = sub[1]
                    table_data = []
                    for row in rows:
                        table_data.append([
                            Paragraph(md_to_rich(cell), styles['body_small'])
                            for cell in row
                        ])
                    num_cols = len(rows[0]) if rows else 1
                    inner_w = (col_width - 16) / num_cols
                    tbl = Table(table_data, colWidths=[inner_w] * num_cols)
                    tbl.setStyle(TableStyle([
                        ('FONTNAME', (0, 0), (-1, -1), FONT_MINCHO),
                        ('FONTSIZE', (0, 0), (-1, -1), 6),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('LEFTPADDING', (0, 0), (-1, -1), 2),
                        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
                        ('TOPPADDING', (0, 0), (-1, -1), 1.5),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5),
                        ('GRID', (0, 0), (-1, -1), 0.4, RULE_COLOR),
                        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#EDE8DC')),
                        ('FONTNAME', (0, 0), (-1, 0), FONT_GOTHIC),
                    ]))
                    box_flowables.append(tbl)
                elif sub[0] == 'list':
                    for item_text in sub[1]:
                        text = md_to_rich(item_text)
                        box_flowables.append(
                            Paragraph(f'・{text}', styles['list_item'])
                        )

            # Wrap in a cream box
            if box_flowables:
                inner_table = Table(
                    [[bf] for bf in box_flowables],
                    colWidths=[col_width - 12],
                )
                inner_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), CREAM),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                    ('BOX', (0, 0), (-1, -1), 0.5, DARK_BROWN),
                ]))
                flowables.append(Spacer(1, 1.5))
                flowables.append(KeepTogether([inner_table]))
                flowables.append(Spacer(1, 1.5))

        elif elem[0] == 'hr':
            flowables.append(HRFlowable(
                width='100%', thickness=0.5, color=RULE_COLOR,
                spaceBefore=1, spaceAfter=1,
            ))

    return flowables


class NewsletterTemplate(BaseDocTemplate):
    """Custom document template with header bar and footer."""

    def __init__(self, filename, title_text, subtitle_text, issue_info, **kwargs):
        self.title_text = title_text
        self.subtitle_text = subtitle_text
        self.issue_info = issue_info
        super().__init__(filename, **kwargs)

    def afterPage(self):
        """Draw header and footer on each page."""
        c = self.canv
        page_num = c.getPageNumber()

        # ── Header bar ──
        header_h = 18 * mm
        c.setFillColor(DARK_GREEN)
        c.rect(0, PAGE_H - header_h, PAGE_W, header_h, fill=1, stroke=0)

        # Title
        c.setFillColor(white)
        c.setFont(FONT_GOTHIC, 16)
        c.drawString(MARGIN_LEFT + 4, PAGE_H - 11 * mm, self.title_text)

        # Subtitle
        c.setFont(FONT_MINCHO, 6)
        c.setFillColor(HexColor('#CCCCCC'))
        c.drawString(MARGIN_LEFT + 4, PAGE_H - 15.5 * mm, self.subtitle_text)

        # Issue info (right side)
        c.setFont(FONT_MINCHO, 6)
        c.setFillColor(HexColor('#CCCCCC'))
        info_w = c.stringWidth(self.issue_info, FONT_MINCHO, 6)
        c.drawString(PAGE_W - MARGIN_RIGHT - info_w - 4, PAGE_H - 11 * mm, self.issue_info)

        # Thin gold line under header
        c.setStrokeColor(GOLD)
        c.setLineWidth(1.5)
        c.line(0, PAGE_H - header_h, PAGE_W, PAGE_H - header_h)

        # ── Footer ──
        footer_y = 8 * mm
        c.setStrokeColor(RULE_COLOR)
        c.setLineWidth(0.5)
        c.line(MARGIN_LEFT, footer_y + 3, PAGE_W - MARGIN_RIGHT, footer_y + 3)

        c.setFillColor(HexColor('#999999'))
        c.setFont(FONT_MINCHO, 5)
        c.drawString(MARGIN_LEFT, footer_y - 3,
                     '© 2026 Pearl Memorial / Universal Need株式会社　無断複製、転載を禁ず。')

        c.drawRightString(PAGE_W - MARGIN_RIGHT, footer_y - 3,
                          f'トキコエニュースレター Vol.1 2026年春号 ─ {page_num}')


def generate_pdf(md_path, output_path):
    """Generate the newspaper-style newsletter PDF."""
    elements_raw = parse_markdown(md_path)
    styles = build_styles()

    # ── Layout: 3 columns on A3 landscape ──
    header_h = 18 * mm
    footer_h = 10 * mm
    usable_w = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT
    usable_h = PAGE_H - header_h - MARGIN_TOP - footer_h

    num_cols = 3
    col_w = (usable_w - COL_GAP * (num_cols - 1)) / num_cols
    frame_y = footer_h

    frames = []
    for i in range(num_cols):
        x = MARGIN_LEFT + i * (col_w + COL_GAP)
        frames.append(Frame(
            x, frame_y, col_w, usable_h,
            leftPadding=2, rightPadding=2,
            topPadding=4, bottomPadding=4,
            id=f'col{i}',
        ))

    doc = NewsletterTemplate(
        output_path,
        title_text='トキコエニュースレター',
        subtitle_text='共鳴で、境界線を越える  Crossing boundaries through resonance',
        issue_info='Vol.1 2026年 春号 ｜ Pearl Memorial',
        pagesize=(PAGE_W, PAGE_H),
        leftMargin=MARGIN_LEFT,
        rightMargin=MARGIN_RIGHT,
        topMargin=MARGIN_TOP + header_h,
        bottomMargin=footer_h,
    )

    template = PageTemplate(
        id='main',
        frames=frames,
        pagesize=(PAGE_W, PAGE_H),
    )
    doc.addPageTemplates([template])

    # Build flowables
    flowables = build_flowables(elements_raw, styles, col_w - 4)

    # Build
    doc.build(flowables)
    print(f'生成完了: {output_path}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='トキコエニュースレター PDF生成')
    parser.add_argument('input', help='入力Markdownファイル')
    parser.add_argument('-o', '--output', default=None, help='出力PDFファイル')
    args = parser.parse_args()

    output = args.output or args.input.replace('.md', '.pdf')
    generate_pdf(args.input, output)
