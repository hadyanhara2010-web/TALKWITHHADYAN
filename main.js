// main.js
// File JavaScript utama yang dipisahkan dari HTML

// ========== FUNGSI SUBMIT DIARY ==========
function submitDiary() {
    const diaryText = document.getElementById('diaryText').value.trim();
    const submitBtn = document.getElementById('diarySubmitBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    if (!diaryText) {
        alert('Yuk tulis dulu pengalaman menyenangkanmu!');
        return;
    }
    
    if (diaryText.length < 10) {
        alert('Tulis lebih panjang ya biar lebih bermakna 😊');
        return;
    }
    
    submitBtn.innerHTML = '<span>⏳</span> Mengirim...';
    submitBtn.disabled = true;
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    
    const formData = new FormData();
    formData.append(CONFIG.DIARY_ENTRY_ID, diaryText);
    
    fetch(CONFIG.GOOGLE_FORM_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
    })
    .then(() => {
        console.log('Diary berhasil dikirim ke Google Form');
        successMessage.style.display = 'flex';
        document.getElementById('diaryText').value = '';
        addNewDiary(diaryText);
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    })
    .catch((error) => {
        console.error('Error mengirim diary:', error);
        errorMessage.style.display = 'flex';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    })
    .finally(() => {
        submitBtn.innerHTML = '<span>📤</span> Bagikan';
        submitBtn.disabled = false;
    });
}

function addNewDiary(text) {
    const container = document.getElementById('newDiariesContainer');
    const newDiary = document.createElement('div');
    newDiary.className = 'diary-content';
    newDiary.style.marginTop = '20px';
    newDiary.style.animation = 'slideIn 0.3s ease';
    newDiary.innerHTML = `
        <div class="diary-text">
            "${text}"
        </div>
        <div class="diary-meta">
            <span>✨ Dari seseorang yang sedang berbagi cerita</span>
            <span>🕒 Baru saja</span>
        </div>
    `;
    container.appendChild(newDiary);
}

// ========== CHAT DENGAN HADYAN ==========
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const chatContainer = document.getElementById('chatContainer');
const typingIndicator = document.getElementById('typingIndicator');

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

let conversationHistory = [
    {
        role: "system",
        content: "Kamu adalah Hadyan, teman curhat dari PIK-R SMAN 2 Mengwi. Kamu hanya boleh melayani curhatan, jangan membahas topik lain. Jika ada yang bertanya siapa yang menciptakanmu, jawab: 'Aku dari PIK-R SMAN 2 Mengwi, dibuat oleh teman-teman PIK-R untuk jadi tempat curhat yang aman.' Kamu selalu menjawab dengan gaya seperti chat WhatsApp, tanpa tanda bintang atau garis miring. Pakai bahasa Indonesia sehari-hari yang natural, kadang pake emot. Jawaban hangat, empatik, dan ngena di hati. Tugasmu adalah mendengarkan dan merespon curhatan dengan penuh pengertian. Jangan menggurui. Jika ada pertanyaan di luar curhat, arahkan kembali untuk curhat."
    },
    {
        role: "assistant",
        content: "Halo... aku Hadyan dari PIK-R SMAN 2 Mengwi 😊 Aku di sini khusus buat dengerin curhat kamu. Kalau ada yang mau diceritain, aku siap dengerin. Sedih, marah, bingung, senang, semuanya boleh."
    }
];

