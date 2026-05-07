const state = {
  mode: "board"
};

const modeLabelMap = {
  board: "役員会議",
  "ai-search": "AI検索戦略",
  "google-search": "Google検索 / SEO",
  gbp: "Googleビジネスプロフィール",
  pricing: "料金戦略",
  "us-hotels": "米国ホテル事例",
  free: "自由相談"
};

function $(id) {
  return document.getElementById(id);
}

function badgeClass(status) {
  if (status === "warn") return "warn";
  if (status === "good") return "good";
  return "info";
}

function renderSiteAudit() {
  $("site-audit").innerHTML = window.HOTEL_KNOWLEDGE.siteAudit.map((item) => `
    <div class="audit-item">
      <h4>${item.title}</h4>
      <p>${item.detail}</p>
      <span class="audit-meta ${badgeClass(item.status)}">${item.status === "warn" ? "要改善" : item.status === "good" ? "活用可能" : "伸びしろ"}</span>
    </div>
  `).join("");
}

function renderExecutiveInsights() {
  $("executive-insights").innerHTML = window.HOTEL_KNOWLEDGE.executiveInsights.map((item) => `
    <div class="insight-item">
      <h4>${item.title}</h4>
      <p>${item.detail}</p>
    </div>
  `).join("");
}

function renderChecklist() {
  $("checklist-container").innerHTML = window.HOTEL_KNOWLEDGE.checklist.map((item) => `
    <div class="check-item">
      <h4>${item.title}</h4>
      <p>${item.detail}</p>
      <span class="check-meta ${badgeClass(item.status)}">${item.status === "warn" ? "未着手/要改善" : item.status === "good" ? "継続運用" : "企画化候補"}</span>
    </div>
  `).join("");
}

function renderSources() {
  $("source-list").innerHTML = window.HOTEL_KNOWLEDGE.sources.map((item) => `
    <div class="source-item">
      <h4><a href="${item.url}" target="_blank" rel="noreferrer">${item.name}</a></h4>
      <p>${item.note}</p>
    </div>
  `).join("");
}

function renderPromptChips() {
  $("prompt-chips").innerHTML = window.HOTEL_KNOWLEDGE.promptChips.map((prompt) => `
    <button class="prompt-chip" data-prompt="${prompt}">${prompt}</button>
  `).join("");

  document.querySelectorAll(".prompt-chip").forEach((button) => {
    button.addEventListener("click", () => {
      $("user-prompt").value = button.dataset.prompt;
    });
  });
}

function renderSchema() {
  $("schema-box").textContent = JSON.stringify(window.HOTEL_KNOWLEDGE.schemaTemplate, null, 2);
}

function updateMode() {
  state.mode = $("mode-select").value;
  $("response-mode").textContent = `モード: ${modeLabelMap[state.mode]}`;
  // Removed auto-filling of default prompts to keep the textarea empty
}

