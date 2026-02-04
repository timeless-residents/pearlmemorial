#!/usr/bin/env python3
"""
トキコエニュースレター 縦書きPDF生成スクリプト

Markdown → 縦書きPDF（ReportLab）

使い方:
  python3 news/generate-tategaki-pdf.py news/2026-spring-vol01.md
  python3 news/generate-tategaki-pdf.py news/2026-spring-vol01.md -o output.pdf

必要:
  pip install reportlab
"""

import argparse
import re
import sys
import unicodedata
from pathlib import Path

from reportlab.lib.pagesizes import A5, landscape
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

# --- フォント登録 ---
MINCHO_PATH = "/usr/share/fonts/opentype/ipafont-mincho/ipam.ttf"
GOTHIC_PATH = "/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf"
pdfmetrics.registerFont(TTFont("IPAMincho", MINCHO_PATH))
pdfmetrics.registerFont(TTFont("IPAGothic", GOTHIC_PATH))

# --- 色定義 ---
COLOR_TITLE = HexColor("#5B4A3A")
COLOR_ACCENT = HexColor("#C9A962")
COLOR_BODY = HexColor("#1a1a1a")
COLOR_LIGHT = HexColor("#888888")
COLOR_QUOTE = HexColor("#555555")

# --- ページ設定（A5横置き） ---
PAGE_W, PAGE_H = landscape(A5)
MARGIN_TOP = 15 * mm
MARGIN_BOTTOM = 15 * mm
MARGIN_LEFT = 14 * mm
MARGIN_RIGHT = 14 * mm

AREA_TOP = PAGE_H - MARGIN_TOP
AREA_BOTTOM = MARGIN_BOTTOM
AREA_RIGHT = PAGE_W - MARGIN_RIGHT
AREA_LEFT = MARGIN_LEFT
AREA_HEIGHT = AREA_TOP - AREA_BOTTOM

# --- 本文設定 ---
BODY_FONT_SIZE = 9
BODY_LINE_SPACING = BODY_FONT_SIZE * 1.8

H1_FONT_SIZE = 18
H2_FONT_SIZE = 13
H3_FONT_SIZE = 10.5
H4_FONT_SIZE = 9.5

# 半角英数（ROTATE_CHARS から除外して、ワード単位で処理する）
ASCII_CHARS = set(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    "0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?~`\\"
)

# 縦書きで90度回転すべき約物（通常の全角括弧類＋長音）
# ー（長音記号）も横棒なので回転が必要
ROTATE_PUNCTUATION = set("「」（）『』【】〈〉《》〔〕｛｝ー〜")

# 句読点（位置調整が必要）
KUTEN = set("。、，．")

# ダッシュ類（縦棒の線として描画）
VERTICAL_LINES = {"─": True, "—": True, "──": True}

# 半角→全角数字変換テーブル
HALF_TO_FULL_DIGIT = str.maketrans("0123456789", "０１２３４５６７８９")


def is_fullwidth(ch):
    eaw = unicodedata.east_asian_width(ch)
    return eaw in ("F", "W")


def is_cjk(ch):
    """CJK文字（漢字・かな・カタカナ）かどうか"""
    cp = ord(ch)
    return (
        (0x3000 <= cp <= 0x9FFF) or   # CJK基本
        (0xF900 <= cp <= 0xFAFF) or   # CJK互換
        (0x20000 <= cp <= 0x2FA1F)    # CJK拡張
    )


# =====================================================
# Markdown パーサー
# =====================================================

class Element:
    pass

class Heading(Element):
    def __init__(self, level, text):
        self.level = level
        self.text = strip_inline(text)

class Paragraph(Element):
    def __init__(self, text, indent=True):
        self.text = strip_inline(text)
        self.indent = indent

class HRule(Element):
    pass

class Blockquote(Element):
    def __init__(self, text):
        self.text = strip_inline(text)

class ListItem(Element):
    def __init__(self, text, marker="・"):
        self.text = strip_inline(text)
        self.marker = marker

class TableRow(Element):
    def __init__(self, cells):
        self.cells = [strip_inline(c) for c in cells]


def strip_inline(text):
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    return text.strip()


