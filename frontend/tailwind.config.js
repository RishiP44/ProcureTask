/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0F172A', // Example dark theme base
                accent: '#3B82F6', // Example blue accent
            }
        },
    },
    plugins: [],
}
