document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("aiWidgetContainer");
    if (!container) return;

    // 🔑 TEMPELKAN GEMINI API KEY KAMU DI SINI
    const GEMINI_API_KEY = "AQ.Ab8RN6LvouacimckxnjOGWdDVDXJr5eCVAOk9qmKi4z__Yv0vg";

    let certificatesData = [];
    let videosData = [];
    let blogsData = [];
    let excelKnowledgeData = [
        { Keyword: "hobi, kegemaran, suka apa", Answer: "Hobi saya adalah koding, mengeksplorasi teknologi web modern, dan mendaki gunung." },
        { Keyword: "pengalaman, magang, kerja", Answer: "Saya memiliki pengalaman dalam pengembangan web front-end, pengelolaan server Linux, dan perancangan UI/UX." },
        { Keyword: "sosmed, instagram, github, linkedin", Answer: "Kamu bisa terhubung melalui akun GitHub dan LinkedIn resmi yang tertera di bagian footer website ini!" }
    ];

    let lastTopicContext = "";
    let interactionCount = parseInt(localStorage.getItem("ai_interaction_count") || "0");
    let isSpeechEnabled = false;
    const synth = window.speechSynthesis;
    let selectedVoice = null;

    function initVoices() {
        if (!synth) return;
        const voices = synth.getVoices();
        selectedVoice = voices.find(v => v.lang.includes("id") || v.lang.includes("ID")) || voices[0];
    }
    if (synth) {
        initVoices();
        if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = initVoices;
    }

    function getDynamicGreeting() {
        const hour = new Date().getHours();
        if (hour >= 3 && hour < 11) return "Selamat pagi 🌅";
        if (hour >= 11 && hour < 15) return "Selamat siang ☀️";
        if (hour >= 15 && hour < 18) return "Selamat sore 🌇";
        return "Selamat malam 🌙";
    }

    function getDeveloperStatus() {
        const hour = new Date().getHours();
        if (hour >= 8 && hour < 22) return '<span class="status-online" style="color: #00e676;">● Online — Hybrid AI Active</span>';
        return '<span style="color: #94a3b8;">○ Offline — Gemini Standby</span>';
    }

    async function loadExcelKnowledge() {
        try {
            if (typeof XLSX === "undefined") return;
            const response = await fetch("knowledge.xlsx");
            if (!response.ok) return;

            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const sheetData = XLSX.utils.sheet_to_json(worksheet);
            if (sheetData && sheetData.length > 0) {
                excelKnowledgeData = sheetData;
            }
        } catch (error) {
            console.log("Menggunakan database pengetahuan bawaan.");
        }
    }

    async function ensureGlobalDataLoaded() {
        await loadExcelKnowledge();

        if (typeof videos !== "undefined" && videos.length > 0) {
            videosData = videos;
        } else if (videosData.length === 0) {
            try {
                const res = await fetch("videos.html");
                if (res.ok) {
                    const html = await res.text();
                    const match = html.match(/const\s+videos\s*=\s*(\[[\s\S]*?\]);/);
                    if (match && match[1]) videosData = eval(match[1]);
                }
            } catch (e) {}
        }

        if (typeof POSTS !== "undefined" && POSTS.length > 0) {
            blogsData = POSTS;
        } else if (blogsData.length === 0) {
            try {
                const res = await fetch("blog.html");
                if (res.ok) {
                    const html = await res.text();
                    const match = html.match(/const\s+POSTS\s*=\s*(\[[\s\S]*?\]);/);
                    if (match && match[1]) blogsData = eval(match[1]);
                }
            } catch (e) {}
        }
    }

    // 🚀 INTEGRASI GEMINI API
    async function askGeminiAI(userPrompt) {
        if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("PASTE_GEMINI")) {
            return "Wah, obrolan yang menarik! Tapi kalau soal isi portofolio, kamu bisa pilih menu cepat di bawah ini atau tanya hal lain ya:";
        }

        const systemInstruction = "Kamu adalah Asisten AI ramah dari website portofolio interaktif milik Muhammad Zahril Fathan, mahasiswa Teknik Informatika di Universitas Nusa Putra. Jawablah pertanyaan pengunjung secara cerdas, ramah, dan ringkas dalam Bahasa Indonesia.";

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: systemInstruction },
                            { text: userPrompt }
                        ]
                    }]
                })
            });

            if (!response.ok) throw new Error("Gagal terhubung ke Gemini API");

            const data = await response.json();
            const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            return replyText || "Maaf, Gemini AI belum memberikan balasan.";
        } catch (error) {
            return "Wah, obrolan yang menarik! Tapi kalau soal isi portofolio, kamu bisa pilih menu cepat di bawah ini:";
        }
    }

    container.innerHTML = `
        <style>
            .typing-indicator { display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px; }
            .typing-indicator span { width: 6px; height: 6px; background-color: currentColor; border-radius: 50%; opacity: 0.4; animation: aiTypingBounce 1.2s infinite ease-in-out; }
            .typing-indicator span:nth-child(1) { animation-delay: 0s; }
            .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
            .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes aiTypingBounce { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-4px); opacity: 1; } }

            .ai-header-actions { display: flex; align-items: center; gap: 8px; }
            .ai-icon-btn { background: transparent; border: none; color: var(--text-dim, #94a3b8); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: color 0.2s, background 0.2s; }
            .ai-icon-btn:hover { color: #00f2fe; background: rgba(255, 255, 255, 0.1); }
            .ai-icon-btn.active { color: #00e676; }

            .ai-suggestions { display: flex; gap: 6px; overflow-x: auto; padding: 6px 0; margin-top: 6px; scroll-snap-type: x mandatory; }
            .ai-chip { background: rgba(0, 242, 254, 0.1); border: 1px solid rgba(0, 242, 254, 0.25); color: var(--primary-color, #00f2fe); border-radius: 20px; padding: 4px 10px; font-size: 11px; white-space: nowrap; cursor: pointer; transition: all 0.2s ease; scroll-snap-align: start; }
            .ai-chip:hover { background: rgba(0, 242, 254, 0.25); transform: translateY(-1px); }

            .cert-gallery-container { margin-top: 8px; display: flex; flex-direction: column; gap: 8px; }
            .cert-filter-pills { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; }
            .cert-filter-btn { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 2px 10px; font-size: 11px; cursor: pointer; white-space: nowrap; color: inherit; }
            .cert-filter-btn.active { background: #00f2fe; color: #020617; font-weight: bold; border-color: #00f2fe; }
            .cert-cards-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; scroll-snap-type: x mandatory; }
            .cert-card-item { flex: 0 0 140px; scroll-snap-align: start; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 242, 254, 0.2); border-radius: 8px; overflow: hidden; cursor: pointer; transition: transform 0.2s, border-color 0.2s; }
            .cert-card-item:hover { transform: translateY(-2px); border-color: #00f2fe; }
            .cert-card-item img { width: 100%; height: 80px; object-fit: cover; }
            .cert-card-info { padding: 6px; }
            .cert-card-info h5 { margin: 0; font-size: 11px; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .cert-card-info span { font-size: 10px; color: #00f2fe; }

            .cert-detail-card { background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(0, 242, 254, 0.3); border-radius: 10px; padding: 10px; margin-top: 8px; transition: border-color 0.2s; }
            .cert-detail-card:hover { border-color: #00f2fe; }
            .cert-detail-card img { width: 100%; border-radius: 6px; margin-bottom: 8px; }
            .cert-detail-card h4 { margin: 0 0 4px 0; font-size: 13px; color: #00f2fe; }
            .cert-detail-card p { margin: 0 0 6px 0; font-size: 11px; line-height: 1.4; color: #cbd5e1; }

            .ai-link-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: #00f2fe;
                color: #020617 !important;
                font-weight: 600;
                font-size: 11px;
                padding: 6px 12px;
                border-radius: 6px;
                text-decoration: none !important;
                margin-top: 6px;
                cursor: pointer;
                transition: transform 0.2s, background-color 0.2s;
            }
            .ai-link-btn:hover { background: #38ef7d; transform: translateY(-1px); }

            .ai-copy-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: var(--text-dim, #94a3b8);
                font-size: 10px;
                padding: 3px 8px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 6px;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s;
            }
            .ai-copy-btn:hover { background: rgba(0, 242, 254, 0.2); color: #00f2fe; border-color: #00f2fe; }

            .ai-welcome-card { background: rgba(0, 242, 254, 0.04); border: 1px solid rgba(0, 242, 254, 0.2); border-radius: 14px; padding: 12px 14px; margin-bottom: 6px; backdrop-filter: blur(8px); }
            .ai-welcome-card p { margin: 0 0 10px 0; font-size: 0.85rem; line-height: 1.5; color: #e2e8f0; }
            .ai-welcome-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; color: var(--primary-color, #00f2fe); font-weight: 600; font-size: 0.88rem; }
            .ai-welcome-header i { width: 16px; height: 16px; }

            .ai-chat-body::-webkit-scrollbar-button, .cert-cards-scroll::-webkit-scrollbar-button, .cert-filter-pills::-webkit-scrollbar-button, .ai-suggestions::-webkit-scrollbar-button { display: none !important; width: 0 !important; height: 0 !important; }
            .cert-cards-scroll, .cert-filter-pills, .ai-suggestions { -ms-overflow-style: -ms-autohide-scrollbar; }
            .ai-chat-body::-webkit-scrollbar, .cert-cards-scroll::-webkit-scrollbar, .cert-filter-pills::-webkit-scrollbar, .ai-suggestions::-webkit-scrollbar { height: 4px; width: 4px; }
            .ai-chat-body::-webkit-scrollbar-track, .cert-cards-scroll::-webkit-scrollbar-track, .cert-filter-pills::-webkit-scrollbar-track, .ai-suggestions::-webkit-scrollbar-track { background: transparent; }
            .ai-chat-body::-webkit-scrollbar-thumb, .cert-cards-scroll::-webkit-scrollbar-thumb, .cert-filter-pills::-webkit-scrollbar-thumb, .ai-suggestions::-webkit-scrollbar-thumb { background: rgba(0, 242, 254, 0.3); border-radius: 10px; transition: background 0.3s ease; }
            .ai-chat-body::-webkit-scrollbar-thumb:hover, .cert-cards-scroll::-webkit-scrollbar-thumb:hover, .cert-filter-pills::-webkit-scrollbar-thumb:hover, .ai-suggestions::-webkit-scrollbar-thumb:hover { background: #00f2fe; }

            .ai-popup-chat { will-change: left, top; }
            .ai-chat-footer input { font-size: 16px !important; touch-action: manipulation; }

            .ai-icon-btn .icon-speech-off { display: block; }
            .ai-icon-btn .icon-speech-on { display: none; }
            .ai-icon-btn.active .icon-speech-off { display: none; }
            .ai-icon-btn.active .icon-speech-on { display: block; }
        </style>

        <button class="ai-fab-button" id="aiBtn" aria-label="Buka AI Chat">
            <i data-lucide="bot" id="aiIconBot"></i>
            <span class="ai-badge-pulse"></span>
        </button>

        <div class="ai-popup-chat glass-card" id="aiWindow">
            <div class="ai-chat-header">
                <div class="ai-brand">
                    <div class="ai-avatar"><i data-lucide="sparkles"></i></div>
                    <div>
                        <h4>Smart AI Agent v13.0</h4>
                        ${getDeveloperStatus()}
                    </div>
                </div>
                <div class="ai-header-actions">
                    <button class="ai-icon-btn" id="aiVoiceToggle" title="Aktifkan Suara Voice">
                        <i data-lucide="volume-x" class="icon-speech-off"></i>
                        <i data-lucide="volume-2" class="icon-speech-on"></i>
                    </button>
                    <button class="ai-icon-btn" id="aiClearChat" title="Hapus Riwayat">
                        <i data-lucide="trash-2"></i>
                    </button>
                    <button class="ai-close-btn" id="aiClose"><i data-lucide="x"></i></button>
                </div>
            </div>

            <div class="ai-chat-body" id="aiBody">
                <div class="ai-msg bot">
                    <div class="ai-welcome-card">
                        <div class="ai-welcome-header">
                            <i data-lucide="sparkles"></i>
                            <span>${getDynamicGreeting()}! Yuk Ngobrol Santai</span>
                        </div>
                        <p>Selain tanya portofolio, kamu bisa ajak saya ngobrol santai, tanya kabar, atau ngobrol ringan:</p>
                        <div class="ai-suggestions">
                            <button class="ai-chip" data-prompt="Halo, apa kabar?">
                                <i data-lucide="smile"></i> Apa Kabar?
                            </button>
                            <button class="ai-chip" data-prompt="Lagi ngapain nih?">
                                <i data-lucide="cpu"></i> Lagi Ngapain?
                            </button>
                            <button class="ai-chip" data-prompt="Cerita dong">
                                <i data-lucide="message-square"></i> Cerita Dong
                            </button>
                            <button class="ai-chip" data-prompt="Terima kasih ya">
                                <i data-lucide="heart"></i> Makasih Ya
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="ai-chat-footer">
                <input type="text" id="aiInput" placeholder="Ketik pertanyaan atau obrolan di sini..." autocomplete="off">
                <button id="aiSend" class="btn-send"><i data-lucide="send"></i></button>
            </div>
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();

    const aiBtn = document.getElementById("aiBtn");
    const aiWindow = document.getElementById("aiWindow");
    const aiClose = document.getElementById("aiClose");
    const aiSend = document.getElementById("aiSend");
    const aiInput = document.getElementById("aiInput");
    const aiBody = document.getElementById("aiBody");
    const aiVoiceToggle = document.getElementById("aiVoiceToggle");
    const aiClearChat = document.getElementById("aiClearChat");

    function loadChatHistory() {
        const savedHistory = localStorage.getItem("ai_chat_history_v13");
        if (savedHistory) {
            aiBody.innerHTML = savedHistory + `
                <div style="text-align: center; margin: 8px 0;">
                    <span style="font-size: 10px; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 10px; color: var(--text-dim);">Riwayat obrolan dipulihkan (${interactionCount} interaksi)</span>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            aiBody.scrollTop = aiBody.scrollHeight;
        }
    }
    loadChatHistory();

    function saveChatHistory() {
        const messages = aiBody.querySelectorAll(".ai-msg");
        const historyArr = Array.from(messages).slice(-15).map(m => m.outerHTML).join("");
        localStorage.setItem("ai_chat_history_v13", historyArr);
        localStorage.setItem("ai_interaction_count", interactionCount);
    }

    aiBtn.addEventListener("click", () => {
        aiWindow.classList.toggle("active");
        if (aiWindow.classList.contains("active")) aiInput.focus();
    });

    aiClose.addEventListener("click", () => {
        aiWindow.classList.remove("active");
        stopSpeech();
    });

    aiVoiceToggle.addEventListener("click", () => {
        isSpeechEnabled = !isSpeechEnabled;
        aiVoiceToggle.classList.toggle("active", isSpeechEnabled);
        if (!isSpeechEnabled) stopSpeech();
        else speakText("Suara dikondisikan aktif.");
    });

    aiClearChat.addEventListener("click", () => {
        stopSpeech();
        localStorage.removeItem("ai_chat_history_v13");
        localStorage.removeItem("ai_interaction_count");
        interactionCount = 0;
        lastTopicContext = "";
        aiBody.innerHTML = `
            <div class="ai-msg bot">
                Obrolan diatur ulang. Mau ngobrolin apa lagi nih? 😊
                <div class="ai-suggestions">
                    <button class="ai-chip" data-prompt="Halo, apa kabar?">👋 Apa Kabar?</button>
                    <button class="ai-chip" data-prompt="Lagi ngapain nih?">💻 Lagi Ngapain?</button>
                    <button class="ai-chip" data-prompt="Cerita dong">📖 Cerita Dong</button>
                </div>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    function stopSpeech() {
        if (synth) synth.cancel();
    }

    function speakText(text) {
        if (!isSpeechEnabled || !synth) return;
        stopSpeech();
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "id-ID";
        utterance.rate = 1.0;
        if (selectedVoice) utterance.voice = selectedVoice;
        setTimeout(() => { if (isSpeechEnabled) synth.speak(utterance); }, 50);
    }

    async function fetchCertificatesFromPage() {
        if (certificatesData.length > 0) return certificatesData;

        const possiblePaths = ["certificates.html", "/certificates.html", "./certificates.html"];
        let htmlText = "";

        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    htmlText = await response.text();
                    break;
                }
            } catch (e) {}
        }

        if (!htmlText) return [];

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, "text/html");
            const certElements = doc.querySelectorAll(".cert-card");
            const parsedData = [];

            certElements.forEach((el, index) => {
                const img = el.querySelector("img.cert-img")?.getAttribute("src") || "";
                const title = (el.querySelector(".cert-details h3")?.textContent || `Sertifikat ${index + 1}`).trim();
                const description = (el.querySelector(".cert-details p")?.textContent || "Sertifikat resmi portofolio.").trim();
                const category = el.getAttribute("data-cat") || "School";
                const subCategory = el.getAttribute("data-sub") || "";

                if (img || title) {
                    parsedData.push({
                        id: `cert-${index + 1}`,
                        title: title,
                        category: category,
                        subCategory: subCategory,
                        image: img,
                        description: description
                    });
                }
            });

            certificatesData = parsedData;
            return certificatesData;
        } catch (error) {
            return [];
        }
    }

    function cleanQuery(query, stopWords) {
        let cleaned = query.toLowerCase();
        stopWords.forEach(word => {
            cleaned = cleaned.replace(new RegExp("\\b" + word + "\\b", "gi"), "");
        });
        return cleaned.trim().split(/\s+/).filter(k => k.length > 1);
    }

    function searchVideos(query) {
        const vList = (typeof videos !== "undefined" && videos.length > 0) ? videos : videosData;
        if (!vList || vList.length === 0) return [];

        const stopWords = ["cari", "video", "tentang", "ada", "tampilkan", "apa", "apakah", "dikit", "di"];
        const keywords = cleanQuery(query, stopWords);

        return vList.filter(v => {
            const targetStr = (v.title + " " + v.desc).toLowerCase();
            return keywords.length === 0 || keywords.some(k => targetStr.includes(k));
        });
    }

    function searchBlogs(query) {
        const bList = (typeof POSTS !== "undefined" && POSTS.length > 0) ? POSTS : blogsData;
        if (!bList || bList.length === 0) return [];

        const stopWords = ["cari", "artikel", "blog", "tentang", "ada", "apakah", "baca", "atau"];
        const keywords = cleanQuery(query, stopWords);

        return bList.filter(p => {
            const targetStr = (p.title + " " + p.category + " " + p.excerpt + " " + (p.tags || []).join(" ")).toLowerCase();
            return keywords.length === 0 || keywords.some(k => targetStr.includes(k));
        });
    }

    // 🌟 DATABASE OBROLAN SANTAI / SMALL TALK LOKAL
    const smallTalkDatabase = [
        {
            keywords: ["halo", "hai", "hei", "pagi", "siang", "sore", "malam", "assalamualaikum"],
            reply: "Halo juga! Senang bisa ngobrol denganmu hari ini. Ada yang bisa saya bantu atau mau ngobrolin apa nih? 😊"
        },
        {
            keywords: ["apa kabar", "gimana kabarmu", "kabar", "sehat"],
            reply: "Alhamdulillah saya sangat baik dan siap sedia membantu! Kamu sendiri gimana kabarnya? Semoga sehat selalu ya. 🌟"
        },
        {
            keywords: ["lagi ngapain", "sibuk apa", "lagi apa", "kegiatanmu"],
            reply: "Lagi stand-by di portofolio ini buat nemenin kamu keliling melihat karya-karya web development dan artikel keren! Kamu sendiri lagi santai atau sibuk apa nih?"
        },
        {
            keywords: ["terima kasih", "makasih", "thanks", "thx"],
            reply: "Sama-sama dengan senang hati! Kalau ada hal lain yang ingin ditanyakan atau didiskusikan, bilang saja ya. 👍"
        },
        {
            keywords: ["siapa kamu", "nama kamu siapa", "kamu bot", "kamu siapa"],
            reply: "Saya adalah Asisten AI virtual interaktif di portofolio Muhammad Zahril Fathan. Saya dirancang untuk membantumu menjelajahi website ini sekaligus teman ngobrol yang seru!"
        },
        {
            keywords: ["cerita", "dongeng", "hiburan", "lucu"],
            reply: "Cerita apa ya? Hmm... tahukah kamu kalau membuat kode program itu mirip merakit LEGO? Setiap baris kodenya disusun rapi hingga membentuk sebuah aplikasi web yang canggih dan interaktif seperti portofolio ini! 🚀"
        },
        {
            keywords: ["dadah", "sampai jumpa", "bye", "selamat tinggal"],
            reply: "Sampai jumpa lagi! Jangan lupa mampir-mampir lagi ke portofolio ini ya. Have a nice day! 👋"
        }
    ];

    const siteActions = [
        {
            keywords: ["rekomendasikan proyek", "pilihkan proyek", "proyek mana"],
            reply: "Tentu! Jenis proyek apa yang paling ingin Anda lihat?",
            customHTML: `
                <div class="ai-suggestions" style="margin-top:8px;">
                    <button class="ai-chip" data-prompt="ke project">🚀 Semua Proyek</button>
                    <button class="ai-chip" data-prompt="cari artikel web">💻 Web Development</button>
                    <button class="ai-chip" data-prompt="cari video algoritma">🧠 Algoritma & AI</button>
                </div>
            `
        },
        {
            keywords: ["kuliah di mana", "universitas mana", "studi di mana", "kampus mana", "kuliah dimana"],
            reply: "Saya sedang menempuh pendidikan S1 di **Universitas Nusa Putra**, jurusan **Teknik Informatika**."
        },
        {
            keywords: ["trilogi", "nusa putra", "amor deus", "amor parentium", "amor conservis"],
            reply: "Trilogi Nusa Putra terdiri dari 3 nilai luhur:<br>1. **Amor Deus**: Cinta kasih kepada Tuhan.<br>2. **Amor Parentium**: Cinta kasih kepada Orang Tua/Guru.<br>3. **Amor Conservis**: Cinta kasih kepada sesama manusia."
        },
        {
            keywords: ["siapa namamu", "siapa fathan", "biodata"],
            reply: "Website ini merupakan portofolio interaktif karya **Muhammad Zahril Fathan** — Mahasiswa Teknik Informatika Universitas Nusa Putra."
        },
        {
            keywords: ["ke home", "buka home", "halaman utama", "ke beranda"],
            reply: "Siap! Membuka halaman Home & About...",
            action: () => { window.location.href = "index.html"; }
        },
        {
            keywords: ["ke skill", "buka skill", "halaman skill", "keahlian"],
            reply: "Siap! Membuka halaman Skills & Keahlian...",
            action: () => { window.location.href = "skills.html"; }
        },
        {
            keywords: ["ke project", "buka project", "halaman project", "proyek"],
            reply: "Siap! Membuka halaman Projects...",
            action: () => { window.location.href = "projects.html"; }
        },
        {
            keywords: ["ke video", "buka video", "halaman video", "semua video"],
            reply: "Siap! Membuka halaman Videos & Dokumentasi...",
            action: () => { window.location.href = "videos.html"; }
        },
        {
            keywords: ["ke blog", "buka blog", "halaman blog", "semua blog"],
            reply: "Siap! Membuka halaman Blog & Catatan...",
            action: () => { window.location.href = "blog.html"; }
        },
        {
            keywords: ["buka kontak", "hubungi", "kirim pesan", "form kontak"],
            reply: "Siap! Membuka formulir kontak...",
            action: () => {
                const btn = document.getElementById("openContactModal") || document.getElementById("openContactModalHero");
                if (btn) btn.click();
                else window.location.href = "index.html#contact";
            }
        },
        {
            keywords: ["ganti tema", "dark mode", "light mode", "ubah mode"],
            reply: "Siap! Mengubah mode tampilan tema...",
            action: () => {
                const themeBtn = document.getElementById("themeToggle") || document.getElementById("themeToggleBtn");
                if (themeBtn) themeBtn.click();
            }
        }
    ];

    function createCertificateGalleryHTML(data, filterCategory = "All") {
        if (!data || data.length === 0) {
            return `<div style="margin-top:6px; font-size:12px; color:#ef4444;">Tidak ada sertifikat yang cocok.</div>`;
        }

        const categories = ["All", ...new Set(data.map(c => c.category))];
        const filteredData = filterCategory === "All" 
            ? data 
            : data.filter(c => c.category.toLowerCase() === filterCategory.toLowerCase());

        const filterPillsHTML = categories.map(cat => 
            `<button class="cert-filter-btn ${cat.toLowerCase() === filterCategory.toLowerCase() ? 'active' : ''}" data-category="${cat}">${cat.toUpperCase()}</button>`
        ).join("");

        const cardsHTML = filteredData.map(cert => `
            <div class="cert-card-item" data-cert-id="${cert.id}">
                <img src="${cert.image}" alt="${cert.title}" onerror="this.src='https://via.placeholder.com/140x80?text=Sertifikat'">
                <div class="cert-card-info">
                    <h5 title="${cert.title}">${cert.title}</h5>
                    <span>${cert.category}</span>
                </div>
            </div>
        `).join("");

        return `
            <div class="cert-gallery-container">
                <div class="cert-filter-pills">${filterPillsHTML}</div>
                <div class="cert-cards-scroll">${cardsHTML}</div>
            </div>
        `;
    }

    async function processQuery(query) {
        let input = query.toLowerCase().trim();
        await ensureGlobalDataLoaded();
        interactionCount++;

        let sentimentPrefix = "";
        if (input.includes("keren") || input.includes("mantap") || input.includes("hebat") || input.includes("bagus") || input.includes("terima kasih")) {
            sentimentPrefix = "Terima kasih banyak atas apresiasinya! 😊 ";
        } else if (input.includes("jelek") || input.includes("bug") || input.includes("error") || input.includes("payah")) {
            sentimentPrefix = "Mohon maaf atas ketidaknyamanannya, masukan ini sangat berharga. 🙏 ";
        }

        // 🧠 KONTEKS BERLANJUT (Multi-Turn Chat Context)
        if ((input === "di mana?" || input === "dimana?" || input === "kenapa?" || input === "bagaimana?") && lastTopicContext) {
            input = lastTopicContext + " " + input;
        }

        // 1. CEK OBROLAN SANTAI LOKAL
        for (let item of smallTalkDatabase) {
            if (item.keywords.some(k => input.includes(k))) {
                lastTopicContext = "smalltalk";
                return {
                    text: sentimentPrefix + item.reply,
                    customHTML: `
                        <div class="ai-suggestions" style="margin-top:8px;">
                            <button class="ai-chip" data-prompt="Apa hobimu?">😊 Apa Hobimu?</button>
                            <button class="ai-chip" data-prompt="Rekomendasikan proyek">🚀 Lihat Proyek</button>
                        </div>
                    `
                };
            }
        }

        // 2. CEK KNOWLEDGE BASE EXCEL DENGAN PENILAIAN SKOR
        if (excelKnowledgeData && excelKnowledgeData.length > 0) {
            let bestMatch = null;
            let highestScore = 0;
            let matchedTopic = "";

            for (let row of excelKnowledgeData) {
                const keywordVal = row.Keyword || row.keyword || row.KataKunci || row.Pertanyaan || Object.values(row)[0] || "";
                const answerVal = row.Answer || row.answer || row.Jawaban || row.Isi || Object.values(row)[1] || "";

                if (keywordVal) {
                    const keys = String(keywordVal).toLowerCase().split(",");
                    let score = 0;
                    keys.forEach(k => {
                        const cleanK = k.trim();
                        if (input.includes(cleanK) || cleanK.includes(input)) {
                            score += cleanK.length;
                        }
                    });

                    if (score > highestScore) {
                        highestScore = score;
                        bestMatch = String(answerVal);
                        matchedTopic = keys[0];
                    }
                }
            }

            if (bestMatch && highestScore > 1) {
                lastTopicContext = matchedTopic;
                return { 
                    text: sentimentPrefix + bestMatch,
                    customHTML: `
                        <div class="ai-suggestions" style="margin-top:8px;">
                            <button class="ai-chip" data-prompt="Rekomendasikan proyek">🚀 Lihat Proyek</button>
                            <button class="ai-chip" data-prompt="Tampilkan sertifikat">🏆 Lihat Sertifikat</button>
                        </div>
                    `
                };
            }
        }

        // 3. PENCARIAN VIDEO
        if (input.includes("video")) {
            lastTopicContext = "video";
            const foundVideos = searchVideos(input);
            if (foundVideos.length > 0) {
                const videoListHTML = foundVideos.map(v => {
                    const watchUrl = v.url ? v.url.replace("/embed/", "/watch?v=") : "videos.html";
                    return `
                        <div class="cert-detail-card">
                            <h4 style="color:#00f2fe;">🎬 ${v.title}</h4>
                            <p>${v.desc}</p>
                            <a href="${watchUrl}" target="_blank" rel="noopener noreferrer" class="ai-link-btn">
                                <i data-lucide="play-circle" style="width:14px; height:14px;"></i> Tonton Video
                            </a>
                        </div>
                    `;
                }).join("");

                return {
                    text: `Ditemukan **${foundVideos.length} video** relevan:`,
                    customHTML: videoListHTML
                };
            }
        }

        // 4. PENCARIAN BLOG / ARTIKEL
        if (input.includes("artikel") || input.includes("blog") || input.includes("voip") || input.includes("linux")) {
            lastTopicContext = "artikel";
            const foundBlogs = searchBlogs(input);
            if (foundBlogs.length > 0) {
                const blogListHTML = foundBlogs.map(b => `
                    <div class="cert-detail-card">
                        <h4 style="color:#00f2fe;">📰 ${b.title}</h4>
                        <p><strong>Kategori:</strong> ${b.category}</p>
                        <p>${b.excerpt}</p>
                        <a href="blog.html#post/${b.id}" class="ai-link-btn">
                            <i data-lucide="book-open" style="width:14px; height:14px;"></i> Baca Artikel Lengkap
                        </a>
                    </div>
                `).join("");

                return {
                    text: `Ditemukan **${foundBlogs.length} artikel** blog:`,
                    customHTML: blogListHTML
                };
            }
        }

        // 5. PENCARIAN SERTIFIKAT
        if (input.includes("sertifikat")) {
            lastTopicContext = "sertifikat";
            const certs = await fetchCertificatesFromPage();
            const stopWords = ["cari", "sertifikat", "tampilkan", "tentang", "ada"];
            const keywords = cleanQuery(input, stopWords);

            const searchResults = certs.filter(cert => {
                const targetStr = (cert.title + " " + cert.category + " " + cert.subCategory + " " + cert.description).toLowerCase();
                return keywords.length === 0 || keywords.some(k => targetStr.includes(k));
            });

            if (searchResults.length > 0) {
                return {
                    text: `Ditemukan **${searchResults.length} sertifikat**:`,
                    customHTML: createCertificateGalleryHTML(searchResults, "All")
                };
            }
        }

        // 6. SITE ACTIONS & NAVIGASI HALAMAN
        for (let item of siteActions) {
            if (item.keywords.some(k => input.includes(k))) {
                lastTopicContext = item.keywords[0];
                return {
                    text: sentimentPrefix + (item.reply || ""),
                    customHTML: item.customHTML || "",
                    action: item.action || null
                };
            }
        }

        // 7. GEMINI API FALLBACK (Jika Tidak Ada Match Lokal Sama Sekali)
        const geminiText = await askGeminiAI(query);
        return {
            text: sentimentPrefix + geminiText,
            customHTML: `
                <div class="ai-suggestions" style="margin-top:8px;">
                    <button class="ai-chip" data-prompt="Apa hobimu?">😊 Apa Hobimu?</button>
                    <button class="ai-chip" data-prompt="Rekomendasikan proyek">🚀 Rekomendasi Proyek</button>
                    <button class="ai-chip" data-prompt="Tampilkan sertifikat">🏆 Lihat Sertifikat</button>
                </div>
            `
        };
    }

    function showTypingIndicator() {
        removeTypingIndicator();
        const div = document.createElement("div");
        div.className = "ai-msg bot typing-msg";
        div.id = "aiTyping";
        div.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        aiBody.appendChild(div);
        aiBody.scrollTop = aiBody.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingElem = document.getElementById("aiTyping");
        if (typingElem) typingElem.remove();
    }

    function appendBotMsgWithTyping(textHTML, customHTML = "", onComplete = null) {
        const div = document.createElement("div");
        div.className = "ai-msg bot";
        aiBody.appendChild(div);

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = textHTML;
        const plainText = tempDiv.textContent || tempDiv.innerText || "";

        let charIndex = 0;
        const typingSpeed = 15;

        function typeNextChar() {
            if (charIndex < plainText.length) {
                div.innerHTML = plainText.substring(0, charIndex + 1);
                charIndex++;
                aiBody.scrollTop = aiBody.scrollHeight;
                setTimeout(typeNextChar, typingSpeed);
            } else {
                const copyBtnHTML = `<br><button class="ai-copy-btn" data-copy-text="${plainText.replace(/"/g, '&quot;')}"><i data-lucide="copy" style="width:12px;height:12px;"></i> Salin Teks</button>`;
                div.innerHTML = textHTML + customHTML + copyBtnHTML;
                aiBody.scrollTop = aiBody.scrollHeight;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                saveChatHistory();
                if (onComplete) onComplete();
            }
        }

        typeNextChar();
    }

    async function handleSend(customText = null) {
        const text = customText || aiInput.value.trim();
        if (!text) return;

        appendMsg(text, "user");
        saveChatHistory();
        if (!customText) aiInput.value = "";

        showTypingIndicator();

        const result = await processQuery(text);
        removeTypingIndicator();

        const safeText = result.text || "Baik, ini informasinya:";
        const customHTML = result.customHTML || "";
        
        appendBotMsgWithTyping(safeText, customHTML, () => {
            speakText(safeText);
            if (result.action) setTimeout(() => result.action(), 500);
        });
    }

    aiSend.addEventListener("click", () => handleSend());
    aiInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSend();
    });

    function appendMsg(msg, sender) {
        const div = document.createElement("div");
        div.className = `ai-msg ${sender}`;
        div.innerHTML = msg;
        aiBody.appendChild(div);
        aiBody.scrollTop = aiBody.scrollHeight;
    }

    aiBody.addEventListener("click", (e) => {
        const copyBtn = e.target.closest(".ai-copy-btn");
        if (copyBtn) {
            const textToCopy = copyBtn.getAttribute("data-copy-text");
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = `<i data-lucide="check" style="width:12px;height:12px;color:#00e676;"></i> Tersalin!`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }, 2000);
            });
            return;
        }

        if (e.target.classList.contains("ai-chip")) {
            const prompt = e.target.getAttribute("data-prompt");
            if (prompt) handleSend(prompt);
            return;
        }

        if (e.target.classList.contains("cert-filter-btn")) {
            const category = e.target.getAttribute("data-category");
            const galleryContainer = e.target.closest(".cert-gallery-container");
            if (galleryContainer) {
                galleryContainer.outerHTML = createCertificateGalleryHTML(certificatesData, category);
            }
            return;
        }

        const certCard = e.target.closest(".cert-card-item");
        if (certCard) {
            const certId = certCard.getAttribute("data-cert-id");
            const cert = certificatesData.find(c => c.id === certId);

            if (cert) {
                showTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    const detailHTML = `
                        <div class="cert-detail-card">
                            <img src="${cert.image}" alt="${cert.title}" onerror="this.src='https://via.placeholder.com/300x160?text=Sertifikat'">
                            <h4>${cert.title}</h4>
                            <p><strong>Kategori:</strong> ${cert.category} ${cert.subCategory ? `(${cert.subCategory})` : ''}</p>
                            <p>${cert.description}</p>
                        </div>
                    `;
                    const introText = `Berikut detail untuk sertifikat ${cert.title}:`;
                    appendBotMsgWithTyping(introText, detailHTML, () => speakText(introText));
                }, 300);
            }
        }
    });

    function initDraggableAIChat() {
        let isDragging = false;
        let startX = 0, startY = 0;
        let initialLeft = 0, initialTop = 0;
        let lastTapTime = 0;

        const getPopup = () => document.querySelector(".ai-popup-chat");

        const startDrag = (clientX, clientY, popup) => {
            isDragging = true;
            popup.classList.add("is-dragging", "is-dragged");
            startX = clientX;
            startY = clientY;

            const rect = popup.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            popup.style.right = "auto";
            popup.style.bottom = "auto";
            popup.style.left = `${initialLeft}px`;
            popup.style.top = `${initialTop}px`;
        };

        const updatePosition = (clientX, clientY) => {
            if (!isDragging) return;
            const popup = getPopup();
            if (!popup) return;

            const dx = clientX - startX;
            const dy = clientY - startY;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;

            const maxLeft = window.innerWidth - popup.offsetWidth;
            const maxTop = window.innerHeight - popup.offsetHeight;

            newLeft = Math.max(5, Math.min(newLeft, maxLeft - 5));
            newTop = Math.max(5, Math.min(newTop, maxTop - 5));

            popup.style.left = `${newLeft}px`;
            popup.style.top = `${newTop}px`;
        };

        const stopDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            const popup = getPopup();
            if (popup) popup.classList.remove("is-dragging");
        };

        document.addEventListener("mousedown", (e) => {
            const popup = getPopup();
            if (!popup) return;

            const targetPopup = e.target.closest(".ai-popup-chat");
            if (!targetPopup || e.target.closest(".ai-close-btn") || e.target.closest(".ai-icon-btn")) return;

            const isHeader = !!e.target.closest(".ai-chat-header");
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;

            if (isHeader || (tapLength < 350 && tapLength > 0)) {
                if (e.target.tagName === 'INPUT' && !isHeader) return;
                e.preventDefault();
                startDrag(e.clientX, e.clientY, popup);
                lastTapTime = 0;
            } else {
                lastTapTime = currentTime;
            }
        });

        document.addEventListener("mousemove", (e) => {
            if (isDragging) {
                e.preventDefault();
                updatePosition(e.clientX, e.clientY);
            }
        });

        document.addEventListener("mouseup", () => stopDrag());

        document.addEventListener("touchstart", (e) => {
            const popup = getPopup();
            if (!popup) return;

            const targetPopup = e.target.closest(".ai-popup-chat");
            if (!targetPopup || e.target.closest(".ai-close-btn") || e.target.closest(".ai-icon-btn")) return;

            const isHeader = !!e.target.closest(".ai-chat-header");
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;

            (isHeader || (tapLength < 350 && tapLength > 0)) ? startDrag(e.touches[0].clientX, e.touches[0].clientY, popup) : null;
        });

        document.addEventListener("touchmove", (e) => {
            if (isDragging) {
                e.preventDefault();
                updatePosition(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        document.addEventListener("touchend", () => stopDrag());
    }

    initDraggableAIChat();
});