def parse_markdown(md_text):
    lines = md_text.split("\n")
    elements = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.strip() == "":
            i += 1
            continue
        if re.match(r"^---+\s*$", line.strip()):
            elements.append(HRule())
            i += 1
            continue
        h_match = re.match(r"^(#{1,4})\s+(.+)$", line)
        if h_match:
            elements.append(Heading(len(h_match.group(1)), h_match.group(2)))
            i += 1
            continue
        if line.strip().startswith(">"):
            text = line.strip().lstrip("> ").strip()
            elements.append(Blockquote(text))
            i += 1
            continue
        if "|" in line and line.strip().startswith("|"):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if all(re.match(r"^[-:]+$", c) for c in cells):
                i += 1
                continue
            elements.append(TableRow(cells))
            i += 1
            continue
        ul_match = re.match(r"^[-*]\s+(.+)$", line.strip())
        if ul_match:
            elements.append(ListItem(ul_match.group(1)))
            i += 1
            continue
        ol_match = re.match(r"^(\d+)\.\s+(.+)$", line.strip())
        if ol_match:
            elements.append(ListItem(ol_match.group(2), marker=ol_match.group(1)))
            i += 1
            continue
        elements.append(Paragraph(line))
        i += 1
    return elements


# =====================================================
# テキストトークナイザー（縦書き用）
# =====================================================

def tokenize_for_tategaki(text):
    """テキストをトークンに分割する。

    トークンの種類:
    - ('cjk', char)         : CJK文字1文字
    - ('punct_rotate', char): 回転すべき約物
    - ('kuten', char)       : 句読点（位置調整）
    - ('vline', char)       : 縦棒に変換
    - ('ascii_word', str)   : 英単語/数値（まとめて処理）
    - ('space',)            : スペース
    - ('other', char)       : その他
    """
    tokens = []
    i = 0
    while i < len(text):
        ch = text[i]

        # スペース
        if ch == " " or ch == "　":
            tokens.append(("space",))
            i += 1
            continue

        # ダッシュ類 → 縦線として描画
        if ch in VERTICAL_LINES:
            tokens.append(("vline", ch))
            i += 1
            continue

        # 回転約物
        if ch in ROTATE_PUNCTUATION:
            tokens.append(("punct_rotate", ch))
            i += 1
            continue

        # 句読点
        if ch in KUTEN:
            tokens.append(("kuten", ch))
            i += 1
            continue

        # 半角ASCII（英単語・数値をまとめる）
        if ch in ASCII_CHARS:
            run = []
            j = i
            while j < len(text) and (text[j] in ASCII_CHARS or text[j] == " "):
                run.append(text[j])
                j += 1
                # スペースの後に非ASCIIが来たら、末尾スペースは含めない
                if run[-1] == " " and (j >= len(text) or text[j] not in ASCII_CHARS):
                    run.pop()
                    j -= 1
                    break
            word = "".join(run).strip()
            if word:
                tokens.append(("ascii_word", word))
            i = j
            continue

        # CJKおよびその他の全角文字
        tokens.append(("cjk", ch))
        i += 1

    return tokens


# =====================================================
# 縦書き描画エンジン
# =====================================================

