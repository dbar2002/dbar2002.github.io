document.addEventListener("DOMContentLoaded", function () {
    // Smooth Scroll
    document.querySelectorAll(".nav-links a").forEach(anchor => {
        anchor.addEventListener("click", function (event) {
            if (this.hash !== "") {
                event.preventDefault();
                const targetSection = document.querySelector(this.hash);
                targetSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    // Mobile Menu Toggle
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("show");
    });

    // Fade-in animation for sections
    const fadeElements = document.querySelectorAll(".fade-in");

    const fadeInOnScroll = () => {
        fadeElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9) {
                element.classList.add("visible");
            }
        });
    };

    window.addEventListener("scroll", fadeInOnScroll);
    fadeInOnScroll();

    // Theme Toggle Functionality
    const themeToggle = document.getElementById("theme-toggle");
    const root = document.documentElement;

    function setTheme(theme) {
        localStorage.setItem("theme", theme);
        root.setAttribute("data-theme", theme);
        applyDarkModeStyles(theme);
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem("theme");
        
        if (savedTheme) {
            root.setAttribute("data-theme", savedTheme);
            themeToggle.value = savedTheme;
        } else {
            // If no theme is saved, use system preference
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const defaultTheme = systemPrefersDark ? "dark" : "light";
            setTheme(defaultTheme);
            themeToggle.value = defaultTheme;
        }

        applyDarkModeStyles(themeToggle.value);
    }

    function applyDarkModeStyles(theme) {
        const body = document.body;
        const projectCards = document.querySelectorAll(".project-card");

        if (theme === "dark") {
            body.classList.add("dark-mode");
            projectCards.forEach(card => card.classList.add("dark-card"));
        } else {
            body.classList.remove("dark-mode");
            projectCards.forEach(card => card.classList.remove("dark-card"));
        }
    }

    themeToggle.addEventListener("change", function () {
        const selectedTheme = themeToggle.value;
        setTheme(selectedTheme);
    });

    loadTheme();

    // Fetch and Display GitHub Projects
    async function fetchGitHubProjects() {
        const username = "dbar2002"; // Replace with your GitHub username
        const reposContainer = document.getElementById("github-projects");

        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
            const repos = await response.json();

            reposContainer.innerHTML = repos
                .map(repo => `
                    <div class="project-card">
                        <h3>${repo.name}</h3>
                        <p>${repo.description || "No description available."}</p>
                        <a href="${repo.html_url}" target="_blank" class="btn-outline">View Project</a>
                    </div>
                `)
                .join("");

            // Apply dark mode styling after adding projects
            applyDarkModeStyles(themeToggle.value);
        } catch (error) {
            reposContainer.innerHTML = `<p>Error loading projects. Please try again later.</p>`;
            console.error("GitHub API Error:", error);
        }
    }

    fetchGitHubProjects();
});
