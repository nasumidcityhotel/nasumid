import { NextResponse } from 'next/server';

// ===================================================
// 那須ミッドシティホテル AIコンシェルジュ バックエンド
// 【無料構成の最強パターン】Ollama / VOICEVOX / Google Translate TTS 統合 & 堅牢フォールバック
// ===================================================

const SYSTEM_PROMPT = `
あなたは那須ミッドシティホテルの優秀で温かみのある公式「AIコンシェルジュ（もりなすちゃん）」です。ホテルの宿泊客や検討中の旅行者に対して、丁寧で親切な日本語（または英語）で回答してください。

以下のホテル情報およびデジタルガイドブックの詳細知識を完璧に記憶し、これに基づいてプロフェッショナルかつ親しみやすく回答してください。AIが知らないことを聞かれた際や、緊急の対応が必要なトラブルの際は、絶対に推測で答えず、必ず「客室の電話機より内線9番でフロントまでおかけください」と直接案内してください。情報にないことは推測で話さないでください。

【那須ミッドシティホテル RAGナレッジベース】

◆ 1. 施設・サービス（設備・ビジネス対応・お子様添い寝無料）
- 朝食バイキング無料サービス：宿泊のお客様は全員無料！地産地消の和食（那須御養卵TKG、栃木県産コシヒカリ成熟玄米、特製朝粥、高菜漬け、きくらげ昆布、つぼ漬）や、焼きたてパンを中心とした洋食（自家製クロワッサン、ダイヤモンドギッフェリ、胡麻ロール、スクランブルエッグ等）を提供。
  - 朝食営業時間：6:45〜9:30（ラストオーダー 9:15）。場所：1階レストラン「オールヴォワール」。
  - 外来料金：大人 950円、お子様（4歳〜小学生）650円。
- ビジネス対応：
  - ロビーは無線LAN、客室はWi-Fiおよび有線LANを無料でご利用いただけます。
  - 客室内のデスクは幅2m以上と大きく、デスクライトやコンセント完備。PC作業や書類仕事も快適。
  - 有料コピー・FAXはフロントにて。ズボンプレッサー、消臭スプレー、コインランドリー完備。
  - 全室シモンズ製ベッドを導入。エアコンは各客室で個別コントロール可能です。防音ペアガラス窓を採用。
- お子様の添い寝無料：
  - 小学生以下のお子様は、保護者と同じベッドで添い寝される場合、宿泊料金無料！大人2人小人2人の家族4人でもツインでおとな2人料金のまま宿泊可能。
  - タオル・室内着・スリッパ・アメニティは付属しません（フロントで有料レンタル有）。
  - 4歳〜小学生の添い寝朝食は別途650円。エキストラベッドの追加は不可（デラックスツイン除く）。

◆ 2. 朝食・「究極の卵かけご飯（TKG）」のこだわり
70年の歴史を持つ稲見商店のブランド卵「那須御養卵」を3種類から選んで贅沢に味わえます。
- 那須御養卵 白玉：よもぎ粉末や木酢酸、ファフィア酵母など20種以上ブレンドしたオリジナル配合飼料で育てられ、コクと甘みが強く生臭さがない一番人気。赤玉と同じ飼料で低価格を実現。
- 那須御養卵 赤玉：職人がゆったりとした鶏舎で大切に育てた、プロも支持するプレミアムブランド卵。味の濃厚さが魅力。
- 純国産鶏「さくら」の卵：地元大田原産の唐辛子「栃木三鷹（カプサイシン）」と北海道産ホタテ貝殻を餌に配合し、殻が丈夫で鮮度が長持ち。粘度が高く濃厚で、卵料理がふわふわになります。
- トッピング：小ねぎ、かつお節、佃煮昆布、岩塩（4〜5種類）。卵かけご飯専用醤油を用意。フォトブース「TKG STUDIO」や組み合わせを提案する「TKGコンシェルジュ」完備。稲見商店の卵は地元農場から24時間以内に届く極上の鮮度。

◆ 3. 夕食（1階レストラン「オールヴォワール」）
- 営業時間：17:30〜21:00。お一人様からファミリーまで歓迎。
- ちょい飲みセット（1,500円）：生ビール中・ハイボール・レモンサワーから1杯 ＋ 豊富な料理から3品選択。ビジネスマンに大人気。
- ディナーコース：
  - ステーキコースディナー：オードブル、本日のスープ、パスタ、とちぎ和牛のラウンドステーキ温野菜添え、サラダ、パンかライス、デザート盛り合わせ, デミタスコーヒー。
  - カジュアルディナーコース：アミューズ、スープ、メイン（目鯛のソテー ブールブランソース または 那須高原豚のステーキから1品）、サラダ、パンかライス、デザート、コーヒー。
- 栃木の素材中心メニュー（スープ・サラダ・ライスまたはパン・コーヒー付）：
  - ハンバーグステーキ 200g：那須高原豚と国産牛の合挽き。和風またはマスタードソース。
  - 那須高原豚ロースステーキ 130g：甘みのある脂身が特徴。和風またはマスタードソース。
  - ヤシオマスのバターソテー 120g：栃木特産プレミアムニジマス。
- キッズプレート：煮込みハンバーグ、ポテト、チキンライス、目玉焼き、エビフライ、サラダ、デザート、オレンジジュース。
- 単品メニュー：ボロネーゼ、ペスカトーレ、ペペロンチーノ、ミックスピザ、ピッツァ・クワトロ、ガーリックトースト、野菜カレー、栃木和牛スタミナ丼、豚バラすた丼、栃木和牛すじ温茶漬け。

◆ 4. タクシー・レンタカー移動ガイド（那須塩原駅西口からのアクセス）
- タクシー乗り場：西口徒歩1〜2分。常時数台待機。
  - 黒磯観光タクシー：0287-62-1526
  - ファーストタクシーグループ塩原自動車：0120-818-391 または 0287-63-0444
- レンタカー各社：
  - トヨタレンタカー：0287-65-3100
  - ニッポンレンタカー：050-1712-2823
  - 日産レンタカー：0287-67-1523
  - JR駅レンタカー：0287-65-1680
  - ワンズレンタカー：0287-73-8255
  - オリックスレンタカー：0287-67-1543
  - 那須高原レンタカー：0287-73-5710

◆ 5. 那須・塩原の日帰り温泉ガイド（アクセス・営業時間・特徴）
館内に大浴場はありませんが、周辺の日帰り温泉をご案内します。
- 大鷹の湯（車10分、タクシー15分、10:00〜14:00/18:00〜21:00、大人1000円、小学生600円、ナトリウム-塩化物・炭酸水素塩温泉、茶褐色とろみの希少な五ツ星源泉100%かけ流しモール泉、個室貸切露天風呂有、TEL:0287-36-6802、井口548-350）
- 千本松温泉（車15分、千本松牧場内、13:00〜23:00、無休、平日大人700円/土日祝800円、アルカリ性美肌植物由来天然モール泉、遅い時間（23時）まで営業、TEL:0287-36-1025、千本松799）
- 那須塩原駅前温泉（車5分、徒歩26分、13:00〜21:00、定休第3火曜、大人1000円、子供500円、エメラルドグリーン源泉かけ流し、2020年オープン、内湯・露天・サウナ・水風呂、最寄の温泉、TEL:0287-65-1126、唐杉曽根林41）
- みかえりの郷 彩花の湯（車10〜15分、10:00〜21:00、定休第3水曜、大人700円、小人400円、pH8.8弱アルカリ性ナトリウム-塩化物泉、絶景露天、サウナ、TEL:0287-34-1126、関谷1425-211）
- あしの温泉（那須塩原駅より約20km、大型複合温泉）
- 鹿の湯（車35分、8:00〜18:00、大人500円、小学生300円、乳白色の強い酸性硫黄泉、1300年の歴史を持つ発祥名湯、高コスパ）
- 大丸温泉旅館（車40分、11:30〜15:00、大人1000円、小学生700円、天狗の湯、巨大露天の川の湯）
- 北温泉旅館（車50分、8:30〜17:30、大人700円、小人400円、テルマエロマエロケ地）
- 小鹿の湯（車35分、9:00〜21:00、大人500円、小人300円、鹿の湯源泉使用の比較的空いている穴場）
- 金ちゃん温泉（車40分、11:30〜16:00/17:00〜21:00、昼800円/夜650円、塩化物泉、静かな森の露天、ライトアップ）
- 塩原あかつきの湯（車40分、10:00〜22:00、平日800円/土日祝1000円、pH9.2高アルカリ性温泉、美肌効果、歩行プール）
- 湯っ歩の里（車45分、9:00〜18:00、大人300円、日本最大級 of 足湯）
- 源泉館（車50分、8:00〜18:00、大人800円、濁り湯で日によって色が変わる本格秘湯）
- 温泉への送迎はありません（タクシー・バス案内）。貸切風呂や夜利用は直前確認・予約推奨。タオルは持参推奨（当ホテルのタオルの持ち出し厳禁）。硫黄泉では金属アクセサリーは黒く変色するため外してください。

◆ 6. Aカード現金キャッシュバックシステム
- Aカードとは：全国470以上の加盟ホテルで使え、入会費・年会費・再発行手数料完全無料の最強ポイントカード。
- 還元システム：基本はサービス料・消費税を除く室料の10%ポイント付与。他社サイト経由は5%。当ホテルの「Aカードポイント20%付与プラン」もあり！
- キャッシュバック：5,500ptでその場で現金5,000円、9,700ptで現金10,000円、19,000ptで現金20,000円をフロントで即時キャッシュバック（現金でお渡し）。
- ポイント有効期限：最終ご利用日から1年半。期限内再利用で全ポイントの有効期限が自動延長。
- 申込：チェックイン時にフロントで「Aカードに入会したい」と伝えるだけでその場で即時発行（住所記入不要でらくらくチェックイン）。WEBやアプリから入会登録すると500ポイントプレゼント！カードレスで使えるアプリも対応。

◆ 7. よくあるご質問(FAQ)
- Q. チェックイン、チェックアウト時間は何時ですか？
  - A. チェックインは15:00から、チェックアウトは11:00まででございます。
- Q. 駐車場はありますか？料金はかかりますか？
  - A. はい、屋外の無料駐車場を完備しております。普通車であればご予約不要で無料でご利用いただけます。
- Q. チェックイン前やチェックアウト後に荷物は預けられますか？
  - A. はい、フロントにて無料でお預かりいたします。お気軽にスタッフへお申し付けください。
- Q. クレジットカードや電子マネー、バーコード決済は使えますか？
  - A. はい、各種クレジットカード（VISA, Mastercard, JCB, AMEX, Diners）や各種QRコード決済・電子マネーに対応しております。詳細はお問い合わせください。

【回答のルール】
1. 質問された「特定の1つの事柄」に対してのみ、ピンポイントで回答してください。余計な情報は一切含めないでください。
2. 知らないことは勝手に推測せず、必ず「客室の電話機より内線9番でフロントまでおかけください」と案内してください。
3. 1回の回答は、原則として【1〜2文程度】で簡潔に答えてください。話が長くならないようにしてください。
`;

