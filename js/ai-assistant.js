document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("aiWidgetContainer");
    if (!container) return;

    let certificatesData = [];
    let videosData = [];
    let blogsData = [];
    
    // Fallback data manual jika file Excel belum dibuat/gagal dimuat
    let excelKnowledgeData = [
        { Keyword: "hobi, kegemaran, suka apa", Answer: "Hobi saya adalah koding, mengeksplorasi teknologi web modern, dan mendaki gunung." },
        { Keyword: "pengalaman, magang, kerja", Answer: "Saya memiliki pengalaman dalam pengembangan web front-end, pengelolaan server Linux, dan perancangan UI/UX." },
        { Keyword: "sosmed, instagram, github, linkedin", Answer: "Kamu bisa terhubung melalui akun GitHub dan LinkedIn resmi yang tertera di bagian footer website ini!" }
    ];

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
                excelKnowledgeData = sheetData; // Menimpa dengan data dari Excel jika berhasil
            }
        } catch (error) {
            console.log("Menggunakan database pengetahuan bawaan (Excel opsional).");
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
                        <h4>Smart AI Agent v6.1</h4>
                        <span class="status-online">Safe Knowledge Engine</span>
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
                            <span>Spatial AI Assistant Ready</span>
                        </div>
                        <p>Halo! Saya AI Agent serbaguna. Tanya hobi, video, blog, sertifikat, atau informasi apapun secara interaktif:</p>
                        <div class="ai-suggestions">
                            <button class="ai-chip" data-prompt="Apa hobimu?">
                                <i data-lucide="smile"></i> Apa Hobimu?
                            </button>
                            <button class="ai-chip" data-prompt="Kuliah di mana?">
                                <i data-lucide="graduation-cap"></i> Info Kuliah
                            </button>
                            <button class="ai-chip" data-prompt="Rekomendasikan proyek">
                                <i data-lucide="folder"></i> Rekomendasi Proyek
                            </button>
                            <button class="ai-chip" data-prompt="Cari video algoritma">
                                <i data-lucide="video"></i> Video Algoritma
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="ai-chat-footer">
                <input type="text" id="aiInput" placeholder="Tanya sesuatu atau pilih opsi di atas..." autocomplete="off">
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
        aiBody.innerHTML = `
            <div class="ai-msg bot">
                Obrolan telah dibersihkan! Ada yang ingin Anda tanyakan lagi?
                <div class="ai-suggestions">
                    <button class="ai-chip" data-prompt="Apa hobimu?">😊 Apa Hobimu?</button>
                    <button class="ai-chip" data-prompt="Kuliah di mana?">🎓 Info Kuliah</button>
                    <button class="ai-chip" data-prompt="Rekomendasikan proyek">🚀 Rekomendasi Proyek</button>
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
            keywords: ["siapa namamu", "siapa kamu", "siapa fathan", "biodata"],
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
        const input = query.toLowerCase().trim();
        await ensureGlobalDataLoaded();

        // 1. CEK DARI DATABASE PENGETAHUAN (EXCEL / FALLBACK)
        if (excelKnowledgeData && excelKnowledgeData.length > 0) {
            for (let row of excelKnowledgeData) {
                if (row.Keyword) {
                    const keys = row.Keyword.toLowerCase().split(",");
                    if (keys.some(k => input.includes(k.trim()))) {
                        return { text: row.Answer || "Informasi ditemukan." };
                    }
                }
            }
        }

        // 2. PENCARIAN VIDEO
        if (input.includes("video")) {
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
                    text: `Ditemukan **${foundVideos.length} video** yang relevan:`,
                    customHTML: videoListHTML
                };
            }
        }

        // 3. PENCARIAN BLOG / ARTIKEL
        if (input.includes("artikel") || input.includes("blog") || input.includes("voip") || input.includes("linux")) {
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
                    text: `Ditemukan **${foundBlogs.length} artikel blog** yang cocok:`,
                    customHTML: blogListHTML
                };
            }
        }

        // 4. PENCARIAN SERTIFIKAT
        if (input.includes("sertifikat")) {
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

        // 5. SITE ACTIONS & PERCAKAPAN
        for (let item of siteActions) {
            if (item.keywords.some(k => input.includes(k))) {
                return {
                    text: item.reply || "",
                    customHTML: item.customHTML || "",
                    action: item.action || null
                };
            }
        }

        // 6. SCRAPING ISI HALAMAN (FALLBACK)
        const sections = document.querySelectorAll("section, .about-card, .project-card, article, .video-card");
        for (let sec of sections) {
            const text = sec.textContent.replace(/\s+/g, ' ').trim();
            const words = input.split(" ").filter(w => w.length > 2);
            if (words.some(w => text.toLowerCase().includes(w))) {
                const sentences = text.split(". ");
                const matched = sentences.find(s => words.some(w => s.toLowerCase().includes(w)));
                if (matched) return { text: `Berdasarkan halaman ini: "${matched.trim()}."` };
            }
        }

        return {
            text: "Maaf, saya belum menemukan jawaban yang tepat. Coba tanyakan hal seperti: 'apa hobimu', 'kuliah di mana', 'cari video algoritma', atau 'ke sertifikat'."
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
        const typingSpeed = 20;

        function typeNextChar() {
            if (charIndex < plainText.length) {
                div.innerHTML = plainText.substring(0, charIndex + 1);
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

            const safeText = result.text || "Baik, ini informasinya:";
            const customHTML = result.customHTML || "";
            
            appendBotMsgWithTyping(safeText, customHTML, () => {
                speakText(safeText);
                if (result.action) setTimeout(() => result.action(), 500);
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
        div.innerHTML = msg;
        aiBody.appendChild(div);
        aiBody.scrollTop = aiBody.scrollHeight;
    }

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

        document.addEventListener("touchend", () => stopDrag());
    }

    initDraggableAIChat();
});