"use client";

import { useState, useEffect, useRef } from 'react';

const UI_TEXT = {
  ja: { 
    name: 'もりなすちゃん (AIコンシェルジュ)', 
    status: 'オンライン', 
    placeholder: 'テキストで質問する...', 
    send: '送信', 
    genderLabel: '性別', 
    voiceLabel: '声質', 
    speedLabel: '速度', 
    speedNormal: '普通 (1.0x)', 
    speedFast: '早く (1.25x)', 
    speedFastest: '最速 (1.5x)', 
    femaleBtn: '👩 女性', 
    maleBtn: '👨 男性', 
    chips: ['朝食は何時から？', 'おすすめの温泉は？', 'チェックインの時間', '駐車場はある？', '駅からの行き方', '部屋の設備は？'], 
    greeting: 'こんにちは！那須ミッドシティホテル公式マスコット「もりなすちゃん」です🍆 何でもお気軽にお尋ねくださいね。', 
    def: 'ご質問ありがとうございます。その件につきましては、フロントのスタッフが喜んで詳しくご案内いたします。お電話は、0287-67-1400 まで、いつでもお気軽にお問い合わせください。' 
  },
  en: { 
    name: 'Mori-Nasu-chan (AI Concierge)', 
    status: 'Online', 
    placeholder: 'Ask a question in English...', 
    send: 'Send', 
    genderLabel: 'Gender', 
    voiceLabel: 'Voice', 
    speedLabel: 'Speed', 
    speedNormal: 'Normal (1.0x)', 
    speedFast: 'Fast (1.25x)', 
    speedFastest: 'Fastest (1.5x)', 
    femaleBtn: '👩 Female', 
    maleBtn: '👨 Male', 
    chips: ['Breakfast time?', 'Recommend Onsen?', 'Check-in time?', 'Is parking free?', 'How to go from station?', 'Room amenities?'], 
    greeting: 'Hello! I\'m "Mori-Nasu-chan", the official mascot of Nasu Midcity Hotel🍆 Please feel free to ask about breakfast, hot springs, access, or anything else.', 
    def: 'Thank you for your question. Our front desk staff will be happy to assist you in detail. Please feel free to call us at +81-287-67-1400 anytime.' 
  }
};

