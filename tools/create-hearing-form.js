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
// SECTIONS DEFINITION
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
    title: 'Section 3: 故人の渡米歴 / Immigration History',
    description: '渡米の経緯について / About immigration to the US'
  },
  {
    title: 'Section 4: ご遺灰について / About the Ashes',
    description: '現在のご遺灰の状況 / Current situation of the ashes'
  },
  {
    title: 'Section 5: 法的・行政手続き / Legal & Administrative',
    description: '必要書類と権限について / Required documents and authority'
  },
  {
    title: 'Section 6: 日本側の情報 / Information about Japan',
    description: '日本のお墓や親戚について / About grave and relatives in Japan'
  },
  {
    title: 'Section 7: 資料・写真 / Documents and Photos',
    description: 'お持ちの資料について / About documents you have'
  },
  {
    title: 'Section 8: ご希望・ご要望 / Your Preferences',
    description: 'ご希望をお聞かせください / Tell us your preferences'
  },
  {
    title: 'Section 9: 財務・予算 / Budget and Payment',
    description: '費用について / About costs and budget'
  },
  {
    title: 'Section 10: 協力・サポート / Cooperation and Support',
    description: '活動へのご協力について / About supporting our activities'
  },
  {
    title: 'Section 11: アンケート / Survey',
    description: 'サービス改善のため教えてください / Help us improve our service'
  },
  {
    title: 'Section 12: 免責事項・同意 / Disclaimers and Consent',
    description: '重要事項のご確認 / Important confirmations'
  }
];

// ============================================
// QUESTIONS DEFINITION (100 questions total)
// ============================================

