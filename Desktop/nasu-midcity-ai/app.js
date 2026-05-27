const state = {
  mode: "board",
  activeTab: "consult", // "consult" or "meeting"
  selectedDept: "coo"
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

// DOMユーティリティ
function $(id) {
  return document.getElementById(id);
}

function badgeClass(status) {
  if (status === "warn") return "warn";
  if (status === "good") return "good";
  return "info";
}

// 1. サイト監査と重要示唆のレンダリング
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

// 2. チェックリストのレンダリング
function renderChecklist() {
  const saved = JSON.parse(localStorage.getItem("nasu_checklist") || "{}");
  $("checklist-container").innerHTML = window.HOTEL_KNOWLEDGE.checklist.map((item, i) => {
    const isDone = saved[i] === true;
    const labelMap = { warn: "未着手/要改善", good: "継続運用", info: "企画化候補" };
    return `
    <div class="check-item ${isDone ? 'done' : ''}" id="check-item-${i}">
      <div class="check-item-header">
        <input type="checkbox" class="interactive-check" id="chk-${i}" ${isDone ? 'checked' : ''}>
        <label for="chk-${i}" style="flex:1; cursor:pointer;">
          <h4>${item.title}</h4>
        </label>
        <span class="check-meta ${badgeClass(item.status)}">${isDone ? '✓ 完了' : labelMap[item.status] || item.status}</span>
      </div>
      <div class="check-item-content">
        <p>${item.detail}</p>
      </div>
    </div>
  `;
  }).join("");

  window.HOTEL_KNOWLEDGE.checklist.forEach((_, i) => {
    const chk = document.getElementById(`chk-${i}`);
    if (chk) {
      chk.addEventListener("change", () => {
        const saved = JSON.parse(localStorage.getItem("nasu_checklist") || "{}");
        saved[i] = chk.checked;
        localStorage.setItem("nasu_checklist", JSON.stringify(saved));
        const itemEl = document.getElementById(`check-item-${i}`);
        if (chk.checked) {
          itemEl.classList.add("done");
          itemEl.querySelector(".check-meta").textContent = "✓ 完了";
          itemEl.querySelector(".check-meta").className = "check-meta good";
        } else {
          itemEl.classList.remove("done");
          const labelMap = { warn: "未着手/要改善", good: "継続運用", info: "企画化候補" };
          const orig = window.HOTEL_KNOWLEDGE.checklist[i];
          itemEl.querySelector(".check-meta").textContent = labelMap[orig.status] || orig.status;
          itemEl.querySelector(".check-meta").className = `check-meta ${badgeClass(orig.status)}`;
        }
      });
    }
  });
}

function renderSources() {
  $("source-list").innerHTML = window.HOTEL_KNOWLEDGE.sources.map((item) => `
    <div class="source-item">
      <h4><a href="${item.url}" target="_blank" rel="noreferrer">${item.name}</a></h4>
      <p>${item.note}</p>
    </div>
  `).join("");
}

// 3. AI組織図の動的レンダリングとイベント
function renderAiOrganization() {
  const org = window.HOTEL_KNOWLEDGE.aiOrganization;
  const listContainer = $("org-departments-list");
  
  // 8つの部署を横並びにレンダリング
  listContainer.innerHTML = org.departments.map(dept => `
    <div class="org-node" id="node-${dept.id}" data-dept="${dept.id}">
      <span class="node-avatar">${dept.avatar}</span>
      <span class="node-name">${dept.name}</span>
      <span class="node-role">${dept.role.substring(0, 14)}${dept.role.length > 14 ? '...' : ''}</span>
    </div>
  `).join("");

  // 全ノード（CEO, COO, 各部署）にクリックイベントを設定
  const allNodes = document.querySelectorAll(".org-node");
  allNodes.forEach(node => {
    node.addEventListener("click", () => {
      const deptId = node.dataset.dept;
      selectDepartment(deptId);
    });
  });
}

function selectDepartment(deptId) {
  const org = window.HOTEL_KNOWLEDGE.aiOrganization;
  let target = null;

  if (deptId === "ceo") {
    target = org.ceo;
  } else if (deptId === "coo") {
    target = org.coo;
  } else {
    target = org.departments.find(d => d.id === deptId);
  }

  if (!target) return;

  // UIのアクティブ状態更新
  document.querySelectorAll(".org-node").forEach(n => n.classList.remove("active"));
  const activeNode = $(`node-${deptId}`);
  if (activeNode) activeNode.classList.add("active");

  // 詳細カードの書き換え
  $("org-detail-avatar").textContent = target.avatar;
  $("org-detail-name").textContent = target.name;
  $("org-detail-role").textContent = target.role;
  $("org-detail-desc").textContent = target.desc;

  // ミッションの表示
  const missionEl = $("org-detail-mission-badge");
  if (target.mission) {
    missionEl.textContent = `🎯 ミッション: ${target.mission}`;
    missionEl.style.display = "inline-flex";
  } else {
    missionEl.style.display = "none";
  }

  // 取り組み（タスク）の表示
  const tasksSection = $("org-detail-tasks-section");
  const tasksList = $("org-detail-tasks-list");
  if (target.tasks && target.tasks.length > 0) {
    tasksList.innerHTML = target.tasks.map(t => `<li>${t}</li>`).join("");
    tasksSection.style.display = "block";
  } else {
    tasksSection.style.display = "none";
  }

  // 個別相談フォームの状態更新
  state.selectedDept = deptId;
  $("selected-dept").value = deptId;
  $("consult-persona-label").textContent = target.name;
  $("response-mode").textContent = `モード: ${target.name}`;

  // プロンプト入力欄にデフォルトのプロンプトを自動セット
  const defaultPrompt = window.HOTEL_KNOWLEDGE.defaultPrompts[deptId] || "";
  $("user-prompt").value = defaultPrompt;

  // 部署に応じたAPI相談モードの決定
  const modeMapping = {
    ceo: "board",
    coo: "board",
    "ai-trends": "ai-search",
    "us-insights": "us-hotels",
    "marketing-ota": "gbp",
    "ai-agent-booking": "ai-search",
    "revenue-management": "pricing",
    "restaurant-strategy": "free",
    "digital-guide": "google-search",
    "hotel-ops": "free"
  };
  state.mode = modeMapping[deptId] || "free";
}

// 4. 客室QR案内サイト一覧のレンダリング
function renderQrGuides() {
  const guides = window.HOTEL_KNOWLEDGE.qrGuides;
  const container = $("qr-guides-grid");

  container.innerHTML = guides.map((guide, idx) => `
    <div class="qr-guide-card">
      <div class="qr-guide-header">
        <h4 class="qr-guide-name">${guide.name}</h4>
        <span class="qr-guide-category">${guide.category}</span>
      </div>
      <p class="qr-guide-desc">${guide.desc}</p>
      <div class="qr-guide-actions">
        <a href="${guide.url}" target="_blank" rel="noreferrer" class="qr-guide-link">
          <i class="fas fa-external-link-alt"></i> サイトを開く
        </a>
        <button class="ghost-btn qr-consult-btn" style="min-height:30px; height:30px; font-size:11px; padding:0 8px; margin-left:auto;" data-idx="${idx}">
          <i class="fas fa-magic"></i> 改善案をAI相談
        </button>
      </div>
    </div>
  `).join("");

  // 改善案をAI相談するボタンのイベント
  container.querySelectorAll(".qr-consult-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.dataset.idx;
      const guide = guides[idx];
      
      // 個別相談タブに切り替え
      switchTab("consult");
      
      // デジタルコンシェルジュ推進部(digital-guide)を選択
      selectDepartment("digital-guide");

      // プロンプトを書き換え
      $("user-prompt").value = `【Netlify案内サイト改善案】\n客室向け案内サイト『${guide.name}』（URL: ${guide.url}）を、より那須ミッドシティホテルのコンセプト「那須の拠点ホテル」に合致させ、お客様の利便性・満足度を高めるためのデジタルコンシェルジュとしての超具体的な改善ポイントや追加すべきコンテンツ提案を作成してください。`;

      // スムーズスクロール
      $("assistant").scrollIntoView({ behavior: "smooth" });
    });
  });
}

