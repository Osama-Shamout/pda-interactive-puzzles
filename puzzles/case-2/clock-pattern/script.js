document.addEventListener("DOMContentLoaded", function () {

    /* ─── Language Detection ─── */
    const isArabic = window.location.pathname.includes("/ar/");

    /* ─── Track Wrong Attempts ─── */
    let wrongAttempts = 0;

    // تعريف النصوص والصور باللغتين
    const translations = {
        ar: {
            mainImage: "https://pdacases.com/wp-content/uploads/2026/05/Gilluissopaz-scaled.png",
            hints: [
                "انتبه إلى الرقم 19 الذي بجانب اللوحة",
                "الشكل يدل على رقمين",
                "في الجزء الثاني من اللغز يجب أن يكون يسوع رقم 5 في الترتيب"
            ],
            resetBtn: "↺ إعادة ضبط",
            hintBtn: "✦ تلميح",
            answerBtn: "إجابة",
            revealBtn: "👁 إظهار الحل",
            answerLabel: "أدخل إجابتك",
            answerPlaceholder: "اكتب هنا...",
            submitBtn: "إرسال",
            closeBtn: "إغلاق",
            correctMsg: "✦ أحسنت، الإجابة هي: 1965 انتظر قليلاً...",
            wrongMsg: "✗ إجابة خاطئة",
            bgText: "صل الرؤوس ببعضها بدءا من الرجل الذي في مقدمة السفينة، مرورا بالرجل أشيب الشعر، وانتهاء عنده. ثم ابدأ من الرجل الذي يمسك المجدفة، وتوقف عند العجوز الذي خلف رامبرانت، ولا تمر على الرأس نفسه مرتين"
        },
        en: {
            mainImage: "https://pdacases.com/wp-content/uploads/2026/09/Gilluissopaz-Recov44ered-scaled.png",
            hints: [
                "Pay attention to the number 19 next to the painting.",
                "The shape indicates two numbers.",
                "In the second part of the puzzle, Jesus must be number 5 in the sequence."
            ],
            resetBtn: "↺ Reset",
            hintBtn: "✦ Hint",
            answerBtn: "Answer",
            revealBtn: "👁 Show Answer",
            answerLabel: "ENTER YOUR ANSWER",
            answerPlaceholder: "Type here…",
            submitBtn: "Submit",
            closeBtn: "Close",
            correctMsg: "✦ Well done, the answer is: 1965 wait...",
            wrongMsg: "✗ Wrong answer",
            bgText: "Connect the heads to each other, starting with the man at the front of the ship, passing through the gray-haired man, and ending at him. Then start with the man holding the oar, and stop at the old man behind Rembrandt, without passing through the same head twice."
        }
    };

    const lang = isArabic ? translations.ar : translations.en;

    /* ─── Update UI Text & Image Based on Language ─── */
    const mainImgEl   = document.querySelector(".pda-main-image");
    const resetBtnEl  = document.getElementById("pdaBtnReset");
    const hintBtnEl   = document.getElementById("pdaBtnHint");
    const answerBtnEl = document.getElementById("pdaBtnAnswer");
    const labelEl     = document.getElementById("pdaAnswerLabel");
    const inputEl     = document.getElementById("pdaAnswerInput");
    const submitBtnEl = document.getElementById("pdaBtnSubmit");
    const closeModalEl= document.getElementById("pdaBtnClose");
    const boxContainer = document.getElementById("pdaBox");
    const btnBar      = document.querySelector(".pda-btn-bar");

    if (mainImgEl)    mainImgEl.src            = lang.mainImage;
    if (resetBtnEl)   resetBtnEl.textContent   = lang.resetBtn;
    if (hintBtnEl)    hintBtnEl.textContent    = lang.hintBtn;
    if (answerBtnEl)  answerBtnEl.textContent  = lang.answerBtn;
    if (labelEl)      labelEl.textContent      = lang.answerLabel;
    if (inputEl)      inputEl.placeholder      = lang.answerPlaceholder;
    if (submitBtnEl)  submitBtnEl.textContent  = lang.submitBtn;
    if (closeModalEl) closeModalEl.textContent = lang.closeBtn;
    
    if (boxContainer) {
        boxContainer.style.setProperty("--pda-bg-text", `"${lang.bgText}"`);
        if (isArabic) {
            boxContainer.setAttribute("dir", "rtl");
        } else {
            boxContainer.setAttribute("dir", "ltr");
        }
    }

    /* ─── Dynamic Reveal Button Creation ─── */
    const revealBtn = document.createElement("button");
    revealBtn.className = "pda-btn";
    revealBtn.id = "pdaBtnReveal";
    revealBtn.textContent = lang.revealBtn;
    revealBtn.style.display = "none";
    if (btnBar) btnBar.appendChild(revealBtn);

    revealBtn.addEventListener("click", () => {
        answerOverlay.classList.add("visible");
        answerInput.value = "65";
        answerInput.focus();
    });

    /* ─── Popup open / close ─── */
    const openBtn       = document.getElementById("openPuzzle");
    const popupOverlay  = document.getElementById("pdaPopupOverlay");
    const closeBtn      = document.getElementById("closePuzzle");

    openBtn.addEventListener("click", () => {
        if (popupOverlay.parentElement !== document.body) {
            document.body.appendChild(popupOverlay);
        }
        popupOverlay.classList.add("visible");
        setTimeout(() => { resizeCanvas(); createPoints(); }, 50);
    });

    closeBtn.addEventListener("click", () => {
        popupOverlay.classList.remove("visible");
    });

    popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.classList.remove("visible");
        }
    });

    /* ─── Puzzle logic ─── */
    const box    = document.getElementById("pdaBox");
    const canvas = document.getElementById("pdaCanvas");
    if (!box || !canvas) return;

    box.style.touchAction = "pinch-zoom";

    const ctx = canvas.getContext("2d");
    let containerWidth, containerHeight;

    const positions = [
        [31,48],[39,56],[43,60],[33,59],[34,64],
        [46,74],[49,73],[57,71],[55,78],[61,71],[62,67],
        [72,70],[65,74],[55,82]
    ];

    const overlapPoints = [3];
    let points = [];
    let drawing = false, currentStroke = [], visited = new Set();
    let activeGroup = null, patterns = [];

    function getScale() {
        return Math.max(0.5, Math.min(1, Math.min(containerWidth, containerHeight) / 700));
    }

    function resizeCanvas() {
        containerWidth  = box.clientWidth;
        containerHeight = box.clientHeight;
        canvas.width    = containerWidth;
        canvas.height   = containerHeight;
        ctx.clearRect(0, 0, containerWidth, containerHeight);
        redrawAllPatterns();
        points.forEach((p, i) => {
            p.style.left = positions[i][0] + "%";
            p.style.top  = positions[i][1] + "%";
        });
    }

    function createPoints() {
        points.forEach(p => p.remove());
        points = [];
        positions.forEach(pos => {
            const el = document.createElement("div");
            el.className  = "pda-point";
            el.style.left = pos[0] + "%";
            el.style.top  = pos[1] + "%";
            box.appendChild(el);
            points.push(el);
        });
    }

    function getCenter(index) {
        const el = points[index];
        const r  = el.getBoundingClientRect();
        const b  = box.getBoundingClientRect();
        return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
    }

    function drawLine(a, b, width = 7, permanent = false) {
        ctx.strokeStyle = "#ffaa00";
        ctx.lineWidth   = width;
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        ctx.shadowColor = "#ffaa00";
        ctx.shadowBlur  = permanent ? 15 : 10;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }

    function redrawAllPatterns() {
        patterns.forEach(pData => {
            for (let i = 1; i < pData.length; i++) {
                drawLine(getCenter(pData[i-1]), getCenter(pData[i]), 8, true);
            }
        });
    }

    function resetTemp() {
        currentStroke = [];
        visited.clear();
        activeGroup = null;
        points.forEach(p => p.classList.remove("active"));
    }

    function resetAll() {
        patterns = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resetTemp();
    }

    function handleStart(e) {
        if (e.cancelable) e.preventDefault();
        drawing = true;
        resetTemp();
    }

    function handleMove(e) {
        if (!drawing) return;
        if (e.cancelable) e.preventDefault();

        const rect   = box.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const hitR = 20 * getScale();

        points.forEach((p, i) => {
            const c = getCenter(i);
            if (Math.hypot(x - c.x, y - c.y) >= hitR) return;

            if (activeGroup === null) activeGroup = (i < 5) ? "A" : "B";
            if (activeGroup === "A" && i >= 5) return;
            if (activeGroup === "B" && i <  5) return;

            if (!overlapPoints.includes(i) && visited.has(i)) return;
            if (currentStroke[currentStroke.length - 1] === i) return;

            visited.add(i);
            currentStroke.push(i);
            p.classList.add("active");

            if (currentStroke.length > 1) {
                drawLine(getCenter(currentStroke[currentStroke.length - 2]), c, 7, false);
            }
        });
    }

    function handleEnd(e) {
        if (!drawing) return;
        drawing = false;

        const uniqueCount = new Set(currentStroke).size;
        const isValidA = (activeGroup === "A" && uniqueCount === 5);
        const isValidB = (activeGroup === "B" && uniqueCount === 9);

        if (isValidA || isValidB) {
            patterns.push([...currentStroke]);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawAllPatterns();
        resetTemp();
    }

    if (window.PointerEvent) {
        box.addEventListener("pointerdown",  handleStart);
        box.addEventListener("pointermove",  handleMove);
        box.addEventListener("pointerup",    handleEnd);
        box.addEventListener("pointercancel",handleEnd);
    } else {
        box.addEventListener("touchstart", handleStart, { passive: false });
        box.addEventListener("touchmove",  handleMove,  { passive: false });
        box.addEventListener("touchend",   handleEnd,   { passive: false });
    }

    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            createPoints();
            resizeCanvas();
        }, 100);
    });

    /* ─── Buttons ─── */
    document.getElementById("pdaBtnReset").addEventListener("click", resetAll);

    let hintIndex = 0;
    const hintBox = document.getElementById("pdaHintBox");

    document.getElementById("pdaBtnHint").addEventListener("click", () => {
        hintBox.textContent = lang.hints[hintIndex++ % lang.hints.length];
        hintBox.classList.add("visible");
        setTimeout(() => hintBox.classList.remove("visible"), 7000);
    });

    const answerOverlay = document.getElementById("pdaAnswerOverlay");
    const answerInput   = document.getElementById("pdaAnswerInput");

    document.getElementById("pdaBtnAnswer").addEventListener("click", () => {
        answerOverlay.classList.add("visible");
        answerInput.focus();
    });

    document.getElementById("pdaBtnClose").addEventListener("click", () => {
        answerOverlay.classList.remove("visible");
    });

    document.getElementById("pdaBtnSubmit").addEventListener("click", () => {
        const val     = answerInput.value.trim();
        const correct = ["65","1965","56","1956"].includes(val);
        answerOverlay.classList.remove("visible");

        if (!correct) {
            wrongAttempts++;
            if (wrongAttempts >= 3) {
                revealBtn.style.display = "inline-block";
            }
        }

        const fb = document.createElement("div");
        fb.textContent = correct ? lang.correctMsg : lang.wrongMsg;
        Object.assign(fb.style, {
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%,-50%)",
            background: "#0a0a0f",
            padding: "20px",
            borderRadius: "10px",
            color: correct ? "#fc0" : "#f44",
            zIndex: 100,
            fontFamily: 'inherit',
            fontSize: "18px",
            letterSpacing: "1px",
            textAlign: "center",
            border: `1px solid ${correct ? "rgba(255,204,0,0.4)" : "rgba(255,68,68,0.4)"}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
        });
        box.appendChild(fb);
        if (correct) {
            setTimeout(() => {
                fb.remove();
                window.location.href = isArabic 
                    ? "https://pdacases.com/ar/the-basement/" 
                    : "https://pdacases.com/the-basement/";
            }, 2000);
        } else {
            setTimeout(() => fb.remove(), 2000);
        }
    });
});