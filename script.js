document.addEventListener("DOMContentLoaded", () => {

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
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    reveals.forEach(el => revealObs.observe(el));

    // ---- Theme Toggle ----
    const toggle = document.getElementById("theme-toggle");
    const root = document.documentElement;

    function getTheme() {
        return localStorage.getItem("theme") ||
            (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }

    function applyTheme(t) {
        root.setAttribute("data-theme", t);
        localStorage.setItem("theme", t);
    }

    applyTheme(getTheme());

    if (toggle) {
        toggle.addEventListener("click", () => {
            applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
        });
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
        if (!localStorage.getItem("theme")) applyTheme(e.matches ? "dark" : "light");
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

    // ---- Active Nav Tracking ----
    const sections = document.querySelectorAll("section[id]");
    const navItems = document.querySelectorAll(".nav-links a");

    const secObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navItems.forEach(a => {
                    a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
                });
            }
        });
    }, { threshold: 0.25, rootMargin: "-80px 0px -50% 0px" });
    sections.forEach(s => secObs.observe(s));
});