function optimizeTextForSpeech(text, isEnglish = false) {
  if (!text) return '';
  if (isEnglish) return text.replace(/:/g, ' ');

  let optimized = text;
  optimized = optimized.replace(/6:30/g, '六時半');
  optimized = optimized.replace(/6:45/g, '六時四十五分');
  optimized = optimized.replace(/8:00/g, '八時');
  optimized = optimized.replace(/8:30/g, '八時半');
  optimized = optimized.replace(/9:00/g, '九時');
  optimized = optimized.replace(/9:15/g, '九時十五分');
  optimized = optimized.replace(/9:30/g, '九時半');
  optimized = optimized.replace(/10:00/g, '十時');
  optimized = optimized.replace(/11:00/g, '十一時');
  optimized = optimized.replace(/11:30/g, '十一時半');
  optimized = optimized.replace(/13:00/g, '十三時');
  optimized = optimized.replace(/14:00/g, '十四時');
  optimized = optimized.replace(/15:00/g, '十五時');
  optimized = optimized.replace(/17:00/g, '十七時');
  optimized = optimized.replace(/17:30/g, '十七時半');
  optimized = optimized.replace(/18:00/g, '十八時');
  optimized = optimized.replace(/21:00/g, '二十一時');
  optimized = optimized.replace(/22:00/g, '二十二時');
  optimized = optimized.replace(/22:30/g, '二十二時半');
  optimized = optimized.replace(/23:00/g, '二十三時');
  optimized = optimized.replace(/1階/g, 'いっかい');
  optimized = optimized.replace(/2階/g, 'にかい');
  optimized = optimized.replace(/1,000円/g, '千円');
  optimized = optimized.replace(/完全無料/g, 'かんぜんむりょう');
  optimized = optimized.replace(/Wi-Fi/g, 'ワイファイ');
  optimized = optimized.replace(/0287-67-1400/g, 'れい にー はち なな、ろく なな、いち よん ぜろ ぜろ');
  optimized = optimized.replace(/那須御養卵/g, 'なすごようらん');
  optimized = optimized.replace(/大鷹の湯/g, 'おおたかのゆ');
  optimized = optimized.replace(/Aカード/g, 'えーかーど');
  optimized = optimized.replace(/内線9番/g, 'ないせん きゅうばん');
  
  // 電話番号の完全除去（TTSエンジンがハイフンと数字の連続でクラッシュするため）
  optimized = optimized.replace(/[0-9]{2,4}-[0-9]{2,4}-[0-9]{3,4}/g, '');
  
  // 記号や絵文字の完全除去（TTSエンジンがクラッシュするのを防ぐ）
  optimized = optimized.replace(/🍆/g, '');
  optimized = optimized.replace(/[🌸💎❄️🎀👑🌼⭐🌟✨🦊💡🍀🎵👀👩👨🏨📞📱]/g, '');
  optimized = optimized.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');
  
  // 読み上げ不可能な記号を「空文字」または安全な文字に変換（半角スペースはパースエラーの元なので絶対に入れない）
  optimized = optimized.replace(/[（）()【】『』「」:：]/g, '');
  optimized = optimized.replace(/[〜~]/g, 'から');
  optimized = optimized.replace(/[-ー—]/g, 'ー');

  // もしテキスト内に半角スペースが混入している場合は、読点に置換するか削除する（英語は除く）
  if (!isEnglish) {
    optimized = optimized.replace(/ /g, '、');
    optimized = optimized.replace(/　/g, '、');
  }

  return optimized.trim();
}

