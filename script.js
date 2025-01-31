// Typed.js for animated text
new Typed("#typed-text", {
    strings: ["Web Developer", "Designer", "Creative Thinker"],
    typeSpeed: 50,
    backSpeed: 30,
    loop: true,
});

// GSAP Scroll Animations
gsap.from(".section", {
    opacity: 0,
    y: 50,
    duration: 1,
    scrollTrigger: {
        trigger: ".section",
        start: "top 80%",
    },
});

// Parallax Effect
gsap.to(".parallax-bg", {
    yPercent: -50,
    ease: "none",
    scrollTrigger: {
        trigger: ".parallax-section",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
    },
});