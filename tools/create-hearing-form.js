/**
 * Soul Carrier 詳細ヒアリングフォーム自動作成スクリプト
 *
 * 使い方:
 * 1. Google Drive で新しい Google Apps Script プロジェクトを作成
 * 2. このコードを貼り付け
 * 3. createHearingForm() を実行
 * 4. 作成されたフォームのURLがログに出力される
 *
 * 修正方法:
 * - QUESTIONS 配列を編集してフォームを更新
 * - updateForm() を実行して既存フォームを更新
 */

// ============================================
// CONFIG
// ============================================

const FORM_CONFIG = {
  title: 'Soul Carrier 詳細ヒアリングフォーム / Detailed Hearing Form',
  description: `【日本語】
初回相談ありがとうございました。
調査を開始するにあたり、詳細な情報をお聞かせください。
分かる範囲で構いません。後から追加・修正も可能です。

【English】
Thank you for your initial consultation.
Please provide detailed information to help us begin the research.
Fill in what you know - you can add or update information later.`,

  confirmationMessage: `【日本語】
ご回答ありがとうございました。
内容を確認し、3営業日以内にご連絡いたします。

【English】
Thank you for your response.
We will contact you within 3 business days.`
};

// ============================================
// QUESTIONS DEFINITION
// ============================================

const SECTIONS = [
  {
    title: 'Section 1: 依頼者情報 / Your Information',
    description: 'あなたについて教えてください / Tell us about yourself'
  },
  {
    title: 'Section 2: 故人の基本情報 / Deceased\'s Basic Information',
    description: '故人について分かる範囲で / What you know about the deceased'
  },
  {
    title: 'Section 3: ご遺灰について / About the Ashes',
    description: '現在のご遺灰の状況 / Current situation of the ashes'
  },
  {
    title: 'Section 4: 日本側の情報 / Information about Japan',
    description: '日本のお墓や親戚について / About grave and relatives in Japan'
  },
  {
    title: 'Section 5: 資料・写真 / Documents and Photos',
    description: 'お持ちの資料について / About documents you have'
  },
  {
    title: 'Section 6: ご希望・ご要望 / Your Preferences',
    description: 'ご希望をお聞かせください / Tell us your preferences'
  },
  {
    title: 'Section 7: 協力・サポート / Cooperation and Support',
    description: '活動へのご協力について / About supporting our activities'
  }
];