function localChromaRAG(query) {
  const sections = SYSTEM_PROMPT.split('◆').slice(1);
  let bestSection = '';
  let maxScore = -1;

  const cleanQuery = query.toLowerCase();

  sections.forEach(sec => {
    let score = 0;
    const title = sec.split('\n')[0].toLowerCase();
    const body = sec.toLowerCase();

    const keywords = {
      breakfast: ['朝食', 'ごはん', 'バイキング', '卵', '御養卵', 'さくら', '卵かけご飯', 'tkg', '稲見商店', 'restaurant', 'オールヴォワール', '洋食', '和食', 'パン', 'サラダ', '朝ごはん', 'モーニング', '食べる'],
      business: ['wi-fi', 'ワイファイ', '有線lan', 'インターネット', 'ビジネス', 'デスク', '作業', 'コンセント', 'コピー', 'fax', 'ズボンプレッサー', 'コインランドリー', 'シモンズ', '仕事', 'パソコン', 'pc', '洗濯', 'ランドリー', 'アイロン'],
      kids: ['子供', 'こども', '添い寝', '小学生', '幼児', '無料', 'アメニティ', 'レンタル', 'エキストラベッド', '家族', '赤ちゃん', 'ベビー', 'キッズ'],
      dinner: ['夕食', 'ディナー', 'ちょい飲み', 'コース', 'ハンバーグ', 'ステーキ', '豚', 'ビール', 'キッズプレート', 'ピザ', 'パスタ', '晩御飯', '夜ごはん', '夕飯', '酒', '飲む', '居酒屋'],
      access: ['タクシー', 'レンタカー', 'アクセス', '西口', '乗り場', '駅', '行き方', '電車', 'バス', '新幹線', '徒歩', '近い'],
      onsen: ['温泉', 'お風呂', '大浴場', '大鷹の湯', 'モール泉', '千本松温泉', '彩花の湯', '鹿の湯', '硫黄泉', '日帰り', '最寄', '近く', '風呂', 'サウナ', '露天風呂', '入浴', '銭湯'],
      acard: ['aカード', 'キャッシュバック', '還元', 'ポイント', '現金', '入会', '無料', 'フロント', '登録', '会員'],
      faq: ['駐車場', '車', '駐車', 'パーキング', 'チェックイン', 'チェックアウト', '時間', '荷物', '預かり', 'クレジットカード', '電子マネー', '決済', 'バーコード', 'pay', 'クルマ', 'くるま', '停め', 'とめ', 'クレカ', 'ペイ', '支払い']
    };

    Object.keys(keywords).forEach(key => {
      const words = keywords[key];
      const matchCount = words.filter(w => cleanQuery.includes(w)).length;
      if (matchCount > 0) {
        if (body.includes(key) || title.includes(key)) {
          score += matchCount * 2;
        } else {
          score += matchCount;
        }
      }
    });

    // 辞書漏れを防ぐための動的TF (Term Frequency) スコアリング
    // ユーザーの質問から2文字以上の単語（漢字・カタカナ・ひらがな・英数字）を抽出し、本文での出現回数をスコア化
    const ngrams = cleanQuery.match(/[一-龯ぁ-んァ-ヶa-z0-9]{2,}/g) || [];
    ngrams.forEach(gram => {
      // 短すぎる一般的な単語（ある、ですか等）は除外
      if (['します', 'ですか', 'あります', 'について', 'ください'].includes(gram)) return;
      const count = (body.match(new RegExp(gram, 'g')) || []).length;
      score += count * 0.5;
    });

    if (score > maxScore && score > 0) {
      maxScore = score;
      bestSection = sec;
    }
  });

  return bestSection ? `【関連する知識コンテキスト】\n◆ ${bestSection.trim()}\n\n` : '';
}

