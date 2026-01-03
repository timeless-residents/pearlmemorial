/**
 * Soul Carrier 詳細ヒアリングフォーム - Google Apps Script
 *
 * 設定方法:
 * 1. Google Form を作成
 * 2. スクリプトエディタを開く（フォーム > スクリプトエディタ）
 * 3. このコードを貼り付け
 * 4. CONFIG セクションを編集
 * 5. トリガーを設定（onFormSubmit を フォーム送信時に実行）
 */

// ============================================
// CONFIG - 環境に合わせて編集
// ============================================

const CONFIG = {
  // ケースID プレフィックス
  caseIdPrefix: 'SC',

  // 通知先メールアドレス
  notifyEmails: [
    'info@pearlmemorial.org',
    // 'team@example.com'
  ],

  // Slack Webhook URL (任意)
  slackWebhookUrl: '',

  // ケース管理スプレッドシートID
  // スプレッドシートのURLから取得: https://docs.google.com/spreadsheets/d/XXXXXX/edit
  casesSpreadsheetId: '',

  // 確認メールの件名
  confirmationSubject: {
    ja: 'Soul Carrier ヒアリングフォーム受付完了',
    en: 'Soul Carrier Hearing Form Received'
  }
};

// ============================================
// MAIN FUNCTION - フォーム送信時に実行
// ============================================

function onFormSubmit(e) {
  try {
    const response = e.response;
    const items = response.getItemResponses();

    // 回答をオブジェクトに変換
    const answers = parseResponses(items);

    // ケースID生成
    const caseId = generateCaseId();

    // ケース管理シートに追加
    if (CONFIG.casesSpreadsheetId) {
      addToSpreadsheet(caseId, answers);
    }

    // 確認メール送信
    sendConfirmationEmail(caseId, answers);

    // チーム通知
    notifyTeam(caseId, answers);

    // Slack通知（設定されている場合）
    if (CONFIG.slackWebhookUrl) {
      notifySlack(caseId, answers);
    }

    Logger.log(`Case ${caseId} processed successfully`);

  } catch (error) {
    Logger.log(`Error processing form: ${error}`);
    // エラー通知
    MailApp.sendEmail(
      CONFIG.notifyEmails[0],
      '[ERROR] Soul Carrier Form Processing Failed',
      `Error: ${error}\n\nTimestamp: ${new Date()}`
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * フォーム回答をパース
 */
function parseResponses(items) {
  const answers = {
    timestamp: new Date(),
    raw: {}
  };

  items.forEach(item => {
    const title = item.getItem().getTitle();
    const response = item.getResponse();
    answers.raw[title] = response;

    // 主要フィールドを抽出
    if (title.includes('お名前') || title.includes('Your Name')) {
      answers.clientName = response;
    }
    if (title.includes('メール') || title.includes('Email')) {
      answers.email = response;
    }
    if (title.includes('故人のお名前') && title.includes('漢字')) {
      answers.deceasedName = response;
    }
    if (title.includes('出身地') || title.includes('Birthplace')) {
      answers.birthplace = response;
    }
    if (title.includes('日本語レベル') || title.includes('Japanese Language')) {
      answers.japaneseLevel = response;
    }
  });

  return answers;
}

/**
 * ケースID生成
 */
function generateCaseId() {
  const year = new Date().getFullYear();
  const sheet = SpreadsheetApp.openById(CONFIG.casesSpreadsheetId).getActiveSheet();
  const lastRow = sheet.getLastRow();
  const sequence = String(lastRow).padStart(3, '0');

  return `${CONFIG.caseIdPrefix}-${year}-${sequence}`;
}

/**
 * スプレッドシートに追加
 */
function addToSpreadsheet(caseId, answers) {
  const sheet = SpreadsheetApp.openById(CONFIG.casesSpreadsheetId).getActiveSheet();

  // ヘッダーがなければ作成
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'ケースID',
      '受付日時',
      '依頼者名',
      'メール',
      '故人名',
      '出身地',
      '日本語レベル',
      'ステータス',
      '備考'
    ]);
  }

  sheet.appendRow([
    caseId,
    answers.timestamp,
    answers.clientName || '',
    answers.email || '',
    answers.deceasedName || '',
    answers.birthplace || '',
    answers.japaneseLevel || '',
    '新規受付',
    ''
  ]);
}

/**
 * 確認メール送信
 */
