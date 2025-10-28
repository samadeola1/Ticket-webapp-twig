// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./assets/**/*.js", // Scan JavaScript files
        "./templates/**/*.html.twig", // Scan Twig template files
    ],
    theme: {
        extend: {
            fontFamily: {
                inter: ["Inter", "sans-serif"],
            },
            keyframes: {
                // ---> COPY KEYFRAMES FROM PREVIOUS INSTRUCTIONS HERE <---
                shake: {
                    "0%, 100%": { transform: "translateX(0)" },
                    "25%": { transform: "translateX(-5px)" },
                    "50%": { transform: "translateX(5px)" },
                    "75%": { transform: "translateX(-5px)" },
                },
                "fade-in-up": {
                    from: { opacity: "0", transform: "translateY(20px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "bounce-rotate": {
                    "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
                    "50%": { transform: "translateY(-15px) rotate(10deg)" },
                },
                "bounce-scale": {
                    "0%, 100%": { transform: "translateY(0) scale(1)" },
                    "50%": { transform: "translateY(10px) scale(1.1)" },
                },
                "wiggle-float": {
                    "0%, 100%": {
                        transform:
                            "translateY(0px) translateX(0px) rotate(5deg) scale(1)",
                    },
                    "25%": {
                        transform:
                            "translateY(-5px) translateX(5px) rotate(3deg) scale(1.02)",
                    },
                    "50%": {
                        transform:
                            "translateY(5px) translateX(-5px) rotate(7deg) scale(1)",
                    },
                    "75%": {
                        transform:
                            "translateY(-5px) translateX(5px) rotate(3deg) scale(1.02)",
                    },
                },
                "float-bubble": {
                    "0%, 100%": {
                        transform: "translateY(0) translateX(0) scale(1)",
                        opacity: "0.6",
                    },
                    "25%": {
                        transform:
                            "translateY(-10px) translateX(5px) scale(1.1)",
                        opacity: "0.7",
                    },
                    "50%": {
                        transform:
                            "translateY(-20px) translateX(-5px) scale(1)",
                        opacity: "0.8",
                    },
                    "75%": {
                        transform:
                            "translateY(-10px) translateX(5px) scale(0.9)",
                        opacity: "0.7",
                    },
                },
            },
            animation: {
                // ---> COPY ANIMATIONS FROM PREVIOUS INSTRUCTIONS HERE <---
                shake: "shake 0.4s ease",
                "fade-in-up": "fade-in-up 1.2s ease forwards",
                "bounce-rotate": "bounce-rotate 6s ease-in-out infinite",
                "bounce-scale": "bounce-scale 7s ease-in-out infinite",
                "wiggle-float": "wiggle-float 8s ease-in-out infinite",
                "bubble-1": "float-bubble 10s ease-in-out infinite 0s",
                "bubble-2": "float-bubble 12s ease-in-out infinite 2s",
                "bubble-3": "float-bubble 11s ease-in-out infinite 4s",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
