// Data Pengetahuan AI Mandiri (Knowledge Base)
const portfolioKnowledge = [
    {
        keywords: ["siapa", "profil", "tentang", "about", "nama"],
        response: "Saya adalah Developer Muda & Mahasiswa Teknik Informatika yang berfokus pada pengembangan Web Modern interaktif."
    },
    {
        keywords: ["skill", "keahlian", "kemampuan", "stack", "bahasa"],
        response: "Keahlian utama saya meliputi HTML5, CSS3, JavaScript (ES6+), Responsive Design, serta Git/GitHub."
    },
    {
        keywords: ["proyek", "project", "karya", "buat"],
        response: "Saya telah membuat berbagai proyek web interaktif. Kamu bisa cek langsung daftar lengkapnya di halaman Projects!"
    },
    {
        keywords: ["sertifikat", "sertifikasi", "course"],
        response: "Sertifikat keahlian saya terdaftar resmi dan dapat kamu lihat di halaman Certificates."
    },
    {
        keywords: ["tugas", "kuliah", "video"],
        response: "Saya merekam beberapa dokumentasi presentasi tugas kuliah yang diunggah pada halaman Videos."
    },
    {
        keywords: ["kontak", "hubungi", "email"],
        response: "Silakan isi form kontak di bagian bawah halaman ini untuk mengirim pesan langsung ke saya!"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("aiWidgetContainer");
    if (!container) return;

    // Inject HTML: Hanya Icon Melayang & Modal Pop-Up Kecil
    container.innerHTML = `
        <!-- Icon Floating Trigger -->
        <button class="ai-fab-button" id="aiBtn" aria-label="Buka AI Chat">
            <i data-lucide="bot" id="aiIconBot"></i>
            <span class="ai-badge-pulse"></span>
        </button>

        <!-- Pop-up Chat Box Kecil -->
        <div class="ai-popup-chat glass-card" id="aiWindow">
            <div class="ai-chat-header">
                <div class="ai-brand">
                    <div class="ai-avatar"><i data-lucide="sparkles"></i></div>
                    <div>
                        <h4>AI Assistant</h4>
                        <span class="status-online">Online</span>
                    </div>
                </div>
                <button class="ai-close-btn" id="aiClose"><i data-lucide="x"></i></button>
            </div>

            <div class="ai-chat-body" id="aiBody">
                <div class="ai-msg bot">
                    Halo! Ada yang bisa saya bantu? Tanyakan seputar <b>skill</b>, <b>project</b>, atau <b>sertifikat</b> saya!
                </div>
            </div>

            <div class="ai-chat-footer">
                <input type="text" id="aiInput" placeholder="Tulis pertanyaan..." autocomplete="off">
                <button id="aiSend" class="btn-send"><i data-lucide="send"></i></button>
            </div>
        </div>
    `;

    // Render ulang ikon Lucide
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const aiBtn = document.getElementById("aiBtn");
    const aiWindow = document.getElementById("aiWindow");
    const aiClose = document.getElementById("aiClose");
    const aiSend = document.getElementById("aiSend");
    const aiInput = document.getElementById("aiInput");
    const aiBody = document.getElementById("aiBody");

    // Toggle Pop-up saat Icon diklik
    aiBtn.addEventListener("click", () => {
        aiWindow.classList.toggle("active");
        if (aiWindow.classList.contains("active")) {
            aiInput.focus();
        }
    });

    // Tutup Pop-up saat tombol X diklik
    aiClose.addEventListener("click", () => {
        aiWindow.classList.remove("active");
    });

    // Fungsi Kirim Pesan
    function handleSend() {
        const text = aiInput.value.trim();
        if (!text) return;

        appendMsg(text, "user");
        aiInput.value = "";

        setTimeout(() => {
            const reply = processQuery(text);
            appendMsg(reply, "bot");
        }, 300);
    }

    aiSend.addEventListener("click", handleSend);
    aiInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSend();
    });

    function processQuery(query) {
        const input = query.toLowerCase();
        for (let item of portfolioKnowledge) {
            if (item.keywords.some(k => input.includes(k))) {
                return item.response;
            }
        }
        return "Maaf, saya belum memahami itu. Coba tanyakan hal seperti: 'Apa saja skill kamu?' atau 'Lihat proyek terbaru'.";
    }

    function appendMsg(msg, sender) {
        const div = document.createElement("div");
        div.className = `ai-msg ${sender}`;
        div.innerHTML = msg;
        aiBody.appendChild(div);
        aiBody.scrollTop = aiBody.scrollHeight;
    }
});