function localChromaRAGRaw(query) {
  const sections = SYSTEM_PROMPT.split('◆').slice(1);
  let bestSection = '';
  let maxScore = -1;

  const cleanQuery = query.toLowerCase();

  sections.forEach(sec => {
    let score = 0;
    const lines = sec.trim().split('\n');
    if (lines.length === 0) return;
    const title = lines[0].toLowerCase();
    const body = sec.toLowerCase();

    const keywords = {
      breakfast: ['朝食', 'ごはん', 'バイキング', '卵', '御養卵', 'さくら', '卵かけご飯', 'tkg', '稲見商店', 'レストラン', 'オールヴォワール', '洋食', '和食', 'パン', 'サラダ', '営業時間', '料金', '外来', '何時', '朝ごはん', 'モーニング', '食べる'],
      business: ['wi-fi', 'ワイファイ', '有線lan', 'インターネット', 'ビジネス', 'デスク', '作業', 'コンセント', 'コピー', 'fax', 'ズボンプレッサー', 'コインランドリー', 'シモンズ', 'ベッド', 'エアコン', '防音', '出張', '仕事', 'パソコン', 'pc', '洗濯', 'ランドリー', 'アイロン'],
      kids: ['子供', 'こども', '添い寝', '小学生', '幼児', '無料', 'アメニティ', 'レンタル', 'エキストラベッド', '家族', 'ツイン', '赤ちゃん', 'ベビー', 'キッズ'],
      dinner: ['夕食', 'ディナー', 'ちょい飲み', 'コース', 'ハンバーグ', 'ステーキ', '豚', 'ビール', 'キッズプレート', 'ピザ', 'パスタ', '丼', '茶漬け', 'レストラン', 'オールヴォワール', '営業時間', '晩御飯', '夜ごはん', '夕飯', '酒', '飲む', '居酒屋'],
      access: ['タクシー', 'レンタカー', 'アクセス', '西口', '乗り場', '駅', '行き方', '電車', 'バス', '新幹線', '徒歩', '近い'],
      onsen: ['温泉', 'お風呂', '大浴場', '大鷹の湯', 'モール泉', '千本松温泉', '彩花の湯', '鹿の湯', '硫黄泉', '日帰り', '最寄', '近く', '駅前温泉', '露天風呂', 'サウナ', '風呂', '入浴', '銭湯'],
      acard: ['aカード', 'キャッシュバック', '還元', 'ポイント', '現金', '入会', '無料', 'フロント', '登録', 'アプリ', '会員'],
      faq: ['駐車場', '車', '駐車', 'パーキング', 'チェックイン', 'チェックアウト', '時間', '荷物', '預かり', 'クレジットカード', '電子マネー', '決済', 'バーコード', 'pay', 'クルマ', 'くるま', '停め', 'とめ', 'クレカ', 'ペイ', '支払い']
    };

    Object.keys(keywords).forEach(key => {
      const words = keywords[key];
      const matchCount = words.filter(w => cleanQuery.includes(w)).length;
      if (matchCount > 0) {
        if (body.includes(key) || title.includes(key)) {
          score += matchCount * 3;
        } else {
          score += matchCount;
        }
      }
    });

    // 動的TFスコアリング（キーワード辞書にない単語のセーフティネット）
    const ngrams = cleanQuery.match(/[一-龯ぁ-んァ-ヶa-z0-9]{2,}/g) || [];
    ngrams.forEach(gram => {
      if (['します', 'ですか', 'あります', 'について', 'ください', '教えて', 'ホテル'].includes(gram)) return;
      const count = (body.match(new RegExp(gram, 'g')) || []).length;
      score += count * 0.8; // 生のRAGなので少し重みをつける
    });

    if (score > maxScore && score > 0) {
      maxScore = score;
      bestSection = sec;
    }
  });

  return bestSection ? bestSection.trim() : null;
}