// 5. 個別相談プロンプトチップス
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

// 6. タブの切り替え制御
function switchTab(tabMode) {
  state.activeTab = tabMode;

  if (tabMode === "consult") {
    $("tab-consult-btn").className = "primary-btn";
    $("tab-meeting-btn").className = "ghost-btn";
    $("consultation-panel").style.display = "block";
    $("boardroom-panel").style.display = "none";
    $("assistant-title").innerHTML = `<i class="fas fa-robot"></i> 会議同席AI (個別相談)`;
    $("assistant-sub").textContent = "選択したAI部署の担当アドバイザーに直接相談できます";
  } else {
    $("tab-consult-btn").className = "ghost-btn";
    $("tab-meeting-btn").className = "primary-btn";
    $("consultation-panel").style.display = "none";
    $("boardroom-panel").style.display = "block";
    $("assistant-title").innerHTML = `<i class="fas fa-users"></i> AI役員会議シミュレーター`;
    $("assistant-sub").textContent = "COO執行役員がファシリテーターとなり、複数のAI部署を招集して役員会用の提言を練り上げます";
  }
}

// 7. AI会議シミュレーター：議題と参加部署の動的マッピング
const themeDeptsMap = {
  brand: ["ai-trends", "us-insights", "marketing-ota", "ai-agent-booking"],
  "ota-marketing": ["marketing-ota", "revenue-management", "digital-guide"],
  "room-qr": ["restaurant-strategy", "digital-guide", "hotel-ops"],
  "ai-agent": ["ai-trends", "ai-agent-booking", "revenue-management"],
  "pricing-revenue": ["revenue-management", "marketing-ota", "us-insights"],
  "free-agenda": ["ai-trends", "us-insights", "marketing-ota", "ai-agent-booking", "revenue-management", "restaurant-strategy", "digital-guide", "hotel-ops"]
};

