/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                bg: '#050505',
                bgElevated: '#101010',
                accentPrimary: '#00E5FF',
                accentWarning: '#FFC800',
                accentDanger: '#FF3366',
                textPrimary: '#F5F5F5',
                textSecondary: '#A0A0A0',
                borderSubtle: '#262626',
            },
        },
    },
    plugins: [],
}