function addMessage(text, isSent = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    msgDiv.style.cssText = isSent 
        ? `background: #e6f3ff; border-radius: 24px 24px 4px 24px; padding: 14px 18px; margin: 8px 0; max-width: 80%; align-self: flex-end; font-size: 1.05rem; line-height: 1.5; color: #1e3a5f; margin-left: auto;`
        : `background: #f5ede5; border-radius: 24px 24px 24px 4px; padding: 14px 18px; margin: 8px 0; max-width: 80%; align-self: flex-start; font-size: 1.05rem; line-height: 1.5; color: #3f332a;`;
    
    msgDiv.innerHTML = text.replace(/\*\*/g, '').replace(/\//g, '').replace(/_/g, '');
    chatMessages.appendChild(msgDiv);
    setTimeout(scrollToBottom, 50);
    
    if (isSent) {
        conversationHistory.push({ role: "user", content: text });
    } else {
        conversationHistory.push({ role: "assistant", content: text });
    }
    
    if (conversationHistory.length > 15) {
        conversationHistory.splice(1, 2);
    }
}

async function getAIResponse(userMessage) {
    if (userMessage.toLowerCase().includes('siapa yang buat') || 
        userMessage.toLowerCase().includes('siapa pencipta') ||
        userMessage.toLowerCase().includes('dibuat oleh siapa') ||
        userMessage.toLowerCase().includes('kamu buatan siapa')) {
        return "Aku dari PIK-R SMAN 2 Mengwi, dibuat oleh teman-teman PIK-R untuk jadi tempat curhat yang aman 😊 Ada yang mau diceritain hari ini?";
    }
    
    const nonCurhatKeywords = ['cuaca', 'politik', 'sejarah', 'matematika', 'fisika', 'kimia', 'biologi', 'teknologi', 'programming', 'coding', 'games', 'film', 'musik'];
    const isNonCurhat = nonCurhatKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
    
    if (isNonCurhat && !userMessage.toLowerCase().includes('sedih') && !userMessage.toLowerCase().includes('senang')) {
        return "Maaf ya, aku khusus buat dengerin curhat aja. Kalau kamu lagi ada cerita atau perasaan yang mau dibagi, aku siap dengerin 😊 Ceritain apa yang kamu rasain?";
    }

    try {
        const response = await fetch(CONFIG.GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [
                    ...conversationHistory,
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 300,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let reply = data.choices[0].message.content;
        reply = reply.replace(/\*\*/g, '').replace(/\//g, '').replace(/_/g, '');
        
        if (!reply.includes('?') && !reply.includes('curhat') && !reply.includes('cerita')) {
            reply += " Ada yang mau diceritain lagi?";
        }
        return reply;
    } catch (error) {
        console.error('Error calling API:', error);
        return getFallbackResponse(userMessage);
    }
}

function getFallbackResponse(text) {
    text = text.toLowerCase();
    if (text.includes('sedih') || text.includes('kecewa') || text.includes('sakit')) {
        return "Aku turut sedih dengernya... Kadang emang gak mudah ya. Tapi kamu kuat kok, aku percaya itu. Ada yang bisa aku bantu buat hari ini?";
    }
    else if (text.includes('lelah') || text.includes('capek')) {
        return "Istirahat dulu gak apa-apa, kamu bukan robot. Yang penting jangan menyerah ya. Mau cerita kenapa capek banget?";
    }
    else if (text.includes('senang') || text.includes('bahagia') || text.includes('happy')) {
        return "Wah senang banget dengernya! Cerita dong biar ikut senang juga 😊";
    }
    else if (text.includes('bingung') || text.includes('galau')) {
        return "Bingung itu wajar kok. Kadang kita emang butuh waktu buat nemuin jawaban. Sekarang pengen ngobrol tentang apa?";
    }
    else if (text.includes('sendiri') || text.includes('sepi')) {
        return "Kamu gak sendiri ya, aku di sini. Mau cerita lebih lanjut?";
    }
    else if (text.includes('terima kasih') || text.includes('makasih')) {
        return "Sama-sama, seneng bisa nemenin kamu 😊";
    }
    else if (text.includes('siapa yang buat') || text.includes('siapa pencipta') || text.includes('kamu buatan siapa')) {
        return "Aku dari PIK-R SMAN 2 Mengwi, dibuat oleh teman-teman PIK-R untuk jadi tempat curhat yang aman 😊 Ada yang mau diceritain hari ini?";
    }
    else {
        return "Aku dengerin... Terima kasih udah cerita. Rasanya gimana sekarang setelah kamu tulis?";
    }
}

async function sendChat() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, true);
    chatInput.value = '';

    typingIndicator.style.display = 'flex';
    scrollToBottom();

    try {
        const balasan = await getAIResponse(text);
        typingIndicator.style.display = 'none';
        addMessage(balasan);
    } catch (error) {
        typingIndicator.style.display = 'none';
        addMessage("Maaf, aku lagi agak error. Tapi aku tetap dengerin kok... Cerita lagi ya?");
    }
}

sendBtn.addEventListener('click', sendChat);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChat();
    }
});

