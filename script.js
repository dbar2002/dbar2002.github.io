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
    }

    themeToggle.addEventListener("change", function () {
        const selectedTheme = themeToggle.value;
        setTheme(selectedTheme);
    });

    loadTheme();
});