function buildPricingSuggestion() {
  const occ = Number($("occ-input").value || 0);
  const adr = Number($("adr-input").value || 0);
  const compGap = Number($("comp-input").value || 0);
  const eventScore = Number($("event-input").value || 0);
  const pace = Number($("pace-input").value || 0);
  const lead = Number($("lead-input").value || 0);

  let pct = 0;
  const reasons = [];

  if (occ >= 90) {
    pct += 25;
    reasons.push("稼働率90%以上のため、基準ルールとして強気運用");
  } else if (occ >= 70) {
    pct += 10;
    reasons.push("稼働率70〜89%のため、基準ルールとして上方修正");
  } else if (occ < 50) {
    pct -= 10;
    reasons.push("稼働率50%未満のため、基準ルールとして需要喚起が必要");
  } else {
    reasons.push("稼働率50〜69%のため、基準ルールでは据え置き帯");
  }

  if (eventScore > 0) {
    const eventImpact = Math.min(eventScore * 4, 16);
    pct += eventImpact;
    reasons.push(`イベント強度${eventScore}のため +${eventImpact}% 調整`);
  }

  if (pace !== 0) {
    const paceImpact = Math.max(-8, Math.min(8, Math.round(pace * 0.4)));
    pct += paceImpact;
    reasons.push(`予約ペース指数を反映して ${paceImpact >= 0 ? "+" : ""}${paceImpact}% 調整`);
  }

  if (compGap > 1500 && occ >= 70) {
    pct += 5;
    reasons.push("競合より安く、かつ需要もあるため、値上げ余地あり");
  } else if (compGap < -1500 && occ < 70) {
    pct -= 4;
    reasons.push("競合より高く、需要も弱いため、微調整が妥当");
  }

  if (lead <= 5 && occ >= 80) {
    pct += 4;
    reasons.push("直前かつ高稼働のため、直前需要を取りにいく");
  } else if (lead >= 30 && occ < 60) {
    pct -= 3;
    reasons.push("先日程で需要が弱いため、早期予約の刺激が必要");
  }

  pct = Math.max(-15, Math.min(35, pct));

  const recommended = Math.round((adr * (1 + pct / 100)) / 100) * 100;
  const revparBase = Math.round(adr * occ / 100);
  const occAfter = Math.max(40, Math.min(98, occ - Math.max(0, Math.round((pct - 8) * 0.25)) + Math.max(0, Math.round((-pct - 5) * -0.1))));
  const revparAfter = Math.round(recommended * occAfter / 100);
  const confidence = Math.max(62, Math.min(93, 70 + Math.round(Math.abs(pct) * 0.6) + (eventScore * 2)));

  return [
    `推奨改定率: ${pct >= 0 ? "+" : ""}${pct}%`,
    `推奨価格: ¥${recommended.toLocaleString()}`,
    `現状RevPAR目安: ¥${revparBase.toLocaleString()}`,
    `改定後RevPAR試算: ¥${revparAfter.toLocaleString()}`,
    `判断信頼度: ${confidence}%`,
    "",
    "判断理由:",
    ...reasons.map((reason) => `・${reason}`),
    "",
    "役員会議メモ:",
    "・価格だけでなく、『那須の拠点ホテル』としての価値説明とセットで運用する",
    "・イベント日、アウトレット需要、温泉回遊需要、新幹線来訪需要を同じ需要モデルで見直す",
    "・最終反映前に公式予約導線のCVRも確認する"
  ].join("\n");
}

async function askAssistant() {
  const message = $("user-prompt").value.trim();
  const context = $("meeting-context").value.trim();
  const useWeb = $("use-web").checked;

  if (!message) {
    $("assistant-answer").textContent = "相談内容を入力してください。";
    return;
  }

  $("status-pill").className = "status-pill loading";
  $("status-pill").textContent = "回答生成中";
  $("ask-btn").disabled = true;
  $("assistant-answer").textContent = "調査と整理を実行しています...";

  try {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        mode: state.mode,
        context,
        useWeb
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI応答の取得に失敗しました。");
    }

    $("assistant-answer").textContent = data.answer || "回答を取得できませんでした。";
    $("status-pill").className = "status-pill success";
    $("status-pill").textContent = "回答完了";
    
    // Show speak button if content exists
    if (data.answer) {
      $("speak-btn").style.display = "flex";
    }
  } catch (error) {
    $("assistant-answer").textContent = `エラー: ${error.message}\n\nNetlify環境変数の GEMINI_API_KEY と GEMINI_MODEL を確認してください。`;
    $("status-pill").className = "status-pill error";
    $("status-pill").textContent = "エラー";
  } finally {
    $("ask-btn").disabled = false;
  }
}

