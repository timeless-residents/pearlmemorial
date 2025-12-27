# Future Improvements Draft
## 将来対応ドラフト

最終更新: 2025-12-27

---

## 1. 英語レポートサンプルPDF ✅ 完了
**対象ペルソナ**: 日系アメリカ人 (Persona 3)
**期待効果**: エトス +5
**ステータス**: 実装済み (`sample-report-en.pdf`)

### 概要
日系アメリカ人向けに、戸籍調査・家紋レポートの実際の成果物サンプルを提供する。

### 構成案

```
SAMPLE FAMILY REGISTRY REPORT
===================================

CLIENT: [Sample Client Name]
RESEARCH PERIOD: [Month Year]

---

SECTION 1: FAMILY TREE OVERVIEW
- Visual family tree spanning 3-5 generations
- Birth/death dates and locations
- Immigration records identified

SECTION 2: KOSEKI (FAMILY REGISTRY) FINDINGS
- Summary of registered family members
- Original hometown (hon-seki) identification
- Key dates and relationships

SECTION 3: KAMON (FAMILY CREST) IDENTIFICATION
- Crest image and name
- Historical significance
- Regional/clan associations
- Recommendations for memorial engraving

SECTION 4: CEMETERY/TEMPLE RESEARCH
- Location(s) identified
- Contact information
- Recommended visit itinerary

SECTION 5: NEXT STEPS
- Accompaniment options
- Memorial product recommendations
- Timeline for pilgrimage visit

---

"Your roots are waiting. We help you find the way home."
```

### 実装ステップ
1. 実際のレポート（個人情報マスク済み）から構造を抽出
2. サンプルデータで英語レポートPDFを作成
3. ランディングページにリンク追加: `sample-report-en.pdf`
4. Soul Carrierセクションに「See a sample report」リンク追加

---

## 2. Press Kit ページ ✅ 完了
**対象ペルソナ**: メディア/ジャーナリスト (Persona 6)
**期待効果**: エトス +7
**ステータス**: 実装済み (`press-kit.html`, `press-kit-ja.html`)

### 概要
メディア向けに、取材・記事作成に必要な情報をまとめたプレスキットページを作成する。

### 構成案

```html
<!-- press-kit.html または press-kit-ja.html -->

<section class="press-kit-section">
    <h1>Press Kit / プレスキット</h1>

    <!-- 1. Executive Summary -->
    <div class="press-summary">
        <h2>About Pearl Memorial</h2>
        <p>Pearl Memorial is a family-run service connecting Japanese-Americans
        with their ancestral roots through family registry research, family crest
        identification, and accompanied visits to Japan.</p>

        <h2>Pearl Memorialについて</h2>
        <p>Pearl Memorialは、日系アメリカ人と日本のルーツを繋ぐ家族運営のサービスです。
        戸籍調査、家紋特定、日本への同行訪問を提供しています。</p>
    </div>

    <!-- 2. Key Facts -->
    <div class="press-facts">
        <h2>Key Facts / 主要データ</h2>
        <ul>
            <li>Founded: 2025, Maui, Hawaii</li>
            <li>Founders: Takuya & Mina Sato (Japanese nationals)</li>
            <li>Services: Family registry research, Kamon identification, Accompanied visits</li>
            <li>Locations: Maui, Hawaii ⇄ Urayasu & Kurihara, Japan</li>
            <li>Church Support: Lodging support from historic Hana church (Dec 24, 2025)</li>
        </ul>
    </div>

    <!-- 3. Story Angle -->
    <div class="press-story">
        <h2>Story Angles / 取材切り口</h2>

        <h3>1. Post-Fire Maui Community</h3>
        <p>Japanese family providing free off-grid infrastructure support to
        Lahaina fire survivors, including solar+Starlink setups.</p>

        <h3>2. Japanese-American Roots Journey</h3>
        <p>Helping third and fourth-generation Japanese-Americans reconnect
        with their ancestral homeland through koseki research.</p>

        <h3>3. Boundarist Movement</h3>
        <p>A philosophy of crossing system boundaries through human connection -
        born from the family's own experience of being "unhoused" and finding
        helpers within bureaucratic systems.</p>
    </div>

    <!-- 4. Media Assets -->
    <div class="press-assets">
        <h2>Media Assets / メディア素材</h2>
        <ul>
            <li><a href="logos/">Logo pack (PNG, SVG)</a></li>
            <li><a href="photos/">High-res photos</a></li>
            <li><a href="the-book-of-resonance-en.pdf">Book of Resonance (Full story)</a></li>
            <li><a href="Partner.pdf">Partner Information Sheet</a></li>
        </ul>
    </div>

    <!-- 5. Contact -->
    <div class="press-contact">
        <h2>Media Contact / 取材お問い合わせ</h2>
        <p>Email: press@pearl.memorial</p>
        <p>Calendly: <a href="https://calendly.com/pearlmemorial/pearlmemorialsession">Book a call</a></p>
    </div>

    <!-- 6. Fact Verification -->
    <div class="press-verification">
        <h2>Fact Verification / 事実確認</h2>
        <p>All claims in the Book of Resonance are verifiable.
        Church agreement, expense records, and activity documentation
        available upon request for journalistic verification.</p>
    </div>
</section>
```

### 実装ステップ
1. `press-kit.html` および `press-kit-ja.html` を作成
2. ロゴパック（PNG/SVG）を`logos/`フォルダに用意
3. 高解像度写真を`photos/`フォルダに用意
4. フッターに「Press Kit」リンクを追加
5. ナビゲーションに「For Media」リンクを追加

---

## 3. その他の将来検討事項

### 3.1 ビデオ証言
- 既存クライアントからのビデオ証言
- ペルソナ2, 3のパトス強化に効果的
- 期待効果: パトス +10

### 3.2 FAQ セクション
- よくある質問をまとめたセクション
- ペルソナ1（ビジネスパーソン）のロゴス強化
- 期待効果: ロゴス +5

### 3.3 プロセス詳細ページ
- 各ステップの詳細説明ページ
- 写真・図解を含む
- 期待効果: ロゴス +5, エトス +3

### 3.4 コミュニティパートナーシップ紹介
- マウイのパートナー団体一覧
- 歴史的教会との関係詳細
- 期待効果: エトス +5

---

## 優先度

| 項目 | ペルソナ効果 | 実装工数 | 優先度 |
|------|------------|---------|--------|
| 英語レポートサンプル | Persona 3 エトス+5 | 中 | 高 |
| Press Kitページ | Persona 6 エトス+7 | 中 | 高 |
| ビデオ証言 | Persona 2,3 パトス+10 | 高 | 中 |
| FAQセクション | Persona 1 ロゴス+5 | 低 | 中 |
| プロセス詳細 | 全体 ロゴス+5 | 中 | 低 |
| パートナー紹介 | 全体 エトス+5 | 低 | 低 |

---

*このドラフトは2025年12月27日時点の計画です。*
*実装時に詳細を調整してください。*
