/**
 * Essay Navigation - Dynamic Cross-Links
 * エッセイ間のクロスリンクを動的に生成
 */
(function() {
  // エッセイ一覧（順序保持）
  const essays = [
    { id: 'psychology', ja: '心理学的考察', en: 'Psychology' },
    { id: 'philosophy', ja: '社会哲学的考察', en: 'Social Philosophy' },
    { id: 'pathology', ja: '継承の病理', en: 'Pathology of Legacy' },
    { id: 'future', ja: 'AI時代と存在証明', en: 'AI Era' },
    { id: 'religion', ja: '神話・宗教と存在証明', en: 'Religion & Mythology' },
    { id: 'organization', ja: '組織と存在証明', en: 'Organizations' },
    { id: 'government', ja: '行政と存在証明', en: 'Government' },
    { id: 'nation', ja: '国家と存在証明', en: 'Nation-States' },
    { id: 'ceremony', ja: '冠婚葬祭と存在証明', en: 'Rites of Passage' },
    { id: 'lifecycle', ja: '生老病死と存在証明', en: 'Life Cycle' },
    { id: 'industry', ja: '産業と存在証明', en: 'Industry' },
    { id: 'entertainment', ja: 'エンタメと存在証明', en: 'Entertainment' },
    { id: 'tourism', ja: '観光と存在証明', en: 'Tourism' },
    { id: 'erasure', ja: '残さないという選択', en: 'The Choice Not to Leave Behind' },
    { id: 'legacy', ja: '技術的設計思想', en: 'Technical Design' }
  ];

  // 現在のページから言語を判定
  const isEnglish = document.documentElement.lang === 'en';

  // 現在のページのIDを取得
  const currentPath = window.location.pathname;
  const currentFile = currentPath.split('/').pop().replace('.html', '').replace('-en', '');

  // リンクを生成
  const links = essays.map(essay => {
    const href = isEnglish ? `${essay.id}-en.html` : `${essay.id}.html`;
    const label = isEnglish ? essay.en : essay.ja;

    // 現在のページはリンクにしない
    if (essay.id === currentFile) {
      return `<span style="color: var(--text-muted);">${label}</span>`;
    }
    return `<a href="${href}">${label}</a>`;
  }).join(' / ');

  // DOMにリンクを挿入
  document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('essay-nav-links');
    if (container) {
      container.innerHTML = links;
    }
  });
})();