const VOICES_DICT = {
  ja: { 
    female: [
      { value: 'ja-JP-Chirp3-HD-Aoede', label: 'さくら (明るく上品な妖精 🌸)' }, 
      { value: 'ja-JP-Chirp3-HD-Achernar', label: 'あおい (しっとり落ち着いた妖精 💎)' }, 
      { value: 'ja-JP-Chirp3-HD-Zephyr', label: 'めい (ふんわり愛らしい妖精 ❄️)' }
    ], 
    male: [
      { value: 'ja-JP-Chirp3-HD-Aoede', label: 'さくら (明るく上品な妖精 🌸)' }, 
      { value: 'ja-JP-Chirp3-HD-Achernar', label: 'あおい (しっとり落ち着いた妖精 💎)' }, 
      { value: 'ja-JP-Chirp3-HD-Zephyr', label: 'めい (ふんわり愛らしい妖精 ❄️)' }
    ] 
  },
  en: { 
    female: [
      { value: 'en-US-Chirp3-HD-Aoede', label: 'Emily (Bright & friendly fairy 🎀)' }, 
      { value: 'en-US-Chirp3-HD-Kore', label: 'Sophia (Elegant & professional 👑)' },
      { value: 'en-US-Neural2-F', label: 'Lily (Sweet & clear fairy 🌼)' }
    ], 
    male: [
      { value: 'en-US-Chirp3-HD-Aoede', label: 'Emily (Bright & friendly fairy 🎀)' }, 
      { value: 'en-US-Chirp3-HD-Kore', label: 'Sophia (Elegant & professional 👑)' },
      { value: 'en-US-Neural2-F', label: 'Lily (Sweet & clear fairy 🌼)' }
    ] 
  }
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_concierge_muted') === 'true';
    }
    return false;
  });
  const [currentLang, setCurrentLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_concierge_lang') || 'ja';
    }
    return 'ja';
  });
  const [currentGender, setCurrentGender] = useState('female');
  const [currentVoice, setCurrentVoice] = useState('ja-JP-Chirp3-HD-Aoede');
  const [playbackRate, setPlaybackRate] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseFloat(localStorage.getItem('ai_concierge_speed') || '1.0');
    }
    return 1.0;
  });
  const [messages, setMessages] = useState([]);
  
  // 状態の競合を防ぐための究極の設計：タイピング中の文字列を独立したステートで管理する！！！
  const [currentTypingText, setCurrentTypingText] = useState('');
  
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [statusText, setStatusText] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('ai_concierge_lang') || 'ja';
      return savedLang === 'en' ? 'Online' : 'オンライン';
    }
    return 'オンライン';
  });

  const chatBodyRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceCacheRef = useRef({});
  const lastAnswerRef = useRef('');
  
  // タイピングの二重実行を100%防止するためのセッション管理ID
  const activeTypingSessionRef = useRef(0);
  const isMutedRef = useRef(false);
  const currentLangRef = useRef('ja');
  const currentVoiceRef = useRef('ja-JP-Chirp3-HD-Aoede');
  const playbackRateRef = useRef(1.0);
  const handleUserSendRef = useRef(null);

  // Refを最新stateと常に同期して非同期コールバック時のクロージャ問題を完全解決
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { currentLangRef.current = currentLang; }, [currentLang]);
  useEffect(() => { currentVoiceRef.current = currentVoice; }, [currentVoice]);
  useEffect(() => { playbackRateRef.current = playbackRate; }, [playbackRate]);

  // 初期ロード
  useEffect(() => {

    audioRef.current = new Audio();

    // IntersectionObserverの初期化（フェードインアニメーション用）
    const fadeEls = document.querySelectorAll('.feature, .split-text, .split-img, .access-item, .news-item, .concept-lead, .concept-text');
    fadeEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity .9s ease, transform .9s ease';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
          }, i * 80);
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach(el => observer.observe(el));

    // 音声認識 (SpeechRecognition)
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      
      let silenceTimer = null;
      let lastText = '';

      rec.onresult = (ev) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = ev.resultIndex; i < ev.results.length; ++i) {
          if (ev.results[i].isFinal) {
            finalTranscript += ev.results[i][0].transcript;
          } else {
            interimTranscript += ev.results[i][0].transcript;
          }
        }
        
        const currentText = finalTranscript || interimTranscript;
        if (currentText.trim()) {
          lastText = currentText;
          setInputText(lastText);
          
          clearTimeout(silenceTimer);
          silenceTimer = setTimeout(() => {
            if (lastText.trim()) {
              setInputText('');
              rec.stop();
              handleUserSendRef.current?.(lastText);
            }
          }, 450);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        setStatusText(UI_TEXT[currentLangRef.current].status);
        clearTimeout(silenceTimer);
      };

      rec.onerror = () => {
        setIsListening(false);
        setStatusText(UI_TEXT[currentLangRef.current].status);
        clearTimeout(silenceTimer);
      };

      recognitionRef.current = rec;
    }

    return () => {
      observer.disconnect();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // 言語の更新
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLang === 'ja' ? 'ja-JP' : 'en-US';
    }
  }, [currentLang]);

  // メッセージの自動スクロール
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, currentTypingText]);

  // 音声の自動アンロック
  const unlockAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA';
        audioRef.current.volume = 0;
        audioRef.current.play().catch(() => {});
      } catch (e) {}
    }
    if (window.speechSynthesis) {
      try {
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }
  };

  // 音声の全停止
  const stopSpeaking = () => {
    activeTypingSessionRef.current += 1; // 進行中のタイピングセッションIDを更新し、古いタイピングプロセスを完全終了！
    setCurrentTypingText(''); // タイピング中テキストを瞬時に完全リセット！
    
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = '';
      } catch (e) {}
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setIsSpeaking(false);
    setStatusText(UI_TEXT[currentLangRef.current].status);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('ai_concierge_muted', nextMuted);
    if (nextMuted) {
      stopSpeaking();
    }
  };

  const handleToggleLanguage = () => {
    const nextLang = currentLang === 'ja' ? 'en' : 'ja';
    setCurrentLang(nextLang);
    localStorage.setItem('ai_concierge_lang', nextLang);
    setStatusText(UI_TEXT[nextLang].status);
    stopSpeaking();
    
    const greeting = UI_TEXT[nextLang].greeting;
    lastAnswerRef.current = greeting;
    setMessages([]); // メッセージ配列をリセットして重複防止
    
    setTimeout(() => {
      speakLastAnswerDynamic(greeting, nextLang);
    }, 150);
  };

  // ブラウザのローカルSpeechSynthesisによる音声合成フォールバック（AI音声はなくせの指示に基づき完全廃止）
  const speakLocalFallback = (text, lang) => {
    return new Promise((resolve) => {
      resolve();
    });
  };

  // API音声再生（確実なBase64再生）
  const playGcpTtsAudio = (audioData, rate = playbackRateRef.current) => {
    return new Promise((resolve) => {
      if (isMutedRef.current || !audioRef.current || !audioData) { resolve(); return; }
      
      let objectUrl = null;
      let isResolved = false;

      const safeResolve = () => {
        if (isResolved) return;
        isResolved = true;
        
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onpause = null;
        
        setIsSpeaking(false);
        if (objectUrl) {
          try { URL.revokeObjectURL(objectUrl); } catch (e) {}
        }
        resolve();
      };

      try {
        audioRef.current.pause();

        const byteCharacters = atob(audioData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        // MIME type を付与しないとブラウザによっては再生に失敗する
        const blob = new Blob([byteArray], { type: 'audio/wav' });
        objectUrl = URL.createObjectURL(blob);
        audioRef.current.src = objectUrl;
        
        audioRef.current.volume = 1.0;
        audioRef.current.playbackRate = rate;
        
        setIsSpeaking(true);
        
        audioRef.current.onended = safeResolve;
        audioRef.current.onerror = safeResolve;
        audioRef.current.onpause = safeResolve;
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.error("Audio playback failed:", e);
            safeResolve();
          });
        }

        setTimeout(safeResolve, 15000);
      } catch (e) {
        safeResolve();
      }
    });
  };

  // 独立ステート currentTypingText に対して文字を 1 文字ずつ書き込む（超安全設計・競合ゼロ）
  const typewriteSentence = (sentenceText, sessionId, rate = playbackRateRef.current) => {
    return new Promise((resolve) => {
      const charArray = Array.from(sentenceText);

      if (currentLangRef.current !== 'ja') {
        if (activeTypingSessionRef.current !== sessionId) { resolve(); return; }
        setCurrentTypingText(prev => prev + sentenceText);
        resolve();
        return;
      }

      let i = 0;
      const speed = Math.round(75 / rate);
      
      const typeWriter = () => {
        if (activeTypingSessionRef.current !== sessionId) {
          resolve();
          return;
        }

        if (i < charArray.length) {
          const char = charArray[i];
          setCurrentTypingText(prev => prev + char);
          i++;
          setTimeout(typeWriter, speed);
        } else {
          resolve();
        }
      };
      typeWriter();
    });
  };

  const prefetchSentence = async (text, voice) => {
    const cacheKey = `${voice}_${text}`;
    if (voiceCacheRef.current[cacheKey]) return;

    try {
      const res = await fetch('/api/concierge', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ text, voice, ttsOnly: true }) 
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          voiceCacheRef.current[cacheKey] = data.audio;
        }
      }
    } catch (e) {}
  };

  // ストリーミング・排他タイピング＆音声再生ループ
  const speakLastAnswerDynamic = async (fullText, lang = currentLang, voice = currentVoice) => {
    if (!fullText) return;
    
    // 旧音声とタイピングセッションをクリアし、currentTypingText も完全に空にする
    stopSpeaking();
    
    // 今回のセッション専用のIDを取得
    const mySessionId = activeTypingSessionRef.current;
    
    // stopSpeakingで上書きされたステータステキストを「考え中」に戻す（これがないと文字が消えてしまう）
    setStatusText(lang === 'en' ? 'Thinking...' : '考え中・・・');

    const sentences = fullText.split(/([。！\?\n])/).reduce((acc, cur) => {
      if (acc.length === 0) { acc.push(cur); } 
      else {
        const last = acc[acc.length - 1];
        if (last === '。' || last === '！' || last === '?' || last === '\n' || last === '？') { acc.push(cur); } 
        else { acc[acc.length - 1] += cur; }
      }
      return acc;
    }, []).filter(s => s.trim() !== '');

    let sentenceIndex = 0;
    
    const playNext = async () => {
      if (activeTypingSessionRef.current !== mySessionId) return;

      if (sentenceIndex >= sentences.length) {
        // 全文の読み上げとタイピングが完了！
        // タイピング中だった内容をクリアして、正式に messages ステートに保存する
        if (activeTypingSessionRef.current === mySessionId) {
          setMessages(prev => [...prev, { role: 'bot', text: fullText }]);
          setCurrentTypingText('');
        }
        setStatusText(UI_TEXT[lang].status);
        return;
      }

      const txt = sentences[sentenceIndex];
      const cacheKey = `${voice}_${txt}`;
      let audioData = voiceCacheRef.current[cacheKey];

      if (!audioData) {
        try {
          // 余計なディレイは完全撤廃し、音声が準備でき次第すぐに再生する！
          const res = await fetch('/api/concierge', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ text: txt, voice, ttsOnly: true }) 
          });

          if (res.ok) {
            const data = await res.json();
            if (data.audio) {
              audioData = data.audio;
              voiceCacheRef.current[cacheKey] = audioData;
            }
          }
        } catch (e) {}
      }

      if (sentenceIndex + 1 < sentences.length) {
        prefetchSentence(sentences[sentenceIndex + 1], voice);
      }

      if (activeTypingSessionRef.current !== mySessionId) return;

      // ここで初めて「考え中」を消す！（最低1.2秒はアニメーションが表示された後）
      setIsThinking(false);
      setStatusText(lang === 'en' ? 'Speaking...' : 'お話し中...');

      if (audioData) {
        // 声と文字のタイピングは完全に同時！
        await Promise.all([
          typewriteSentence(txt, mySessionId),
          playGcpTtsAudio(audioData)
        ]);
      } else {
        // 音声が万が一取得できなかった場合は文字のみで即時回答
        await typewriteSentence(txt, mySessionId);
      }

      sentenceIndex++;
      await playNext();
    };

    await playNext();
  };

  const handleUserSend = async (textToSend) => {
    const query = textToSend || inputText.trim();
    if (!query) return;

    setInputText('');
    stopSpeaking();
    
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setStatusText(currentLang === 'en' ? 'Thinking...' : '応答を考えています...');
    setIsThinking(true);

    let botAnswer = '';
    try {
      const res = await fetch('/api/concierge', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ text: query, voice: currentVoice }) 
      });
      if (res.ok) {
        const data = await res.json();
        if (data.answer) {
          botAnswer = data.answer;
        }
      }
    } catch (e) {}

    if (!botAnswer) {
      botAnswer = currentLang === 'ja' ? UI_TEXT.ja.def : UI_TEXT.en.def;
    }

    lastAnswerRef.current = botAnswer;
    await speakLastAnswerDynamic(botAnswer);
  };
  useEffect(() => {
    handleUserSendRef.current = handleUserSend;
  }, [handleUserSend]);

  const openModal = () => {
    unlockAudio();
    setIsModalOpen(true);
    // 重複を避けるため、初回起動時の挨拶は、メッセージリストとタイピングステートが完全に空の時のみキックする
    if (messages.length === 0 && !currentTypingText) {
      const greeting = UI_TEXT[currentLang].greeting;
      speakLastAnswerDynamic(greeting);
    }
  };

  const closeModal = () => {
    stopSpeaking();
    setIsModalOpen(false);
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }
    stopSpeaking();
    unlockAudio();
    setIsListening(true);
    setStatusText(currentLang === 'en' ? 'Listening...' : '聞いています...');
    if (recognitionRef.current) recognitionRef.current.start();
  };

  const handleChipClick = (chipText) => {
    setMessages(prev => [...prev, { role: 'user', text: chipText }]);
    handleUserSend(chipText);
  };

  return (
    <>
      {/* ============== HEADER ============== */}
      <header className="header scrolled" id="header">
        <a href="#" className="logo-link">
          <img src="/sheader_logo.png" alt="那須ミッドシティホテル" className="logo-img" />
        </a>
        <nav className="nav">
          <a href="#concept">CONCEPT<small>コンセプト</small></a>
          <a href="#rooms">ROOMS<small>客室</small></a>
          <a href="#breakfast">BREAKFAST<small>朝食</small></a>
          <a href="#onsen">ONSEN<small>温泉</small></a>
          <a href="#access">ACCESS<small>アクセス</small></a>
        </nav>
        <a href="#book" className="btn-book">BOOK NOW</a>
        <button className="menu-toggle"><span></span><span></span><span></span></button>
      </header>

      {/* ============== HERO ============== */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <p className="hero-tag">A Base Hotel for Exploring Nasu</p>
          <h1 className="hero-title">
            那須塩原駅、徒歩<strong>3</strong>分。<br />
            ここから、<strong>那須を動く</strong>。
          </h1>
          <p className="hero-sub">
            那須塩原駅徒歩3分、無料駐車場完備。<br />
            観光の出張・温泉巡りや周辺エリアへの移動に便利な、<br />
            那須の拠点となるホテルです。
          </p>
          <div className="hero-ctas">
            <a href="#book" className="btn primary">BOOK NOW &nbsp;宿泊予約</a>
            <a href="#access" className="btn">ACCESS &nbsp;アクセス</a>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="hero-ai-btn ai-fab" onClick={openModal} style={{ fontSize: '14px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
              AIコンシェルジュに話しかける
            </button>
          </div>
        </div>
        <div className="scroll-indicator">SCROLL</div>
      </section>

      {/* ============== EXTERIOR / BASE ============== */}
      <section className="base-hotel" id="about">
        <div className="base-inner">
          <div className="base-img">
            <img src="/midcityhotel.jpg" alt="那須ミッドシティホテル外観" />
          </div>
          <div className="base-text">
            <p className="section-en" style={{ textAlign: 'left' }}>OUR HOTEL</p>
            <h2>那須を繋ぐ、<br />ただひとつの拠点へ。</h2>
            <p>
              新幹線の改札を抜ければ、そこはもう那須への入り口。<br />
              那須塩原駅前という圧倒的な利便性と、車移動を力強く支える広大な無料駐車場を備えています。
            </p>
            <p>
              那須高原の豊かな自然、歴史ある温泉郷、精度高いサービスとビジネスの中心地へ。<br />
              あらゆる目的をシームレスに繋ぐ「ベースキャンプ」がここにあります。
            </p>
          </div>
        </div>
      </section>

      {/* ============== CONCEPT ============== */}
      <section className="concept" id="concept">
        <div className="section-head">
          <p className="section-en">CONCEPT</p>
          <h2 className="section-jp">那須を、動くための拠点へ</h2>
        </div>
        <p className="concept-lead">
          便利なビジネスホテルではなく、<br />
          <em>「那須を動くための拠点ホテル」</em>へ。
        </p>
        <p className="concept-text">
          那須塩原駅徒歩3分は、ただの「駅近」ではありません。
          新幹線で東京から70分、降りてすぐに那須を動き出せる<strong>機動力</strong>です。
          無料駐車場は「お得」ではなく、車移動の<strong>拠点</strong>。
          朝食は「無料サービス」ではなく、那須の朝を味わう<strong>地域体験</strong>。
          温泉案内は弱点の補完ではなく、周辺の名湯を巡る<strong>アクティブの導線設計</strong>です。
          すべてが、那須という土地を最大に楽しむための装置として、ひとつにつながっています。
        </p>
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <a className="btn primary" href="/concept" style={{ background: 'var(--c-accent)', color: 'var(--c-white)', border: 'none' }}>VIEW FULL CONCEPT &nbsp;コンセプトの詳細を見る</a>
        </div>
      </section>

      {/* ============== FEATURES ============== */}
      <section className="features">
        <div className="section-head">
          <p className="section-en">FEATURE</p>
          <h2 className="section-jp">選ばれる、4つの理由</h2>
        </div>
        <div className="feature-grid">
          <div className="feature">
            <p className="feature-num">01</p>
            <div className="feature-icon">🚉</div>
            <h3>那須塩原駅<br />徒歩3分</h3>
            <p>新幹線到着後、最短で那須エリアへ。チェックイン前後の身軽な行動を可能にします。</p>
          </div>
          <div className="feature">
            <p className="feature-num">02</p>
            <div className="feature-icon">🚗</div>
            <h3>無料駐車場<br />完備</h3>
            <p>車で来ても、ここを起点に。那須高原・板室・塩原温泉郷へ自由に動ける拠点です。</p>
          </div>
          <div className="feature">
            <p className="feature-num">03</p>
            <div className="feature-icon">🍳</div>
            <h3>地域を味わう<br />無料朝食</h3>
            <p>那須御養卵の特別な卵かけご飯や地元野菜、焼きたてパン。朝から那須を動き出すための、地域体験です。</p>
          </div>
          <div className="feature">
            <p className="feature-num">04</p>
            <div className="feature-icon">♨️</div>
            <h3>温泉巡りの<br />ベースキャンプ</h3>
            <p>那須・塩原・板室の名湯までスグ。日帰り温泉案内付きで、滞在中の動きを設計します。</p>
          </div>
        </div>
      </section>

      {/* ============== ROOMS ============== */}
      <section className="split" id="rooms">
        <div className="split-inner">
          <div className="split-img">
            <img src="/comfort.jpg" alt="シモンズベッドを備えた客室" />
          </div>
          <div className="split-text">
            <p className="section-en" style={{ textAlign: 'left' }}>ROOMS</p>
            <h2><small>客室</small>翌日のための、確かな休息。</h2>
            <p>
              全室<strong>シモンズベッド</strong>採用。個別空調、防音ペアガラス、幅2mのワイドデスク。
              観光で歩き疲れた一日も、出張の前夜も、しっかり休めるための機能を客室に集約しました。
            </p>
            <p>
              全室ユニットバスのため、お風呂はあえて温泉案内と組み合わせ、<br />
              客室を「休む場所」、温泉を「楽しむ場所」として明確に分けています。
            </p>
            <a href="#" className="more">View Rooms ➔</a>
          </div>
        </div>
      </section>

      {/* ============== BREAKFAST ============== */}
      <section className="split reverse" id="breakfast">
        <div className="split-inner">
          <div className="split-img">
            <img src="/breakfast.jpg" alt="無料朝食バイキング" />
          </div>
          <div className="split-text">
            <p className="section-en" style={{ textAlign: 'left' }}>BREAKFAST</p>
            <h2><small>朝食</small>那須の朝を、いただく。</h2>
            <p>
              那須御養卵の特別な卵かけご飯、地元野菜のサラダ、焼き立てのパン。
              栃木県産のお米と味噌汁。地域の食材を中心にした朝食バイキングを<strong>無料</strong>でご用意しています。
            </p>
            <p>
              早朝から那須を動き出す方のために、朝6:30よりオープン。<br />
              観光出発の朝を、ここから始めてください。
            </p>
            <a href="#" className="more">View Breakfast ➔</a>
          </div>
        </div>
      </section>

      {/* ============== ONSEN ============== */}
      <section className="split" id="onsen">
        <div className="split-inner">
          <div className="split-img">
            <img src="/shikanoyu.jpg" alt="那須の温泉" />
          </div>
          <div className="split-text">
            <p className="section-en" style={{ textAlign: 'left' }}>ONSEN GUIDE</p>
            <h2><small>温泉ガイド</small>名湯を、巡る拠点。</h2>
            <p>
              那須温泉郷、板室温泉、塩原温泉郷。
              当ホテルでは、それぞれの温泉の<strong>泉質・所要時間・日帰り入浴料金</strong>をまとめた
              独自の温泉ガイドをご用意しています。
            </p>
            <p>
              フロントでのご相談やデジタル案内にも対応。<br />
              「次はどこへ？」をスムーズに設計します。
            </p>
            <a href="#" className="more">View Onsen Guide ➔</a>
          </div>
        </div>
      </section>

      {/* ============== AI CONCIERGE BANNER ============== */}
      <section className="ai-concierge-banner">
        <div className="ai-banner-content">
          <div className="ai-icon-large">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
          </div>
          <h2><small>VOICE AI CONCIERGE</small>話しかけるだけで、<br />那須の旅をパーソナライズ。</h2>
          <p>
            「明日の朝食は何時から？」「車で30分以内に行けるおすすめの温泉は？」<br />
            那須ミッドシティホテルのコンシェルジュAIが、あなたの声による質問にいつでもお答えします。<br />
            どんな些細なことでも、お気軽にお声がけください。
          </p>
          <button onClick={openModal} className="btn primary ai-fab" style={{ background: 'var(--c-white)', color: 'var(--c-accent)', border: 'none', fontWeight: 500 }}>AIに相談する</button>
        </div>
      </section>

      {/* ============== ACCESS ============== */}
      <section className="access" id="access">
        <div className="section-head">
          <p className="section-en">ACCESS</p>
          <h2 className="section-jp">那須塩原駅、目の前。</h2>
        </div>
        <div className="access-grid">
          <div className="access-item">
            <p className="label">BY SHINKANSEN</p>
            <p className="big">徒歩<em>3</em>分</p>
            <p className="desc">JR那須塩原駅西口より<br />東京駅から新幹線で約70分</p>
          </div>
          <div className="access-item">
            <p className="label">BY CAR</p>
            <p className="big"><em>10</em>分</p>
            <p className="desc">東北自動車道<br />黒磯板室ICより約10分</p>
          </div>
          <div className="access-item">
            <p className="label">PARKING</p>
            <p className="big">無料</p>
            <p className="desc">無料駐車場完備<br />那須エリア観光の拠点に</p>
          </div>
        </div>
      </section>

      {/* ============== NEWS ============== */}
      <section className="news">
        <div className="section-head">
          <p className="section-en">NEWS</p>
          <h2 className="section-jp">お知らせ</h2>
        </div>
        <div className="news-list">
          <div className="news-item">
            <span className="date">2026.05.10</span>
            <span className="tag">PLAN</span>
            <span className="title">那須高原ハイシーズン特別プラン受付開始のお知らせ</span>
          </div>
          <div className="news-item">
            <span className="date">2026.04.22</span>
            <span className="tag event">EVENT</span>
            <span className="title">温泉巡りガイド（2026年版）を館内QRより公開しました</span>
          </div>
          <div className="news-item">
            <span className="date">2026.04.01</span>
            <span className="tag">PLAN</span>
            <span className="title">ビジネス・ファミリー・観光プラン、リニューアル予約スタート</span>
          </div>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="cta" id="book">
        <h2>那須を、動き始めよう。</h2>
        <p>
          那須塩原駅徒歩3分の拠点ホテルから、<br />
          あなただけの那須の楽しみ方が始まります。
        </p>
        <div className="hero-ctas">
          <a href="#" className="btn primary">BOOK NOW &nbsp;ご予約はこちら</a>
          <a href="#" className="btn">CONTACT &nbsp;お問い合わせ</a>
        </div>
      </section>

      {/* ============== AI CONCIERGE FAB ============== */}
      <div className="ai-fab-container">
        <button className="ai-fab" onClick={openModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="22"></line>
          </svg>
          <span className="ai-fab-label">AIコンシェルジュに相談する</span>
        </button>
      </div>

      {/* ============== FOOTER ============== */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <img src="/sheader_logo.png" alt="那須ミッドシティホテル" className="footer-logo-img" />
            <p className="footer-info">
              〒329-3156<br />
              栃木県那須塩原市方京1-1-10<br />
              TEL: 0287-67-1400<br />
              JR那須塩原駅西口 徒歩3分
            </p>
          </div>
          <div>
            <h4>STAY</h4>
            <ul>
              <li><a href="#rooms">客室</a></li>
              <li><a href="#breakfast">朝食</a></li>
              <li><a href="#book">宿泊プラン</a></li>
              <li><a href="#book">ご予約</a></li>
            </ul>
          </div>
          <div>
            <h4>EXPERIENCE</h4>
            <ul>
              <li><a href="#onsen">温泉ガイド</a></li>
              <li><a href="#">観光ガイド</a></li>
              <li><a href="#">館内サービス</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4>CONTACT</h4>
            <ul>
              <li><a href="#access">アクセス</a></li>
              <li><a href="#">お問い合わせ</a></li>
              <li><a href="#">プライバシーポリシー</a></li>
            </ul>
          </div>
        </div>
        <p className="copyright">© 2026 NASU MIDCITY HOTEL. All Rights Reserved.</p>
      </footer>

      {/* ============== AI CONCIERGE MODAL ============== */}
      <div className={`ai-modal-overlay ${isModalOpen ? 'active' : ''}`} id="aiModal" onClick={(e) => e.target.id === 'aiModal' && closeModal()}>
        <div className="ai-modal-content ai-chat-mode">
          <button className="ai-modal-close" onClick={closeModal}>×</button>
          
          <div className="ai-chat-header">
            {/* 動くアバター */}
            <div className={`ai-live-avatar ${isSpeaking ? 'is-speaking' : ''}`} id="aiLiveAvatar">
              <img src="/nasu_avatar.png" alt="もりなすちゃん" onError={(e) => { e.target.src = '/sheader_logo.png'; }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="ai-chat-name" id="aiChatName">{UI_TEXT[currentLang].name}</div>
              <div className="ai-chat-status" id="aiChatStatus" style={{ display: 'flex', alignItems: 'center', height: '18px' }}>
                {(statusText.includes('考え中') || statusText.includes('Thinking') || statusText.includes('考えています')) ? (
                  <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                    <span style={{ width: '6px', height: '6px', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.16s' }}></span>
                    <span style={{ width: '6px', height: '6px', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.32s' }}></span>
                  </span>
                ) : (
                  <span>{statusText}</span>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '25px' }}>
              {/* 消音ボタン */}
              <button onClick={toggleMute} id="aiMuteBtn" title="消音切替" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isMuted ? 0.5 : 1, outline: 'none' }}>
                <svg id="muteIcon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  {!isMuted && <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>}
                  {isMuted && <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth={2} strokeLinecap="round"></line>}
                </svg>
              </button>
              
              {/* 言語トグル */}
              <button onClick={handleToggleLanguage} id="aiLangBtn" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', fontFamily: 'inherit', outline: 'none' }}>
                {currentLang === 'ja' ? 'English' : '日本語'}
              </button>
            </div>
          </div>

          {/* 声質・速度選択 */}
          <div style={{ background: '#1b3a2e', padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span id="voiceLabelEl" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', letterSpacing: '0.1em', minWidth: '35px' }}>{UI_TEXT[currentLang].voiceLabel}</span>
              <select id="voiceSelect" value={currentVoice} onChange={(e) => setCurrentVoice(e.target.value)} style={{ flex: 1, background: '#0c1a15', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {VOICES_DICT[currentLang][currentGender].map(v => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <span id="speedLabelEl" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', letterSpacing: '0.1em', minWidth: '35px' }}>{UI_TEXT[currentLang].speedLabel}</span>
              <select id="voiceSpeedSelect" value={playbackRate.toString()} onChange={(e) => {
                const speed = parseFloat(e.target.value);
                setPlaybackRate(speed);
                localStorage.setItem('ai_concierge_speed', speed.toString());
              }} style={{ flex: 1, background: '#0c1a15', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <option value="1.0">{UI_TEXT[currentLang].speedNormal}</option>
                <option value="1.25">{UI_TEXT[currentLang].speedFast}</option>
                <option value="1.5">{UI_TEXT[currentLang].speedFastest}</option>
              </select>
            </div>
          </div>

          {/* チャット領域 */}
          <div className="ai-chat-body" id="aiChatBody" ref={chatBodyRef}>
            <div id="aiChatMessages">
              {/* 確定済みのメッセージ履歴 */}
              {messages.map((m, idx) => (
                <div key={idx} className={`ai-msg ai-msg-${m.role}`}>
                  <div className="ai-msg-bubble" dangerouslySetInnerHTML={{ __html: m.text }}></div>
                </div>
              ))}
              
              {/* タイピング中の最新メッセージ（確定前のリアルタイムタイピングを独立表示！） */}
              {currentTypingText && (
                <div className="ai-msg ai-msg-bot">
                  <div className="ai-msg-bubble" dangerouslySetInnerHTML={{ __html: currentTypingText }}></div>
                </div>
              )}

              {/* 考え中の表示 (ローディングアニメーション) */}
              {isThinking && (
                <div className="ai-msg ai-msg-bot">
                  <style>{`
                    @keyframes bounce {
                      0%, 80%, 100% { transform: scale(0); }
                      40% { transform: scale(1.0); }
                    }
                  `}</style>
                  <div className="ai-msg-bubble" style={{ display: 'flex', gap: '4px', padding: '12px 18px', alignItems: 'center', height: '36px' }}>
                    <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--c-accent)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                    <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--c-accent)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.16s' }}></span>
                    <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--c-accent)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.32s' }}></span>
                  </div>
                </div>
              )}

              {/* クイック質問チップス（AIが話していない入力待ちの時は、常に下に表示する） */}
              {!currentTypingText && !isThinking && (
                <div className="ai-suggestions" style={{ marginTop: '12px' }}>
                  {UI_TEXT[currentLang].chips.map((chip, idx) => (
                    <button key={idx} className="ai-chip" onClick={() => handleChipClick(chip)}>{chip}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 入力欄 */}
          <div className="ai-chat-input-area">
            <button className={`ai-voice-btn ${isListening ? 'listening' : ''}`} id="aiVoiceBtn" onClick={toggleListening} title="音声で質問">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
            </button>
            <div className="ai-tinput-wrap">
              <input type="text" id="aiTextInput" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUserSend()} placeholder={UI_TEXT[currentLang].placeholder} />
              <button id="aiSendBtn" onClick={() => handleUserSend()}>{UI_TEXT[currentLang].send}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