function formatRagResponse(section, query) {
  const lines = section.split('\n');
  const titleLine = lines[0];
  const q = query.toLowerCase();
  
  // 0. 挨拶
  if (q.includes('こんにちは') || q.includes('こんばんは') || q.includes('おはよう') || q.includes('はじめまして') || q.includes('ハロー') || q === 'やあ' || q === 'どうも') {
    return "こんにちは！那須ミッドシティホテル公式マスコット「もりなすちゃん」です🍆 何でもお気軽にお尋ねくださいね。";
  }

  // 1. 朝食・TKG・卵の種類
  if (titleLine.includes('朝食') || titleLine.includes('卵かけご飯') || titleLine.includes('tkg') || q.includes('朝食') || q.includes('ごはん') || q.includes('卵') || q.includes('tkg')) {
    if (q.includes('何時') || q.includes('営業時間') || q.includes('時間')) {
      return "朝食の営業時間は、毎朝の6:45から9:30まで（ラストオーダー 9:15）となっております。1階レストラン「オールヴォワール」にてご提供しております。";
    }
    if (q.includes('料金') || q.includes('いくら') || q.includes('外来') || q.includes('無料')) {
      return "ご宿泊のお客様の朝食バイキング料金は【完全無料】でございます！なお、外来（ご宿泊以外）のお客様は大人950円、4歳〜小学生のお子様は650円でご利用いただけます。";
    }
    if (q.includes('白玉') || q.includes('赤玉') || q.includes('さくら') || q.includes('御養卵') || q.includes('種類')) {
      if (q.includes('白玉')) {
        return "那須御養卵の「白玉」は、コクと甘みが強く生臭さが一切ない、当ホテル一番人気の卵です。よもぎ粉末や木酢酸など20種以上のオリジナル飼料で健康的に育てられています。";
      }
      if (q.includes('赤玉')) {
        return "那須御養卵の「赤玉」は、プロのシェフやパティシエから絶大な支持を得ているプレミアムなブランド卵です。味の濃厚さと豊かな甘みが最大の特徴です。";
      }
      if (q.includes('さくら')) {
        return "純国産鶏「さくら」の卵は、地元大田原産唐辛子「栃木三鷹」やホタテ貝殻をブレンドした餌で育ち、殻が硬く鮮度が長持ちします。濃厚な粘りとコクがあり、卵料理がふわふわに仕上がります。";
      }
      return "朝食では、70年の歴史を持つ稲見商店の極上ブランド卵「那須御養卵」の【白玉・赤玉・さくら】の3種類からお好きな卵を選んで、贅沢な食べ比べをお楽しみいただけます！";
    }
    if (q.includes('トッピング') || q.includes('かける')) {
      return "究極のTKGトッピングとして、小ねぎ、かつお節、佃煮昆布、岩塩などの約4〜5種類のプレミアムな具材と、特選の卵かけご飯専用醤油をご用意しております。";
    }
    if (q.includes('メニュー') || q.includes('おかず') || q.includes('和食') || q.includes('洋食')) {
      return "朝食バイキングでは、和食（那須御養卵TKG、栃木産こしひかりの成熟玄米、特製朝粥、高菜漬け、きくらげ昆布等）や、洋食（自家製クロワッサン、ダイヤモンドギッフェリ、胡麻ロール、スクランブルエッグ）、サラダ・シリアルをご用意しております。";
    }
    return "朝食は6:45〜9:30に1階オールヴォワールにて【宿泊者全員無料】のバイキングを提供しております！稲見商店の「那須御養卵」3種（白玉・赤玉・さくら）から選べる究極の卵かけご飯や自家製クロワッサンをぜひお楽しみください。";
  }

  // 2. 夕食・ディナーコース・ちょい飲み
  if (titleLine.includes('夕食') || titleLine.includes('オールヴォワール') || q.includes('夕食') || q.includes('ディナー') || q.includes('レストラン') || q.includes('夜の食事')) {
    if (q.includes('時間') || q.includes('何時') || q.includes('営業時間')) {
      return "夕食の営業時間は、17:30から21:00まででございます。1階レストラン「オールヴォワール」にてお待ちしております。";
    }
    if (q.includes('ちょい飲み') || q.includes('おつまみ') || q.includes('ビール') || q.includes('セット')) {
      return "ビジネスマンに大人気の「ちょい飲みセット」は1,500円でご提供しております！生ビール・ハイボール・レモンサワーから1杯と、豊富なおつまみメニューからお好きな3品をお選びいただけます。";
    }
    if (q.includes('コース') || q.includes('ステーキ') || q.includes('和牛')) {
      if (q.includes('とちぎ和牛') || q.includes('ステーキコース')) {
        return "「ステーキコースディナー」は、とちぎ和牛のラウンドステーキ温野菜添えをメインに、オードブル、スープ、パスタ、サラダ、パン/ライス、デザート、デミタスコーヒーがセットになった特別なコースです。";
      }
      return "夕食コースは、贅沢な「ステーキコースディナー」と、メイン（目鯛のソテーまたは那須高原豚のステーキ）が選べる「カジュアルディナーコース」の2種類をご用意しております。";
    }
    if (q.includes('豚') || q.includes('ハンバーグ') || q.includes('ヤシオマス')) {
      return "栃木の素材メニューとして、那須高原豚と国産牛の「ハンバーグステーキ200g」、「那須高原豚ロースステーキ130g」、「ヤシオマスのバターソテー120g」をご用意。すべてスープ・サラダ・ライス/パン・コーヒー付です。";
    }
    if (q.includes('カレー') || q.includes('パスタ') || q.includes('ピザ') || q.includes('スタ丼') || q.includes('茶漬け')) {
      return "単品アラカルトとして、ボロネーゼやペスカトーレなどのパスタ、ピザ、彩り豊かな野菜カレー、栃木和牛スタミナ丼、豚バラすた丼、栃木和牛すじ温茶漬けなど多彩にご用意しております。";
    }
    return "夕食は17:30〜21:00に1階レストラン「オールヴォワール」にて営業しております。ビジネスマンに人気の「ちょい飲みセット（¥1,500）」や、とちぎ和牛ステーキコース、パスタ、ピザ、スタミナ丼など、地元の食材を活かした豊富なメニューがございます。";
  }

  // 3. 日帰り温泉
  if (titleLine.includes('温泉') || titleLine.includes('お風呂') || titleLine.includes('大浴場') || q.includes('温泉') || q.includes('お風呂') || q.includes('大浴場') || q.includes('銭湯')) {
    if (q.includes('大鷹の湯') || q.includes('おおたか')) {
      return "一番人気の「大鷹の湯」は車で約10分。日帰り時間は10:00〜14:00/18:00〜21:00。料金は大人1,000円。五ツ星源泉100%掛け流しの茶褐色でとろみがある極上モール泉で、日帰りでも個室の貸切露天風呂が利用可能です。";
    }
    if (q.includes('千本松') || q.includes('牧場')) {
      return "「千本松温泉」は車で約15分、千本松牧場内にございます。13:00〜23:00（最終受付22:30）まで営業しており、遅い時間のリフレッシュに最適です。料金は平日大人700円、土日祝800円。アルカリ性美肌のモール泉です。";
    }
    if (q.includes('最寄') || q.includes('一番近い') || q.includes('駅前温泉')) {
      return "当ホテルから最も近い温泉は、車で約5分（徒歩26分）の「那須塩原駅前温泉」です。営業時間は平日13:00〜21:00（第3火曜休）、大人1,000円。2020年にオープンした綺麗な施設で、内湯・露天・サウナ・水風呂を完備しています。";
    }
    if (q.includes('彩花の湯') || q.includes('みかえり')) {
      return "「みかえりの郷 彩花の湯」は車で約10〜15分、もみじ谷大吊橋の近くにあります。10:00〜21:00（第3水曜休）営業で大人700円。山々を見渡せる絶景の露天風呂とサウナが人気です。";
    }
    if (q.includes('鹿の湯')) {
      return "歴史的名湯「鹿の湯」は車で約35分。営業時間は8:00〜18:00、大人500円と非常にリーズナブル。乳白色の強い酸性硫黄泉で、1300年の歴史を持つ那須温泉発祥の地です。";
    }
    if (q.includes('テルマエ') || q.includes('北温泉') || q.includes('映画')) {
      return "映画『テルマエ・ロマエ』のロケ地として有名な「北温泉旅館」は車で約50分。8:30〜17:30営業で大人700円。天狗伝説が残る、江戸時代のような風情あふれるレトロな秘湯です。";
    }
    if (q.includes('川の湯') || q.includes('大丸')) {
      return "「大丸温泉旅館」は車で約40分。日帰りは11:30〜15:00、大人1,000円。標高1,300メートルの山中にあり、川そのものが巨大な自然の露天風呂となっている「川の湯」がダイナミックで大人気です。";
    }
    if (q.includes('タオル') || q.includes('持参') || q.includes('アメニティ')) {
      return "多くの温泉施設でタオルの販売やレンタルがございますが、あらかじめご自身で持参されることをおすすめします。なお、当ホテルのタオルの持ち出しはご遠慮ください。";
    }
    if (q.includes('注意点') || q.includes('硫黄') || q.includes('肌')) {
      return "硫黄泉の温泉に入る際は、金属アクセサリーが真っ黒に変色してしまいますので必ず外してください。また、肌が弱い方は入浴後にシャワーで軽く温泉成分を流すことをおすすめします。";
    }
    if (q.includes('送迎') || q.includes('シャトル')) {
      return "あいにく当ホテルから各温泉施設への送迎バス等はございません。フロントにてタクシー手配や公共バスの時刻表案内を行っておりますのでお気軽にお声がけください。";
    }
    return "当ホテル館内に大浴場はございませんが、車で5分の「那須塩原駅前温泉」（エメラルドグリーン源泉・サウナ）、車10分で五ツ星源泉の「大鷹の湯」、車15分で23時まで営業の「千本松温泉」など、極上の日帰り温泉を多数ご紹介可能です！";
  }

  // 4. タクシー・レンタカー・アクセス
  if (titleLine.includes('タクシー') || titleLine.includes('レンタカー') || titleLine.includes('アクセス') || q.includes('タクシー') || q.includes('レンタカー') || q.includes('移動') || q.includes('電話番号')) {
    if (q.includes('タクシー')) {
      return "那須塩原駅西口から徒歩1〜2分にタクシー乗り場があり常時待機しております。黒磯観光タクシー（0287-62-1526）や、フリーダイヤルの塩原自動車（0120-818-391 / 0287-63-0444）がご利用いただけます。";
    }
    if (q.includes('レンタカー') || q.includes('トヨタ') || q.includes('ニッポン') || q.includes('日産')) {
      return "那須塩原駅西口すぐにレンタカー各社がございます。トヨタ（0287-65-3100）、ニッポン（050-1712-2823）、日産（0287-67-1523）、JR駅（0287-65-1680）、オリックス（0287-67-1543）等がございます。";
    }
    return "那須塩原駅西口（徒歩1〜2分）にタクシー乗り場（黒磯観光 0287-62-1526、塩原自動車 0120-818-391）のほか、トヨタ、ニッポン、日産、JR駅、オリックス、ワンズなどの駅前レンタカー各社が揃っております。";
  }

  // 5. お子様・添い寝
  if (titleLine.includes('添い寝') || titleLine.includes('子供') || q.includes('子供') || q.includes('こども') || q.includes('添い寝') || q.includes('幼児') || q.includes('ファミリー') || q.includes('家族')) {
    if (q.includes('無料') || q.includes('料金')) {
      return "小学生以下のお子様が、保護者の方と同じベッドで添い寝される場合、宿泊料金は【完全無料】となります！ツインルームでおとな2人の通常料金のまま、ご家族4人でもお得にお泊りいただけます。";
    }
    if (q.includes('アメニティ') || q.includes('タオル') || q.includes('スリッパ')) {
      return "添い寝のお子様には、タオル・室内着・スリッパ・歯ブラシなどのアメニティ類は付属いたしませんのでご持参をお願いします。なお、有料でのアメニティレンタルもフロントにて承ります。";
    }
    if (q.includes('朝食') || q.includes('ごはん') || q.includes('バイキング')) {
      return "4歳〜小学生の添い寝のお子様が朝食バイキングをご利用される場合は、別途650円を頂戴しております。（3歳以下の幼児のお子様は無料です）。";
    }
    if (q.includes('ベッド') || q.includes('エキストラ')) {
      return "あいにく、デラックスツインルームを除き、お部屋へのエキストラベッドの追加は承ることができませんのでご了承ください。";
    }
    return "小学生以下のお子様はベッド添い寝の場合【宿泊料金無料】です！ご家族4人（大人2名・添い寝2名）でもおとな2名分のツイン料金のままご宿泊いただけます。ただしお子様用アメニティは付きませんのでご持参いただくか、フロントで有料レンタルをご利用ください。4歳以上小学生のお子様は朝食代のみ別途650円を頂戴します。";
  }

  // 6. Aカード
  if (titleLine.includes('Aカード') || titleLine.includes('キャッシュバック') || q.includes('aカード') || q.includes('キャッシュバック') || q.includes('ポイント') || q.includes('現金') || q.includes('カード')) {
    if (q.includes('いくら') || q.includes('キャッシュバック') || q.includes('還元') || q.includes('率')) {
      return "Aカードは、5,500ポイント貯まるとフロントで【現金5,000円】、9,700ポイントで【現金10,000円】、19,000ポイントで【現金20,000円】をその場で即座に現金手渡しでキャッシュバックいたします！貯めるほど還元率がアップします。";
    }
    if (q.includes('付与') || q.includes('プラン')) {
      return "基本のポイント付与率は宿泊料金（税抜室料）の10%以上です。他社ネット予約経由は5%となりますが、当ホテルでは特別に【Aカードポイント20%付与プラン】もご用意しております！";
    }
    if (q.includes('無料') || q.includes('年会費') || q.includes('登録')) {
      return "Aカードは入会金・年会費・再発行手数料がすべて【完全無料】です！チェックイン時にフロントで「Aカードに入会したい」とお伝えいただければ、その場で即時に無料発行いたします。";
    }
    if (q.includes('期限') || q.includes('有効期限')) {
      return "ポイントの有効期限は、最終ご利用日から1年半（18ヶ月）です。有効期限内に全国のいずれかの加盟ホテルで再度カードをご利用いただければ、全ポイントの期限が自動で延長されます。";
    }
    if (q.includes('アプリ') || q.includes('スマホ') || q.includes('web') || q.includes('ダウンロード')) {
      return "Aカードは便利なスマートフォンアプリにも対応しており、カードレスですぐに使えます。WEB公式サイトやアプリから事前に入会申し込みをしていただくと、もれなく【500ポイント】がプレゼントされます！";
    }
    return "Aカードは入会金・年会費無料の最強ポイントカードです！宿泊で10%（当ホテル独自の20%プランもあり）ポイントが貯まり、5,500ポイントで現金5,000円、9,700ポイントで現金1万円をフロントで即座に【現金手渡しキャッシュバック】いたします。フロントで即時発行可能です。";
  }

  // 7. よくあるご質問(FAQ) & 施設一般
  if (titleLine.includes('質問') || titleLine.includes('FAQ') || q.includes('質問') || q.includes('faq') || q.includes('時間') || q.includes('何時') || q.includes('チェックイン') || q.includes('チェックアウト') || q.includes('駐車場') || q.includes('荷物') || q.includes('支払') || q.includes('決済') || q.includes('カード') || q.includes('wi-fi') || q.includes('ワイファイ') || q.includes('ネット') || q.includes('ベッド') || q.includes('デスク')) {
    if (q.includes('チェックイン') || q.includes('チェックアウト') || q.includes('時間')) {
      if (q.includes('アウト')) {
        return "チェックアウト時間は、午前11:00までとなっております。";
      }
      if (q.includes('イン')) {
        return "チェックイン時間は、午後15:00からとなっております。深夜の到着にも対応いたします。";
      }
      return "当ホテルのチェックイン時間は15:00から、チェックアウト時間は午前11:00まででございます。";
    }
    if (q.includes('駐車場') || q.includes('車') || q.includes('料金')) {
      return "敷地内に屋外の無料駐車場を完備しております。普通乗用車であれば、ご予約不要で【完全無料】にてご利用いただけます。";
    }
    if (q.includes('荷物') || q.includes('預り') || q.includes('チェックイン前') || q.includes('チェックアウト後')) {
      return "はい、チェックイン前およびチェックアウト後でも、フロントにてお客様のお荷物を【無料】で大切にお預かりいたします。お気軽にスタッフへお申し付けください。";
    }
    if (q.includes('支払') || q.includes('クレジットカード') || q.includes('電子マネー') || q.includes('決済') || q.includes('qrコード')) {
      return "お支払いは、各種クレジットカード（VISA, MasterCard, JCB, AMEX, Diners）のほか、各種QRコード決済・電子マネーに対応しております。";
    }
    if (q.includes('デスク') || q.includes('ビジネス') || q.includes('ネット') || q.includes('wi-fi') || q.includes('ワイファイ')) {
      return "全客室にWi-Fiおよび有線LANを無料で完備。客室のデスクは幅2メートル以上の非常にワイドな設計で、PCライトやコンセントも備わっておりPC作業に最適です。ロビーは無料無線LANが使えます。";
    }
    if (q.includes('ベッド') || q.includes('エアコン') || q.includes('防音') || q.includes('窓')) {
      return "全室に快適な寝心地のシモンズ製ベッドを導入しております。また、エアコンは各室個別コントロール可能で、窓は開閉可能な防音ペアガラスを採用しており快適にお休みいただけます。";
    }
  }

  // 該当なし
  const contentLines = lines.slice(1).map(l => l.trim().replace(/^-\s*/, '')).filter(l => l.length > 0);
  if (contentLines.length > 0) {
    return `ご質問ありがとうございます！お調べした那須ミッドシティホテルの公式情報をご案内いたします。 ${contentLines.slice(0, 2).join(' ')}`;
  }
  return "ご質問ありがとうございます。あいにくその件に関する詳細なデータが私の手元にございません。客室の電話機より内線9番でフロントまでおかけいただければ、スタッフが喜んで詳しくご案内いたします。";
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST failed ${res.status}: ${text}`);
  }
  return res.json();
}

// 超安定な VOICEVOX v2 API
async function getVoicevoxAudioV2(text, speaker, apiKey = '') {
  let url = `https://api.tts.quest/v2/voicevox/synthesis?speaker=${speaker}&text=${encodeURIComponent(text)}`;
  if (apiKey) {
    url += `&key=${apiKey}`;
  }
  console.log(`[Next.js API] Calling stable tts.quest v2 API: ${url.replace(apiKey, 'REDACTED')}`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36' }
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`v2 API failed. Status: ${res.status}, Response: ${errText}`);
    throw new Error(`v2 API returned status ${res.status}`);
  }
  
  const json = await res.json();
  if (!json.success || !json.wavDownloadUrl) {
    throw new Error("v2 API returned error or missing wavDownloadUrl");
  }

  let finalUrl = json.wavDownloadUrl;
  if (finalUrl.startsWith('//')) finalUrl = 'https:' + finalUrl;
  
  // 確実な再生のため、サーバー側で完全にダウンロードしてからBase64で返す
  const audioRes = await fetch(finalUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  if (!audioRes.ok) throw new Error("Failed to download wav audio from v2 API");
  const arrayBuffer = await audioRes.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

// VOICEVOX v3 API
async function getVoicevoxAudioV3(text, speaker, apiKey) {
  const url = `https://api.tts.quest/v3/voicevox/synthesis?key=${apiKey}&text=${encodeURIComponent(text)}&speaker=${speaker}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36' }
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`v3 API init failed. Status: ${res.status}, Response: ${errText}`);
    throw new Error("VOICEVOX synthesis init failed");
  }
  const json = await res.json();
  
  if (!json.success) throw new Error("VOICEVOX synthesis init error");
  
  let audioUrl = json.mp3DownloadUrl || json.wavDownloadUrl || json.mp3Url;
  if (audioUrl && audioUrl.startsWith('//')) audioUrl = 'https:' + audioUrl;
  const statusUrl = json.audioStatusUrl;

  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const statRes = await fetch(statusUrl);
    if (!statRes.ok) continue;
    const statJson = await statRes.json();
    
    if (statJson.isAudioReady) {
      // 確実な再生のためサーバー側でダウンロード
      const audioRes = await fetch(audioUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (!audioRes.ok) throw new Error("Download generated audio failed");
      const arrayBuffer = await audioRes.arrayBuffer();
      return Buffer.from(arrayBuffer).toString('base64');
    }
    if (statJson.isAudioError) {
      throw new Error("VOICEVOX synthesis error");
    }
  }
  throw new Error("VOICEVOX synthesis timeout");
}

// 究極の第3フォールバック：su-shiki.com (直接WAVを返すシンプルな無料API)
async function getVoicevoxAudioSuShiki(text, speaker) {
  const url = `https://api.voicevox.su-shiki.com/v1/audio/?text=${encodeURIComponent(text)}&speaker=${speaker}`;
  console.log(`[Next.js API] Calling fallback su-shiki API...`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  if (!res.ok) {
    throw new Error(`su-shiki API failed with status ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

export async function POST(req) {
  try {
    const { text = '', voice = 'ja-JP-Chirp3-HD-Aoede', ttsOnly = false } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const ragContext = localChromaRAG(text);
    console.log(`[Next.js API RAG] Extracted context.`);

    let answerText = text;

    if (!ttsOnly) {
      let isOllamaSuccess = false;
      
      try {
        console.log("[Next.js API] Attempting Ollama local generation...");
        const ollamaRes = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3',
            prompt: `${SYSTEM_PROMPT}\n\n${ragContext}\nユーザーの質問: ${text}\nAIコンシェルジュの回答:`,
            stream: false,
            options: { temperature: 0.2, num_predict: 200 }
          })
        });

        if (ollamaRes.ok) {
          const ollamaData = await ollamaRes.json();
          if (ollamaData.response) {
            answerText = ollamaData.response.trim();
            isOllamaSuccess = true;
            console.log("[Next.js API] Generated answer successfully via local Ollama.");
          }
        }
      } catch (ollamaErr) {
        console.warn("[Next.js API] Local Ollama not available. Trying Gemini Cloud...");
      }

      if (!isOllamaSuccess) {
        console.log("[Next.js API] Ollama failed or not available. Using complete local RAG logic (Gemini bypassed)...");
        const rawRagSection = localChromaRAGRaw(text);
        if (rawRagSection) {
          answerText = formatRagResponse(rawRagSection, text);
          console.log(`[Next.js API] Generated highly accurate local RAG response: ${answerText}`);
        } else {
          const isEnglish = voice.toLowerCase().includes('en-us');
          answerText = isEnglish 
            ? "Thank you for your question. As I don't have that specific information right now, please call the front desk at extension 9 from your room phone, and our staff will assist you."
            : "ご質問ありがとうございます。あいにくその件につきましては詳細なデータが手元にございません。客室の電話機より内線9番でフロントまでおかけいただければ、スタッフが喜んで詳しくご案内いたします。";
          console.log(`[Next.js API] No RAG match. Bypassed Gemini and used default front desk guide.`);
        }
      }
    }

    const isEnglish = voice.toLowerCase().includes('en-us');
    const speechReadyText = optimizeTextForSpeech(answerText, isEnglish);

    let audioContent = null;

    // ttsOnly が true の場合のみ、音声生成を行う（二重生成によるAPIスパム判定を防ぐため）
    if (ttsOnly) {
      let voicevoxSpeaker = 2; // 四国めたん
      const vLower = voice.toLowerCase();
      if (vLower.includes('achernar') || vLower.includes('aoi')) voicevoxSpeaker = 8; // 春日部つむぎ
      else if (vLower.includes('zephyr') || vLower.includes('mei')) voicevoxSpeaker = 10; // 雨晴はう

      let isVoicevoxSuccess = false;
      const VOICEVOX_API_KEY = (process.env.VOICEVOX_API_KEY || 'j-81N719n201661').trim();

      // 1. 最優先：ローカル VOICEVOX（圧倒的に早いため、立ち上がっている場合はこれを最優先）
      if (!isVoicevoxSuccess) {
        try {
          console.log(`[Next.js API] Synthesizing via local VOICEVOX...`);
          const queryRes = await fetch(`http://localhost:50021/audio_query?text=${encodeURIComponent(speechReadyText)}&speaker=${voicevoxSpeaker}`, { method: 'POST' });
          if (queryRes.ok) {
            const queryJson = await queryRes.json();
            const synthRes = await fetch(`http://localhost:50021/synthesis?speaker=${voicevoxSpeaker}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            if (synthRes.ok) {
              const arrayBuffer = await synthRes.arrayBuffer();
              audioContent = Buffer.from(arrayBuffer).toString('base64');
              isVoicevoxSuccess = true;
              console.log(`[Next.js API] Local VOICEVOX generation successful!`);
            }
          }
        } catch (err) {
          console.warn("[Next.js API] Local VOICEVOX not available. Falling back to cloud APIs...");
        }
      }

      // 2. 第二優先：VOICEVOX_API_KEY を使用した tts.quest v2 API
      if (!isVoicevoxSuccess && VOICEVOX_API_KEY) {
        try {
          console.log(`[Next.js API] Synthesizing via tts.quest v2 API. Speaker ID: ${voicevoxSpeaker}`);
          audioContent = await getVoicevoxAudioV2(speechReadyText, voicevoxSpeaker, VOICEVOX_API_KEY);
          isVoicevoxSuccess = true;
        } catch (err) {
          console.error('[Next.js API] v2 API failed. Trying v3...', err);
        }
      }

      // 3. 第三優先：VOICEVOX_API_KEY を使用した tts.quest v3 API
      if (!isVoicevoxSuccess && VOICEVOX_API_KEY) {
        try {
          console.log(`[Next.js API] Synthesizing via tts.quest v3 API...`);
          audioContent = await getVoicevoxAudioV3(speechReadyText, voicevoxSpeaker, VOICEVOX_API_KEY);
          isVoicevoxSuccess = true;
        } catch (err) {
          console.error('[Next.js API] v3 API failed:', err);
        }
      }

      // 4. 第四優先：無料枠の tts.quest v2 API (キーなし)
      if (!isVoicevoxSuccess) {
        try {
          console.log(`[Next.js API] Synthesizing via keyless v2 API...`);
          audioContent = await getVoicevoxAudioV2(speechReadyText, voicevoxSpeaker);
          isVoicevoxSuccess = true;
        } catch (err) {
          console.error('[Next.js API] Keyless v2 API failed:', err);
        }
      }

      // 5. 最終防衛ライン：su-shiki.com API
      if (!isVoicevoxSuccess) {
        try {
          console.log(`[Next.js API] Synthesizing via su-shiki API...`);
          audioContent = await getVoicevoxAudioSuShiki(speechReadyText, voicevoxSpeaker);
          isVoicevoxSuccess = true;
        } catch (err) {
          console.error('[Next.js API] ALL VOICEVOX APIS FAILED:', err);
        }
      }
    }

    return NextResponse.json({
      answer: answerText,
      audio: audioContent,
      mimeType: 'audio/mp3'
    });

  } catch (err) {
    console.error('Next.js Handler Error:', err);
    return NextResponse.json({ error: err.toString() }, { status: 500 });
  }
}
