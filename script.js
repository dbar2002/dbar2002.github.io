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
});
