document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("aiWidgetContainer");
    if (!container) return;

    // Cache untuk menyimpan data sertifikat setelah di-fetch
    let certificatesData = [];

    // 1. Inject HTML UI Assistant & CSS Style
    container.innerHTML = `
        <style>
            /* Typing Indicator */
            .typing-indicator {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
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
                background: #3b82f6;
                color: #fff;
                border-color: #3b82f6;
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
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                transition: transform 0.2s, border-color 0.2s;
            }
            .cert-card-item:hover {
                transform: translateY(-2px);
                border-color: #3b82f6;
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
                opacity: 0.7;
            }

            /* Certificate Detail View */
            .cert-detail-card {
                background: rgba(0, 0, 0, 0.25);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 8px;
                margin-top: 6px;
            }
            .cert-detail-card img {
                width: 100%;
                border-radius: 6px;
                margin-bottom: 6px;
            }
            .cert-detail-card h4 {
                margin: 0 0 4px 0;
                font-size: 13px;
            }
            .cert-detail-card p {
                margin: 0 0 6px 0;
                font-size: 11px;
                line-height: 1.4;
            }
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
                        <h4>Smart AI Agent</h4>
                        <span class="status-online">Full Control Mode</span>
                    </div>
                </div>
                <button class="ai-close-btn" id="aiClose"><i data-lucide="x"></i></button>
            </div>

            <div class="ai-chat-body" id="aiBody">
                <div class="ai-msg bot">
                    Halo! Saya AI Agent web ini. Anda bisa meminta saya menampilkan sertifikat dari halaman certificates.html, berpindah halaman, hingga membuka form kontak!
                </div>
            </div>

            <div class="ai-chat-footer">
                <input type="text" id="aiInput" placeholder="Tanyakan sesuatu atau beri perintah..." autocomplete="off">
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

    // Toggle Chatbox
    aiBtn.addEventListener("click", () => {
        aiWindow.classList.toggle("active");
        if (aiWindow.classList.contains("active")) aiInput.focus();
    });

    aiClose.addEventListener("click", () => aiWindow.classList.remove("active"));

    // 2. Dynamic Fetcher untuk Membaca `certificates.html` Secara Presisi
    async function fetchCertificatesFromPage() {
        if (certificatesData.length > 0) return certificatesData; // Gunakan cache jika ada

        // Jika user sedang berada di halaman certificates.html, ambil langsung dari DOM aktif
        const localCertCards = document.querySelectorAll(".cert-card");
        if (localCertCards.length > 0) {
            const parsedData = [];
            localCertCards.forEach((el, index) => {
                const img = el.querySelector("img.cert-img")?.getAttribute("src") || "";
                const title = (el.querySelector(".cert-details h3")?.textContent || `Sertifikat ${index + 1}`).trim();
                const description = (el.querySelector(".cert-details p")?.textContent || "Sertifikat resmi portofolio.").trim();
                
                if (img || title) {
                    parsedData.push({
                        id: `cert-${index + 1}`,
                        title: title,
                        category: "Sertifikat",
                        image: img,
                        description: description
                    });
                }
            });
            certificatesData = parsedData;
            return certificatesData;
        }

        // Jika dipanggil dari halaman lain, lakukan fetch HTTP
        const possiblePaths = ["certificates.html", "/certificates.html", "./certificates.html"];
        let htmlText = "";

        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    htmlText = await response.text();
                    break;
                }
            } catch (e) {
                // Lanjut ke path berikutnya
            }
        }

        if (!htmlText) {
            console.error("Gagal memuat certificates.html dari semua path.");
            return [];
        }

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, "text/html");

            const certElements = doc.querySelectorAll(".cert-card");
            const parsedData = [];

            certElements.forEach((el, index) => {
                const img = el.querySelector("img.cert-img")?.getAttribute("src") || "";
                // Menggunakan textContent agar pembacaan string dari DOMParser stabil
                const title = (el.querySelector(".cert-details h3")?.textContent || `Sertifikat ${index + 1}`).trim();
                const description = (el.querySelector(".cert-details p")?.textContent || "Sertifikat resmi portofolio.").trim();
                const category = "Sertifikat";

                if (img || title) {
                    parsedData.push({
                        id: `cert-${index + 1}`,
                        title: title,
                        category: category,
                        image: img,
                        description: description
                    });
                }
            });

            certificatesData = parsedData;
            return certificatesData;
        } catch (error) {
            console.error("Error parsing certificates.html:", error);
            return [];
        }
    }

    // 3. Kumpulan Navigasi & Aksi Web
    const siteActions = [
        {
            keywords: ["tampilkan sertifikat", "tunjukkan sertifikat", "lihat sertifikat", "daftar sertifikat", "sertifikat"],
            reply: "Berikut daftar sertifikat yang berhasil diambil langsung dari halaman `certificates.html`. Klik pada salah satu sertifikat untuk melihat penjelasannya:",
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
        {
            keywords: ["halaman skill", "buka skill", "ke skill"],
            reply: "Siap! Membuka halaman Skills...",
            action: () => { window.location.href = "skills.html"; }
        },
        {
            keywords: ["halaman project", "buka project", "semua project"],
            reply: "Siap! Membuka halaman Projects...",
            action: () => { window.location.href = "projects.html"; }
        },
        {
            keywords: ["halaman sertifikat", "buka sertifikat", "ke sertifikat"],
            reply: "Siap! Membuka halaman Certificates...",
            action: () => { window.location.href = "certificates.html"; }
        },
        {
            keywords: ["halaman video", "buka video", "ke video"],
            reply: "Siap! Membuka halaman Videos...",
            action: () => { window.location.href = "videos.html"; }
        },
        {
            keywords: ["halaman blog", "buka blog", "ke blog"],
            reply: "Siap! Membuka halaman Blog...",
            action: () => { window.location.href = "blog.html"; }
        }
    ];

    // 4. Render Komponen Gallery Sertifikat (Dengan Filter Kategori)
    function createCertificateGalleryHTML(data, filterCategory = "All") {
        if (!data || data.length === 0) {
            return `<div style="margin-top:6px; font-size:12px; color:#ef4444;">Tidak dapat menemukan data sertifikat di halaman certificates.html. Pastikan website dibuka menggunakan Live Server/Local Host.</div>`;
        }

        const categories = ["All", ...new Set(data.map(c => c.category))];
        
        const filteredData = filterCategory === "All" 
            ? data 
            : data.filter(c => c.category === filterCategory);

        const filterPillsHTML = categories.map(cat => 
            `<button class="cert-filter-btn ${cat === filterCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>`
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

    // 5. Scraper DOM untuk Teks Halaman Saat Ini
    function scrapePageContent() {
        const sections = document.querySelectorAll("section, .about-card, .project-card");
        const knowledge = [];

        sections.forEach(sec => {
            const title = sec.querySelector("h1, h2, h3, .section-title")?.textContent || "";
            const text = sec.textContent.replace(/\s+/g, ' ').trim();
            if (title || text) {
                knowledge.push({ title: title.toLowerCase(), text: text });
            }
        });

        return knowledge;
    }

    // 6. Processing Brain
    function processQuery(query) {
        const input = query.toLowerCase().trim();

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
                        text: `Berdasarkan informasi di halaman ini: "${matchedSentence.trim()}."`
                    };
                }
            }
        }

        return {
            text: "Maaf, saya belum memahami perintah tersebut. Coba ketik seperti: 'tampilkan sertifikat', 'buka kontak', 'ganti tema', atau 'ke proyek'."
        };
    }

    // 7. Handling Typing & Messaging UI
    function showTypingIndicator() {
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

    async function handleSend() {
        const text = aiInput.value.trim();
        if (!text) return;

        appendMsg(text, "user");
        aiInput.value = "";

        showTypingIndicator();

        const result = processQuery(text);

        // Jika user meminta sertifikat, fetch data dari certificates.html terlebih dahulu
        if (result.type === "SHOW_CERTIFICATES") {
            const certs = await fetchCertificatesFromPage();
            removeTypingIndicator();
            const fullReply = result.text + createCertificateGalleryHTML(certs, "All");
            appendMsg(fullReply, "bot");
            return;
        }

        setTimeout(() => {
            removeTypingIndicator();
            appendMsg(result.text, "bot");
            if (result.action) {
                setTimeout(() => result.action(), 1000);
            }
        }, 800);
    }

    aiSend.addEventListener("click", handleSend);
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

    // 8. Event Delegation untuk Interaksi Galeri Sertifikat (Filter & Klik Detail)
    aiBody.addEventListener("click", (e) => {
        // Filter Kategori
        if (e.target.classList.contains("cert-filter-btn")) {
            const category = e.target.getAttribute("data-category");
            const galleryContainer = e.target.closest(".cert-gallery-container");
            if (galleryContainer) {
                galleryContainer.outerHTML = createCertificateGalleryHTML(certificatesData, category);
            }
        }

        // Klik Kartu untuk Detail Sertifikat
        const certCard = e.target.closest(".cert-card-item");
        if (certCard) {
            const certId = certCard.getAttribute("data-cert-id");
            const cert = certificatesData.find(c => c.id === certId);

            if (cert) {
                showTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    const detailHTML = `
                        Berikut detail mengenai sertifikat **${cert.title}**:
                        <div class="cert-detail-card">
                            <img src="${cert.image}" alt="${cert.title}" onerror="this.src='https://via.placeholder.com/300x160?text=Sertifikat'">
                            <h4>${cert.title}</h4>
                            <p>${cert.description}</p>
                        </div>
                    `;
                    appendMsg(detailHTML, "bot");
                }, 500);
            }
        }
    });
});