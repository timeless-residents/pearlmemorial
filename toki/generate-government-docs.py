#!/usr/bin/env python3
"""Generate government/municipal proposal template PDFs (事業者概要書, 見積書)."""

from fpdf import FPDF
import os

OUT_DIR = os.path.dirname(os.path.abspath(__file__))
FONT_PATH = "/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf"

# Colors — toki blue accent instead of emerald
TOKI_BLUE = (37, 99, 235)       # #2563EB
DARK = (30, 41, 59)
SECONDARY = (71, 85, 105)
MUTED = (148, 163, 184)
BORDER = (226, 232, 240)
BG_LIGHT = (248, 250, 252)
WHITE = (255, 255, 255)


class GovPDF(FPDF):
    """Base PDF class with Japanese font support for government docs."""

    def __init__(self):
        super().__init__()
        self.add_font("JP", "", FONT_PATH, uni=True)
        self.add_font("JP", "B", FONT_PATH, uni=True)
        self.set_auto_page_break(auto=False)

    def footer(self):
        self.set_y(-18)
        self.set_draw_color(*BORDER)
        self.line(15, self.get_y(), 195, self.get_y())
        self.ln(2)
        self.set_font("JP", "", 6.5)
        self.set_text_color(*MUTED)
        self.cell(0, 3.5, "TokiStorage  |  行政提案書類", ln=True, align="C")
        self.cell(
            0, 3.5,
            "本書は見本です。実際の書類は内容確定後に発行いたします。",
            ln=True, align="C",
        )

    def header_block(self, title, subtitle=None):
        """Company header + document title."""
        # Top accent line
        self.set_fill_color(*TOKI_BLUE)
        self.rect(0, 0, 210, 3, "F")

        self.set_y(12)
        # Company name
        self.set_font("JP", "B", 9)
        self.set_text_color(*DARK)
        self.cell(0, 5, "TokiStorage（佐藤卓也）", ln=True, align="L")
        self.set_font("JP", "", 7)
        self.set_text_color(*SECONDARY)
        self.cell(0, 4, "TokiStorage", ln=True, align="L")

        self.ln(8)

        # Document title
        self.set_font("JP", "B", 18)
        self.set_text_color(*DARK)
        self.cell(0, 12, title, ln=True, align="C")

        if subtitle:
            self.set_font("JP", "", 8)
            self.set_text_color(*MUTED)
            self.cell(0, 6, subtitle, ln=True, align="C")

        self.ln(4)
        # Divider
        self.set_draw_color(*BORDER)
        self.line(15, self.get_y(), 195, self.get_y())
        self.ln(6)

    def label_value(self, label, value, label_w=40):
        """Label: Value row."""
        self.set_font("JP", "", 8)
        self.set_text_color(*MUTED)
        self.cell(label_w, 7, label, align="L")
        self.set_font("JP", "", 9)
        self.set_text_color(*DARK)
        self.cell(0, 7, value, ln=True, align="L")

    def label_value_multi(self, label, value, label_w=40):
        """Label + multi-line value."""
        y_start = self.get_y()
        self.set_font("JP", "", 8)
        self.set_text_color(*MUTED)
        self.cell(label_w, 6, label, align="L")

        x_val = self.get_x()
        self.set_font("JP", "", 8.5)
        self.set_text_color(*DARK)
        self.set_xy(x_val, y_start)
        self.multi_cell(140, 5.5, value)
        self.ln(1.5)

    def section_title(self, title):
        """Section heading."""
        self.ln(1.5)
        self.set_font("JP", "B", 9.5)
        self.set_text_color(*DARK)
        self.cell(0, 7, title, ln=True)
        self.ln(1)

    def body_text(self, text):
        """Normal body text."""
        self.set_font("JP", "", 8.5)
        self.set_text_color(*SECONDARY)
        self.multi_cell(0, 5, text)
        self.ln(1)

    def template_stamp(self):
        """'TEMPLATE / 見本' watermark-style label."""
        self.set_font("JP", "B", 7)
        self.set_text_color(*MUTED)
        self.set_xy(150, 12)
        self.cell(45, 5, "TEMPLATE / 見本", align="R")