function initEvents() {
  $("mode-select").addEventListener("change", updateMode);
  $("ask-btn").addEventListener("click", askAssistant);
  
  // Voice Input
  const voiceBtn = $("voice-input-btn");
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = false;

    recognition.onstart = () => {
      voiceBtn.classList.add("recording");
      voiceBtn.innerHTML = '<i class="fas fa-circle"></i> 聞き取り中...';
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      $("user-prompt").value += transcript;
    };

    recognition.onerror = () => {
      voiceBtn.classList.remove("recording");
      voiceBtn.innerHTML = '<i class="fas fa-microphone"></i> 音声入力';
    };

    recognition.onend = () => {
      voiceBtn.classList.remove("recording");
      voiceBtn.innerHTML = '<i class="fas fa-microphone"></i> 音声入力';
    };

    voiceBtn.addEventListener("click", () => {
      recognition.start();
    });
  } else {
    voiceBtn.style.display = "none";
  }

  // Automatic Recording Mode (Meeting Mode)
  const meetingModeBtn = $("meeting-mode-btn");
  let isMeetingMode = false;
  let meetingRecognition = null;

  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    meetingRecognition = new SpeechRecognition();
    meetingRecognition.lang = "ja-JP";
    meetingRecognition.continuous = true;
    meetingRecognition.interimResults = false;

    meetingRecognition.onstart = () => {
      meetingModeBtn.classList.add("recording");
      meetingModeBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> 自動録音中... (REC)';
    };

    meetingRecognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + "。\n";
        }
      }
      if (finalTranscript) {
        $("meeting-context").value += finalTranscript;
        // Auto scroll to bottom
        $("meeting-context").scrollTop = $("meeting-context").scrollHeight;
      }
    };

    meetingRecognition.onend = () => {
      if (isMeetingMode) {
        // Auto-restart if it was stopped by silence or error but mode is still ON
        try {
          meetingRecognition.start();
        } catch (e) {
          console.error("Failed to restart recording:", e);
        }
      } else {
        meetingModeBtn.classList.remove("recording");
        meetingModeBtn.innerHTML = '<i class="fas fa-history"></i> 自動録音モード: OFF';
      }
    };

    meetingRecognition.onerror = (event) => {
      console.error("Meeting Mode Error:", event.error);
      if (event.error === "not-allowed") {
        alert("マイクの使用が許可されていません。");
        isMeetingMode = false;
        meetingModeBtn.classList.remove("recording");
        meetingModeBtn.innerHTML = '<i class="fas fa-history"></i> 自動録音モード: OFF';
      }
    };

    meetingModeBtn.addEventListener("click", () => {
      isMeetingMode = !isMeetingMode;
      if (isMeetingMode) {
        meetingRecognition.start();
      } else {
        meetingRecognition.stop();
      }
    });
  } else {
    meetingModeBtn.style.display = "none";
  }

  // Read Aloud
  $("speak-btn").addEventListener("click", () => {
    const text = $("assistant-answer").textContent;
    if (!text) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      $("speak-btn").innerHTML = '<i class="fas fa-volume-up"></i> 読み上げ';
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 1.0;
    
    utterance.onstart = () => {
      $("speak-btn").innerHTML = '<i class="fas fa-stop"></i> 停止';
    };
    
    utterance.onend = () => {
      $("speak-btn").innerHTML = '<i class="fas fa-volume-up"></i> 読み上げ';
    };

    window.speechSynthesis.speak(utterance);
  });

  $("clear-btn").addEventListener("click", () => {
    $("user-prompt").value = "";
    $("meeting-context").value = "";
    $("speak-btn").style.display = "none";
    window.speechSynthesis.cancel();
  });
  $("simulate-btn").addEventListener("click", () => {
    $("pricing-output").textContent = buildPricingSuggestion();
  });
  $("copy-schema-btn").addEventListener("click", async () => {
    await navigator.clipboard.writeText(JSON.stringify(window.HOTEL_KNOWLEDGE.schemaTemplate, null, 2));
    alert("JSON-LDをコピーしました。");
  });
  $("save-notes-btn").addEventListener("click", () => {
    localStorage.setItem("nasu_midcity_notes", $("notes-area").value);
    alert("会議メモを保存しました。");
  });
  $("clear-notes-btn").addEventListener("click", () => {
    if (confirm("会議メモを消去しますか？")) {
      localStorage.removeItem("nasu_midcity_notes");
      $("notes-area").value = "";
    }
  });

  document.querySelectorAll("[data-fill-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      $("user-prompt").value = button.dataset.fillPrompt;
      document.getElementById("assistant").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function restoreNotes() {
  $("notes-area").value = localStorage.getItem("nasu_midcity_notes") || "";
}

function init() {
  renderSiteAudit();
  renderExecutiveInsights();
  renderChecklist();
  renderSources();
  renderPromptChips();
  renderSchema();
  restoreNotes();
  initEvents();
  updateMode();
  $("pricing-output").textContent = buildPricingSuggestion();
}

init();