function sendConfirmationEmail(caseId, answers) {
  if (!answers.email) return;

  const isJapanese = answers.japaneseLevel &&
    (answers.japaneseLevel.includes('ネイティブ') ||
     answers.japaneseLevel.includes('日常会話'));

  const subject = isJapanese ?
    CONFIG.confirmationSubject.ja :
    CONFIG.confirmationSubject.en;

  const body = isJapanese ? `
${answers.clientName || 'お客'} 様

Soul Carrier 詳細ヒアリングフォームへのご回答ありがとうございました。

【ケースID】${caseId}

内容を確認し、3営業日以内にご連絡いたします。
追加の情報や写真がありましたら、このメールに返信するか
info@pearlmemorial.org までお送りください。

ご不明な点がありましたら、お気軽にお問い合わせください。

─────────────────────
Pearl Memorial Boundarist Movement
Soul Carrier Project
https://pearlmemorial.org
─────────────────────
` : `
Dear ${answers.clientName || 'Client'},

Thank you for completing the Soul Carrier Detailed Hearing Form.

【Case ID】${caseId}

We will review your information and contact you within 3 business days.
If you have additional information or photos, please reply to this email
or send to info@pearlmemorial.org.

Please don't hesitate to contact us if you have any questions.

─────────────────────
Pearl Memorial Boundarist Movement
Soul Carrier Project
https://pearlmemorial.org
─────────────────────
`;

  MailApp.sendEmail({
    to: answers.email,
    subject: subject,
    body: body,
    replyTo: 'info@pearlmemorial.org'
  });
}

/**
 * チームへ通知
 */
function notifyTeam(caseId, answers) {
  const subject = `[新規ケース] ${caseId} - ${answers.deceasedName || '名前未入力'}`;

  const body = `
新しいヒアリングフォームが送信されました。

【ケースID】${caseId}
【受付日時】${answers.timestamp}
【依頼者】${answers.clientName || '未入力'}
【メール】${answers.email || '未入力'}
【故人名】${answers.deceasedName || '未入力'}
【出身地】${answers.birthplace || '未入力'}
【日本語】${answers.japaneseLevel || '未入力'}

詳細はスプレッドシートを確認してください。
`;

  CONFIG.notifyEmails.forEach(email => {
    MailApp.sendEmail(email, subject, body);
  });
}

/**
 * Slack通知
 */
function notifySlack(caseId, answers) {
  if (!CONFIG.slackWebhookUrl) return;

  const payload = {
    text: `新規ケース受付: ${caseId}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📋 新規ケース: ${caseId}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*故人名:*\n${answers.deceasedName || '未入力'}`
          },
          {
            type: 'mrkdwn',
            text: `*出身地:*\n${answers.birthplace || '未入力'}`
          },
          {
            type: 'mrkdwn',
            text: `*依頼者:*\n${answers.clientName || '未入力'}`
          },
          {
            type: 'mrkdwn',
            text: `*日本語:*\n${answers.japaneseLevel || '未入力'}`
          }
        ]
      }
    ]
  };

  UrlFetchApp.fetch(CONFIG.slackWebhookUrl, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * テスト用 - 手動実行でテスト
 */
function testNotification() {
  const testAnswers = {
    timestamp: new Date(),
    clientName: 'テスト太郎',
    email: 'test@example.com',
    deceasedName: '山田 花子',
    birthplace: '群馬県前橋市',
    japaneseLevel: '日常会話可能'
  };

  const caseId = 'SC-TEST-001';

  // メール通知テスト
  notifyTeam(caseId, testAnswers);

  Logger.log('Test notification sent');
}

/**
 * スプレッドシート初期化
 */
function initializeSpreadsheet() {
  const sheet = SpreadsheetApp.openById(CONFIG.casesSpreadsheetId).getActiveSheet();

  // ヘッダー設定
  sheet.appendRow([
    'ケースID',
    '受付日時',
    '依頼者名',
    'メール',
    '故人名',
    '出身地',
    '日本語レベル',
    'ステータス',
    '備考'
  ]);

  // 列幅調整
  sheet.setColumnWidth(1, 120);  // ケースID
  sheet.setColumnWidth(2, 150);  // 受付日時
  sheet.setColumnWidth(3, 120);  // 依頼者名
  sheet.setColumnWidth(4, 200);  // メール
  sheet.setColumnWidth(5, 120);  // 故人名
  sheet.setColumnWidth(6, 150);  // 出身地
  sheet.setColumnWidth(7, 120);  // 日本語レベル
  sheet.setColumnWidth(8, 100);  // ステータス
  sheet.setColumnWidth(9, 200);  // 備考

  // ヘッダー書式
  const headerRange = sheet.getRange(1, 1, 1, 9);
  headerRange.setBackground('#8b4513');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');

  Logger.log('Spreadsheet initialized');
}