const QUESTIONS = [
  // ============================================
  // Section 1: 依頼者情報 (15 questions)
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
  {
    section: 0,
    type: 'TEXT',
    title: '緊急連絡先（別の方）/ Emergency Contact (Another Person)',
    helpText: '連絡が取れない場合の代替連絡先 / Alternative contact if we cannot reach you'
  },
  {
    section: 0,
    type: 'PARAGRAPH',
    title: '代理人情報 / Representative Information',
    helpText: '高齢の場合など、主に連絡を取る方が別にいれば記入 / If someone else will be the main contact'
  },
  {
    section: 0,
    type: 'MULTIPLE_CHOICE',
    title: 'パスポートの有無・有効期限 / Passport Status',
    helpText: '日本渡航を検討する場合に必要です / Needed if considering travel to Japan',
    choices: [
      '有効なパスポートあり / Have valid passport',
      'パスポートあるが期限切れ / Have expired passport',
      'パスポートなし / No passport',
      '渡航予定なし / Not planning to travel'
    ]
  },
  {
    section: 0,
    type: 'PARAGRAPH',
    title: '健康上の制限 / Health Limitations',
    helpText: '長距離移動や渡航に影響する健康上の制限があれば / Any health conditions affecting travel'
  },
  {
    section: 0,
    type: 'MULTIPLE_CHOICE',
    title: '渡航時の同行者予定 / Travel Companions',
    choices: [
      '一人で渡航予定 / Planning to travel alone',
      '家族と渡航予定 / With family',
      '友人と渡航予定 / With friends',
      '未定 / Undecided',
      '渡航予定なし / Not planning to travel'
    ]
  },
  {
    section: 0,
    type: 'MULTIPLE_CHOICE',
    title: 'あなたは何世代目ですか？ / What generation are you?',
    helpText: '日系アメリカ人としての世代 / Your generation as Japanese American',
    choices: [
      '一世 / Issei (1st generation)',
      '二世 / Nisei (2nd generation)',
      '三世 / Sansei (3rd generation)',
      '四世 / Yonsei (4th generation)',
      '五世以降 / Gosei or later',
      '混血・複合 / Mixed heritage',
      '分からない / Not sure'
    ]
  },
  {
    section: 0,
    type: 'MULTIPLE_CHOICE',
    title: '他の家族の関与 / Family Involvement',
    helpText: 'この取り組みについて、他のご家族は関与・認識していますか？ / Are other family members involved or aware of this initiative?',
    choices: [
      '家族全員で取り組んでいる / Entire family is involved',
      '一部の家族が認識 / Some family members know',
      '自分だけで進めている / Doing this alone',
      '家族に反対されている / Family opposes this',
      '今後共有予定 / Plan to share later'
    ]
  },

  // ============================================
  // Section 2: 故人の基本情報 (11 questions)
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
    title: '戦前の日本での職業 / Occupation in Japan (Pre-war)',
    helpText: '家族特定の手がかりになります / Helps identify family'
  },
  {
    section: 1,
    type: 'TEXT',
    title: 'ハワイでの職業・勤務先 / Occupation/Employer in Hawaii',
    helpText: '例: Dole Plantation, 農場労働者'
  },

  // ============================================
  // Section 3: 故人の渡米歴 (6 questions)
  // ============================================
  {
    section: 2,
    type: 'TEXT',
    title: '渡米時期 / When did they immigrate to the US?',
    helpText: '例: 1920年頃、戦前'
  },
  {
    section: 2,
    type: 'MULTIPLE_CHOICE',
    title: '渡米時の出港地 / Departure Port',
    helpText: '日本から出発した港 / Port of departure from Japan',
    choices: [
      '横浜 / Yokohama',
      '神戸 / Kobe',
      '長崎 / Nagasaki',
      'その他 / Other',
      '不明 / Unknown'
    ]
  },
  {
    section: 2,
    type: 'TEXT',
    title: '船名（わかれば）/ Ship Name (if known)',
    helpText: '移民船記録との照合に役立ちます / Helps cross-reference immigration records'
  },
  {
    section: 2,
    type: 'PARAGRAPH',
    title: '渡米の経緯 / Immigration circumstances',
    helpText: '労働移民、写真花嫁、呼び寄せ、留学など分かる範囲で'
  },
  {
    section: 2,
    type: 'MULTIPLE_CHOICE',
    title: '強制収容歴（WWII）/ WWII Internment History',
    helpText: '第二次世界大戦中の強制収容について / About wartime internment',
    choices: [
      '収容された / Was interned',
      '収容されなかった / Was not interned',
      '不明 / Unknown'
    ]
  },
  {
    section: 2,
    type: 'TEXT',
    title: '収容所名（該当する場合）/ Internment Camp Name (if applicable)',
    helpText: '例: Honouliuli, Manzanar'
  },

  // ============================================
  // Section 4: ご遺灰について (6 questions)
  // ============================================
  {
    section: 3,
    type: 'PARAGRAPH',
    title: '現在のご遺灰の保管場所 / Current Location of Ashes',
    required: true,
    helpText: '住所、または「自宅」「〇〇霊園」など'
  },
  {
    section: 3,
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
    section: 3,
    type: 'TEXT',
    title: '骨壷のサイズ（概算）/ Urn Size (approximate)',
    helpText: '例: 高さ20cm程度、小さめ / e.g., about 20cm tall, small'
  },
  {
    section: 3,
    type: 'TEXT',
    title: '遺灰の量（概算）/ Amount of Ashes (approximate)',
    helpText: '輸送方法の計画に必要です / Needed for shipping planning'
  },
  {
    section: 3,
    type: 'MULTIPLE_CHOICE',
    title: '分骨の希望 / Do you want to keep some ashes?',
    choices: [
      '全て日本へ送りたい / Send all to Japan',
      '一部を手元に残したい / Keep some ashes',
      '未定 / Undecided'
    ]
  },
  {
    section: 3,
    type: 'TEXT',
    title: '分骨する場合の割合 / If keeping some, what portion?',
    helpText: '例: 半分、少量のみ'
  },

  // ============================================
  // Section 5: 法的・行政手続き (6 questions)
  // ============================================
  {
    section: 4,
    type: 'MULTIPLE_CHOICE',
    title: '遺灰の法的権限 / Legal Authority over Ashes',
    required: true,
    helpText: '遺灰を移動・処分する法的権限について / Your legal authority to handle the ashes',
    choices: [
      '私が遺言執行者 / I am the executor',
      '私が唯一の相続人 / I am the sole heir',
      '相続人の一人 / I am one of multiple heirs',
      '法的権限は不明 / Legal authority unclear',
      'その他 / Other'
    ]
  },
  {
    section: 4,
    type: 'MULTIPLE_CHOICE',
    title: '他の相続人・家族の同意 / Consent from Other Heirs/Family',
    helpText: '他の家族がいる場合、この計画への同意について / About consent from other family members',
    choices: [
      '全員同意済み / All have agreed',
      '大半は同意 / Most have agreed',
      'まだ話し合っていない / Haven\'t discussed yet',
      '反対する人がいる / Some oppose',
      '他に相続人・家族はいない / No other heirs/family'
    ]
  },
  {
    section: 4,
    type: 'MULTIPLE_CHOICE',
    title: '死亡証明書の有無 / Death Certificate',
    choices: [
      '持っている / Have it',
      '取得可能 / Can obtain',
      '持っていない・取得困難 / Don\'t have / Difficult to obtain',
      '不明 / Unknown'
    ]
  },
  {
    section: 4,
    type: 'MULTIPLE_CHOICE',
    title: '火葬証明書の有無 / Cremation Certificate',
    choices: [
      '持っている / Have it',
      '取得可能 / Can obtain',
      '持っていない・取得困難 / Don\'t have / Difficult to obtain',
      '不明 / Unknown'
    ]
  },
  {
    section: 4,
    type: 'MULTIPLE_CHOICE',
    title: '故人の遺言書の有無 / Deceased\'s Will',
    helpText: '日本への帰葬について言及があるか / Does it mention return to Japan?',
    choices: [
      '遺言書あり・帰葬の希望記載 / Will exists, mentions return to Japan',
      '遺言書あり・帰葬の記載なし / Will exists, no mention of return',
      '遺言書なし / No will',
      '不明 / Unknown'
    ]
  },
  {
    section: 4,
    type: 'PARAGRAPH',
    title: '故人の遺志（口頭など）/ Deceased\'s Wishes (verbal, etc.)',
    helpText: '遺言書以外で、故人が日本への帰葬を望んでいたことを示すもの / Any indication the deceased wanted to return to Japan'
  },

  // ============================================
  // Section 6: 日本側の情報 (15 questions)
  // ============================================
  {
    section: 5,
    type: 'TEXT',
    title: '宗教・宗派 / Religion/Denomination',
    helpText: '例: 曹洞宗、真言宗、キリスト教、神道など'
  },
  {
    section: 5,
    type: 'TEXT',
    title: '戒名・法名（仏教の場合）/ Buddhist Posthumous Name',
    helpText: '墓石に刻まれていることが多いです'
  },
  {
    section: 5,
    type: 'PARAGRAPH',
    title: '日本のお墓の場所 / Grave Location in Japan',
    helpText: '寺の名前、住所、または「〇〇県〇〇市の寺」など'
  },
  {
    section: 5,
    type: 'TEXT',
    title: '寺院・神社・霊園の連絡先 / Temple/Shrine/Cemetery Contact',
    helpText: '電話番号やメールアドレス（分かれば）/ Phone or email if known'
  },
  {
    section: 5,
    type: 'MULTIPLE_CHOICE',
    title: '墓地の種類 / Cemetery Type',
    choices: [
      '寺院墓地 / Temple cemetery',
      '公営墓地 / Public cemetery',
      '民間霊園 / Private cemetery',
      '共同墓地 / Community cemetery',
      '不明 / Unknown'
    ]
  },
  {
    section: 5,
    type: 'MULTIPLE_CHOICE',
    title: 'お墓の管理状況 / Grave Maintenance Status',
    helpText: '長年放置されているお墓は清掃・修復が必要な場合があります',
    choices: [
      '親戚が管理している / Relatives maintain it',
      '寺院・霊園が管理している / Temple/cemetery maintains it',
      '長年放置されている可能性 / Possibly abandoned for years',
      '不明 / Unknown'
    ]
  },
  {
    section: 5,
    type: 'MULTIPLE_CHOICE',
    title: '檀家関係の有無 / Temple Membership (Danka)',
    helpText: '寺院墓地の場合、檀家としての関係があるかどうか',
    choices: [
      '檀家として継続中 / Still a member',
      '過去は檀家だった / Was a member in the past',
      '檀家ではない / Not a member',
      '不明 / Unknown'
    ]
  },
  {
    section: 5,
    type: 'PARAGRAPH',
    title: 'お墓の場所の記憶 / Memories of the Grave Location',
    helpText: '寺の周辺環境、駐車場、入口からの距離など覚えていること'
  },
  {
    section: 5,
    type: 'PARAGRAPH',
    title: '墓石の形や特徴 / Gravestone Shape/Features',
    helpText: '和型、洋型、大きさ、刻まれている文字など'
  },
  {
    section: 5,
    type: 'TEXT',
    title: '家紋 / Family Crest (Kamon)',
    helpText: '例: 抱き茗荷、丸に橘'
  },
  {
    section: 5,
    type: 'TEXT',
    title: '父親の名前 / Father\'s Name'
  },
  {
    section: 5,
    type: 'TEXT',
    title: '母親の名前（旧姓も）/ Mother\'s Name (including maiden name)'
  },
  {
    section: 5,
    type: 'PARAGRAPH',
    title: '兄弟姉妹の名前 / Siblings\' Names'
  },
  {
    section: 5,
    type: 'PARAGRAPH',
    title: '日本にいる親戚の情報 / Relatives in Japan',
    helpText: '名前、関係、連絡先（分かれば）'
  },
  {
    section: 5,
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
  // Section 7: 資料・写真 (3 questions)
  // ============================================
  {
    section: 6,
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
    section: 6,
    type: 'CHECKBOX',
    title: '古い書類はありますか？ / Do you have old documents?',
    choices: [
      '戦前の手紙 / Pre-war letters',
      '戸籍謄本 / Family register copy',
      'パスポート / Passport',
      '移民関連書類 / Immigration documents',
      '強制収容関連書類 / Internment documents',
      'なし / None'
    ]
  },
  {
    section: 6,
    type: 'PARAGRAPH',
    title: '写真・書類の共有方法 / How to Share Photos/Documents',
    helpText: 'Google Drive、Dropboxなどの共有リンクを貼り付けるか、後日メールで送信してください。大きなファイルはmovement@pearl.memorialへ直接お送りください / Paste a sharing link (Google Drive, Dropbox, etc.) or send files via email to movement@pearl.memorial'
  },

  // ============================================
  // Section 8: ご希望・ご要望 (11 questions)
  // ============================================
  {
    section: 7,
    type: 'PARAGRAPH',
    title: 'このプロジェクトへの思い / Your Motivation for This Project',
    helpText: 'なぜ故人を日本に帰したいと思われたのですか？ / Why do you want to return the deceased to Japan?'
  },
  {
    section: 7,
    type: 'PARAGRAPH',
    title: '希望する実施時期 / Preferred Timing',
    helpText: '例: 2025年春、故人の命日（〇月）に合わせて'
  },
  {
    section: 7,
    type: 'MULTIPLE_CHOICE',
    title: '日本への渡航予定 / Travel Plans to Japan',
    choices: [
      '納骨式に参列したい / Want to attend the ceremony',
      '渡航は難しい（代行を希望）/ Cannot travel (want delivery service)',
      '未定 / Undecided'
    ]
  },
  {
    section: 7,
    type: 'MULTIPLE_CHOICE',
    title: '日本での同行サポート希望 / Want Accompaniment in Japan?',
    choices: [
      'はい、通訳・案内が必要 / Yes, need interpreter/guide',
      'いいえ、自分で対応できる / No, can manage on my own',
      '未定 / Undecided'
    ]
  },
  {
    section: 7,
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
    section: 7,
    type: 'MULTIPLE_CHOICE',
    title: '納骨式の規模希望 / Ceremony Size Preference',
    choices: [
      '家族のみで静かに / Family only, quiet ceremony',
      '日本の親戚も招待したい / Want to invite Japan relatives',
      '盛大に行いたい / Want a larger ceremony',
      '式は不要 / No ceremony needed',
      '未定 / Undecided'
    ]
  },
  {
    section: 7,
    type: 'PARAGRAPH',
    title: '日本で購入してほしいもの / Items to Purchase in Japan',
    helpText: '故郷の品、お供え物など'
  },
  {
    section: 7,
    type: 'MULTIPLE_CHOICE',
    title: '継続的なお墓参り代行への関心 / Interest in Ongoing Grave Visit Service',
    helpText: '納骨後、定期的にお墓参りを代行するサービス（有料）',
    choices: [
      'とても興味がある / Very interested',
      '少し興味がある / Somewhat interested',
      '興味がない / Not interested',
      '詳細を聞きたい / Want more information'
    ]
  },
  {
    section: 7,
    type: 'MULTIPLE_CHOICE',
    title: '家紋入り記念品への関心 / Interest in Family Crest Memorials',
    choices: [
      'とても興味がある / Very interested',
      '少し興味がある / Somewhat interested',
      '興味がない / Not interested'
    ]
  },
  {
    section: 7,
    type: 'MULTIPLE_CHOICE',
    title: '日本のオハナハウス滞在への関心 / Interest in Ohana House Stay in Japan',
    helpText: '日本滞在中にご利用いただける宿泊施設です。詳しくはカタログをご覧ください / Accommodation available during your stay in Japan. See catalog for details.',
    choices: [
      'とても興味がある / Very interested',
      '少し興味がある / Somewhat interested',
      '詳細を聞きたい / Want more information',
      '興味がない / Not interested'
    ]
  },
  {
    section: 7,
    type: 'MULTIPLE_CHOICE',
    title: '技術業務支援への関心 / Interest in Technical Support Services',
    helpText: 'オフグリッドインフラの診断・構築・改善支援サービス / Off-grid infrastructure diagnosis, setup, and improvement services',
    choices: [
      'とても興味がある / Very interested',
      '少し興味がある / Somewhat interested',
      '詳細を聞きたい / Want more information',
      '興味がない / Not interested'
    ]
  },
  {
    section: 7,
    type: 'MULTIPLE_CHOICE',
    title: 'DNA鑑定サービスとの併用への関心 / Interest in DNA Testing Services',
    helpText: '家系調査やルーツ探しにDNA鑑定を併用するオプション / Option to combine DNA testing for genealogy research',
    choices: [
      'とても興味がある / Very interested',
      '少し興味がある / Somewhat interested',
      '既にDNA検査済み / Already done DNA testing',
      '詳細を聞きたい / Want more information',
      '興味がない / Not interested'
    ]
  },
  {
    section: 7,
    type: 'MULTIPLE_CHOICE',
    title: '家系図作成支援への関心 / Interest in Family Tree Creation',
    helpText: '戸籍調査をもとに家系図を作成するサービス / Service to create a family tree based on family register research',
    choices: [
      'とても興味がある / Very interested',
      '少し興味がある / Somewhat interested',
      '詳細を聞きたい / Want more information',
      '興味がない / Not interested'
    ]
  },
  {
    section: 7,
    type: 'PARAGRAPH',
    title: 'その他のご要望 / Other Requests',
    helpText: '特別な儀式、故人の遺志、その他何でも'
  },

  // ============================================
  // Section 9: 財務・予算 (4 questions)
  // ============================================
  {
    section: 8,
    type: 'MULTIPLE_CHOICE',
    title: '予算感 / Budget Range',
    helpText: '渡航費・滞在費・有料オプション等を含む概算 / Approximate including travel, lodging, paid options',
    choices: [
      '$1,000未満 / Under $1,000',
      '$1,000-$3,000',
      '$3,000-$5,000',
      '$5,000-$10,000',
      '$10,000以上 / Over $10,000',
      '予算は柔軟 / Budget is flexible',
      'まだ分からない / Not sure yet'
    ]
  },
  {
    section: 8,
    type: 'MULTIPLE_CHOICE',
    title: '分割払いへの関心 / Interest in Payment Plans',
    choices: [
      '一括払いで問題ない / Can pay in full',
      '分割払いを希望 / Would prefer payment plan',
      '内容による / Depends on amount',
      '不要（費用がかからない見込み）/ Not needed'
    ]
  },
  {
    section: 8,
    type: 'MULTIPLE_CHOICE',
    title: '寄付可能な金額帯 / Potential Donation Range',
    helpText: 'Soul Carrier活動への任意の寄付について / Optional donation to Soul Carrier activities',
    choices: [
      '寄付を検討したい / Want to consider donating',
      '$100未満 / Under $100',
      '$100-$500',
      '$500-$1,000',
      '$1,000以上 / Over $1,000',
      '今は難しい / Not possible now'
    ]
  },
  {
    section: 8,
    type: 'PARAGRAPH',
    title: '費用に関するご質問・ご懸念 / Questions/Concerns about Costs',
    helpText: '費用について不安な点があればお聞かせください / Let us know if you have any concerns about costs'
  },

  // ============================================
  // Section 10: 協力・サポート (3 questions)
  // ============================================
  {
    section: 9,
    type: 'MULTIPLE_CHOICE',
    title: '体験談の共有・広報への協力 / Share Story / Help Outreach',
    choices: [
      '協力可能 / Can cooperate',
      '匿名なら協力可能 / Anonymous only',
      '協力は難しい / Cannot cooperate'
    ]
  },
  {
    section: 9,
    type: 'MULTIPLE_CHOICE',
    title: '活動への資金・物資援助 / Financial/Material Support',
    choices: [
      '支援を検討したい / Want to consider supporting',
      '今は難しい / Not possible now',
      '詳しく聞きたい / Want more information'
    ]
  },
  {
    section: 9,
    type: 'MULTIPLE_CHOICE',
    title: '有料オプションへの関心 / Interest in Paid Options',
    choices: [
      '関心あり / Interested',
      '内容による / Depends on what\'s offered',
      '関心なし / Not interested'
    ]
  },

  // ============================================
  // Section 11: アンケート (13 questions)
  // ============================================
  {
    section: 10,
    type: 'CHECKBOX',
    title: 'Soul Carrierをどこで知りましたか？ / How did you hear about Soul Carrier?',
    helpText: '該当するものすべてにチェック / Check all that apply',
    choices: [
      '友人・知人からの紹介 / Friend/acquaintance referral',
      '家族からの紹介 / Family referral',
      '教会・寺院・コミュニティ / Church/temple/community',
      'Facebook / Instagram / SNS',
      'Google検索 / Google search',
      '新聞・雑誌記事 / Newspaper/magazine article',
      'テレビ・ラジオ / TV/radio',
      'イベント・講演会 / Event/seminar',
      'その他 / Other'
    ]
  },
  {
    section: 10,
    type: 'TEXT',
    title: '「その他」の場合、具体的に / If "Other", please specify'
  },
  {
    section: 10,
    type: 'PARAGRAPH',
    title: '相談しようと思ったきっかけ / What prompted you to reach out?',
    helpText: '何がきっかけで今回相談しようと思われましたか？ / What made you decide to contact us now?'
  },
  {
    section: 10,
    type: 'CHECKBOX',
    title: 'これまで試した方法 / Methods you have tried before',
    helpText: '該当するものすべてにチェック / Check all that apply',
    choices: [
      '自分で日本の親戚に連絡を試みた / Tried contacting relatives in Japan myself',
      '自分でお墓を探そうとした / Tried to find the grave myself',
      '日本に行ってみた / Visited Japan',
      '他のサービス・業者に相談した / Consulted other services/providers',
      '教会・寺院に相談した / Consulted church/temple',
      'インターネットで調べた / Searched online',
      '特に何も試していない / Haven\'t tried anything',
      'その他 / Other'
    ]
  },
  {
    section: 10,
    type: 'PARAGRAPH',
    title: 'これまで困ったこと・うまくいかなかったこと / Difficulties you have faced',
    helpText: '今までどんなことで困りましたか？何がうまくいきませんでしたか？ / What challenges have you encountered? What didn\'t work?'
  },
  {
    section: 10,
    type: 'MULTIPLE_CHOICE',
    title: '友人・知人にSoul Carrierを勧める可能性 / How likely would you recommend Soul Carrier?',
    helpText: '0=全く勧めない、10=強く勧める / 0=Not at all, 10=Very likely',
    choices: [
      '10 - 強く勧める / Highly recommend',
      '9',
      '8',
      '7',
      '6',
      '5 - どちらとも言えない / Neutral',
      '4',
      '3',
      '2',
      '1',
      '0 - 全く勧めない / Not at all'
    ]
  },
  {
    section: 10,
    type: 'PARAGRAPH',
    title: 'さらに充実すると嬉しいサービス / Services you would like to see',
    helpText: 'あったら嬉しいサービスや機能があれば教えてください / What additional services or features would you find helpful?'
  },
  {
    section: 10,
    type: 'PARAGRAPH',
    title: 'この取り組みを通じて子孫に残したいこと / Legacy you want to leave for future generations',
    helpText: 'この経験を通じて、お子様やお孫様に伝えたいことはありますか？ / What would you like your children or grandchildren to learn from this experience?'
  },
  {
    section: 10,
    type: 'PARAGRAPH',
    title: 'コミュニティや社会への影響 / Impact on community and society',
    helpText: 'この取り組みがコミュニティや社会にどのような影響を与えると思いますか？ / What impact do you think this initiative could have on your community or society?'
  },
  {
    section: 10,
    type: 'PARAGRAPH',
    title: 'アイデンティティへの影響 / Impact on your identity',
    helpText: 'この取り組みがあなたのアイデンティティや自己認識にどのような変化をもたらすと思いますか？ / What changes do you think this experience might bring to your identity or self-understanding?'
  },
  {
    section: 10,
    type: 'MULTIPLE_CHOICE',
    title: 'お知らせ・プロモーション情報の受信 / Newsletter and promotional updates',
    helpText: '今後のお知らせやプロモーション情報の受信を希望しますか？ / Would you like to receive future announcements and promotional information?',
    choices: [
      'はい、受信を希望します / Yes, I would like to receive updates',
      '重要な情報のみ希望 / Only important updates',
      'いいえ、受信を希望しません / No, I do not want to receive updates'
    ]
  },
  {
    section: 10,
    type: 'CHECKBOX',
    title: 'この経験の記録方法 / How would you like to document this journey?',
    helpText: '該当するものすべてにチェック / Check all that apply',
    choices: [
      '写真撮影 / Photography',
      '動画撮影 / Video recording',
      '文章・日記 / Written journal',
      'プロの記録サービス希望 / Professional documentation service',
      'SNS共有予定 / Plan to share on social media',
      'プライベートに留めたい / Keep private',
      'まだ決めていない / Haven\'t decided yet'
    ]
  },
  {
    section: 10,
    type: 'PARAGRAPH',
    title: 'ご意見・ご要望 / Comments or Suggestions',
    helpText: 'サービス改善のためのご意見があればお聞かせください / Any feedback to help us improve'
  },

  // ============================================
  // Section 12: 免責事項・同意 (2 questions)
  // ============================================
  {
    section: 11,
    type: 'CHECKBOX',
    title: 'サービスの限界についての理解 / Understanding of Service Limitations',
    required: true,
    helpText: '以下すべてにチェックしてください / Please check all items',
    choices: [
      '調査の結果、お墓が見つからない・特定できない場合があります / Research may not locate or identify the grave',
      '寺院や親戚の事情により、納骨が実現しない可能性があります / Interment may not be possible due to temple or family circumstances',
      '法的・行政的な問題により、遺灰の輸送ができない場合があります / Legal/administrative issues may prevent transportation of ashes'
    ]
  },
  {
    section: 11,
    type: 'CHECKBOX',
    title: '費用負担についての理解 / Understanding of Cost Responsibility',
    required: true,
    helpText: '以下すべてにチェックしてください / Please check all items',
    choices: [
      '調査・手続きに関わる実費（交通費、書類取得費等）は依頼者負担です / Actual costs (travel, document fees, etc.) are the requester\'s responsibility',
      '有料オプションは別途料金が発生します / Paid options incur additional charges',
      'プロジェクトが中断・中止となった場合、既に発生した費用は返金されません / Costs already incurred are non-refundable if the project is discontinued'
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
  form.addPageBreakItem()
    .setTitle('確認 / Confirmation')
    .setHelpText('送信前にご確認ください / Please confirm before submitting');

  const confirmItem = form.addCheckboxItem();
  confirmItem.setTitle('送信前の確認 / Pre-submission Confirmation');
  confirmItem.setChoices([
    confirmItem.createChoice('上記の情報は正確です。後から修正・追加が可能であることを理解しています。 / The above information is accurate. I understand I can update it later.')
  ]);
  confirmItem.setRequired(true);

  const privacyItem = form.addCheckboxItem();
  privacyItem.setTitle('プライバシーポリシーへの同意 / Privacy Policy Agreement');
  privacyItem.setChoices([
    privacyItem.createChoice('プライバシーポリシーに同意します / I agree to the Privacy Policy')
  ]);
  privacyItem.setRequired(true);

  Logger.log('フォーム作成完了: ' + form.getEditUrl());
  Logger.log('回答用URL: ' + form.getPublishedUrl());
  Logger.log('質問数: ' + QUESTIONS.length);

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

    // NOTE: FILE type removed - addFileUploadItem() requires respondents to be logged in
    // Using PARAGRAPH with instructions to share via Google Drive/email instead

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
  form.addPageBreakItem()
    .setTitle('確認 / Confirmation')
    .setHelpText('送信前にご確認ください / Please confirm before submitting');

  const confirmItem2 = form.addCheckboxItem();
  confirmItem2.setTitle('送信前の確認 / Pre-submission Confirmation');
  confirmItem2.setChoices([
    confirmItem2.createChoice('上記の情報は正確です。後から修正・追加が可能であることを理解しています。 / The above information is accurate. I understand I can update it later.')
  ]);
  confirmItem2.setRequired(true);

  const privacyItem2 = form.addCheckboxItem();
  privacyItem2.setTitle('プライバシーポリシーへの同意 / Privacy Policy Agreement');
  privacyItem2.setChoices([
    privacyItem2.createChoice('プライバシーポリシーに同意します / I agree to the Privacy Policy')
  ]);
  privacyItem2.setRequired(true);

  Logger.log('フォーム更新完了: ' + form.getEditUrl());
  Logger.log('質問数: ' + QUESTIONS.length);
}

/**
 * 質問一覧をログ出力（デバッグ用）
 */
function listQuestions() {
  let currentSection = -1;
  QUESTIONS.forEach((q, i) => {
    if (q.section !== currentSection) {
      currentSection = q.section;
      Logger.log(`\n=== ${SECTIONS[currentSection].title} ===`);
    }
    Logger.log(`${i + 1}. [${q.type}] ${q.title}${q.required ? ' *' : ''}`);
  });
  Logger.log(`\nTotal: ${QUESTIONS.length} questions + 2 confirmation = ${QUESTIONS.length + 2} items`);
}

/**
 * セクションごとの質問数を表示
 */
function countBySection() {
  const counts = {};
  QUESTIONS.forEach(q => {
    const sectionName = SECTIONS[q.section].title;
    counts[sectionName] = (counts[sectionName] || 0) + 1;
  });

  Logger.log('=== Questions by Section ===');
  Object.entries(counts).forEach(([section, count]) => {
    Logger.log(`${section}: ${count} questions`);
  });
  Logger.log(`\nTotal: ${QUESTIONS.length} questions`);
}