function renderBoardroomDepts() {
  const depts = window.HOTEL_KNOWLEDGE.aiOrganization.departments;
  const container = $("meeting-depts-selector");

  container.innerHTML = depts.map(d => `
    <div class="meeting-dept-pill active" id="pill-${d.id}" data-id="${d.id}">
      <span>${d.avatar}</span> ${d.name}
    </div>
  `).join("");

  // Pills クリックイベント
  container.querySelectorAll(".meeting-dept-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      pill.classList.toggle("active");
    });
  });

  // 初期議題（brand）に応じた選択の同期
  syncMeetingDepts("brand");
}

function syncMeetingDepts(themeValue) {
  const targetIds = themeDeptsMap[themeValue] || [];
  const depts = window.HOTEL_KNOWLEDGE.aiOrganization.departments;

  depts.forEach(d => {
    const pill = $(`pill-${d.id}`);
    if (pill) {
      if (targetIds.includes(d.id)) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    }
  });
}

// 8. 個別相談API連携 (askAssistant)
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
        useWeb,
        dept: state.selectedDept
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI応答の取得に失敗しました。");
    }

    $("assistant-answer").textContent = data.answer || "回答を取得できませんでした。";
    $("status-pill").className = "status-pill success";
    $("status-pill").textContent = "回答完了";
    
    // 履歴へ保存
    if (data.answer) {
      saveToHistory(message, data.answer, state.selectedDept);
    }
  } catch (error) {
    $("assistant-answer").textContent = `エラー: ${error.message}\n\nNetlify環境変数の GEMINI_API_KEY と GEMINI_MODEL を確認してください。`;
    $("status-pill").className = "status-pill error";
    $("status-pill").textContent = "エラー";
  } finally {
    $("ask-btn").disabled = false;
  }
}

// 9. AI会議シミュレーターAPI連携 (callMeeting)
async function callMeeting() {
  const themeSelect = $("meeting-theme-select");
  const themeValue = themeSelect.value;
  const themeText = themeSelect.options[themeSelect.selectedIndex].text;
  const customAgenda = $("meeting-agenda-custom").value.trim();
  const context = $("meeting-context").value.trim();
  const useWeb = $("use-web").checked;

  // アクティブな部署の抽出
  const selectedDepts = [];
  window.HOTEL_KNOWLEDGE.aiOrganization.departments.forEach(d => {
    const pill = $(`pill-${d.id}`);
    if (pill && pill.classList.contains("active")) {
      selectedDepts.push(d.name);
    }
  });

  if (selectedDepts.length === 0) {
    alert("会議に参加するAI部署を少なくとも1つ選択してください。");
    return;
  }

  $("boardroom-output").style.display = "block";
  $("boardroom-status-pill").className = "status-pill loading";
  $("boardroom-status-pill").textContent = "会議進行中";
  $("call-meeting-btn").disabled = true;
  $("discussion-flow").innerHTML = '<div style="color:var(--muted); font-size:14px; text-align:center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> COOが関連部署を招集し、ディスカッションを進行しています。この処理には1分程度かかる場合があります...</div>';
  $("boardroom-final-report").textContent = "会議の取りまとめを行っています...";
  $("speak-boardroom-btn").style.display = "none";

  // プロンプトの組み立て
  const agendaMessage = `議題：『${themeText}』について、役員会議に向けたAI部署合同会議を開催します。
${customAgenda ? `【特記指示事項】：\n${customAgenda}` : ""}`;

  try {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: agendaMessage,
        mode: "board",
        context: context,
        useWeb: useWeb,
        isMeeting: true,
        meetingDepts: selectedDepts
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "AI会議応答の取得に失敗しました。");

    // 議論チャットのパースと描画
    parseAndRenderDiscussion(data.answer, selectedDepts);

    // COO報告書のレンダリング（後半の報告書部分を綺麗にみせる）
    // 報告書部分の抽出（「3. 【COO役員会報告書】」以降、もしくは全体を表示）
    const reportMatch = data.answer.match(/(?:3\.\s*【COO役員会報告書】|【COO役員会報告書】)([\s\S]*)/i);
    const finalReportText = reportMatch ? reportMatch[1].trim() : data.answer;
    
    $("boardroom-final-report").textContent = finalReportText;
    $("boardroom-status-pill").className = "status-pill success";
    $("boardroom-status-pill").textContent = "会議終了・報告書完成";
    $("speak-boardroom-btn").style.display = "flex";

    // 相談履歴に保存
    saveToHistory(`【AI役員会議】${themeText}`, data.answer, "coo");

  } catch (error) {
    $("discussion-flow").innerHTML = `<div style="color:var(--danger); padding:16px; border:1px solid var(--line); border-radius:12px; font-weight:700;">会議エラー: ${error.message}</div>`;
    $("boardroom-final-report").textContent = "エラーが発生したため、報告書を生成できませんでした。";
    $("boardroom-status-pill").className = "status-pill error";
    $("boardroom-status-pill").textContent = "エラー";
  } finally {
    $("call-meeting-btn").disabled = false;
  }
}