class TategakiRenderer:
    def __init__(self, output_path):
        self.output_path = output_path
        self.c = canvas.Canvas(str(output_path), pagesize=landscape(A5))
        self.page_num = 0
        self.col_x = AREA_RIGHT
        self.char_y = AREA_TOP
        self.current_font = "IPAMincho"
        self.current_size = BODY_FONT_SIZE
        self.current_color = COLOR_BODY
        self.line_spacing = BODY_LINE_SPACING
        self._start_page()

    def _start_page(self):
        self.page_num += 1
        self.col_x = AREA_RIGHT
        self.char_y = AREA_TOP
        if self.page_num > 1:
            self.c.setFont("IPAGothic", 6)
            self.c.setFillColor(COLOR_LIGHT)
            self.c.drawString(MARGIN_LEFT, PAGE_H - 10 * mm, "トキコエニュースレター")
            self.c.drawCentredString(PAGE_W / 2, 8 * mm, str(self.page_num))
        self.c.setFillColor(self.current_color)

    def _new_page(self):
        self.c.showPage()
        self._start_page()

    def _new_column(self):
        self.col_x -= self.line_spacing
        self.char_y = AREA_TOP
        if self.col_x < AREA_LEFT:
            self._new_page()

    def _cell_height(self, size=None):
        s = size or self.current_size
        return s * 1.4

    def _ensure_cell(self, size=None):
        """1文字分のスペースを確保"""
        h = self._cell_height(size)
        if self.char_y - h < AREA_BOTTOM:
            self._new_column()

    # --- 文字描画プリミティブ ---

    def _draw_cjk_char(self, ch, font=None, size=None, color=None):
        """CJK文字を1文字縦書きで描画"""
        f = font or self.current_font
        s = size or self.current_size
        col = color or self.current_color
        h = self._cell_height(s)
        self._ensure_cell(s)

        self.c.setFont(f, s)
        self.c.setFillColor(col)

        x = self.col_x - s * 0.5
        y = self.char_y - s
        self.c.drawString(x, y, ch)
        self.char_y -= h

    def _draw_rotated_punct(self, ch, font=None, size=None, color=None):
        """括弧・長音などを90度回転して描画

        日本語の縦書きでは、括弧類と長音記号は時計回りに90度回転する。
        ReportLabのrotate()は反時計回りが正なので、+90で時計回り相当。
        """
        f = font or self.current_font
        s = size or self.current_size
        col = color or self.current_color
        h = self._cell_height(s)
        self._ensure_cell(s)

        self.c.saveState()
        self.c.setFont(f, s)
        self.c.setFillColor(col)

        cx = self.col_x - s * 0.15
        cy = self.char_y - h * 0.5

        self.c.translate(cx, cy)
        self.c.rotate(90)
        self.c.drawCentredString(0, -s * 0.35, ch)
        self.c.restoreState()
        self.char_y -= h

    def _draw_kuten(self, ch, font=None, size=None, color=None):
        """句読点を右上に寄せて描画"""
        f = font or self.current_font
        s = size or self.current_size
        col = color or self.current_color
        h = self._cell_height(s)
        self._ensure_cell(s)

        self.c.setFont(f, s)
        self.c.setFillColor(col)

        # 句読点は前の文字のセルの右上に寄せる
        x = self.col_x + s * 0.05
        y = self.char_y - s * 0.4
        self.c.drawString(x, y, ch)
        # 句読点は次の文字との間隔を小さくする
        self.char_y -= h * 0.3

    def _draw_vline(self, ch, font=None, size=None, color=None):
        """ダッシュ（——等）を縦棒として描画"""
        f = font or self.current_font
        s = size or self.current_size
        col = color or self.current_color
        h = self._cell_height(s)
        self._ensure_cell(s)

        # 縦線をストロークで描画
        self.c.setStrokeColor(col)
        self.c.setLineWidth(s * 0.08)
        x = self.col_x - s * 0.15
        y_top = self.char_y - s * 0.1
        y_bot = self.char_y - h + s * 0.1
        self.c.line(x, y_top, x, y_bot)
        self.char_y -= h

    def _draw_ascii_word(self, word, font=None, size=None, color=None):
        """半角英数ワードを適切に描画する

        - 1〜2文字の数字: 縦中横（横書きで1セルに収める）
        - 3〜4桁の数字: 全角数字に変換して1文字ずつ
        - 英単語: 90度回転して横書きのまま表示
        """
        f = font or self.current_font
        s = size or self.current_size
        col = color or self.current_color

        # 数字のみの場合
        digits_only = word.replace(".", "").replace(",", "").isdigit()

        if digits_only and len(word) <= 2:
            # 1〜2桁: 縦中横
            self._draw_tatenakayoko(word, f, s, col)
        elif digits_only and len(word) <= 4:
            # 3〜4桁: 全角数字にして1文字ずつ縦
            fw = word.translate(HALF_TO_FULL_DIGIT)
            for ch in fw:
                self._draw_cjk_char(ch, f, s, col)
        elif len(word) <= 2 and word.isalpha():
            # 短いアルファベット (OK, QR, etc.) → 縦中横
            self._draw_tatenakayoko(word, f, s, col)
        else:
            # 長い英単語/文: 90度回転してまとめて描画
            self._draw_rotated_word(word, f, s, col)

    def _draw_tatenakayoko(self, text, font, size, color):
        """縦中横: 横書きテキストを1文字分のセルに収める"""
        h = self._cell_height(size)
        self._ensure_cell(size)

        self.c.setFont(font, size)
        self.c.setFillColor(color)

        cx = self.col_x - size * 0.15
        cy = self.char_y - h * 0.55
        self.c.drawCentredString(cx, cy, text)
        self.char_y -= h

    def _draw_rotated_word(self, word, font, size, color):
        """英単語を90度回転して描画（列方向に収める）"""
        # 単語の幅を計算
        self.c.setFont(font, size * 0.8)
        word_width = pdfmetrics.stringWidth(word, font, size * 0.8)
        needed_height = word_width + size * 0.5

        # 残りの列スペースに収まらない場合は次の列へ
        if self.char_y - needed_height < AREA_BOTTOM:
            self._new_column()

        self.c.saveState()
        self.c.setFont(font, size * 0.8)
        self.c.setFillColor(color)

        cx = self.col_x - size * 0.1
        cy = self.char_y - needed_height * 0.5

        self.c.translate(cx, cy)
        self.c.rotate(-90)
        self.c.drawCentredString(0, -size * 0.2, word)
        self.c.restoreState()

        self.char_y -= needed_height

    # --- トークン列の描画 ---

    def _draw_tokens(self, tokens, font=None, size=None, color=None):
        """トークン列を描画"""
        for tok in tokens:
            kind = tok[0]
            if kind == "cjk":
                self._draw_cjk_char(tok[1], font, size, color)
            elif kind == "punct_rotate":
                self._draw_rotated_punct(tok[1], font, size, color)
            elif kind == "kuten":
                self._draw_kuten(tok[1], font, size, color)
            elif kind == "vline":
                self._draw_vline(tok[1], font, size, color)
            elif kind == "ascii_word":
                self._draw_ascii_word(tok[1], font, size, color)
            elif kind == "space":
                self.char_y -= (size or self.current_size) * 0.5
            elif kind == "other":
                self._draw_cjk_char(tok[1], font, size, color)

    def _draw_text(self, text, font=None, size=None, color=None):
        """テキスト文字列を縦書きで描画"""
        tokens = tokenize_for_tategaki(text)
        self._draw_tokens(tokens, font, size, color)

    # --- 要素描画 ---

    def draw_heading(self, element):
        if element.level == 1:
            fs = H1_FONT_SIZE
            spacing = fs * 2.2
        elif element.level == 2:
            fs = H2_FONT_SIZE
            spacing = fs * 2.0
        elif element.level == 3:
            fs = H3_FONT_SIZE
            spacing = fs * 1.8
        else:
            fs = H4_FONT_SIZE
            spacing = fs * 1.7

        if self.char_y < AREA_TOP - 10:
            self._new_column()

        old_spacing = self.line_spacing
        self.line_spacing = spacing

        if element.level <= 2:
            line_x = self.col_x + 2
            self.c.setStrokeColor(COLOR_ACCENT)
            self.c.setLineWidth(1.5 if element.level == 1 else 0.8)
            self.c.line(line_x, AREA_TOP, line_x, AREA_BOTTOM)

        self._draw_text(element.text, font="IPAGothic", size=fs, color=COLOR_TITLE)

        self._new_column()
        self.line_spacing = old_spacing

    def draw_paragraph(self, element):
        if element.indent and len(element.text) > 0:
            self.char_y -= self.current_size * 1.0
        self._draw_text(element.text)
        self.char_y -= self.current_size * 0.6

    def draw_blockquote(self, element):
        small_size = BODY_FONT_SIZE * 0.9
        self._draw_text(element.text, size=small_size, color=COLOR_QUOTE)
        self.char_y -= self.current_size * 0.5

    def draw_list_item(self, element):
        marker = element.marker
        if marker == "・":
            self._draw_cjk_char("・")
        else:
            # 番号マーカー
            for ch in marker:
                self._draw_cjk_char(ch)
            self._draw_cjk_char(".")
        self._draw_text(element.text)
        self.char_y -= self.current_size * 0.4

    def draw_hrule(self):
        self._new_column()
        line_x = self.col_x + self.line_spacing * 0.5
        self.c.setStrokeColor(COLOR_ACCENT)
        self.c.setLineWidth(0.4)
        y_mid = (AREA_TOP + AREA_BOTTOM) / 2
        self.c.line(line_x, y_mid + 30 * mm, line_x, y_mid - 30 * mm)

    def draw_table_row(self, element):
        for cell in element.cells:
            self._draw_text(cell, size=BODY_FONT_SIZE * 0.85)
        self.char_y -= self.current_size * 0.3

    def render(self, elements):
        for el in elements:
            if isinstance(el, Heading):
                self.draw_heading(el)
            elif isinstance(el, Paragraph):
                self.draw_paragraph(el)
            elif isinstance(el, HRule):
                self.draw_hrule()
            elif isinstance(el, Blockquote):
                self.draw_blockquote(el)
            elif isinstance(el, ListItem):
                self.draw_list_item(el)
            elif isinstance(el, TableRow):
                self.draw_table_row(el)

        self.c.showPage()
        self.c.save()


def main():
    parser = argparse.ArgumentParser(description="トキコエニュースレター 縦書きPDF生成")
    parser.add_argument("input", help="Markdown ファイルのパス")
    parser.add_argument("-o", "--output", help="出力PDFファイルのパス（省略時は入力と同じ名前.pdf）")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"ファイルが見つかりません: {input_path}", file=sys.stderr)
        sys.exit(1)

    output_path = Path(args.output) if args.output else input_path.with_suffix(".pdf")

    md_text = input_path.read_text(encoding="utf-8")
    elements = parse_markdown(md_text)
    renderer = TategakiRenderer(output_path)
    renderer.render(elements)
    print(f"生成完了: {output_path}")


if __name__ == "__main__":
    main()
