// config.js
// File konfigurasi terpisah untuk menyimpan API key dan pengaturan lainnya

// ========== KONFIGURASI API - GROQ ==========
const CONFIG = {
    GROQ_API_KEY: "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",
    GROQ_API_URL: "https://api.groq.com/openai/v1/chat/completions",
    
    // ========== GOOGLE FORM CONFIG ==========
    GOOGLE_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLScd_EEQNsSDdkDcEKpRpuPLZFRqeXJrHZxBp1zydk0TbQAlRw/formResponse',
    DIARY_ENTRY_ID: 'entry.1921997133'
};

// Jangan lupa untuk mengekspor jika menggunakan module
// Untuk penggunaan biasa, CONFIG sudah tersedia secara global