// 10. 会議回答のパースと吹き出しレンダリング
function parseAndRenderDiscussion(rawAnswer, selectedDepts) {
  const container = $("discussion-flow");
  container.innerHTML = "";
  
  // 1. 【会議の趣旨】の抽出
  let intro = "";
  const introMatch = rawAnswer.match(/(?:1\.\s*【会議の趣旨】|【会議の趣旨】)([\s\S]*?)(?=2\.\s*【各部署からの意見】|【各部署からの意見】|3\.\s*【COO役員会報告書】|【COO役員会報告書】|$)/i);
  if (introMatch) {
    intro = introMatch[1].trim();
    appendSpeechBubble("coo", "COO (AI会議執行役員)", "⚙️", `今回のAI役員会議を招集しました。議題について関連部署から意見を聞き、対応策を練り上げます。\n\n${intro}`);
  } else {
    appendSpeechBubble("coo", "COO (AI会議執行役員)", "⚙️", `今回のAI役員会議を開始します。議題に対して各専門部署の知見を集約し、報告書を策定します。`);
  }
  
  // 2. 各部署の発言の抽出
  let foundAnyDept = false;
  const depts = window.HOTEL_KNOWLEDGE.aiOrganization.departments;
  
  depts.forEach(dept => {
    // 部署名で切り出すための正規表現
    // 例: 「最新AI影響調査部」
    const escapedName = dept.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:【${escapedName}】|■\\s*${escapedName}|[・-]?\\s*${escapedName}\\s*[:：])([\\s\\S]*?)(?=【|■|\\d\\.|【COO|\\n\\n[\\w\\s\\(\\)]+[:：]|$)`, "i");
    const match = rawAnswer.match(regex);
    
    if (match) {
      const speechText = match[1].trim().replace(/^[:：\s]*/, ''); // コロン等を削る
      if (speechText.length > 20) { // 空白に近いものは除外
        appendSpeechBubble(dept.id, dept.name, dept.avatar, speechText);
        foundAnyDept = true;
      }
    }
  });

  // 見つからなかった場合のフォールバック（全体を表示）
  if (!foundAnyDept) {
    // 2. 【各部署からの意見】部分全体を抜き出す
    const opinionsMatch = rawAnswer.match(/(?:2\.\s*【各部署からの意見】|【各部署からの意見】)([\s\S]*?)(?=3\.\s*【COO役員会報告書】|【COO役員会報告書】|$)/i);
    if (opinionsMatch && opinionsMatch[1].trim().length > 30) {
      appendSpeechBubble("departments", "AI招集部署一同", "🤝", opinionsMatch[1].trim());
    } else {
      appendSpeechBubble("coo", "COO (AI会議執行役員)", "⚙️", `議論の内容をふまえ、役員会への最終報告書を以下に取りまとめました。ご確認ください。`);
    }
  }
}

function appendSpeechBubble(id, name, avatar, text) {
  const container = $("discussion-flow");
  const div = document.createElement("div");
  div.className = `discussion-speech ${id === 'coo' ? 'coo' : ''}`;
  div.innerHTML = `
    <div class="speech-avatar">${avatar}</div>
    <div class="speech-body">
      <div class="speech-header">
        <span class="speech-name">${name}</span>
        <span class="speech-role">${id === 'coo' ? '会議進行' : '専門部'}</span>
      </div>
      <div class="speech-text">${text}</div>
    </div>
  `;
  container.appendChild(div);
}

// 11. 履歴の保存と読込
function saveToHistory(question, answer, deptId) {
  const org = window.HOTEL_KNOWLEDGE.aiOrganization;
  let deptName = "専用AI";
  if (deptId === "ceo") deptName = org.ceo.name;
  else if (deptId === "coo") deptName = org.coo.name;
  else {
    const d = org.departments.find(x => x.id === deptId);
    if (d) deptName = d.name;
  }

  const history = JSON.parse(localStorage.getItem("nasu_ai_history") || "[]");
  history.unshift({
    id: Date.now(),
    date: new Date().toLocaleString("ja-JP"),
    mode: state.mode,
    deptName: deptName,
    question: question,
    answer: answer
  });

  if (history.length > 50) history.pop();
  localStorage.setItem("nasu_ai_history", JSON.stringify(history));
  renderHistory();
  $("speak-btn").style.display = "flex";
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("nasu_ai_history") || "[]");
  const container = $("history-container");
  if (history.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); font-size: 14px; padding: 16px 0;">まだ履歴がありません。AIに相談すると、ここに自動保存されます。</p>';
    return;
  }
  container.innerHTML = history.map(item => `
    <div class="history-item" id="hist-${item.id}">
      <div class="history-meta">
        <span class="check-meta good">${item.deptName || "専用AI"}</span>
        <span style="font-size: 12px; color: var(--muted); margin-left: 8px;">${item.date}</span>
        <button class="icon-btn ghost" style="margin-left: auto; font-size: 11px; padding: 3px 8px;" onclick="deleteHistory(${item.id})"><i class="fas fa-trash-alt"></i></button>
      </div>
      <div class="history-question"><strong>Q:</strong> ${item.question.substring(0, 80)}${item.question.length > 80 ? '...' : ''}</div>
      <div class="history-answer">${item.answer}</div>
      <button class="ghost-btn" style="margin-top: 8px; font-size: 12px;" onclick="loadHistoryToContext(${item.id})"><i class="fas fa-file-import"></i> 補足メモに読み込む</button>
    </div>
  `).join("");
}

window.deleteHistory = function(id) {
  if (!confirm("この履歴を削除しますか？")) return;
  const history = JSON.parse(localStorage.getItem("nasu_ai_history") || "[]");
  const filtered = history.filter(h => h.id !== id);
  localStorage.setItem("nasu_ai_history", JSON.stringify(filtered));
  renderHistory();
};

window.loadHistoryToContext = function(id) {
  const history = JSON.parse(localStorage.getItem("nasu_ai_history") || "[]");
  const item = history.find(h => h.id === id);
  if (!item) return;
  const ctx = $("meeting-context");
  ctx.value += `\n\n【過去の相談 ${item.date}】\nQ: ${item.question}\nA: ${item.answer.substring(0, 500)}...`;
  localStorage.setItem("nasu_midcity_context", ctx.value);
  $("assistant").scrollIntoView({ behavior: "smooth" });
  alert("補足メモに読み込みました。");
};

// 12. ダイナミックプライシング試算
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

// 13. イベントリスナーと初期化
function initEvents() {
  $("ask-btn").addEventListener("click", askAssistant);
  $("call-meeting-btn").addEventListener("click", callMeeting);
  
  // Tab切り替え
  $("tab-consult-btn").addEventListener("click", () => switchTab("consult"));
  $("tab-meeting-btn").addEventListener("click", () => switchTab("meeting"));

  // 議題切り替え時の部署チェック同期
  $("meeting-theme-select").addEventListener("change", (e) => {
    syncMeetingDepts(e.target.value);
  });

  // 音声入力
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

  // 議事録自動録音モード
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
        const contextArea = $("meeting-context");
        contextArea.value += finalTranscript;
        contextArea.scrollTop = contextArea.scrollHeight;
        localStorage.setItem("nasu_midcity_context", contextArea.value);
      }
    };

    meetingRecognition.onend = () => {
      if (isMeetingMode) {
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

  // 音声読み上げ
  function getBestJapaneseVoice() {
    const voices = window.speechSynthesis.getVoices();
    const priority = [
      v => v.lang === "ja-JP" && v.name.includes("Google") && v.name.includes("Female"),
      v => v.lang === "ja-JP" && v.name.includes("Google"),
      v => v.lang === "ja-JP" && v.name.includes("Microsoft"),
      v => v.lang === "ja-JP" && v.name.includes("Kyoko"),
      v => v.lang === "ja-JP" && v.name.includes("Otoya"),
      v => v.lang === "ja-JP" && !v.name.includes("Compact"),
      v => v.lang === "ja-JP",
    ];
    for (const fn of priority) {
      const found = voices.find(fn);
      if (found) return found;
    }
    return null;
  }

  function speakText(rawText, btnEl) {
    const text = rawText
      .replace(/【.*?】/g, "")
      .replace(/■/g, "")
      .replace(/・/g, "、")
      .replace(/\n{2,}/g, "。\n")
      .replace(/https?:\/\/[^\s]*/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.95;
    utterance.pitch = 1.02;

    const voice = getBestJapaneseVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      btnEl.innerHTML = '<i class="fas fa-stop"></i> 停止';
    };
    utterance.onend = () => {
      btnEl.innerHTML = btnEl.id === "speak-btn" ? '<i class="fas fa-volume-up"></i> 読み上げ' : '<i class="fas fa-volume-up"></i> 報告書読み上げ';
    };
    utterance.onerror = () => {
      btnEl.innerHTML = btnEl.id === "speak-btn" ? '<i class="fas fa-volume-up"></i> 読み上げ' : '<i class="fas fa-volume-up"></i> 報告書読み上げ';
    };

    window.speechSynthesis.speak(utterance);
  }

  $("speak-btn").addEventListener("click", () => {
    const text = $("assistant-answer").textContent;
    if (!text || text === "ここにAIの回答が表示されます。") return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      $("speak-btn").innerHTML = '<i class="fas fa-volume-up"></i> 読み上げ';
      return;
    }
    speakText(text, $("speak-btn"));
  });

  $("speak-boardroom-btn").addEventListener("click", () => {
    const text = $("boardroom-final-report").textContent;
    if (!text || text === "ここにAI会議の結果と、COO報告書が生成されます。") return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      $("speak-boardroom-btn").innerHTML = '<i class="fas fa-volume-up"></i> 報告書読み上げ';
      return;
    }
    speakText(text, $("speak-boardroom-btn"));
  });

  $("clear-btn").addEventListener("click", () => {
    $("user-prompt").value = "";
    $("meeting-context").value = "";
    $("speak-btn").style.display = "none";
    window.speechSynthesis.cancel();
  });
  $("clear-boardroom-btn").addEventListener("click", () => {
    $("meeting-agenda-custom").value = "";
    syncMeetingDepts($("meeting-theme-select").value);
    $("boardroom-output").style.display = "none";
    window.speechSynthesis.cancel();
  });
  $("simulate-btn").addEventListener("click", () => {
    $("pricing-output").textContent = buildPricingSuggestion();
  });
  $("generate-schema-btn").addEventListener("click", async () => {
    const context = $("meeting-context").value.trim();
    const notes = $("notes-area").value.trim();
    
    $("schema-status").style.display = "block";
    $("generate-schema-btn").disabled = true;
    $("schema-box").textContent = "AIが会議内容から構造化データを構築しています...";

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "【重要：JSON-LD生成依頼】これまでの会議の内容やメモを踏まえて、那須ミッドシティホテルの最新の構造化データ（JSON-LD）を作成してください。説明文（description）やキーワードを、最新の決定事項に合わせて最適化してください。回答は、余計な説明文を入れず、```json ... ``` の形式でJSONコードのみを返してください。",
          mode: "google-search",
          context: `【会議補足メモ】\n${context}\n\n【会議メモ】\n${notes}`,
          useWeb: false
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const jsonMatch = data.answer.match(/```json\n([\s\S]*?)\n```/) || data.answer.match(/```([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : data.answer;
      
      try {
        const parsed = JSON.parse(jsonStr.trim());
        $("schema-box").textContent = JSON.stringify(parsed, null, 2);
        $("schema-status").textContent = "✓ 最新の会議内容を反映しました";
      } catch (e) {
        $("schema-box").textContent = jsonStr.trim();
        $("schema-status").textContent = "✓ 生成が完了しました（内容を確認してください）";
      }
    } catch (error) {
      $("schema-box").textContent = "生成エラー: " + error.message;
      $("schema-status").textContent = "エラーが発生しました";
    } finally {
      $("generate-schema-btn").disabled = false;
      setTimeout(() => { $("schema-status").style.display = "none"; }, 5000);
    }
  });

  $("copy-schema-btn").addEventListener("click", async () => {
    await navigator.clipboard.writeText($("schema-box").textContent);
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
      $("assistant").scrollIntoView({ behavior: "smooth" });
      
      if (button.dataset.autoSubmit === "true") {
        setTimeout(() => {
          askAssistant();
        }, 500);
      }
    });
  });

  $("meeting-context").addEventListener("input", () => {
    localStorage.setItem("nasu_midcity_context", $("meeting-context").value);
  });

  $("clear-context-btn").addEventListener("click", () => {
    if (confirm("会議補足メモをクリアしますか？")) {
      $("meeting-context").value = "";
      localStorage.removeItem("nasu_midcity_context");
    }
  });

  $("clear-history-btn").addEventListener("click", () => {
    if (confirm("AI相談履歴をすべて消去しますか？\nこの操作は元に戻せません。")) {
      localStorage.removeItem("nasu_ai_history");
      renderHistory();
    }
  });

  $("load-history-btn").addEventListener("click", () => {
    const history = JSON.parse(localStorage.getItem("nasu_ai_history") || "[]");
    if (history.length === 0) { alert("履歴がありません。"); return; }
    const summary = history.slice(0, 5).map(h =>
      `【${h.date} / ${h.deptName}】\nQ: ${h.question.substring(0, 60)}...\nA: ${h.answer.substring(0, 200)}...`
    ).join("\n\n---\n\n");
    const ctx = $("meeting-context");
    ctx.value = `【直近のAI相談履歴（要約）】\n\n${summary}\n\n` + ctx.value;
    localStorage.setItem("nasu_midcity_context", ctx.value);
    alert("直近5件の履歴を補足メモに読み込みました。");
  });
}