# ---------------------------------------------------------------------------
# Document 1: 事業者概要書 (Business Overview)
# ---------------------------------------------------------------------------

def generate_overview():
    """事業者概要書 template."""
    pdf = GovPDF()
    pdf.add_page()
    pdf.template_stamp()
    pdf.header_block("事業者概要書", "Business Overview")

    # ── Basic information ──
    pdf.label_value("事業者名", "TokiStorage（屋号）/ 佐藤卓也")
    pdf.label_value_multi(
        "所在地",
        "千葉県浦安市明海2-11-13（2026年春 新潟県佐渡市へ移転予定）",
    )
    pdf.label_value("連絡先", "business@satotakuya.jp")
    pdf.ln(1)

    # ── Divider ──
    pdf.set_draw_color(*BORDER)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(4)

    # ── 事業内容 ──
    pdf.section_title("事業内容")
    pdf.body_text(
        "石英ガラスを用いた千年記録サービスの企画・制作・販売。"
        "QRコード刻印による情報の永続保存。"
    )

    # ── 技術概要 ──
    pdf.section_title("技術概要")
    pdf.body_text(
        "石英ガラスプレートに金属蒸着でQRコードを刻印。"
        "電源・サーバー不要、1,000年以上の耐久性。"
        "スマートフォンカメラで読取可能。"
    )

    # ── 代表者経歴 ──
    pdf.section_title("代表者経歴")
    pdf.body_text(
        "大手コンサルティングファーム経験後、"
        "半導体製造装置エンジニアリング20年超。"
        "タイムレスタウン新浦安自治会長（250世帯）。"
        "SoulCarrier「共鳴の会」主宰。"
        "70以上の思想エッセイ執筆。"
    )

    # ── 主な実績・活動 ──
    pdf.section_title("主な実績・活動")
    pdf.body_text(
        "・SoulCarrier遺骨帰還活動\n"
        "・マウイ・山中湖オフグリッド実証\n"
        "・200以上のユースケース設計"
    )

    out = os.path.join(OUT_DIR, "government-template-overview.pdf")
    pdf.output(out)
    print(f"  -> {out}")


# ---------------------------------------------------------------------------
# Document 2: 御見積書 (Estimate)
# ---------------------------------------------------------------------------