const QUESTIONS = [
  // ============================================
  // Section 1: 依頼者情報
  // ============================================
  {
    section: 0,
    type: 'TEXT',
    title: 'お名前 / Your Name',
    required: true
  },
  {
    section: 0,
    type: 'TEXT',
    title: 'メールアドレス / Email Address',
    required: true,
    validation: 'EMAIL'
  },
  {
    section: 0,
    type: 'TEXT',
    title: '電話番号 / Phone Number',
    helpText: '国際電話の場合は国番号から / Include country code'
  },
  {
    section: 0,
    type: 'LIST',
    title: '故人との関係 / Relationship to the Deceased',
    required: true,
    choices: [
      '子 / Child',
      '孫 / Grandchild',
      '甥・姪 / Niece/Nephew',
      '配偶者 / Spouse',
      '兄弟姉妹 / Sibling',
      'その他 / Other'
    ]
  },
  {
    section: 0,
    type: 'TEXT',
    title: '「その他」の場合、具体的に / If "Other", please specify'
  },
  {
    section: 0,
    type: 'MULTIPLE_CHOICE',
    title: '日本語レベル / Japanese Language Level',
    choices: [
      'ネイティブ・流暢 / Native/Fluent',
      '日常会話可能 / Conversational',
      '挨拶程度 / Basic greetings only',
      'なし / None'
    ]
  },
  {
    section: 0,
    type: 'CHECKBOX',
    title: '希望する連絡手段 / Preferred Contact Method',
    choices: [
      'メール / Email',
      '電話 / Phone',
      'LINE',
      'Zoom/ビデオ通話 / Video call',
      'WhatsApp'
    ]
  },
  {
    section: 0,
    type: 'CHECKBOX',
    title: '連絡可能な時間帯（ハワイ時間）/ Available Hours (Hawaii Time)',
    choices: [
      '朝 6:00-9:00 / Morning',
      '午前 9:00-12:00 / Late Morning',
      '午後 12:00-17:00 / Afternoon',
      '夕方以降 17:00+ / Evening'
    ]
  },

  // ============================================
  // Section 2: 故人の基本情報
  // ============================================
  {
    section: 1,
    type: 'TEXT',
    title: '故人のお名前（漢字）/ Deceased\'s Name (Kanji)',
    required: true,
    helpText: '例: 岩下 輝子'
  },
  {
    section: 1,
    type: 'TEXT',
    title: '故人のお名前（ローマ字）/ Deceased\'s Name (Romaji)',
    helpText: '例: Iwashita Teruko'
  },
  {
    section: 1,
    type: 'TEXT',
    title: '旧姓（該当する場合）/ Maiden Name (if applicable)',
    helpText: '女性の場合、調査に重要です'
  },
  {
    section: 1,
    type: 'DATE',
    title: '生年月日 / Date of Birth',
    helpText: '不明な場合は次の質問で大まかな年代を'
  },
  {
    section: 1,
    type: 'TEXT',
    title: '生年（大まかに）/ Approximate Birth Year',
    helpText: '例: 1920年代、昭和初期'
  },
  {
    section: 1,
    type: 'DATE',
    title: '死亡日 / Date of Death'
  },
  {
    section: 1,
    type: 'TEXT',
    title: '死亡年（大まかに）/ Approximate Death Year'
  },
  {
    section: 1,
    type: 'TEXT',
    title: '出身地（都道府県・市町村）/ Birthplace',
    required: true,
    helpText: '例: 群馬県前橋市'
  },
  {
    section: 1,
    type: 'PARAGRAPH',
    title: '本籍地（番地まで分かれば）/ Permanent Domicile',
    helpText: '戸籍取得に必要。出身地と異なる場合があります'
  },
  {
    section: 1,
    type: 'TEXT',
    title: '渡米時期 / When did they immigrate to the US?',
    helpText: '例: 1920年頃、戦前'
  },
  {
    section: 1,
    type: 'PARAGRAPH',
    title: '渡米の経緯 / Immigration circumstances',
    helpText: '労働移民、写真花嫁、留学など分かる範囲で'
  },

  // ============================================
  // Section 3: ご遺灰について
  // ============================================
  {
    section: 2,
    type: 'PARAGRAPH',
    title: '現在のご遺灰の保管場所 / Current Location of Ashes',
    required: true,
    helpText: '住所、または「自宅」「〇〇霊園」など'
  },
  {
    section: 2,
    type: 'MULTIPLE_CHOICE',
    title: '骨壷の種類・状態 / Urn Type and Condition',
    choices: [
      '日本式骨壷 / Japanese-style urn',
      '洋式骨壷 / Western-style urn',
      '散骨用容器 / Container for scattering',
      'その他 / Other',
      '不明 / Unknown'
    ]
  },
  {
    section: 2,
    type: 'MULTIPLE_CHOICE',
    title: '分骨の希望 / Do you want to keep some ashes?',
    choices: [
      '全て日本へ送りたい / Send all to Japan',
      '一部を手元に残したい / Keep some ashes',
      '未定 / Undecided'
    ]
  },
  {
    section: 2,
    type: 'TEXT',
    title: '分骨する場合の割合 / If keeping some, what portion?',
    helpText: '例: 半分、少量のみ'
  },

  // ============================================
  // Section 4: 日本側の情報
  // ============================================
  {
    section: 3,
    type: 'TEXT',
    title: '宗教・宗派 / Religion/Denomination',
    helpText: '例: 曹洞宗、真言宗、キリスト教、神道など'
  },
  {
    section: 3,
    type: 'TEXT',
    title: '戒名・法名（仏教の場合）/ Buddhist Posthumous Name',
    helpText: '墓石に刻まれていることが多いです'
  },
  {
    section: 3,
    type: 'PARAGRAPH',
    title: '日本のお墓の場所 / Grave Location in Japan',
    helpText: '寺の名前、住所、または「〇〇県〇〇市の寺」など'
  },
  {
    section: 3,
    type: 'PARAGRAPH',
    title: 'お墓の場所の記憶 / Memories of the Grave Location',
    helpText: '寺の周辺環境、駐車場、入口からの距離など覚えていること'
  },
  {
    section: 3,
    type: 'PARAGRAPH',
    title: '墓石の形や特徴 / Gravestone Shape/Features',
    helpText: '和型、洋型、大きさ、刻まれている文字など'
  },
  {
    section: 3,
    type: 'TEXT',
    title: '家紋 / Family Crest (Kamon)',
    helpText: '例: 抱き茗荷、丸に橘'
  },
  {
    section: 3,
    type: 'TEXT',
    title: '父親の名前 / Father\'s Name'
  },
  {
    section: 3,
    type: 'TEXT',
    title: '母親の名前（旧姓も）/ Mother\'s Name (including maiden name)'
  },
  {
    section: 3,
    type: 'PARAGRAPH',
    title: '兄弟姉妹の名前 / Siblings\' Names'
  },
  {
    section: 3,
    type: 'PARAGRAPH',
    title: '日本にいる親戚の情報 / Relatives in Japan',
    helpText: '名前、関係、連絡先（分かれば）'
  },
  {
    section: 3,
    type: 'MULTIPLE_CHOICE',
    title: '日本の親戚との関係性 / Relationship with Japan relatives',
    choices: [
      '連絡を取り合っている / In regular contact',
      '数年前に連絡あり / Contact within last few years',
      '長年連絡なし / No contact for many years',
      '親戚がいるか不明 / Unknown if relatives exist',
      '親戚はいない / No relatives'
    ]
  },

  // ============================================
  // Section 5: 資料・写真
  // ============================================
  {
    section: 4,
    type: 'CHECKBOX',
    title: '古い写真はありますか？ / Do you have old photos?',
    choices: [
      '故人の写真 / Photos of the deceased',
      '日本の故郷の写真 / Photos of hometown in Japan',
      'お墓の写真 / Photos of the grave',
      '家族写真 / Family photos',
      'なし / None'
    ]
  },
  {
    section: 4,
    type: 'CHECKBOX',
    title: '古い書類はありますか？ / Do you have old documents?',
    choices: [
      '戦前の手紙 / Pre-war letters',
      '戸籍謄本 / Family register copy',
      'パスポート / Passport',
      '移民関連書類 / Immigration documents',
      'なし / None'
    ]
  },
  {
    section: 4,
    type: 'FILE',
    title: '写真・書類のアップロード / Upload Photos/Documents',
    helpText: '複数ファイル可。後から追加も可能です'
  },

  // ============================================
  // Section 6: ご希望・ご要望
  // ============================================
  {
    section: 5,
    type: 'PARAGRAPH',
    title: '希望する実施時期 / Preferred Timing',
    helpText: '例: 2025年春、故人の命日（〇月）に合わせて'
  },
  {
    section: 5,
    type: 'MULTIPLE_CHOICE',
    title: '日本への渡航予定 / Travel Plans to Japan',
    choices: [
      '納骨式に参列したい / Want to attend the ceremony',
      '渡航は難しい（代行を希望）/ Cannot travel (want delivery service)',
      '未定 / Undecided'
    ]
  },
  {
    section: 5,
    type: 'MULTIPLE_CHOICE',
    title: '日本での同行サポート希望 / Want Accompaniment in Japan?',
    choices: [
      'はい、通訳・案内が必要 / Yes, need interpreter/guide',
      'いいえ、自分で対応できる / No, can manage on my own',
      '未定 / Undecided'
    ]
  },
  {
    section: 5,
    type: 'MULTIPLE_CHOICE',
    title: '希望する最終安置方法 / Preferred Final Arrangement',
    choices: [
      '本家のお墓に納骨 / Inter in family grave',
      '故郷での散骨 / Scatter in hometown',
      '新規にお墓を建立 / Build a new grave',
      '樹木葬・永代供養 / Tree burial / Perpetual memorial',
      '未定・相談したい / Undecided / Want to discuss'
    ]
  },
  {
    section: 5,
    type: 'PARAGRAPH',
    title: '日本で購入してほしいもの / Items to Purchase in Japan',
    helpText: '故郷の品、お供え物など'
  },
  {
    section: 5,
    type: 'MULTIPLE_CHOICE',
    title: '家紋入り記念品への関心 / Interest in Family Crest Memorials',
    choices: [
      'とても興味がある / Very interested',
      '少し興味がある / Somewhat interested',
      '興味がない / Not interested'
    ]
  },
  {
    section: 5,
    type: 'PARAGRAPH',
    title: 'その他のご要望 / Other Requests',
    helpText: '特別な儀式、故人の遺志、その他何でも'
  },

  // ============================================
  // Section 7: 協力・サポート
  // ============================================
  {
    section: 6,
    type: 'MULTIPLE_CHOICE',
    title: '体験談の共有・広報への協力 / Share Story / Help Outreach',
    choices: [
      '協力可能 / Can cooperate',
      '匿名なら協力可能 / Anonymous only',
      '協力は難しい / Cannot cooperate'
    ]
  },
  {
    section: 6,
    type: 'MULTIPLE_CHOICE',
    title: '活動への資金・物資援助 / Financial/Material Support',
    choices: [
      '支援を検討したい / Want to consider supporting',
      '今は難しい / Not possible now',
      '詳しく聞きたい / Want more information'
    ]
  },
  {
    section: 6,
    type: 'MULTIPLE_CHOICE',
    title: '有料オプションへの関心 / Interest in Paid Options',
    choices: [
      '関心あり / Interested',
      '内容による / Depends on what\'s offered',
      '関心なし / Not interested'
    ]
  }
];

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * フォームを新規作成
 */
