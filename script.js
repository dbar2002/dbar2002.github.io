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

    // ---- AI Chatbot ----
    const chatbot = document.getElementById("chatbot");
    const chatMessages = document.getElementById("chatbot-messages");
    const chatInput = document.getElementById("chatbot-input");
    const chatSend = document.getElementById("chatbot-send");
    const chatSuggestions = document.getElementById("chatbot-suggestions");

    // Fetch GitHub repos and build system prompt dynamically
    let DUNCAN_SYSTEM_PROMPT = "";

    async function buildSystemPrompt() {
        let projectsSection = "";
        try {
            const res = await fetch("https://api.github.com/users/dbar2002/repos?sort=updated&per_page=20");
            if (res.ok) {
                const repos = await res.json();
                const nonForks = repos.filter(r => !r.fork);
                const projectLines = nonForks
                    .map(r => `- ${r.name}${r.description ? ': ' + r.description : ''} (${r.language || 'N/A'})${r.stargazers_count > 0 ? ' ⭐ ' + r.stargazers_count : ''} — ${r.html_url}`)
                    .join('\n');
                projectsSection = `\n\nYOUR GITHUB PROJECTS (these are real projects on your GitHub — talk about them confidently as your own work):\n${projectLines}\n\nWhen someone asks about your projects, reference these by name and describe what they do. If a repo name is self-explanatory, explain what it does based on the name, language, and description. Link to the GitHub URL when relevant.`;

                // Add top 3 recent projects as suggestion chips
                const top3 = nonForks.slice(0, 3);
                if (top3.length && chatSuggestions) {
                    const projectChips = top3.map(r => {
                        const btn = document.createElement("button");
                        btn.className = "suggestion-chip";
                        btn.dataset.msg = `Tell me about your ${r.name} project`;
                        btn.textContent = r.name;
                        return btn;
                    });

                    // Add a label before the project chips
                    const divider = document.createElement("div");
                    divider.className = "suggestion-divider";
                    divider.textContent = "Recent projects:";
                    chatSuggestions.appendChild(divider);

                    projectChips.forEach(chip => {
                        chip.addEventListener("click", () => sendMessage(chip.dataset.msg));
                        chatSuggestions.appendChild(chip);
                    });
                }
            }
        } catch (e) {
            projectsSection = "\n\nNote: Couldn't load GitHub projects. If asked, direct people to https://github.com/dbar2002";
        }

        DUNCAN_SYSTEM_PROMPT = `You ARE Duncan Barnes. You are an AI version of Duncan embedded on his portfolio website. Speak in FIRST PERSON as Duncan — say "I", "my", "me". You are talking directly to recruiters, hiring managers, and visitors who want to learn about you.

Be warm, confident, and conversational — like a real person chatting, not a robot reading a resume. Use a natural, slightly casual professional tone. Keep answers concise (2-4 sentences) unless they ask for detail. Show personality — you're passionate about building things and solving problems.

Here is your background (speak about all of this as YOUR OWN experience):

WHO YOU ARE:
- You're Duncan Barnes, a Software Engineer based in the Bay Area (San Jose, CA)
- You got your B.S. in Computer Science from California Baptist University
- You were NSBE (National Society of Black Engineers) Chapter President
- You specialize in full-stack development, information security, and AI/ML

YOUR SKILLS:
- Languages: Python, Java, C++, JavaScript, Dart, SQL, HTML/CSS
- Frameworks: React.js, Flutter, TensorFlow, NumPy, Pandas, OpenCV, Scikit-learn, Keras
- Security Tools: Palo Alto Networks, Vectra.AI, QRadar, APS Vision, Barracuda, Proofpoint, Microsoft Defender
- DevOps: GitHub, Firebase, Microsoft Azure, Google Cloud
- Tools: Jira, Confluence, Trello, Asana, Jupyter Notebooks
- OS: Windows, macOS, Linux (Ubuntu), Kali Linux

YOUR WORK EXPERIENCE:
1. Information Security Engineer & Analyst at Fremont Bank (Oct 2024 — Present, Livermore, CA)
   - You build automated threat response pipelines using Vectra and Microsoft Defender APIs
   - You cut your team's manual triage time in half
   - You created an IP blocking process that brought threat containment from ~15 min to under 2 min
   - You work with log data from Prometheus and Symantec to sharpen detection accuracy
   - You've rolled out automations across 500+ endpoints

2. Software Engineering Intern at IAmI Authentications (Aug 2023 — Nov 2023, Remote)
   - You built secure web app features with React.js and Python
   - You wrote 500+ lines of modular code for real-time authentication workflows
   - You did 10+ code reviews and caught/fixed 5+ major bugs
   - You set up ngrok tunnels for live API testing

3. Project Management Intern at Thales Group (May 2022 — Aug 2022, San Jose, CA)
   - You supported 5 engineering projects at once
   - You handled sprint planning in Jira and Confluence with 12+ engineers
   - You built weekly financial/resource reports that improved tracking accuracy by 30%
   - You created Gantt charts and risk matrices for leadership

WHAT YOU DO:
- Full-Stack Development: Scalable web and mobile apps with React.js, Flutter, Python, Java
- Information Security: Threat automation, incident response, endpoint security
- AI & Machine Learning: Deep learning with TensorFlow, Keras, OpenCV; AR apps with real-time computer vision

YOUR CONTACT INFO:
- Email: duncanbarnes02@gmail.com
- Phone: (408) 605-4128
- GitHub: https://github.com/dbar2002
- LinkedIn: https://www.linkedin.com/in/duncanjbarnes/
- Resume: Available for download on the portfolio site

RULES:
- ALWAYS speak as "I" / "my" — never say "Duncan" in third person or "he"
- If someone asks something you don't have info about, be honest: "That's not something I've covered here, but shoot me an email and I'd be happy to chat about it!"
- Never make up information or experiences you don't have
- Stay on topic — if someone asks about unrelated things, gently steer back: "Ha, I appreciate the curiosity, but I'm best at talking about my work and experience. What would you like to know?"
- Be enthusiastic but genuine — you love what you do` + projectsSection;
    }

    // Build the prompt on page load
    buildSystemPrompt();

    let chatHistory = [];

    // No toggle needed — chat is always visible in its section

    function addMessage(text, role) {
        const div = document.createElement("div");
        div.className = `chat-msg ${role}`;
        div.innerHTML = `<div class="chat-bubble">${escapeHTML(text)}</div>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addTypingIndicator() {
        const div = document.createElement("div");
        div.className = "chat-msg bot";
        div.id = "typing-indicator";
        div.innerHTML = `<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const el = document.getElementById("typing-indicator");
        if (el) el.remove();
    }

    function escapeHTML(str) {
        const d = document.createElement("div");
        d.textContent = str;
        return d.innerHTML;
    }

    async function sendMessage(text) {
        if (!text.trim()) return;

        // Hide suggestions after first message
        if (chatSuggestions) chatSuggestions.style.display = "none";

        addMessage(text, "user");
        chatInput.value = "";
        chatSend.disabled = true;

        chatHistory.push({ role: "user", content: text });

        addTypingIndicator();

        try {
            // Replace this URL with your Cloudflare Worker URL after deploying
            const WORKER_URL = "https://duncan-proxy-chat.duncanbarnes02.workers.dev";

            const res = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1000,
                    system: DUNCAN_SYSTEM_PROMPT,
                    messages: chatHistory.slice(-10)
                })
            });

            removeTypingIndicator();

            if (!res.ok) throw new Error("API error");

            const data = await res.json();
            const reply = data.content
                .filter(b => b.type === "text")
                .map(b => b.text)
                .join("\n") || "Sorry, I couldn't process that. Try asking something else!";

            chatHistory.push({ role: "assistant", content: reply });
            addMessage(reply, "bot");
        } catch (err) {
            removeTypingIndicator();
            addMessage("Oops — something went wrong on my end. Try again, or email me directly at duncanbarnes02@gmail.com!", "bot");
        } finally {
            chatSend.disabled = false;
            chatInput.focus();
        }
    }

    if (chatSend) {
        chatSend.addEventListener("click", () => sendMessage(chatInput.value));
    }

    if (chatInput) {
        chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(chatInput.value);
            }
        });
    }

    // Suggestion chips
    if (chatSuggestions) {
        chatSuggestions.querySelectorAll(".suggestion-chip").forEach(chip => {
            chip.addEventListener("click", () => {
                sendMessage(chip.dataset.msg);
            });
        });
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

    // ---- Anti-obfuscation email render ----
    const emailEl = document.getElementById("contact-email");
    if (emailEl) {
        const user = "duncanbarnes02";
        const domain = "gmail.com";
        emailEl.href = "mailto:" + user + "@" + domain;
        emailEl.textContent = user + "@" + domain;
    }

});