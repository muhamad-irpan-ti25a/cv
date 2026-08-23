document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("aiWidgetContainer");
    if (!container) return;

    // Cache Data & Speech State
    let certificatesData = [];
    let isSpeechEnabled = false;
    const synth = window.speechSynthesis;
    let selectedVoice = null;

    // Inisialisasi Suara Bahasa Indonesia secara eksplisit
    function initVoices() {
        if (!synth) return;
        const voices = synth.getVoices();
        selectedVoice = voices.find(v => v.lang.includes("id") || v.lang.includes("ID")) || voices[0];
    }
    if (synth) {
        initVoices();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = initVoices;
        }
    }

    // 1. Inject UI CSS & Structure
    container.innerHTML = `
        <style>
            /* Typing Indicator */
            .typing-indicator {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 6px 10px;
            }
            .typing-indicator span {
                width: 6px;
                height: 6px;
                background-color: currentColor;
                border-radius: 50%;
                opacity: 0.4;
                animation: aiTypingBounce 1.2s infinite ease-in-out;
            }
            .typing-indicator span:nth-child(1) { animation-delay: 0s; }
            .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
            .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes aiTypingBounce {
                0%, 100% { transform: translateY(0); opacity: 0.4; }
                50% { transform: translateY(-4px); opacity: 1; }
            }

            /* Header Controls */
            .ai-header-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .ai-icon-btn {
                background: transparent;
                border: none;
                color: var(--text-dim, #94a3b8);
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: color 0.2s, background 0.2s;
            }
            .ai-icon-btn:hover {
                color: #00f2fe;
                background: rgba(255, 255, 255, 0.1);
            }
            .ai-icon-btn.active {
                color: #00e676;
            }

            /* Quick Suggestion Chips */
            .ai-suggestions {
                display: flex;
                gap: 6px;
                overflow-x: auto;
                padding: 6px 0;
                margin-top: 6px;
                scroll-snap-type: x mandatory;
            }
            .ai-chip {
                background: rgba(0, 242, 254, 0.1);
                border: 1px solid rgba(0, 242, 254, 0.25);
                color: var(--primary-color, #00f2fe);
                border-radius: 20px;
                padding: 4px 10px;
                font-size: 11px;
                white-space: nowrap;
                cursor: pointer;
                transition: all 0.2s ease;
                scroll-snap-align: start;
            }
            .ai-chip:hover {
                background: rgba(0, 242, 254, 0.25);
                transform: translateY(-1px);
            }

            /* Certificate Slider & Cards */
            .cert-gallery-container {
                margin-top: 8px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .cert-filter-pills {
                display: flex;
                gap: 6px;
                overflow-x: auto;
                padding-bottom: 4px;
            }
            .cert-filter-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 2px 10px;
                font-size: 11px;
                cursor: pointer;
                white-space: nowrap;
                color: inherit;
            }
            .cert-filter-btn.active {
                background: #00f2fe;
                color: #020617;
                font-weight: bold;
                border-color: #00f2fe;
            }
            .cert-cards-scroll {
                display: flex;
                gap: 10px;
                overflow-x: auto;
                padding-bottom: 6px;
                scroll-snap-type: x mandatory;
            }
            .cert-card-item {
                flex: 0 0 140px;
                scroll-snap-align: start;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(0, 242, 254, 0.2);
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                transition: transform 0.2s, border-color 0.2s;
            }
            .cert-card-item:hover {
                transform: translateY(-2px);
                border-color: #00f2fe;
            }
            .cert-card-item img {
                width: 100%;
                height: 80px;
                object-fit: cover;
            }
            .cert-card-info {
                padding: 6px;
            }
            .cert-card-info h5 {
                margin: 0;
                font-size: 11px;
                line-height: 1.2;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .cert-card-info span {
                font-size: 10px;
                color: #00f2fe;
            }

            /* Certificate Detail View */
            .cert-detail-card {
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(0, 242, 254, 0.3);
                border-radius: 10px;
                padding: 10px;
                margin-top: 8px;
            }
            .cert-detail-card img {
                width: 100%;
                border-radius: 6px;
                margin-bottom: 8px;
            }
            .cert-detail-card h4 {
                margin: 0 0 4px 0;
                font-size: 13px;
                color: #00f2fe;
            }
            .cert-detail-card p {
                margin: 0 0 6px 0;
                font-size: 11px;
                line-height: 1.4;
                color: #cbd5e1;
            }

            /* Modern Welcome Card */
            .ai-welcome-card {
                background: rgba(0, 242, 254, 0.04);
                border: 1px solid rgba(0, 242, 254, 0.2);
                border-radius: 14px;
                padding: 12px 14px;
                margin-bottom: 6px;
                backdrop-filter: blur(8px);
            }
            .ai-welcome-card p {
                margin: 0 0 10px 0;
                font-size: 0.85rem;
                line-height: 1.5;
                color: #e2e8f0;
            }
            .ai-welcome-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
                color: var(--primary-color, #00f2fe);
                font-weight: 600;
                font-size: 0.88rem;
            }
            .ai-welcome-header i {
                width: 16px;
                height: 16px;
            }

            /* Scrollbar Clean */
            .ai-chat-body::-webkit-scrollbar-button,
            .cert-cards-scroll::-webkit-scrollbar-button,
            .cert-filter-pills::-webkit-scrollbar-button,
            .ai-suggestions::-webkit-scrollbar-button {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
            }
            .cert-cards-scroll,
            .cert-filter-pills,
            .ai-suggestions {
                -ms-overflow-style: -ms-autohide-scrollbar;
            }
            .ai-chat-body::-webkit-scrollbar,
            .cert-cards-scroll::-webkit-scrollbar,
            .cert-filter-pills::-webkit-scrollbar,
            .ai-suggestions::-webkit-scrollbar {
                height: 4px;
                width: 4px;
            }
            .ai-chat-body::-webkit-scrollbar-track,
            .cert-cards-scroll::-webkit-scrollbar-track,
            .cert-filter-pills::-webkit-scrollbar-track,
            .ai-suggestions::-webkit-scrollbar-track {
                background: transparent;
            }
            .ai-chat-body::-webkit-scrollbar-thumb,
            .cert-cards-scroll::-webkit-scrollbar-thumb,
            .cert-filter-pills::-webkit-scrollbar-thumb,
            .ai-suggestions::-webkit-scrollbar-thumb {
                background: rgba(0, 242, 254, 0.3);
                border-radius: 10px;
                transition: background 0.3s ease;
            }
            .ai-chat-body::-webkit-scrollbar-thumb:hover,
            .cert-cards-scroll::-webkit-scrollbar-thumb:hover,
            .cert-filter-pills::-webkit-scrollbar-thumb:hover,
            .ai-suggestions::-webkit-scrollbar-thumb:hover {
                background: #00f2fe;
            }

            /* Prevent Zoom & Fix Input */
            .ai-popup-chat {
                will-change: left, top;
            }
            .ai-chat-footer input {
                font-size: 16px !important;
                touch-action: manipulation;
            }

            /* Voice Icon Toggle Display Fix */
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
                        <h4>Smart AI Agent v2</h4>
                        <span class="status-online">Full Control Mode</span>
                    </div>
                </div>
                <div class="ai-header-actions">
                    <button class="ai-icon-btn" id="aiVoiceToggle" title="Aktifkan Suara Voice">
                        <i data-lucide="volume-x" class="icon-speech-off"></i>
                        <i data-lucide="volume-2" class="icon-speech-on"></i>
                    </button>
                    <button class="ai-icon-btn" id="aiClearChat" title="Hapus Obrolan">
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
                            <span>Spatial Assistant Ready</span>
                        </div>
                        <p>Halo! Saya AI Agent web ini. Ada yang bisa saya bantu hari ini? Silakan pilih opsi cepat di bawah atau ketikkan pertanyaan Anda:</p>
                        <div class="ai-suggestions">
                            <button class="ai-chip" data-prompt="Tampilkan sertifikat">
                                <i data-lucide="award"></i> Semua Sertifikat
                            </button>
                            <button class="ai-chip" data-prompt="Cari sertifikat linux">
                                <i data-lucide="terminal"></i> Sertifikat Linux
                            </button>
                            <button class="ai-chip" data-prompt="Hubungi">
                                <i data-lucide="mail"></i> Form Kontak
                            </button>
                            <button class="ai-chip" data-prompt="Ganti tema">
                                <i data-lucide="moon"></i> Ubah Tampilan
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="ai-chat-footer">
                <input type="text" id="aiInput" placeholder="Ketik perintah atau 'Cari sertifikat [topik]'..." autocomplete="off">
                <button id="aiSend" class="btn-send"><i data-lucide="send"></i></button>
            </div>
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // DOM Elements
    const aiBtn = document.getElementById("aiBtn");
    const aiWindow = document.getElementById("aiWindow");
    const aiClose = document.getElementById("aiClose");
    const aiSend = document.getElementById("aiSend");
    const aiInput = document.getElementById("aiInput");
    const aiBody = document.getElementById("aiBody");
    const aiVoiceToggle = document.getElementById("aiVoiceToggle");
    const aiClearChat = document.getElementById("aiClearChat");

    // Toggle Chatbox
    aiBtn.addEventListener("click", () => {
        aiWindow.classList.toggle("active");
        if (aiWindow.classList.contains("active")) aiInput.focus();
    });

    aiClose.addEventListener("click", () => {
        aiWindow.classList.remove("active");
        stopSpeech();
    });

    // Toggle Voice Mode (Toggle Class tanpa Mengubah Elemen DOM - Bebas Flicker & Responsif)
    aiVoiceToggle.addEventListener("click", () => {
        isSpeechEnabled = !isSpeechEnabled;
        aiVoiceToggle.classList.toggle("active", isSpeechEnabled);

        if (!isSpeechEnabled) {
            stopSpeech();
        } else {
            speakText("Suara dikondisikan aktif.");
        }
    });

    // Clear Chat
    aiClearChat.addEventListener("click", () => {
        stopSpeech();
        aiBody.innerHTML = `
            <div class="ai-msg bot">
                Obrolan telah dibersihkan! Ada yang ingin Anda tanyakan lagi?
                <div class="ai-suggestions">
                    <button class="ai-chip" data-prompt="Tampilkan sertifikat">🏆 Semua Sertifikat</button>
                    <button class="ai-chip" data-prompt="Ke proyek">🚀 Lihat Proyek</button>
                    <button class="ai-chip" data-prompt="Hubungi">✉️ Form Kontak</button>
                </div>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    // Hentikan Suara Sepenuhnya
    function stopSpeech() {
        if (synth) synth.cancel();
    }

    // Voice Synthesis Reader
    function speakText(text) {
        if (!isSpeechEnabled || !synth) return;
        stopSpeech();

        const cleanText = text.replace(/<[^>]*>?/gm, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "id-ID";
        utterance.rate = 1.0;
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        setTimeout(() => {
            if (isSpeechEnabled) synth.speak(utterance);
        }, 50);
    }

    /* ============================================================
       AUTO-STOP SPEECH SYSTEM ON LEAVE / SWITCH PAGE
       ============================================================ */
    // 1. Hentikan suara saat meninggalkan halaman (klik link ke page lain)
    window.addEventListener("beforeunload", () => stopSpeech());
    window.addEventListener("pagehide", () => stopSpeech());

    // 2. Hentikan suara saat berpindah tab browser / minimize
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopSpeech();
        }
    });

    // Dynamic Fetcher untuk Membaca `certificates.html`
    async function fetchCertificatesFromPage() {
        if (certificatesData.length > 0) return certificatesData;

        const localCertCards = document.querySelectorAll(".cert-card");
        if (localCertCards.length > 0) {
            const parsedData = [];
            localCertCards.forEach((el, index) => {
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
        }

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

    // Site Actions Mapping
    const siteActions = [
        {
            keywords: ["tampilkan sertifikat", "tunjukkan sertifikat", "lihat sertifikat", "daftar sertifikat", "sertifikat"],
            reply: "Berikut daftar sertifikat yang berhasil diambil langsung dari halaman `certificates.html`. Klik salah satu untuk info detail:",
            type: "SHOW_CERTIFICATES"
        },
        {
            keywords: ["buka kontak", "hubungi", "kirim pesan", "form kontak", "contact"],
            reply: "Siap! Membuka formulir kontak untuk Anda...",
            action: () => {
                const btn = document.getElementById("openContactModal") || document.getElementById("openContactModalHero");
                if (btn) btn.click();
            }
        },
        {
            keywords: ["ganti tema", "dark mode", "light mode", "ubah mode", "mode terang", "mode gelap"],
            reply: "Siap! Mengubah mode tampilan tema...",
            action: () => {
                const themeBtn = document.getElementById("themeToggle");
                if (themeBtn) themeBtn.click();
            }
        },
        {
            keywords: ["ke tentang", "ke about", "scroll ke about", "scroll tentang"],
            reply: "Siap! Menggulung layar ke bagian Tentang Saya...",
            action: () => {
                const target = document.getElementById("about");
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        },
        {
            keywords: ["ke proyek", "ke project", "scroll ke project", "scroll proyek"],
            reply: "Siap! Menggulung layar ke bagian Featured Projects...",
            action: () => {
                const target = document.getElementById("projects");
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        },
        { keywords: ["halaman skill", "buka skill", "ke skill"], reply: "Siap! Membuka halaman Skills...", action: () => { window.location.href = "skills.html"; } },
        { keywords: ["halaman project", "buka project", "semua project"], reply: "Siap! Membuka halaman Projects...", action: () => { window.location.href = "projects.html"; } },
        { keywords: ["halaman sertifikat", "buka sertifikat", "ke sertifikat"], reply: "Siap! Membuka halaman Certificates...", action: () => { window.location.href = "certificates.html"; } },
        { keywords: ["halaman video", "buka video", "ke video"], reply: "Siap! Membuka halaman Videos...", action: () => { window.location.href = "videos.html"; } },
        { keywords: ["halaman blog", "buka blog", "ke blog"], reply: "Siap! Membuka halaman Blog...", action: () => { window.location.href = "blog.html"; } }
    ];

    // Render Component Gallery Sertifikat
    function createCertificateGalleryHTML(data, filterCategory = "All") {
        if (!data || data.length === 0) {
            return `<div style="margin-top:6px; font-size:12px; color:#ef4444;">Tidak dapat menemukan data sertifikat di halaman certificates.html. Pastikan website dibuka via Live Server.</div>`;
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

    // Search Sertifikat berdasarkan Query
    async function searchCertificatesByQuery(query) {
        const certs = await fetchCertificatesFromPage();
        const keywords = query.toLowerCase().replace("cari sertifikat", "").replace("sertifikat", "").trim().split(" ");
        
        return certs.filter(cert => {
            const targetStr = (cert.title + " " + cert.category + " " + cert.subCategory + " " + cert.description).toLowerCase();
            return keywords.some(k => k.length > 1 && targetStr.includes(k));
        });
    }

    // DOM Scraper
    function scrapePageContent() {
        const sections = document.querySelectorAll("section, .about-card, .project-card");
        const knowledge = [];

        sections.forEach(sec => {
            const title = sec.querySelector("h1, h2, h3, .section-title")?.textContent || "";
            const text = sec.textContent.replace(/\s+/g, ' ').trim();
            if (title || text) knowledge.push({ title: title.toLowerCase(), text: text });
        });

        return knowledge;
    }

    // AI Query Brain
    async function processQuery(query) {
        const input = query.toLowerCase().trim();

        if (input.includes("cari sertifikat") || (input.includes("sertifikat") && input.split(" ").length > 1)) {
            const searchResults = await searchCertificatesByQuery(input);
            if (searchResults.length > 0) {
                return {
                    text: `Ditemukan **${searchResults.length} sertifikat** yang cocok dengan pencarian Anda:`,
                    customHTML: createCertificateGalleryHTML(searchResults, "All")
                };
            }
        }

        for (let item of siteActions) {
            if (item.keywords.some(k => input.includes(k))) {
                return {
                    text: item.reply,
                    type: item.type || null,
                    action: item.action || null
                };
            }
        }

        const scrapedData = scrapePageContent();
        for (let data of scrapedData) {
            const words = input.split(" ").filter(w => w.length > 2);
            const isMatch = words.some(word => data.text.toLowerCase().includes(word));
            
            if (isMatch) {
                const sentences = data.text.split(". ");
                const matchedSentence = sentences.find(s => words.some(w => s.toLowerCase().includes(w)));
                if (matchedSentence) {
                    return {
                        text: `Berdasarkan informasi halaman ini: "${matchedSentence.trim()}."`
                    };
                }
            }
        }

        return {
            text: "Maaf, saya belum memahami perintah tersebut. Coba klik opsi di bawah atau ketikkan kata kunci seperti: 'cari sertifikat linux', 'buka kontak', atau 'ganti tema'."
        };
    }

    // UI Helpers (DENGAN EFEK MENGETIK / TYPING EFFECT)
    function showTypingIndicator() {
        removeTypingIndicator();
        const div = document.createElement("div");
        div.className = "ai-msg bot typing-msg";
        div.id = "aiTyping";
        div.innerHTML = `
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        aiBody.appendChild(div);
        aiBody.scrollTop = aiBody.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingElem = document.getElementById("aiTyping");
        if (typingElem) typingElem.remove();
    }

    // Fungsi Efek Mengetik Teks Karakter demi Karakter
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
                div.textContent = plainText.substring(0, charIndex + 1);
                charIndex++;
                aiBody.scrollTop = aiBody.scrollHeight;
                setTimeout(typeNextChar, typingSpeed);
            } else {
                div.innerHTML = textHTML + customHTML;
                aiBody.scrollTop = aiBody.scrollHeight;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                if (onComplete) onComplete();
            }
        }

        typeNextChar();
    }

    async function handleSend(customText = null) {
        const text = customText || aiInput.value.trim();
        if (!text) return;

        appendMsg(text, "user");
        if (!customText) aiInput.value = "";

        showTypingIndicator();

        setTimeout(async () => {
            const result = await processQuery(text);
            removeTypingIndicator();

            if (result.type === "SHOW_CERTIFICATES") {
                const certs = await fetchCertificatesFromPage();
                const customHTML = createCertificateGalleryHTML(certs, "All");
                appendBotMsgWithTyping(result.text, customHTML, () => speakText(result.text));
                return;
            }

            const customHTML = result.customHTML || "";
            appendBotMsgWithTyping(result.text, customHTML, () => {
                speakText(result.text);
                if (result.action) {
                    setTimeout(() => result.action(), 500);
                }
            });
        }, 500);
    }

    aiSend.addEventListener("click", () => handleSend());
    aiInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSend();
    });

    function appendMsg(msg, sender) {
        const div = document.createElement("div");
        div.className = `ai-msg ${sender}`;
        
        if (sender === "user") {
            div.textContent = msg;
        } else {
            div.innerHTML = msg;
        }

        aiBody.appendChild(div);
        aiBody.scrollTop = aiBody.scrollHeight;
    }

    // Event Delegation (Chips, Filter, & Certificate Detail)
    aiBody.addEventListener("click", (e) => {
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
                }, 400);
            }
        }
    });

    /* ============================================================
       PRECISE DRAGGABLE FORM SYSTEM (NO FLICKER & FAST DRAG)
       ============================================================ */
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
            if (popup) {
                popup.classList.remove("is-dragging");
            }
        };

        // --- MOUSE DRAG (DESKTOP) ---
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

        document.addEventListener("mouseup", () => {
            stopDrag();
        });

        // --- TOUCH DRAG (MOBILE / HP) ---
        document.addEventListener("touchstart", (e) => {
            const popup = getPopup();
            if (!popup) return;

            const targetPopup = e.target.closest(".ai-popup-chat");
            if (!targetPopup || e.target.closest(".ai-close-btn") || e.target.closest(".ai-icon-btn")) return;

            const isHeader = !!e.target.closest(".ai-chat-header");
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;

            if (isHeader || (tapLength < 350 && tapLength > 0)) {
                if (e.target.tagName === 'INPUT' && !isHeader) return;

                const touch = e.touches[0];
                startDrag(touch.clientX, touch.clientY, popup);
                lastTapTime = 0;
            } else {
                lastTapTime = currentTime;
            }
        });

        document.addEventListener("touchmove", (e) => {
            if (isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                updatePosition(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        document.addEventListener("touchend", () => {
            stopDrag();
        });
    }

    initDraggableAIChat();
});