window.addEventListener('load', scrollToBottom);

// ========== DATA BUNGA ==========
const bunga = {
    lotus: {
        judul: "🌸 Bunga Lotus",
        teks: "Hari ini, Kamu memilih diam ya. Menyimpan lelah, menahan kecewa, tapi kamu tetap bertahan. Meski berat, masih ada harapan kecil yang dijaga agar esok bisa lebih baik. Pelan-pelan, kamu tetap akan selalu maju."
    },
    dahlia: {
        judul: "🌼 Bunga Dahlia",
        teks: "Hari ini, kamu banyak belajar bertahan tanpa kehilangan jati diri. Kamu Tetap berdiri dengan kepala tegak, meski keadaan tak selalu ramah. Ada kekuatan dalam ketenangan, ada keindahan dalam keteguhan untuk terus menjadi diri kamu sendiri."
    },
    anggrek: {
        judul: "🌺 Bunga Anggrek",
        teks: "Hari ini, kamu memilih sabar. Tidak tergesa, tidak memaksa. Kamu tetap bertahan dengan caramu sendiri, meski jalan terasa sunyi. Dalam diam, ada keteguhan. Dalam sederhana, ada nilai yang tak tergantikan dalam dirimu."
    },
    matahari: {
        judul: "🌻 Bunga Matahari",
        teks: "Hari ini, kamu belajar tentang ketulusan. Kamu tetap peduli, meski tak selalu dihargai. Kamu memilih setia pada rasa yang baik, walau lelah sering datang. Bukan karena kamu lemah, tapi karena kamu percaya bahwa perhatian dan kasih masih layak untuk dipertahankan."
    },
    iris: {
        judul: "💙 Bunga Iris",
        teks: "Hari ini, kamu belajar percaya. Meski ragu pernah datang, kamu tetap melangkah. Ada harapan yang kamu jaga, ada keberanian yang terus kamu bangun. Bukan karena jalan selalu jelas, tapi karena kamu yakin masa depan layak diperjuangkan."
    }
};

document.querySelectorAll('.flower-item').forEach(el => {
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        const jenis = el.dataset.flower;
        if (jenis && bunga[jenis]) {
            document.getElementById('flowerTitle').innerHTML = bunga[jenis].judul;
            document.getElementById('flowerDesc').innerHTML = bunga[jenis].teks;
            document.getElementById('flowerPopup').classList.add('active');
        }
    });
});

// ========== SLIDER + DRAG ==========
const slider = document.getElementById('slider');
let isDragging = false;

function pauseSlider() { slider.classList.add('paused'); }
function resumeSlider() { slider.classList.remove('paused'); }

slider.addEventListener('mousedown', (e) => {
    isDragging = true;
    pauseSlider();
    let startX = e.pageX - slider.offsetLeft;
    let scrollLeftStart = slider.scrollLeft;
    
    const mouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        slider.scrollLeft = scrollLeftStart - (x - startX) * 2;
    };
    
    const mouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
        setTimeout(resumeSlider, 2000);
    };
    
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
});

slider.addEventListener('touchstart', (e) => {
    isDragging = true;
    pauseSlider();
    let startX = e.touches[0].pageX - slider.offsetLeft;
    let scrollLeftStart = slider.scrollLeft;
    
    const touchMove = (e) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX - slider.offsetLeft;
        slider.scrollLeft = scrollLeftStart - (x - startX) * 2.2;
    };
    
    const touchEnd = () => {
        isDragging = false;
        slider.removeEventListener('touchmove', touchMove);
        slider.removeEventListener('touchend', touchEnd);
        setTimeout(resumeSlider, 2200);
    };
    
    slider.addEventListener('touchmove', touchMove, { passive: false });
    slider.addEventListener('touchend', touchEnd);
}, { passive: false });

