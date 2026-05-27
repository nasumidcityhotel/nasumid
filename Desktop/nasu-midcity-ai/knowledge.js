window.HOTEL_KNOWLEDGE = {
  hotel: {
    name: "那須ミッドシティホテル",
    officialUrl: "https://www.nasu-midcity.com/",
    guideUrl: "https://nasu-midcity-guide.netlify.app/",
    concept: "那須塩原駅徒歩3分・無料駐車場を活かし、観光・出張・温泉巡り・地域移動を支える『那須の拠点ホテル』",
    address: "栃木県那須塩原市方京1-1-10",
    phone: "0287-67-1400",
    dataIntegration: "PMSや主要システムとの外部連携API接続が不可（または高額）なため、メール解析、CSV手動アップロード、Webスクレイピングを活用した非API型データ連携を標準採用とする。"
  },
  // 客室QRコード案内URLリスト
  qrGuides: [
    { name: "客室総合ガイド", url: "https://nasu-midcity-guide.netlify.app/", category: "総合案内", desc: "客室QRから開く総合コンシェルジュ。館内、朝食、夕食、温泉、観光など全てのハブとなるメインページ。" },
    { name: "館内インフォメーション", url: "https://nasu-midcity-info.netlify.app/", category: "客室設備", desc: "客室Wi-Fiパスワード、自動販売機、ランドリー、製氷機、空調、アメニティなどの利用案内。" },
    { name: "夕食案内", url: "https://nasu-midcity-dinner.netlify.app/", category: "料飲", desc: "ホテル周辺の夕食・飲食店マップや提携店舗の案内。外食派や出張ビジネスマン向け。" },
    { name: "朝食案内", url: "https://nasu-midcity-breakfast.netlify.app/", category: "料飲", desc: "無料朝食バイキング（焼きたてパン、地産地消の和洋バイキング）のこだわりや時間・混雑案内。" },
    { name: "TKG（卵かけご飯）案内", url: "https://nasu-midcity-tkg.netlify.app/", category: "料飲", desc: "朝食名物の極上ブランド卵「那須御養卵」を使った卵かけご飯の絶品レシピとこだわり解説。" },
    { name: "周辺観光案内", url: "https://nasu-area-guide.netlify.app/", category: "観光", desc: "那須ガーデンアウトレット、那須どうぶつ王国など主要スポットへの移動時間やおすすめルート。" },
    { name: "温泉案内", url: "https://nasu-onsen-guide.netlify.app/", category: "観光・スパ", desc: "那須・塩原エリアの日帰り温泉や共同浴場マップ、ホテル提携の温泉施設などのアクセス紹介。" },
    { name: "キャッシュバック案内", url: "https://nasu-midcity-cashback.netlify.app/", category: "会員特典", desc: "公式予約限定の「Aカード」キャッシュバック（還元率10%〜）の仕組みと会員登録メリットの案内。" },
    { name: "よくある質問 (FAQ)", url: "https://nasu-midcity-faq.netlify.app/", category: "サポート", desc: "荷物預かり、駐車場（無料）、チェックイン前後の手続き、アメニティ、お子様対応などFAQ。" }
  ],
  // AI役員組織の構成定義
  aiOrganization: {
    title: "那須ミッドシティホテル AI組織図",
    subtitle: "AIの力で「選ばれる那須の拠点ホテル」へ",
    goals: [
      "経営の最終判断・投資対効果 of 審査",
      "那須の拠点ホテルとしての価値最大化",
      "AIによる業務効率化と利益最大化",
      "顧客満足・リピート率の向上"
    ],
    sharedDatabase: [
      { name: "予約データ", method: "メール解析", desc: "OTAや予約エンジンからの通知メールを自動パース", freq: "リアルタイム" },
      { name: "顧客データ", method: "メール解析", desc: "予約メールから宿泊顧客プロフィールを自動抽出", freq: "リアルタイム" },
      { name: "宿泊データ", method: "CSVインポート", desc: "PMSから出力した宿泊日報CSVをインポート", freq: "毎日1回" },
      { name: "レストランデータ", method: "CSVインポート", desc: "レストランPOSから出力した売上CSVをインポート", freq: "毎日1回" },
      { name: "口コミデータ", method: "Webスクレイピング", desc: "Googleビジネスプロフィールや主要OTAの口コミを自動クローリング", freq: "毎日自動" },
      { name: "周遊観光データ", method: "Webスクレイピング", desc: "那須エリアの主要観光サイト・イベント情報を自動巡回", freq: "毎週自動" },
      { name: "価格データ", method: "CSVインポート / メール解析", desc: "自社販売価格の履歴情報をCSVまたはメール経由で同期", freq: "毎日1回" },
      { name: "競合データ", method: "Webスクレイピング", desc: "周辺競合ホテルのOTA販売価格を自動クローリング", freq: "毎日自動" },
      { name: "SNSデータ", method: "Webスクレイピング", desc: "SNS上の「那須ミッドシティホテル」言及やトレンドを自動クローリング", freq: "毎日自動" },
      { name: "アンケートデータ", method: "CSVインポート", desc: "客室やWebでのアンケート回答CSVをインポート", freq: "毎週1回" },
      { name: "外部データ（天気・交通・イベント等）", method: "Web API", desc: "気象庁・公共交通・エリアイベント情報を外部APIから自動連動", freq: "3時間ごと" }
    ],
    valuesCreated: {
      customer: {
        title: "お客様にとって",
        items: [
          "最適な情報・プランに出会える",
          "快適で満足度の高い滞在",
          "便利でわかりやすい体験"
        ]
      },
      hotel: {
        title: "ホテルにとって",
        items: [
          "公式予約率の向上",
          "利益率の最大化",
          "業務効率化・コスト削減"
        ]
      },
      area: {
        title: "地域・那須にとって",
        items: [
          "観光・消費の活性化",
          "地域の魅力発信",
          "観光拠点としての価値向上"
        ]
      },
      staff: {
        title: "スタッフにとって",
        items: [
          "業務負担の軽減",
          "データに基づく判断が可能",
          "スキルアップ・働きやすい環境"
        ]
      }
    },
    finalGoal: "那須の拠点ホテルとして選ばれ続ける存在に！",
    ceo: {
      id: "ceo",
      name: "CEO（会長・社長・役員AI）",
      role: "経営判断・最終意思決定",
      avatar: "👔",
      desc: "投資対効果（ROI）、ホテル全体のブランド価値（「那須の拠点ホテル」コンセプト）、中長期的な成長性を基準に、各部署が提案する戦略の採択・最終決断を行います。"
    },
    coo: {
      id: "coo",
      name: "COO (AI会議執行役員AI)",
      role: "会議ファシリテート・各部統括",
      avatar: "⚙️",
      tasks: [
        "会議のファシリテーション",
        "各AI部署の意見招集",
        "経営報告書の作成"
      ],
      desc: "各専門部署のAIが提出したデータや施策を集約・整合調整し、役員会議でそのまま決議可能な「COO役員会報告書（実行策、期待効果、コスト、リスク）」をとりまとめます。"
    },
    departments: [
      {
        id: "ai-trends",
        name: "AIホテル影響調査部",
        role: "最新AIがホテルに与える影響の調査",
        avatar: "📈",
        mission: "業界・投資・旅行者の変化を捉え、先手を打つ",
        tasks: [
          "最新AI (Gemini等) がホテル業界・検索に与える影響調査",
          "旅行者の行動変化の調査",
          "トレンド・競合分析",
          "新規AIサービスの情報収集と活用提案"
        ],
        desc: "Gemini、GPT、Google AI Modeなどの最新AIが旅行者のホテル選び（AI検索）に与える影響、およびAI時代の新たな旅 of 動きを調査・分析します。"
      },
      {
        id: "us-insights",
        name: "米国ホテル調査部",
        role: "米国・欧州等の最先端ホテルAI事例調査",
        avatar: "🌐",
        mission: "海外の成功事例を学び、ホテルの競争力を高める",
        tasks: [
          "米国等の海外先端ホテル事例調査",
          "価格最適化、直販比率向上",
          "AI活用事例の収集・分析",
          "グローバルベストプラクティスの導入提案"
        ],
        desc: "米国などのグローバル市場で実用化されているAIコンシェルジュ、AI動的価格設定、直販比率（公式サイト予約）を最大化する欧米ホテルの最新ベストプラクティスを調査します。"
      },
      {
        id: "marketing-ota",
        name: "マーケティング・OTA対策部",
        role: "自社公式比率向上・じゃらん等手数料低減",
        avatar: "📈",
        desc: "じゃらん・楽天トラベル等の手数料（約10%）を削減するための公式サイト誘導、Aカード（キャッシュバック還元率10%）の会員獲得、およびOTA広告運用の最適化を担当します。"
      },
      {
        id: "ai-agent-booking",
        name: "AIエージェント予約対策部",
        role: "AIエージェント経由予約の推移予測と選ばれる戦略",
        avatar: "🤖",
        desc: "旅行者が自ら探すのではなく「AIエージェント（旅行アシスタントAI）」に予約を任せる時代の推移を予測し、AIに自社ホテルが優先推薦されるためのSEO・構造化データ設計を担当します。"
      },
      {
        id: "revenue-management",
        name: "宿泊プラン＆価格策定部",
        role: "宿泊プランの策定・料金戦略",
        avatar: "📊",
        desc: "「那須の拠点ホテル」の価値に紐づく体験プランの構築、および稼働率・リードタイム・イベント需要・競合価格をふまえたダイナミックプライシング（価格設定）の叩き台を策定します。"
      },
      {
        id: "restaurant-strategy",
        name: "レストラン戦略部",
        role: "朝食・ランチ・夕食の価値向上と集客戦略",
        avatar: "🍽️",
        desc: "大人気の那須御養卵TKGを誇る無料朝食バイキングの価値アピール、ランチ営業の稼働向上、周辺提携飲食店と連携した夕食付きプランなど、料飲部門の売上・体験向上を図ります。"
      },
      {
        id: "digital-guide",
        name: "デジタルコンシェルジュ推進部",
        role: "客室QRコード案内の最適化・利便性向上",
        avatar: "📱",
        desc: "客室設置のQRコード（各種Netlifyガイド）のUI/UX改善、スマートフォンからの温泉・観光地情報へのシームレスな案内、客室滞在中の顧客体験価値（CS）最大化を追求します。"
      },
      {
        id: "hotel-ops",
        name: "ホテル運営効率化部",
        role: "その他ホテル運営・オペレーションの効率化",
        avatar: "🛎️",
        desc: "フロント業務の自動化、夜間ワンオペ対応のAIサポート、荷物預かりの利便性向上など、ホテルの生産性向上と接客クオリティの両立を実現する施策を立案します。"
      }
    ]
  },
  siteAudit: [
    {
      title: "トップページのtitleは『那須塩原駅から徒歩3分』中心",
      detail: "現在のtitleは駅近訴求が強く、Google/AIに『那須観光の拠点ホテル』という概念を十分に学習させる表現になっていません。",
      status: "warn"
    },
    {
      title: "meta descriptionが『アクセス便利なホテル』『ビジネス出張やファミリーレジャー』中心",
      detail: "利便性は伝わる一方、那須の回遊拠点・温泉巡り拠点・新幹線拠点という再定義が弱い状態です。",
      status: "warn"
    },
    {
      title: "既に強い素材はそろっている",
      detail: "那須塩原駅徒歩3分、黒磯板室ICから車10分、駐車場、無料朝食、観光ページ、駅前レンタカー、温泉案内QRなど、拠点ホテル化に必要な材料があります。",
      status: "good"
    },
    {
      title: "観光ページは豊富だが『モデルコース』化の余地が大きい",
      detail: "現状は観光スポット一覧として有用ですが、『駅到着→ホテル→アウトレット→温泉→翌朝出発』のような回遊提案まで踏み込むとAI検索に強くなります。",
      status: "info"
    }
  ],
  executiveInsights: [
    {
      title: "定義を先に統一する",
      detail: "公式サイト、Googleビジネスプロフィール、QR案内、FAQ、口コミ返信で『那須の拠点ホテル』という言い方を揃えるのが最優先です。"
    },
    {
      title: "AI検索では“便利”より“意味”が重要",
      detail: "駅近や駐車場を単体で述べるより、『新幹線で着いてすぐ動ける』『車移動の拠点になる』といった文脈に変える方がAI Mode向きです。"
    },
    {
      title: "Googleビジネスプロフィールは更新頻度が武器になる",
      detail: "写真、投稿、説明文、ホテル属性、Q&A、口コミ返信を定期更新すると、ローカル検索とAI検索の両面で情報鮮度が上がります。"
    },
    {
      title: "価格戦略は『高単価化』だけでなく『拠点価値の説明』とセット",
      detail: "ダイナミックプライシングを導入しても、価格の正当化が弱いと公式転換に繋がりにくいため、立地・朝食・回遊利便性とのセット訴求が重要です。"
    }
  ],
  checklist: [
    {
      title: "title / descriptionを『那須の拠点ホテル』軸へ改訂",
      detail: "トップ・アクセス・観光・朝食・客室の主要ページで同じ概念を使う。",
      status: "warn"
    },
    {
      title: "FAQと構造化データを整備",
      detail: "駅からの行き方、駐車場、温泉導線、観光回遊、朝食、チェックイン時間をFAQ化。",
      status: "warn"
    },
    {
      title: "Googleビジネスプロフィールを毎週更新",
      detail: "写真、投稿、説明文、ホテル属性、Q&A、口コミ返信を運用。",
      status: "warn"
    },
    {
      title: "観光ページをモデルコース化",
      detail: "アウトレット、温泉、ファミリー、出張延泊、雨天時など検索意図別に再編集。",
      status: "info"
    },
    {
      title: "客室QRを『デジタルコンシェルジュ』化",
      detail: "温泉、観光、食事、交通、周辺サービスを一つの回遊導線として再設計。",
      status: "info"
    },
    {
      title: "Search Console / GA4でAI流入後の行動を確認",
      detail: "クリック数だけでなく滞在、予約導線到達、CVを追う。",
      status: "good"
    }
  ],
  sources: [
    {
      name: "Google Search Central: AI features and your website",
      url: "https://developers.google.com/search/docs/appearance/ai-features",
      note: "AI Overviews / AI Modeで必要なのは追加SEOではなく、検索の基本要件、インデックス、テキスト可読性、構造化データ整合性。"
    },
    {
      name: "Google Search Central Blog: Succeeding in AI Search",
      url: "https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search",
      note: "独自性あるコンテンツ、良いページ体験、画像や動画、最新のBusiness Profileが重要。"
    },
    {
      name: "Google Business Profile Help: Edit your Business Profile",
      url: "https://support.google.com/business/answer/3039617?hl=en-NA",
      note: "説明文、カテゴリ、写真、属性、ホテル情報、チェックイン/アウト、Q&Aの更新が可能。"
    },
    {
      name: "Google Business Profile Help: Create & manage posts",
      url: "https://support.google.com/business/answer/7342169?hl=en",
      note: "投稿は最新情報の継続発信に有効。古い投稿はアーカイブされるため、運用頻度が重要。"
    },
    {
      name: "BCG: AI-First Hotels: Leaner, Faster, Smarter",
      url: "https://www.bcg.com/publications/2026/ai-first-hotels-leaner-faster-smarter",
      note: "ホテル業界でAIは可視性、価格最適化、デジタルコンシェルジュ、業務効率化まで広がっている。"
    },
    {
      name: "Hospitality Net: Dynamic pricing guide",
      url: "https://www.hospitalitynet.org/explainer/4131229/the-complete-guide-to-dynamic-pricing-in-the-hotel-industry",
      note: "需要、競合、イベント、予約ペース、リードタイムをもとに価格を調整する考え方の整理に使える。"
    },
    {
      name: "HSMAI case study: Preferred Hotels digital presence",
      url: "https://global.hsmai.org/insight/case-study-optimizing-preferred-hotels-resorts-digital-presence/",
      note: "ホテル群でもschemaと可視化ダッシュボードがオーガニック流入改善に寄与した事例。"
    }
  ],
  promptChips: [
    "Google AI Modeで選ばれる説明文を作る",
    "Googleビジネスプロフィールの改善優先順位を出す",
    "米国ホテルのAI活用事例を会議向けに要約する",
    "公式予約比率を上げる施策を提案する",
    "料金改定の判断材料を整理する",
    "口コミ返信テンプレートを作る"
  ],
  // 各部署・役割に応じたデフォルトプロンプトの定義
  defaultPrompts: {
    ceo: "那須ミッドシティホテルが目指すべき「那須の拠点ホテル」としての長期ビジョンにおいて、今期の設備投資（QRコンシェルジュ化や朝食強化）に対する経営上の評価基準を策定してください。",
    coo: "各部署（最新AI調査、米国事例、マーケティング、料金戦略、デジタルコンシェルジュ、レストラン）からの現状レポートを統合し、今月の役員会議で決議すべき『公式予約向上と顧客体験アップの90日実行プラン』を作成してください。",
    "ai-trends": "ChatGPTやGeminiなどの最新AI、またGoogle AI Modeが旅行者の情報探索に与える影響を分析し、那須の観光拠点としての当ホテルがAIに推薦されやすくなるテキスト表現の指針を示してください。",
    "us-insights": "アメリカの先進的なホテルで導入されている、AIアシスタントを活用した音声案内や、客室QRコードを起点としたアップセル（朝食や周辺ツアー販売）の最新事例と導入効果を教えてください。",
    "marketing-ota": "楽天トラベルやじゃらんでの掲載順位を維持・向上しつつ、送客手数料（約10%）を削減して公式HPへの自社予約比率を高めるための、具体的な誘導施策とAカード（キャッシュバック）の訴求方法を提案してください。",
    "ai-agent-booking": "将来、ユーザーが「AIエージェント」に『那須で家族4人、車で温泉を楽しめて、美味しい朝食が食べられるおすすめのホテルを予約して』と口頭で指示した際、当ホテルがAIによって第一候補に選ばれるためのSEO、構造化データ、口コミの対策を提案してください。",
    "revenue-management": "那須ミッドシティホテルの駅近＆無料駐車場という強みを活かした、ビジネス客向けおよび観光ファミリー向けの新しい宿泊プランを策定し、それに連動するダイナミックプライシング（料金変動）の運用枠組みを提案してください。",
    "restaurant-strategy": "那須御養卵TKGを売りにした無料朝食バイキングの価値をさらに向上・アピールする施策と、提携飲食店での夕食（https://nasu-midcity-dinner.netlify.app/ など）やTKG紹介（https://nasu-midcity-tkg.netlify.app/）を活用したリピーター獲得戦略を提案してください。",
    "digital-guide": "客室QRコードの案内サイト（https://nasu-midcity-guide.netlify.app/ 他）を、単なる案内板から「デジタルコンシェルジュ」へと進化させるために、温泉ガイド（https://nasu-onsen-guide.netlify.app/）やFAQ（https://nasu-midcity-faq.netlify.app/）とのスムーズな遷移設計を含む具体的な改善案を作成してください。",
    "hotel-ops": "深夜帯のフロント業務効率化や、問い合わせ対応（https://nasu-midcity-faq.netlify.app/）のスマート化のために、AIチャットボットやスマートチェックインを導入する場合の運用手順とスタッフ向け教育指針を策定してください。"
  },
  schemaTemplate: {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "那須ミッドシティホテル",
    description: "那須塩原駅徒歩3分・無料駐車場完備。観光、出張、温泉巡り、地域移動を支える『那須の拠点ホテル』。",
    url: "https://www.nasu-midcity.com/",
    telephone: "+81-287-67-1400",
    address: {
      "@type": "PostalAddress",
      postalCode: "329-3156",
      addressRegion: "栃木県",
      addressLocality: "那須塩原市",
      streetAddress: "方京1-1-10",
      addressCountry: "JP"
    },
    checkinTime: "15:00",
    checkoutTime: "10:00",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "無料朝食", value: true },
      { "@type": "LocationFeatureSpecification", name: "無料Wi-Fi", value: true },
      { "@type": "LocationFeatureSpecification", name: "無料駐車場", value: true },
      { "@type": "LocationFeatureSpecification", name: "那須塩原駅徒歩3分", value: true }
    ],
    makesOffer: {
      "@type": "Offer",
      category: "Hotel Room",
      availability: "https://schema.org/InStock"
    },
    sameAs: [
      "https://nasu-midcity-guide.netlify.app/"
    ]
  }
};