function restoreNotes() {
  $("notes-area").value = localStorage.getItem("nasu_midcity_notes") || "";
  $("meeting-context").value = localStorage.getItem("nasu_midcity_context") || "";
}

// 共通データ基盤カードの動的描画
function renderDatabaseBadges() {
  const db = window.HOTEL_KNOWLEDGE.aiOrganization.sharedDatabase;
  const container = $("database-badges-grid");
  if (!container) return;

  const methodClassMap = {
    "メール解析": "email",
    "CSVインポート": "csv",
    "Webスクレイピング": "scrape",
    "Web API": "api"
  };

  const savedTimes = JSON.parse(localStorage.getItem("nasu_db_sync_times") || "{}");

  container.innerHTML = db.map((item, idx) => {
    const methodClass = methodClassMap[item.method] || "api";
    const lastSync = savedTimes[item.name] || "未同期";
    return `
      <div class="db-badge-card" id="db-card-${idx}">
        <span class="db-badge-name">${item.name}</span>
        <span class="db-badge-method ${methodClass}">${item.method}</span>
        <div class="db-badge-status">
          <span>更新: ${item.freq}</span>
          <span class="sync-time-label" data-name="${item.name}">${lastSync}</span>
        </div>
      </div>
    `;
  }).join("");
}

// 非APIデータ取込シミュレーターの制御ロジック
function initSimulators() {
  // 1. タブ切り替え
  const tabIds = ["tab-sim-csv", "tab-sim-email", "tab-sim-scrape"];
  const contentIds = ["sim-content-csv", "sim-content-email", "sim-content-scrape"];

  tabIds.forEach((tabId, idx) => {
    const tabBtn = $(tabId);
    if (tabBtn) {
      tabBtn.addEventListener("click", () => {
        tabIds.forEach(id => $(id).classList.remove("active"));
        contentIds.forEach(id => $(id).classList.remove("active"));
        tabBtn.classList.add("active");
        $(contentIds[idx]).classList.add("active");
      });
    }
  });

  // 2. CSVアップロードシミュレータ
  const dropZone = $("csv-drop-zone");
  const fileInput = $("csv-file-input");

  if (dropZone && fileInput) {
    ["dragenter", "dragover"].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add("highlight");
      }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove("highlight");
      }, false);
    });

    dropZone.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        handleCsvUpload(files[0]);
      }
    }, false);

    fileInput.addEventListener("change", (e) => {
      if (fileInput.files.length > 0) {
        handleCsvUpload(fileInput.files[0]);
      }
    });
  }

  // 3. メール解析シミュレータ
  const parseEmailBtn = $("run-email-parse-btn");
  if (parseEmailBtn) {
    parseEmailBtn.addEventListener("click", handleEmailParse);
  }

  // 4. クローラーシミュレータ
  const runScraperBtn = $("run-scraper-btn");
  if (runScraperBtn) {
    runScraperBtn.addEventListener("click", handleScraperRun);
  }
}

