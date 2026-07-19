const SUPABASE_URL = "https://jxwhiavqnzqvhelimewo.supabase.co/rest/v1/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4d2hpYXZxbnpxdmhlbGltZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0ODc5OTEsImV4cCI6MjEwMDA2Mzk5MX0.bQ2iaF8CSx-en-8AsL_Tl1xB5u1r2njiXQrSMySxPzQ";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ratingInput = document.getElementById("rating");
const commentInput = document.getElementById("comment");
const submitBtn = document.getElementById("matcha-btn");

// KONTROLL: Kas mõlemad väljad on täidetud?
function checkInputs() {
    const isRatingSelected = ratingInput.value !== "";
    const isCommentFilled = commentInput.value.trim() !== "";

    if (isRatingSelected && isCommentFilled) {
        submitBtn.removeAttribute("disabled");
    } else {
        submitBtn.setAttribute("disabled", "true");
    }
}

// Paneme väljad sisestust kuulama
ratingInput.addEventListener("change", checkInputs);
commentInput.addEventListener("input", checkInputs);

async function loadData() {
    // Küsime andmed (vanemad eespool, et tabeli järjekorranumber klapiks)
    const { data: logs, error } = await supabase
        .from('matcha_stats')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Viga laadimisel:", error);
        return;
    }

    // ARVUTAME COUNTERI: Alustame 100-st ja lahutame logitud ridade arvu
    const totalLogged = logs ? logs.length : 0;
    const currentLeft = Math.max(0, 100 - totalLogged);
    document.getElementById("counter").textContent = currentLeft;

    if (totalLogged === 0) {
        document.getElementById("days").textContent = "Andmed puuduvad";
        return;
    }

    // PÄEVAD VIIMASEST MATCHAST: võtame massiivi kõige viimase elemendi
    const latestLog = logs[logs.length - 1];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = new Date(latestLog.created_at);
    last.setHours(0, 0, 0, 0);

    const diff = today.getTime() - last.getTime();
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const sona = days === 1 ? "päev" : "päeva";
    document.getElementById("days").textContent = `${days} ${sona}`;

    // KUVAME TABELI (Uuemad matchad tabeli algusesse)
    const historyContainer = document.getElementById("history-list");
    historyContainer.innerHTML = ""; // Teeme puhtaks

    // Loome koopia ja pöörame tagurpidi, et uuemad oleksid tabelis üleval pool
    const displayLogs = [...logs].reverse();

    displayLogs.forEach((log, index) => {
        // Arvutame õige järjekorranumbri algusest peale
        const matchaNr = logs.length - index;

        const date = new Date(log.created_at).toLocaleDateString('et-EE', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>#${matchaNr}</strong></td>
            <td class="text-muted">${date}</td>
            <td><span class="badge">${log.rating}/10</span></td>
            <td class="comment-cell">${log.comment}</td>
        `;
        historyContainer.appendChild(row);
    });
}

async function joinMatcha() {
    // KÜSIME PAROOLI (Valikuline - eemalda kui pole vaja)
    const parool = prompt("Sisesta salasõna matcha logimiseks:");
    if (parool !== "matcha123") {
        alert("Vale parool!");
        return;
    }

    const ratingVal = parseInt(ratingInput.value);
    const commentVal = commentInput.value.trim();

    // Lisame uue rea andmebaasi
    const { error } = await supabase
        .from('matcha_stats')
        .insert([{ rating: ratingVal, comment: commentVal }]);

    if (error) {
        console.error("Viga salvestamisel:", error);
        alert("Midagi läks valesti!");
    } else {
        // Puhastame väljad ja lukustame nupu uuesti
        ratingInput.value = "";
        commentInput.value = "";
        submitBtn.setAttribute("disabled", "true");
        
        loadData();
    }
}

submitBtn.addEventListener("click", joinMatcha);
loadData();
