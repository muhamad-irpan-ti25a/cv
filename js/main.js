document.addEventListener("DOMContentLoaded", () => {
    // 1. Initializer Icon & External Libraries
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true });
    }

    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.2
        });
    }

    // 2. EFEK MENGETIK UNTUK SUBTITLE JUDUL KIRI (> Web & AI Developer_)
    const typingElement = document.getElementById("typingEffect");
    if (typingElement) {
        // Kata-kata yang akan diketik secara bergantian
        const words = ["Web & AI Developer", "UI/UX Designer", "Tech Enthusiast"];
        let wordIdx = 0;
        let charIdx = 0;
        let isDeleting = false;

        function typeSubtitle() {
            const currentWord = words[wordIdx];
            
            if (isDeleting) {
                typingElement.textContent = currentWord.substring(0, charIdx - 1);
                charIdx--;
            } else {
                typingElement.textContent = currentWord.substring(0, charIdx + 1);
                charIdx++;
            }

            // Kecepatan mengetik & menghapus
            let typeSpeed = isDeleting ? 40 : 80;

            // Jeda waktu saat kata selesai diketik lengkap agar bisa dibaca
            if (!isDeleting && charIdx === currentWord.length) {
                typeSpeed = 2200; // Jeda 2.2 detik
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                wordIdx = (wordIdx + 1) % words.length;
                typeSpeed = 400; // Jeda sebelum mengetik kata baru
            }

            setTimeout(typeSubtitle, typeSpeed);
        }

        // Jalankan langsung dengan sedikit delay 300ms
        setTimeout(typeSubtitle, 300);
    }

    // 3. LIVE CODE TYPING WITH INSTANT REAL-TIME VS CODE COLORING (SEBELAH KANAN)
    const codeElement = document.getElementById("codeTyping");
    if (codeElement) {
        const codeTokens = [
            { text: "const ", class: "syntax-keyword" },
            { text: "developer", class: "syntax-property" },
            { text: " = {\n  ", class: "" },
            { text: "name", class: "syntax-property" },
            { text: ': "', class: "" },
            { text: "Developer Muda", class: "syntax-string" },
            { text: '",\n  ', class: "" },
            { text: "skills", class: "syntax-property" },
            { text: ': [', class: "" },
            { text: '"React"', class: "syntax-string" },
            { text: ", ", class: "" },
            { text: '"AI"', class: "syntax-string" },
            { text: ", ", class: "" },
            { text: '"UI/UX"', class: "syntax-string" },
            { text: '],\n  ', class: "" },
            { text: "status", class: "syntax-property" },
            { text: ': "', class: "" },
            { text: "Ready to Build", class: "syntax-string" },
            { text: '",\n  ', class: "" },
            { text: "execute", class: "syntax-property" },
            { text: ": () ", class: "" },
            { text: "=> ", class: "syntax-keyword" },
            { text: "launchPortfolio", class: "syntax-property" },
            { text: "()\n};", class: "" }
        ];

        let tokenIdx = 0;
        let charInTokenIdx = 0;
        let currentSpan = null;

        function typeRealtimeCode() {
            if (tokenIdx < codeTokens.length) {
                const currentToken = codeTokens[tokenIdx];

                if (charInTokenIdx === 0) {
                    if (currentToken.class) {
                        currentSpan = document.createElement("span");
                        currentSpan.className = currentToken.class;
                        codeElement.appendChild(currentSpan);
                    } else {
                        currentSpan = null;
                    }
                }

                const charToAppend = currentToken.text.charAt(charInTokenIdx);
                
                if (currentSpan) {
                    currentSpan.textContent += charToAppend;
                } else {
                    codeElement.appendChild(document.createTextNode(charToAppend));
                }

                charInTokenIdx++;

                if (charInTokenIdx >= currentToken.text.length) {
                    tokenIdx++;
                    charInTokenIdx = 0;
                }

                let speed = Math.floor(Math.random() * 20) + 25;
                setTimeout(typeRealtimeCode, speed);
            }
        }

        setTimeout(typeRealtimeCode, 800);
    }

    // 4. ANIMATED COUNTER
    const counters = document.querySelectorAll(".counter");
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute("data-target");
            const count = +counter.innerText;
            const inc = target / 50;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 40);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });

    // 5. PARTICLE CANVAS BACKGROUND
    const canvas = document.getElementById("particleCanvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        let particles = [];
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                dx: (Math.random() - 0.5) * 0.5,
                dy: (Math.random() - 0.5) * 0.5
            });
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(0, 242, 254, 0.4)";

            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                p.x += p.dx;
                p.y += p.dy;

                if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
            });
        }
        animate();
    }

    // Event Submit Form via Fonnte API
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            let isValid = true;

            // Validasi Sederhana
            if (nameInput.value.trim().length < 3) {
                showError(nameInput, document.getElementById("nameError"), "Nama minimal 3 karakter!");
                isValid = false;
            } else {
                clearError(nameInput, document.getElementById("nameError"));
            }

            if (!isValidEmail(emailInput.value.trim())) {
                showError(emailInput, document.getElementById("emailError"), "Format email tidak valid!");
                isValid = false;
            } else {
                clearError(emailInput, document.getElementById("emailError"));
            }

            if (messageInput.value.trim().length < 10) {
                showError(messageInput, document.getElementById("messageError"), "Pesan minimal 10 karakter!");
                isValid = false;
            } else {
                clearError(messageInput, document.getElementById("messageError"));
            }

            // Jika Semua Field Valid -> Kirim ke Fonnte
            if (isValid) {
                const submitBtn = document.getElementById("submitBtn");
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i data-lucide="loader"></i> Mengirim...`;
                if (typeof lucide !== 'undefined') lucide.createIcons();

                // 1. Data Fonnte
                const FONNTE_TOKEN = "1nqujfT3A5hT71idmaEK"; // Masukkan API Token dari Fonnte
                const TARGET_NO_HP = "085121046062"; // Masukkan nomor WhatsApp kamu (misal: 0812... / 62812...)

                // 2. Format Teks Pesan WhatsApp
                const textMessage = `*PESAN BARU DARI PORTOFOLIO!* 🚀\n\n` +
                                    `👤 *Nama:* ${nameInput.value.trim()}\n` +
                                    `✉️ *Email:* ${emailInput.value.trim()}\n` +
                                    `📌 *Subjek:* ${subjectInput.value.trim()}\n\n` +
                                    `💬 *Pesan:* \n"${messageInput.value.trim()}"`;

                // 3. Payload Request
                const formData = new FormData();
                formData.append('target', TARGET_NO_HP);
                formData.append('message', textMessage);

                // 4. Kirim Request ke API Fonnte
                fetch('https://api.fonnte.com/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': FONNTE_TOKEN
                    },
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status) {
                        formAlert.className = "form-alert success";
                        formAlert.innerText = "Pesan berhasil terkirim langsung ke WhatsApp!";
                        contactForm.reset();
                    } else {
                        formAlert.className = "form-alert invalid";
                        formAlert.innerText = "Gagal mengirim pesan: " + (data.reason || "Terjadi kesalahan.");
                    }
                })
                .catch(error => {
                    formAlert.className = "form-alert invalid";
                    formAlert.innerText = "Terjadi kesalahan koneksi saat menghubungi server Fonnte.";
                    console.error("Error Fonnte:", error);
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<i data-lucide="send"></i> Kirim Pesan`;
                    if (typeof lucide !== 'undefined') lucide.createIcons();

                    // Sembunyikan notifikasi setelah 5 detik
                    setTimeout(() => {
                        formAlert.className = "form-alert";
                        formAlert.innerText = "";
                    }, 5000);
                });
            }
        });

    // 7. MODAL CONTACT TRIGGER (macOS Dynamic Origin App Launching)
    const contactModal = document.getElementById("contactModal");
    const spatialWindow = contactModal ? contactModal.querySelector(".spatial-window") : null;
    const closeContactModal = document.getElementById("closeContactModal");
    const openContactModal = document.getElementById("openContactModal");
    const openContactModalHero = document.getElementById("openContactModalHero");

    // Fungsi menghitung titik ciut (transform-origin) dari tombol yang diklik
    const showModal = (e) => {
        if (contactModal && spatialWindow) {
            if (e && e.currentTarget) {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = rect.left + rect.width / 2;
                const clickY = rect.top + rect.height / 2;
                
                // Set titik tumpu animasi mengecil tepat di posisi tombol
                spatialWindow.style.transformOrigin = `${clickX}px ${clickY}px`;
            } else {
                spatialWindow.style.transformOrigin = "center center";
            }

            contactModal.classList.add("active");
        }
    };

    const hideModal = () => {
        if (contactModal) {
            contactModal.classList.remove("active");
        }
    };

    if (openContactModal) openContactModal.addEventListener("click", showModal);
    if (openContactModalHero) openContactModalHero.addEventListener("click", showModal);
    if (closeContactModal) closeContactModal.addEventListener("click", hideModal);

    if (contactModal) {
        contactModal.addEventListener("click", (e) => {
            if (e.target === contactModal) {
                hideModal();
            }
        });
    }
});