function updateDatabaseSyncTime(dataNames, timeStr) {
  const savedTimes = JSON.parse(localStorage.getItem("nasu_db_sync_times") || "{}");
  dataNames.forEach(name => {
    savedTimes[name] = timeStr;
  });
  localStorage.setItem("nasu_db_sync_times", JSON.stringify(savedTimes));

  const labels = document.querySelectorAll(".sync-time-label");
  labels.forEach(label => {
    const name = label.dataset.name;
    if (dataNames.includes(name)) {
      label.textContent = timeStr;
      const card = label.closest(".db-badge-card");
      if (card) {
        card.style.borderColor = "var(--brand)";
        card.style.boxShadow = "0 0 15px rgba(192, 148, 88, 0.3)";
        setTimeout(() => {
          card.style.borderColor = "";
          card.style.boxShadow = "";
        }, 1500);
      }
    }
  });
}

function handleCsvUpload(file) {
  if (!file.name.endsWith(".csv")) {
    alert("CSVファイルを選択してください。");
    return;
  }

  const progressBox = $("csv-progress-box");
  const progressBar = $("csv-progress-bar");
  const progressStatus = $("csv-progress-status");
  const resultBox = $("csv-result-box");

  progressBox.style.display = "block";
  resultBox.style.display = "none";
  progressBar.style.width = "0%";
  progressStatus.textContent = `${file.name} を読み込み中... 0%`;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 20) + 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      setTimeout(() => {
        progressStatus.textContent = `✓ 解析完了 100%`;
        progressBar.style.width = "100%";
        
        const now = new Date().toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        resultBox.innerHTML = `
          <h6><i class="fas fa-check-circle"></i> インポート成功 (同期時刻: ${now})</h6>
          <ul style="margin:0; padding-left:20px; font-size:12.5px; line-height:1.6; color:var(--text);">
            <li>ファイル名: <strong>${file.name}</strong></li>
            <li>レコード件数: <strong>86件</strong></li>
            <li>対応データ基盤: <strong>宿泊データ</strong>、<strong>価格データ</strong></li>
            <li>AI連携: <strong>宿泊プラン & 価格策定部</strong>、<strong>ホテル運営効率化部</strong>にデータを同期しました。</li>
          </ul>
        `;
        resultBox.style.display = "block";
        updateDatabaseSyncTime(["宿泊データ", "価格データ"], now);
      }, 300);
    } else {
      progressBar.style.width = `${progress}%`;
      progressStatus.textContent = `${file.name} を読み込み中... ${progress}%`;
    }
  }, 100);
}

