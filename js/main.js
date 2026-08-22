document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* ============================================================
       PORTFOLIO MAIN.JS
       ============================================================ */

    /* ============================================================
       1. INITIALIZE LIBRARIES
       ============================================================ */

    // Lucide Icons
    const refreshIcons = () => {
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    };

    refreshIcons();

    // AOS
    if (typeof AOS !== "undefined") {
        AOS.init({
            duration: 800,
            easing: "ease-out-cubic",
            once: true,
            offset: 80
        });
    }

    // Vanilla Tilt
    if (typeof VanillaTilt !== "undefined") {
        const tiltCards = document.querySelectorAll(".tilt-card");

        if (tiltCards.length) {
            VanillaTilt.init(tiltCards, {
                max: 12,
                speed: 400,
                glare: true,
                "max-glare": 0.2,
                gyroscope: false
            });
        }
    }


    /* ============================================================
       2. TYPING EFFECT
       ============================================================ */

    const typingElement = document.getElementById("typingEffect");

    if (typingElement) {
        const words = [
            "Web & AI Developer",
            "UI/UX Designer",
            "Tech Enthusiast"
        ];

        let wordIndex = 0;
        let charIndex = 0;
        let deleting = false;

        const typeText = () => {
            const currentWord = words[wordIndex];

            if (!deleting) {
                charIndex++;
            } else {
                charIndex--;
            }

            typingElement.textContent =
                currentWord.substring(0, charIndex);

            let speed = deleting ? 45 : 80;

            // Selesai mengetik
            if (!deleting && charIndex === currentWord.length) {
                speed = 1800;
                deleting = true;
            }

            // Selesai menghapus
            if (deleting && charIndex === 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                speed = 400;
            }

            setTimeout(typeText, speed);
        };

        setTimeout(typeText, 500);
    }


    /* ============================================================
       3. LIVE CODE TYPING
       ============================================================ */

    const codeElement = document.getElementById("codeTyping");

    if (codeElement) {
        const codeTokens = [
            {
                text: "const ",
                className: "syntax-keyword"
            },
            {
                text: "developer",
                className: "syntax-property"
            },
            {
                text: " = {\n  ",
                className: ""
            },
            {
                text: "name",
                className: "syntax-property"
            },
            {
                text: ': "',
                className: ""
            },
            {
                text: "Developer Muda",
                className: "syntax-string"
            },
            {
                text: '",\n  ',
                className: ""
            },
            {
                text: "skills",
                className: "syntax-property"
            },
            {
                text: ": [",
                className: ""
            },
            {
                text: '"React"',
                className: "syntax-string"
            },
            {
                text: ", ",
                className: ""
            },
            {
                text: '"AI"',
                className: "syntax-string"
            },
            {
                text: ", ",
                className: ""
            },
            {
                text: '"UI/UX"',
                className: "syntax-string"
            },
            {
                text: "],\n  ",
                className: ""
            },
            {
                text: "status",
                className: "syntax-property"
            },
            {
                text: ': "',
                className: ""
            },
            {
                text: "Ready to Build",
                className: "syntax-string"
            },
            {
                text: '",\n  ',
                className: ""
            },
            {
                text: "execute",
                className: "syntax-property"
            },
            {
                text: ": () ",
                className: ""
            },
            {
                text: "=> ",
                className: "syntax-keyword"
            },
            {
                text: "launchPortfolio",
                className: "syntax-property"
            },
            {
                text: "()\n};",
                className: ""
            }
        ];

        let tokenIndex = 0;
        let charIndex = 0;
        let currentSpan = null;

        const typeCode = () => {
            if (tokenIndex >= codeTokens.length) {
                return;
            }

            const token = codeTokens[tokenIndex];

            // Token baru
            if (charIndex === 0) {
                if (token.className) {
                    currentSpan = document.createElement("span");
                    currentSpan.className = token.className;

                    codeElement.appendChild(currentSpan);
                } else {
                    currentSpan = null;
                }
            }

            const character = token.text.charAt(charIndex);

            if (currentSpan) {
                currentSpan.textContent += character;
            } else {
                codeElement.appendChild(
                    document.createTextNode(character)
                );
            }

            charIndex++;

            // Token selesai
            if (charIndex >= token.text.length) {
                tokenIndex++;
                charIndex = 0;
            }

            const speed =
                Math.floor(Math.random() * 25) + 25;

            setTimeout(typeCode, speed);
        };

        setTimeout(typeCode, 800);
    }


    /* ============================================================
       4. ANIMATED COUNTER
       ============================================================ */

    const counters = document.querySelectorAll(".counter");

    const animateCounter = (counter) => {
        const target = Number(
            counter.dataset.target
        );

        if (!Number.isFinite(target)) {
            return;
        }

        const duration = 1200;
        const start = performance.now();

        const update = (currentTime) => {
            const progress = Math.min(
                (currentTime - start) / duration,
                1
            );

            const value = Math.floor(
                progress * target
            );

            counter.textContent = value;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = target;
            }
        };

        requestAnimationFrame(update);
    };

    if (counters.length) {
        counters.forEach(animateCounter);
    }


    /* ============================================================
       5. PARTICLE BACKGROUND
       ============================================================ */

    const canvas = document.getElementById("particleCanvas");

    if (canvas) {
        const ctx = canvas.getContext("2d");

        if (ctx) {
            let particles = [];
            let animationFrame = null;

            const getParticleCount = () => {
                if (window.innerWidth <= 600) {
                    return 18;
                }

                if (window.innerWidth <= 900) {
                    return 28;
                }

                return 40;
            };

            const createParticles = () => {
                particles = Array.from(
                    {
                        length: getParticleCount()
                    },
                    () => ({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        radius: Math.random() * 1.5 + 0.5,
                        dx: (Math.random() - 0.5) * 0.5,
                        dy: (Math.random() - 0.5) * 0.5
                    })
                );
            };

            const resizeCanvas = () => {
                const ratio = Math.min(
                    window.devicePixelRatio || 1,
                    2
                );

                canvas.width =
                    window.innerWidth * ratio;

                canvas.height =
                    window.innerHeight * ratio;

                canvas.style.width =
                    `${window.innerWidth}px`;

                canvas.style.height =
                    `${window.innerHeight}px`;

                ctx.setTransform(
                    ratio,
                    0,
                    0,
                    ratio,
                    0,
                    0
                );

                createParticles();
            };

            const animateParticles = () => {
                ctx.clearRect(
                    0,
                    0,
                    window.innerWidth,
                    window.innerHeight
                );

                ctx.fillStyle =
                    "rgba(0, 242, 254, 0.4)";

                particles.forEach((particle) => {
                    ctx.beginPath();

                    ctx.arc(
                        particle.x,
                        particle.y,
                        particle.radius,
                        0,
                        Math.PI * 2
                    );

                    ctx.fill();

                    particle.x += particle.dx;
                    particle.y += particle.dy;

                    if (
                        particle.x < 0 ||
                        particle.x > window.innerWidth
                    ) {
                        particle.dx *= -1;
                    }

                    if (
                        particle.y < 0 ||
                        particle.y > window.innerHeight
                    ) {
                        particle.dy *= -1;
                    }
                });

                animationFrame =
                    requestAnimationFrame(
                        animateParticles
                    );
            };

            resizeCanvas();
            animateParticles();

            let resizeTimeout;

            window.addEventListener(
                "resize",
                () => {
                    clearTimeout(resizeTimeout);

                    resizeTimeout = setTimeout(
                        resizeCanvas,
                        150
                    );
                }
            );

            document.addEventListener(
                "visibilitychange",
                () => {
                    if (document.hidden) {
                        if (animationFrame) {
                            cancelAnimationFrame(
                                animationFrame
                            );

                            animationFrame = null;
                        }
                    } else if (!animationFrame) {
                        animateParticles();
                    }
                }
            );
        }
    }


    /* ============================================================
       6. CONTACT MODAL
       ============================================================ */

    const contactModal =
        document.getElementById("contactModal");

    const spatialWindow =
        contactModal?.querySelector(
            ".spatial-window"
        );

    const openContactModal =
        document.getElementById(
            "openContactModal"
        );

    const openContactModalHero =
        document.getElementById(
            "openContactModalHero"
        );

    const closeContactModal =
        document.getElementById(
            "closeContactModal"
        );

    const showContactModal = (event) => {
        if (!contactModal || !spatialWindow) {
            return;
        }

        // Menentukan titik awal animasi
        if (event?.currentTarget) {
            const rect =
                event.currentTarget
                    .getBoundingClientRect();

            const originX =
                rect.left + rect.width / 2;

            const originY =
                rect.top + rect.height / 2;

            spatialWindow.style.transformOrigin =
                `${originX}px ${originY}px`;
        } else {
            spatialWindow.style.transformOrigin =
                "center center";
        }

        contactModal.classList.add("active");
        document.body.classList.add("modal-open");

        // Fokus ke input nama
        const nameInput =
            document.getElementById("name");

        setTimeout(() => {
            nameInput?.focus();
        }, 300);
    };

    const hideContactModal = () => {
        if (!contactModal) {
            return;
        }

        contactModal.classList.remove("active");
        document.body.classList.remove("modal-open");
    };

    openContactModal?.addEventListener(
        "click",
        showContactModal
    );

    openContactModalHero?.addEventListener(
        "click",
        showContactModal
    );

    closeContactModal?.addEventListener(
        "click",
        hideContactModal
    );

    // Klik area luar modal
    contactModal?.addEventListener(
        "click",
        (event) => {
            if (event.target === contactModal) {
                hideContactModal();
            }
        }
    );


    /* ============================================================
       7. CONTACT FORM
       ============================================================ */

    const contactForm =
        document.getElementById("contactForm");

    if (contactForm) {
        const nameInput =
            document.getElementById("name");

        const emailInput =
            document.getElementById("email");

        const subjectInput =
            document.getElementById("subject");

        const messageInput =
            document.getElementById("message");

        const submitButton =
            document.getElementById("submitBtn");

        const formAlert =
            document.getElementById("formAlert");

        const nameError =
            document.getElementById("nameError");

        const emailError =
            document.getElementById("emailError");

        const subjectError =
            document.getElementById("subjectError");

        const messageError =
            document.getElementById("messageError");


        /*
         * GANTI DENGAN NOMOR WHATSAPP KAMU
         *
         * Contoh:
         * 6281234567890
         */

        const WHATSAPP_NUMBER =
            "628XXXXXXXXXX";


        /* -----------------------------
           Helper
        ----------------------------- */

        const isValidEmail = (email) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email);
        };

        const showError = (
            input,
            errorElement,
            message
        ) => {
            input?.classList.add("invalid");

            if (errorElement) {
                errorElement.textContent = message;
            }
        };

        const clearError = (
            input,
            errorElement
        ) => {
            input?.classList.remove("invalid");

            if (errorElement) {
                errorElement.textContent = "";
            }
        };

        const showAlert = (
            type,
            message
        ) => {
            if (!formAlert) {
                return;
            }

            formAlert.className =
                `form-alert ${type}`;

            formAlert.textContent =
                message;
        };


        /* -----------------------------
           Submit Form
        ----------------------------- */

        contactForm.addEventListener(
            "submit",
            (event) => {
                event.preventDefault();

                const name =
                    nameInput?.value.trim() || "";

                const email =
                    emailInput?.value.trim() || "";

                const subject =
                    subjectInput?.value.trim() || "";

                const message =
                    messageInput?.value.trim() || "";

                let valid = true;


                /* Name */

                if (name.length < 3) {
                    showError(
                        nameInput,
                        nameError,
                        "Nama minimal 3 karakter."
                    );

                    valid = false;
                } else {
                    clearError(
                        nameInput,
                        nameError
                    );
                }


                /* Email */

                if (!isValidEmail(email)) {
                    showError(
                        emailInput,
                        emailError,
                        "Format email tidak valid."
                    );

                    valid = false;
                } else {
                    clearError(
                        emailInput,
                        emailError
                    );
                }


                /* Subject */

                if (subject.length > 0) {
                    clearError(
                        subjectInput,
                        subjectError
                    );
                }


                /* Message */

                if (message.length < 10) {
                    showError(
                        messageInput,
                        messageError,
                        "Pesan minimal 10 karakter."
                    );

                    valid = false;
                } else {
                    clearError(
                        messageInput,
                        messageError
                    );
                }


                /* Stop */

                if (!valid) {
                    showAlert(
                        "error",
                        "Periksa kembali data yang kamu masukkan."
                    );

                    return;
                }


                /* WhatsApp */

                if (
                    !WHATSAPP_NUMBER ||
                    WHATSAPP_NUMBER.includes(
                        "XXXXXXXXXX"
                    )
                ) {
                    showAlert(
                        "error",
                        "Nomor WhatsApp belum dikonfigurasi."
                    );

                    return;
                }


                const textMessage =
                    `*PESAN DARI PORTFOLIO* 🚀\n\n` +
                    `👤 Nama: ${name}\n` +
                    `✉️ Email: ${email}\n` +
                    `📌 Subjek: ${subject || "-"}\n\n` +
                    `💬 Pesan:\n${message}`;


                const whatsappURL =
                    `https://wa.me/${WHATSAPP_NUMBER}` +
                    `?text=${encodeURIComponent(
                        textMessage
                    )}`;


                /* Button Loading */

                if (submitButton) {
                    submitButton.disabled = true;

                    submitButton.innerHTML =
                        `<i data-lucide="loader-circle"></i> Membuka WhatsApp...`;

                    refreshIcons();
                }


                showAlert(
                    "success",
                    "Membuka WhatsApp..."
                );


                /* Open WhatsApp */

                window.open(
                    whatsappURL,
                    "_blank",
                    "noopener,noreferrer"
                );


                /* Reset */

                contactForm.reset();


                /* Restore Button */

                setTimeout(() => {
                    if (submitButton) {
                        submitButton.disabled = false;

                        submitButton.innerHTML =
                            `<i data-lucide="send"></i> Kirim Pesan`;

                        refreshIcons();
                    }
                }, 1000);


                /* Clear Alert */

                setTimeout(() => {
                    if (formAlert) {
                        formAlert.className =
                            "form-alert";

                        formAlert.textContent =
                            "";
                    }
                }, 5000);
            }
        );
    }


    /* ============================================================
       8. ESCAPE KEY
       ============================================================ */

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape" &&
                contactModal?.classList.contains(
                    "active"
                )
            ) {
                hideContactModal();
            }
        }
    );


    /* ============================================================
       9. MOBILE NAVIGATION
       ============================================================ */

    const mobileMenuToggle =
        document.getElementById(
            "mobileMenuToggle"
        );

    const navLinks =
        document.getElementById(
            "navLinks"
        );

    if (mobileMenuToggle && navLinks) {

        const updateMenuIcon = (isOpen) => {
            mobileMenuToggle.innerHTML =
                `<i data-lucide="${
                    isOpen ? "x" : "menu"
                }"></i>`;

            mobileMenuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            mobileMenuToggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Tutup menu"
                    : "Buka menu"
            );

            refreshIcons();
        };


        /* Toggle */

        mobileMenuToggle.addEventListener(
            "click",
            () => {
                const isOpen =
                    navLinks.classList.toggle(
                        "active"
                    );

                updateMenuIcon(isOpen);
            }
        );


        /* Close ketika link diklik */

        navLinks
            .querySelectorAll("a")
            .forEach((link) => {
                link.addEventListener(
                    "click",
                    () => {
                        navLinks.classList.remove(
                            "active"
                        );

                        updateMenuIcon(false);
                    }
                );
            });


        /* Close ketika resize ke desktop */

        window.addEventListener(
            "resize",
            () => {
                if (window.innerWidth > 768) {
                    navLinks.classList.remove(
                        "active"
                    );

                    updateMenuIcon(false);
                }
            }
        );
    }


    /* ============================================================
       10. THEME TOGGLE
       ============================================================ */

    const themeToggle =
        document.getElementById(
            "themeToggle"
        );

    const savedTheme =
        localStorage.getItem("theme");

    const applyTheme = (theme) => {
        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        localStorage.setItem(
            "theme",
            theme
        );

        if (themeToggle) {
            themeToggle.innerHTML =
                `<i data-lucide="${
                    theme === "light"
                        ? "moon"
                        : "sun"
                }"></i>`;

            themeToggle.setAttribute(
                "aria-label",
                theme === "light"
                    ? "Aktifkan dark mode"
                    : "Aktifkan light mode"
            );

            refreshIcons();
        }
    };

    if (savedTheme === "light") {
        applyTheme("light");
    } else {
        applyTheme("dark");
    }

    themeToggle?.addEventListener(
        "click",
        () => {
            const currentTheme =
                document.documentElement
                    .getAttribute("data-theme");

            applyTheme(
                currentTheme === "light"
                    ? "dark"
                    : "light"
            );
        }
    );


    /* ============================================================
       11. PROJECT FILTER
       ============================================================ */

    const filterButtons =
        document.querySelectorAll(
            ".filter-btn"
        );

    const projectCards =
        document.querySelectorAll(
            ".project-card"
        );

    const projectPages = {
        web: {
            name: "Web",
            url: "projects-web.html"
        },

        uiux: {
            name: "UI/UX",
            url: "projects-uiux.html"
        },

        ai: {
            name: "AI",
            url: "projects-ai.html"
        }
    };


    const updateProjectCategory = (
        category
    ) => {
        projectCards.forEach((card) => {
            const cardCategory =
                card.dataset.category;

            const isVisible =
                cardCategory === category;

            if (isVisible) {
                card.classList.remove(
                    "project-hidden"
                );

                // Restart animation
                card.classList.remove(
                    "project-show"
                );

                void card.offsetWidth;

                card.classList.add(
                    "project-show"
                );
            } else {
                card.classList.remove(
                    "project-show"
                );

                card.classList.add(
                    "project-hidden"
                );
            }
        });

        refreshIcons();
    };


    filterButtons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                const category =
                    button.dataset.filter;

                if (
                    !category ||
                    !projectPages[category]
                ) {
                    return;
                }

                filterButtons.forEach(
                    (btn) => {
                        btn.classList.remove(
                            "active"
                        );
                    }
                );

                button.classList.add(
                    "active"
                );

                updateProjectCategory(
                    category
                );
            }
        );
    });


    /* Default filter */

    const defaultFilter =
        document.querySelector(
            '.filter-btn[data-filter="web"]'
        );

    if (defaultFilter) {
        defaultFilter.click();
    } else if (filterButtons.length) {
        filterButtons[0].click();
    }


    /* ============================================================
       12. ACTIVE NAVIGATION
       ============================================================ */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "index.html";

    document
        .querySelectorAll(".nav-links a")
        .forEach((link) => {
            const href =
                link.getAttribute("href");

            if (
                href === currentPage
            ) {
                link.classList.add("active");
            }
        });


    /* ============================================================
       FINISH
       ============================================================ */

    refreshIcons();

    console.log(
        "%c Portfolio initialized successfully 🚀",
        "color:#00f2fe;font-weight:bold;"
    );
});