function createHearingForm() {
  // フォーム作成
  const form = FormApp.create(FORM_CONFIG.title);
  form.setDescription(FORM_CONFIG.description);
  form.setConfirmationMessage(FORM_CONFIG.confirmationMessage);
  form.setCollectEmail(false);
  form.setAllowResponseEdits(true);

  let currentSection = -1;

  // 質問を追加
  QUESTIONS.forEach((q, index) => {
    // 新しいセクションの場合、ページブレークを追加
    if (q.section !== currentSection) {
      if (currentSection >= 0) {
        form.addPageBreakItem()
          .setTitle(SECTIONS[q.section].title)
          .setHelpText(SECTIONS[q.section].description);
      }
      currentSection = q.section;
    }

    addQuestion(form, q);
  });

  // 確認チェックボックス
  form.addCheckboxItem()
    .setTitle('送信前の確認 / Pre-submission Confirmation')
    .setChoices([
      form.createChoice('上記の情報は正確です / The above information is accurate')
    ])
    .setRequired(true);

  Logger.log('フォーム作成完了: ' + form.getEditUrl());
  Logger.log('回答用URL: ' + form.getPublishedUrl());

  return form;
}

/**
 * 質問を追加
 */
function addQuestion(form, q) {
  let item;

  switch (q.type) {
    case 'TEXT':
      item = form.addTextItem();
      break;

    case 'PARAGRAPH':
      item = form.addParagraphTextItem();
      break;

    case 'MULTIPLE_CHOICE':
      item = form.addMultipleChoiceItem();
      item.setChoices(q.choices.map(c => item.createChoice(c)));
      break;

    case 'CHECKBOX':
      item = form.addCheckboxItem();
      item.setChoices(q.choices.map(c => item.createChoice(c)));
      break;

    case 'LIST':
      item = form.addListItem();
      item.setChoices(q.choices.map(c => item.createChoice(c)));
      break;

    case 'DATE':
      item = form.addDateItem();
      break;

    case 'FILE':
      item = form.addFileUploadItem();
      item.setMaxFiles(10);
      break;

    default:
      return;
  }

  item.setTitle(q.title);

  if (q.helpText) {
    item.setHelpText(q.helpText);
  }

  if (q.required) {
    item.setRequired(true);
  }
}