function handleEmailParse() {
  const text = $("email-raw-text").value.trim();
  const resultContainer = $("email-parsed-results");

  if (!text) {
    resultContainer.innerHTML = `<p style="color:var(--danger); font-size:12.5px;">メール本文を入力してください。</p>`;
    return;
  }

  resultContainer.innerHTML = `<p class="placeholder-text"><i class="fas fa-spinner fa-spin"></i> AIメール解析エンジン実行中...</p>`;

  setTimeout(() => {
    const resNoMatch = text.match(/【予約番号】\s*([A-Z0-9]+)/i);
    const nameMatch = text.match(/【宿泊代表者名】\s*([^\n(]+)/);
    const dateMatch = text.match(/【宿泊開始日】\s*([^\n]+)/);
    const roomMatch = text.match(/【部屋タイプ】\s*([^\n]+)/);
    const planMatch = text.match(/【プラン名】\s*([^\n]+)/);
    const priceMatch = text.match(/【合計料金】\s*([^\n]+)/);

    const now = new Date().toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (nameMatch || resNoMatch) {
      resultContainer.innerHTML = `
        <div class="parsed-results">
          <h6><i class="fas fa-magic"></i> AI抽出結果 (同期: ${now})</h6>
          <div class="parsed-item"><span>予約番号</span><span>${resNoMatch ? resNoMatch[1].trim() : '検出なし'}</span></div>
          <div class="parsed-item"><span>宿泊代表者</span><span>${nameMatch ? nameMatch[1].trim() : '解析エラー'}</span></div>
          <div class="parsed-item"><span>宿泊開始日</span><span>${dateMatch ? dateMatch[1].trim() : '未検出'}</span></div>
          <div class="parsed-item"><span>部屋タイプ</span><span>${roomMatch ? roomMatch[1].trim() : '未検出'}</span></div>
          <div class="parsed-item"><span>プラン名</span><span>${planMatch ? planMatch[1].trim() : '未検出'}</span></div>
          <div class="parsed-item"><span>合計料金</span><span>${priceMatch ? priceMatch[1].trim() : '未検出'}</span></div>
          <p style="color:#48bb78; font-size:11.5px; margin:10px 0 0 0; font-weight:700;"><i class="fas fa-check"></i> 共通データ基盤の「予約データ」「顧客データ」に同期しました。</p>
        </div>
      `;
      updateDatabaseSyncTime(["予約データ", "顧客データ"], now);
    } else {
      resultContainer.innerHTML = `
        <div class="parsed-results">
          <h6><i class="fas fa-triangle-exclamation" style="color:var(--warn)"></i> 抽出部分一致</h6>
          <p style="font-size:12px; color:#8fa397; line-height:1.5;">既定フォーマットではありませんが、テキストデータを解析し「予約データ」にインポートしました。</p>
          <p style="color:#48bb78; font-size:11.5px; margin:10px 0 0 0; font-weight:700;"><i class="fas fa-check"></i> 共通データ基盤の「予約データ」に同期しました。</p>
        </div>
      `;
      updateDatabaseSyncTime(["予約データ"], now);
    }
  }, 800);
}

function handleScraperRun() {
  const terminal = $("scrape-log-terminal");
  const targetComp = $("scrape-target-comp").checked;
  const targetGbp = $("scrape-target-gbp").checked;
  const targetSns = $("scrape-target-sns").checked;

  if (!targetComp && !targetGbp && !targetSns) {
    alert("取得ターゲットを少なくとも1つ選択してください。");
    return;
  }

  terminal.innerHTML = "";
  appendLog("exec", "$ bash run_crawler.sh --targets=" + [targetComp ? 'comp' : '', targetGbp ? 'gbp' : '', targetSns ? 'sns' : ''].filter(Boolean).join(","));
  appendLog("info", "クローラーシステム起動中...");

  let logs = [];
  if (targetComp) {
    logs.push(
      { type: "info", text: "OTA(じゃらん/楽天)の周辺競合ホテル価格データの巡回を開始..." },
      { type: "info", text: "競合ホテルA: 宿泊プラン「スタンダード」➔ 価格 ¥8,600 取得成功" },
      { type: "info", text: "競合ホテルB: 宿泊プラン「朝食付」 ➔ 価格 ¥9,200 取得成功" },
      { type: "success", text: "✔ 競合ホテルの宿泊価格データ（3店舗分）同期完了" }
    );
  }
  if (targetGbp) {
    logs.push(
      { type: "info", text: "Googleビジネスプロフィール / 口コミのクローリング開始..." },
      { type: "warn", text: "⚠ 新規口コミを1件検出: 「那須塩原駅からすぐで出張時に非常に便利でした。朝食の那須御養卵TKGが美味しい。」" },
      { type: "info", text: "口コミ感情分析を実行中... [ポジティブ (スコア: 0.92)]" },
      { type: "success", text: "✔ 口コミデータ同期完了 ➔ レストラン戦略部、最新AI影響調査部へ通知同期" }
    );
  }
  if (targetSns) {
    logs.push(
      { type: "info", text: "那須観光協会および周辺イベント情報の収集開始..." },
      { type: "info", text: "イベント検出: 「那須フラワーワールド バラ祭り」期間: 06/01 - 06/25" },
      { type: "success", text: "✔ 那須周辺イベント・周遊観光データ同期完了" }
    );
  }

  logs.push({ type: "success", text: ">>> 全クローラータスクが正常終了しました。 [Exit Code: 0]" });

  let i = 0;
  function printNextLog() {
    if (i < logs.length) {
      appendLog(logs[i].type, logs[i].text);
      i++;
      terminal.scrollTop = terminal.scrollHeight;
      setTimeout(printNextLog, Math.random() * 200 + 150);
    } else {
      const now = new Date().toLocaleTimeString("ja-JP", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const syncedTargets = [];
      if (targetComp) syncedTargets.push("競合データ");
      if (targetGbp) syncedTargets.push("口コミデータ");
      if (targetSns) syncedTargets.push("周遊観光データ", "SNSデータ");
      updateDatabaseSyncTime(syncedTargets, now);
    }
  }

  setTimeout(printNextLog, 400);
}

function appendLog(type, text) {
  const terminal = $("scrape-log-terminal");
  const p = document.createElement("p");
  p.className = `log-${type}`;
  p.innerHTML = `[${new Date().toLocaleTimeString("ja-JP")}] ${text}`;
  terminal.appendChild(p);
}

function init() {
  renderSiteAudit();
  renderExecutiveInsights();
  renderChecklist();
  renderSources();
  renderAiOrganization();
  renderQrGuides();
  renderPromptChips();
  renderBoardroomDepts();
  renderSchema();
  restoreNotes();
  renderHistory();
  initEvents();
  
  // 新規追加
  renderDatabaseBadges();
  initSimulators();
  
  // 初期状態をCOO(AI会議執行役員)に設定
  selectDepartment("coo");
  
  $("pricing-output").textContent = buildPricingSuggestion();
}

init();