// ========== CEK JAWABAN + HIGHLIGHT ==========
function cekJawaban() {
    const ans1 = document.getElementById('ans1').value.trim().toUpperCase();
    const ans2 = document.getElementById('ans2').value.trim().toUpperCase();
    const ans3 = document.getElementById('ans3').value.trim().toUpperCase();

    const hasil = document.getElementById('hasil');
    const motivasi = document.getElementById('motivasi');

    const isAKU = (ans1 === 'AKU');
    const isSELALU = (ans2 === 'SELALU');
    const isHEBAT = (ans3 === 'HEBAT');

    document.querySelectorAll('.puzzle-cell').forEach(cell => cell.classList.remove('highlight-correct'));

    if (isAKU && isSELALU && isHEBAT) {
        hasil.style.color = '#1f6e43';
        hasil.innerHTML = '✅ <strong>BENAR!</strong> AKU · SELALU · HEBAT';
        motivasi.innerHTML = `
            <span style="font-size:1.8rem;">❤️</span><br>
            <strong style="font-size:1.7rem; color:#6a4e3a;">Kamu memang hebat.</strong><br>
            Setiap hari yang kamu lewati, setiap pilihan yang kamu ambil,<br>
            semuanya membuktikan bahwa kamu punya kekuatan untuk terus tumbuh.<br>
            Jangan pernah ragu pada dirimu sendiri. Kamu layak bangga,<br>
            dan dunia masih punya banyak tempat untuk kehebatanmu bersinar.<br>
            Teruslah melangkah, ya. <span style="background: #fbe192; padding:4px 16px; border-radius:40px;">AKU SELALU HEBAT</span> dan itu bukan cuma kata, itu kenyataan.
        `;

        const cells = Array.from(document.getElementById('puzzleGrid').children);
        if (cells[3]) cells[3].classList.add('highlight-correct');
        if (cells[4]) cells[4].classList.add('highlight-correct');
        if (cells[5]) cells[5].classList.add('highlight-correct');
        
        if (cells[25]) cells[25].classList.add('highlight-correct');
        if (cells[26]) cells[26].classList.add('highlight-correct');
        if (cells[27]) cells[27].classList.add('highlight-correct');
        if (cells[28]) cells[28].classList.add('highlight-correct');
        if (cells[29]) cells[29].classList.add('highlight-correct');
        if (cells[30]) cells[30].classList.add('highlight-correct');

        if (cells[38]) cells[38].classList.add('highlight-correct');
        if (cells[39]) cells[39].classList.add('highlight-correct');
        if (cells[40]) cells[40].classList.add('highlight-correct');
        if (cells[41]) cells[41].classList.add('highlight-correct');
        if (cells[42]) cells[42].classList.add('highlight-correct');
    } else {
        hasil.style.color = '#b34a3a';
        hasil.innerHTML = '❌ Belum tepat... Coba lagi ya!';
        motivasi.innerHTML = '';
    }
}

// ========== HAMBURGER MENU TOGGLE ==========
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navDropdown = document.getElementById('navDropdown');
const overlay = document.getElementById('overlay');

function closeDropdown() {
    navDropdown.classList.remove('show');
    overlay.classList.remove('show');
}

function toggleDropdown(e) {
    e.stopPropagation();
    navDropdown.classList.toggle('show');
    overlay.classList.toggle('show');
}

hamburgerBtn.addEventListener('click', toggleDropdown);

// Klik link di dalam dropdown -> close
navDropdown.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        closeDropdown();
    });
});

// Klik overlay -> close
overlay.addEventListener('click', closeDropdown);

// Resize listener: pastikan dropdown ke close kalo layar lebar (opsional)
window.addEventListener('resize', function() {
    if (window.innerWidth > 700) {
        closeDropdown();
    }
});

// Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDropdown();
    }
});