/**
 * 既存フォームを更新（質問を全て削除して再作成）
 * 注意: 既存の回答は保持されますが、質問との紐付けが切れる可能性があります
 */
function updateForm(formId) {
  const form = FormApp.openById(formId);

  // 既存の質問を全て削除
  const items = form.getItems();
  items.forEach(item => form.deleteItem(item));

  // 設定を更新
  form.setTitle(FORM_CONFIG.title);
  form.setDescription(FORM_CONFIG.description);
  form.setConfirmationMessage(FORM_CONFIG.confirmationMessage);

  let currentSection = -1;

  // 質問を再追加
  QUESTIONS.forEach((q, index) => {
    if (q.section !== currentSection) {
      if (currentSection >= 0) {
        form.addPageBreakItem()
          .setTitle(SECTIONS[q.section].title)
          .setHelpText(SECTIONS[q.section].description);
      }
      currentSection = q.section;
    }

    addQuestion(form, q);
  });

  // 確認チェックボックス
  form.addCheckboxItem()
    .setTitle('送信前の確認 / Pre-submission Confirmation')
    .setChoices([
      form.createChoice('上記の情報は正確です / The above information is accurate')
    ])
    .setRequired(true);

  Logger.log('フォーム更新完了: ' + form.getEditUrl());
}

/**
 * 質問一覧をログ出力（デバッグ用）
 */
function listQuestions() {
  QUESTIONS.forEach((q, i) => {
    Logger.log(`${i + 1}. [Section ${q.section + 1}] ${q.type}: ${q.title}`);
  });
  Logger.log(`Total: ${QUESTIONS.length} questions`);
}