def generate_estimate():
    """御見積書 template."""
    pdf = GovPDF()
    pdf.add_page()
    pdf.template_stamp()
    pdf.header_block("御見積書", "Estimate")

    # ── Addressee ──
    pdf.set_font("JP", "B", 11)
    pdf.set_text_color(*DARK)
    pdf.cell(0, 8, "〇〇市 〇〇課 御中", ln=True)
    pdf.ln(2)

    # ── Meta ──
    pdf.label_value("見積番号", "EST-2026-XXXX")
    pdf.label_value("日付", "2026年　　月　　日")
    pdf.ln(4)

    # ── Table header ──
    col_no = 10
    col_item = 68
    col_qty = 16
    col_unit = 14
    col_price = 36
    col_amount = 36

    pdf.set_fill_color(*BG_LIGHT)
    pdf.set_draw_color(*BORDER)
    pdf.set_font("JP", "B", 7.5)
    pdf.set_text_color(*DARK)
    pdf.cell(col_no, 8, "No.", border="TB", fill=True, align="C")
    pdf.cell(col_item, 8, "  品目", border="TB", fill=True)
    pdf.cell(col_qty, 8, "数量", border="TB", fill=True, align="C")
    pdf.cell(col_unit, 8, "単位", border="TB", fill=True, align="C")
    pdf.cell(col_price, 8, "単価", border="TB", fill=True, align="R")
    pdf.cell(col_amount, 8, "金額", border="TB", fill=True, align="R")
    pdf.ln()

    # ── Table rows ──
    rows = [
        ("1", "石英ガラスプレート制作（QRコード刻印）", "10", "枚", "¥XX,XXX", "¥XXX,XXX"),
        ("2", "コンテンツ設計・キュレーション", "1", "式", "¥XX,XXX", "¥XX,XXX"),
        ("3", "設置工事・取付", "10", "箇所", "¥XX,XXX", "¥XXX,XXX"),
    ]

    pdf.set_font("JP", "", 8)
    pdf.set_text_color(*SECONDARY)
    for no, item, qty, unit, price, amount in rows:
        pdf.cell(col_no, 8, no, border="B", align="C")
        pdf.cell(col_item, 8, "  " + item, border="B")
        pdf.cell(col_qty, 8, qty, border="B", align="C")
        pdf.cell(col_unit, 8, unit, border="B", align="C")
        pdf.cell(col_price, 8, price, border="B", align="R")
        pdf.cell(col_amount, 8, amount, border="B", align="R")
        pdf.ln()

    # Empty rows for spacing / future items
    for _ in range(2):
        pdf.cell(col_no, 8, "", border="B")
        pdf.cell(col_item, 8, "", border="B")
        pdf.cell(col_qty, 8, "", border="B")
        pdf.cell(col_unit, 8, "", border="B")
        pdf.cell(col_price, 8, "", border="B")
        pdf.cell(col_amount, 8, "", border="B")
        pdf.ln()

    pdf.ln(3)

    # ── Totals ──
    totals_label_w = 120
    totals_name_w = 30
    totals_val_w = 30

    pdf.set_font("JP", "", 8.5)
    pdf.set_text_color(*SECONDARY)
    pdf.cell(totals_label_w, 7, "")
    pdf.cell(totals_name_w, 7, "小計", align="R")
    pdf.set_text_color(*DARK)
    pdf.cell(totals_val_w, 7, "¥ ------", align="R")
    pdf.ln()

    pdf.set_text_color(*SECONDARY)
    pdf.cell(totals_label_w, 7, "")
    pdf.cell(totals_name_w, 7, "消費税（10%）", align="R")
    pdf.set_text_color(*DARK)
    pdf.cell(totals_val_w, 7, "¥ ------", align="R")
    pdf.ln()

    pdf.set_draw_color(*DARK)
    pdf.line(150, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(2)

    pdf.set_font("JP", "B", 10)
    pdf.set_text_color(*DARK)
    pdf.cell(totals_label_w, 8, "")
    pdf.cell(totals_name_w, 8, "合計", align="R")
    pdf.cell(totals_val_w, 8, "¥ ------", align="R")
    pdf.ln(10)

    # ── 備考 ──
    pdf.section_title("備考")
    pdf.body_text(
        "上記は概算です。正式な見積は仕様確定後に提出いたします。"
    )

    pdf.label_value("有効期限", "発行日より30日間")
    pdf.ln(6)

    # ── Issuer ──
    pdf.set_draw_color(*BORDER)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(5)

    pdf.set_font("JP", "B", 9)
    pdf.set_text_color(*DARK)
    pdf.cell(0, 6, "TokiStorage　佐藤卓也", ln=True)
    pdf.set_font("JP", "", 8)
    pdf.set_text_color(*SECONDARY)
    pdf.cell(
        0, 5,
        "千葉県浦安市明海2-11-13（2026年春 新潟県佐渡市へ移転予定）",
        ln=True,
    )
    pdf.cell(0, 5, "business@satotakuya.jp", ln=True)

    out = os.path.join(OUT_DIR, "government-template-estimate.pdf")
    pdf.output(out)
    print(f"  -> {out}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("Generating government document templates...")
    generate_overview()
    generate_estimate()
    print("Done.")
