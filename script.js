document.addEventListener("DOMContentLoaded", () => {

    // ---- Page Loader ----
    const loader = document.getElementById("page-loader");
    if (loader) {
        window.addEventListener("load", () => {
            setTimeout(() => loader.classList.add("hidden"), 400);
        });
        // Fallback: hide after 3s even if load event doesn't fire
        setTimeout(() => loader.classList.add("hidden"), 3000);
    }

    // ---- Back to Top Button ----
    const backToTop = document.getElementById("back-to-top");
    if (backToTop) {
        window.addEventListener("scroll", () => {
            backToTop.classList.toggle("visible", window.scrollY > 500);
        }, { passive: true });

        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ---- Smooth Scroll (only for same-page anchors) ----
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", (e) => {
            const hash = link.getAttribute("href");
            if (!hash || hash === "#") return;
            const target = document.querySelector(hash);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth" });
                if (navLinks) navLinks.classList.remove("show");
                if (hamburger) hamburger.classList.remove("active");
            }
        });
    });

    // ---- Mobile Menu ----
    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("show");
            hamburger.classList.toggle("active");
        });
    }

    // ---- Header scroll state ----
    const header = document.getElementById("main-header");
    if (header) {
        window.addEventListener("scroll", () => {
            header.classList.toggle("scrolled", window.scrollY > 60);
        }, { passive: true });
    }

    // ---- Reveal on scroll (IntersectionObserver) ----
    const reveals = document.querySelectorAll(".reveal");
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                // Free GPU memory after animation completes
                setTimeout(() => {
                    entry.target.style.willChange = "auto";
                }, 800);
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    reveals.forEach(el => revealObs.observe(el));

    // ---- Theme Dropdown ----
    const themeToggle = document.getElementById("theme-toggle");
    const themeMenu = document.getElementById("theme-menu");
    const root = document.documentElement;

    function getSystemTheme() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function applyTheme(mode) {
        const resolved = mode === "system" ? getSystemTheme() : mode;

        // Only animate if theme is actually changing
        const currentTheme = root.getAttribute("data-theme");
        if (currentTheme && currentTheme !== resolved) {
            document.body.classList.add("theme-transitioning");
            setTimeout(() => document.body.classList.remove("theme-transitioning"), 500);
        }

        root.setAttribute("data-theme", resolved);
        root.setAttribute("data-theme-mode", mode);
        localStorage.setItem("theme-mode", mode);

        // Update active state in menu
        if (themeMenu) {
            themeMenu.querySelectorAll("button").forEach(btn => {
                btn.classList.toggle("active", btn.dataset.themeChoice === mode);
            });
        }
    }

    // Initialize
    applyTheme(localStorage.getItem("theme-mode") || "system");

    // Toggle dropdown
    if (themeToggle && themeMenu) {
        themeToggle.addEventListener("click", () => {
            themeMenu.classList.toggle("open");
        });

        // Handle menu choices
        themeMenu.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", () => {
                applyTheme(btn.dataset.themeChoice);
                themeMenu.classList.remove("open");
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".theme-dropdown")) {
                themeMenu.classList.remove("open");
            }
        });
    }

    // Listen for system theme changes (only matters when mode is "system")
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (localStorage.getItem("theme-mode") === "system") {
            applyTheme("system");
        }
    });

    // ---- Animated Counters ----
    const counters = document.querySelectorAll("[data-count]");
    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const end = parseInt(el.dataset.count, 10);
            let current = 0;
            const step = Math.max(1, Math.floor(end / 50));
            const tick = () => {
                current = Math.min(current + step, end);
                el.textContent = current;
                if (current < end) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            counterObs.unobserve(el);
        });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObs.observe(el));

    // ---- Tech Stack Search ----
    const stackSearch = document.getElementById("stack-search");
    if (stackSearch) {
        // Mark duplicate spans (the second set used for seamless looping)
        document.querySelectorAll(".stack-track").forEach(track => {
            const spans = track.querySelectorAll("span");
            const half = spans.length / 2;
            spans.forEach((span, i) => {
                if (i >= half) span.classList.add("duplicate");
            });
        });

        stackSearch.addEventListener("input", () => {
            const query = stackSearch.value.trim().toLowerCase();
            const categories = document.querySelectorAll(".stack-category");

            if (!query) {
                // Reset: remove searching state, show all cards, clear highlights
                categories.forEach(cat => {
                    cat.classList.remove("searching", "hidden");
                    cat.querySelectorAll(".stack-track span").forEach(s => s.classList.remove("match"));
                });
                return;
            }

            categories.forEach(cat => {
                cat.classList.add("searching");
                const spans = cat.querySelectorAll(".stack-track span:not(.duplicate)");
                let hasMatch = false;

                spans.forEach(span => {
                    if (span.textContent.toLowerCase().includes(query)) {
                        span.classList.add("match");
                        hasMatch = true;
                    } else {
                        span.classList.remove("match");
                    }
                });

                // Also update duplicates to match
                cat.querySelectorAll(".stack-track span.duplicate").forEach(s => s.classList.remove("match"));

                cat.classList.toggle("hidden", !hasMatch);
            });
        });
    }

    // ---- GitHub Projects ----
    async function loadProjects() {
        const username = "dbar2002";
        const container = document.getElementById("github-projects");
        if (!container) return;

        try {
            const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
            if (!res.ok) throw new Error("API error");
            const repos = await res.json();

            container.innerHTML = repos.map(r => `
                <div class="project-card reveal visible">
                    <h3>${esc(r.name)}</h3>
                    <p>${esc(r.description || "No description available.")}</p>
                    <div class="project-meta">
                        ${r.language ? `<span>&#9679; ${esc(r.language)}</span>` : ""}
                        ${r.stargazers_count > 0 ? `<span>&#9733; ${r.stargazers_count}</span>` : ""}
                    </div>
                    <a href="${esc(r.html_url)}" target="_blank" rel="noopener" class="btn btn-outline">View Project</a>
                </div>
            `).join("");
        } catch (err) {
            container.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:40px 0;color:var(--text-dim)">
                Couldn't load projects. <a href="https://github.com/${username}" target="_blank" rel="noopener" style="color:var(--gold)">Visit GitHub &rarr;</a></p>`;
        }
    }

    function esc(s) {
        const d = document.createElement("div");
        d.textContent = s;
        return d.innerHTML;
    }

    loadProjects();

    // ---- Contact Form Submission ----
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = document.getElementById("submit-btn");
            const btnText = btn.querySelector(".btn-text");
            const btnLoading = btn.querySelector(".btn-loading");
            const status = document.getElementById("form-status");

            // Disable button & show loading
            btn.disabled = true;
            btnText.style.display = "none";
            btnLoading.style.display = "inline";
            status.style.display = "none";

            try {
                const res = await fetch(contactForm.action, {
                    method: "POST",
                    body: new FormData(contactForm),
                    headers: { Accept: "application/json" }
                });

                if (res.ok) {
                    status.textContent = "Message sent! I'll get back to you soon.";
                    status.className = "form-status success";
                    status.style.display = "block";
                    contactForm.reset();
                } else {
                    throw new Error("Submit failed");
                }
            } catch (err) {
                status.textContent = "Something went wrong. Try emailing me directly.";
                status.className = "form-status error";
                status.style.display = "block";
            } finally {
                btn.disabled = false;
                btnText.style.display = "inline";
                btnLoading.style.display = "none";
            }
        });
    }

    // ---- Active Nav Tracking ----
    const sections = document.querySelectorAll("section[id]");
    const navItems = document.querySelectorAll(".nav-links a");

    function updateActiveNav() {
        const scrollY = window.scrollY + 120; // offset for fixed header + buffer
        let currentId = "";

        sections.forEach(section => {
            if (section.offsetTop <= scrollY) {
                currentId = section.id;
            }
        });

        navItems.forEach(a => {
            a.classList.toggle("active", a.getAttribute("href") === `#${currentId}`);
        });
    }

    // Use passive scroll listener — cheap since we're only reading offsetTop
    window.addEventListener("scroll", updateActiveNav, { passive: true });
    updateActiveNav(); // set initial state
});