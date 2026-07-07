/* ==========================================================================
   APPLICATION LOGIC: رسالة من آية... إلى شخصك المستقبلي
   Interactive starry canvas, ambient sound synthesis, navigation,
   question flows, CSS animations, localStorage database, and time travel simulator.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. STATE & GLOBAL DATA ---
    const appState = {
        currentScreen: 'screen-welcome',
        simulatedDate: null, // YYYY-MM-DD
        currentQuestionIndex: 0,
        answers: {}, // Stores Q1-Q18 answers
        mainLetter: '',
        targetDate: '', // Chosen target arrival date (YYYY-MM-DD)
        finalAnswers: {}, // Stores final 4 questions answers
        soundActive: false,
        soundInitialized: false
    };

    // System date defaults to current date (July 7, 2026)
    const getSystemDate = () => {
        if (appState.simulatedDate) {
            return new Date(appState.simulatedDate);
        }
        return new Date(); // Normal browser time
    };

    const getSystemDateString = () => {
        const d = getSystemDate();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const questions = [
        { text: "لو طلبت منك أن تصف شخصك الآن بكلمة واحدة... ماذا ستكون؟", type: "text" },
        { text: "كيف تشعر في هذه المرحلة من حياتك؟ وما السبب الحقيقي وراء هذا الشعور؟", type: "text" },
        { text: "ما أكثر شيء يشغل تفكيرك هذه الأيام؟", type: "text" },
        { text: "متى كانت آخر مرة شعرت فيها بالفخر بنفسك؟ وما الشيء الذي فعلته وجعلك تشعر بذلك؟", type: "text" },
        { text: "ما الموقف الذي جعلك أقوى رغم أنه كان صعبًا؟", type: "text" },
        { text: "هل يوجد شيء تخفيه عن الجميع وتتمنى أن يفهمه أحد؟", type: "text" },
        { text: "ما أكثر شيء تخاف أن تخسره؟", type: "text" },
        { text: "ما الشيء الذي تخاف ألا تحققه قبل مرور السنوات؟", type: "text" },
        { text: "لو عاد بك الزمن سنة واحدة... ما الشيء الوحيد الذي ستغيره؟", type: "text" },
        { text: "ما الحلم الذي لا تريد أن تنهي حياتك قبل أن تحققه؟", type: "text" },
        { text: "كيف تتخيل شخصك بعد 5 أو 10 سنوات؟", type: "text" },
        { text: "ما الصفة التي تتمنى أن يتذكرك الناس بها دائمًا؟", type: "text" },
        { text: "من الشخص الذي تريد أن تشكره الآن؟ ولماذا؟", type: "text" },
        { text: "هل يوجد شخص تتمنى أن تعتذر له أو تسامحه؟", type: "text" },
        { text: "ما أكثر كلمة كنت تتمنى أن تسمعها من أحد؟", type: "text" },
        { text: "ما الشيء الذي تحتاج أن تسامح نفسك عليه؟", type: "text" },
        { text: "ما الوعد الذي تريد أن تقطعه لشخصك المستقبلي؟", type: "text" },
        { text: "ما الرسالة التي تريد أن تصل إلى شخصك بعد السنوات القادمة؟", type: "textarea" }
    ];

    const helpPrompts = [
        "ماذا أتمنى أن أكون قد حققت؟",
        "ما الشيء الذي أتمنى ألا أغيره في نفسي؟",
        "ما الشيء الذي أتمنى أن أكون تجاوزته؟",
        "ماذا أريد أن أقول لنفسي عندما أقرأ هذه الرسالة؟",
        "تحدث عن أحلامك البسيطة والعميقة...",
        "اكتب شيئًا يجعلك تبتسم في المستقبل..."
    ];

    // --- 2. INTERACTIVE STARRY CANVAS (STARFIELD) ---
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');

    let stars = [];
    let comets = [];
    let planets = [];
    const maxStars = 280;

    // Pink/rose/lavender color palette for stars
    const starColors = [
        'rgba(255, 182, 213,',  // pink blush
        'rgba(236, 72, 153,',   // hot pink
        'rgba(251, 207, 232,',  // light pink
        'rgba(196, 181, 253,',  // lavender
        'rgba(255, 255, 255,',  // white
        'rgba(253, 164, 175,',  // rose
        'rgba(249, 168, 212,',  // medium pink
    ];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initStars();
        initPlanets();
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < maxStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2.2,
                twinkleSpeed: 0.004 + Math.random() * 0.018,
                alpha: Math.random(),
                dir: Math.random() > 0.5 ? 1 : -1,
                color: starColors[Math.floor(Math.random() * starColors.length)]
            });
        }
    }

    function initPlanets() {
        planets = [
            {
                x: canvas.width * 0.12, y: canvas.height * 0.15,
                r: 38, color1: '#f9a8d4', color2: '#fce7f3',
                glow: 'rgba(249, 168, 212, 0.35)',
                ring: true, ringColor: 'rgba(236, 72, 153, 0.18)',
                pulseSpeed: 0.008, pulseDir: 1, pulse: 0
            },
            {
                x: canvas.width * 0.88, y: canvas.height * 0.22,
                r: 22, color1: '#c084fc', color2: '#e9d5ff',
                glow: 'rgba(192, 132, 252, 0.3)',
                ring: false, pulseSpeed: 0.012, pulseDir: 1, pulse: 0
            },
            {
                x: canvas.width * 0.78, y: canvas.height * 0.78,
                r: 16, color1: '#f472b6', color2: '#fce7f3',
                glow: 'rgba(244, 114, 182, 0.28)',
                ring: false, pulseSpeed: 0.01, pulseDir: -1, pulse: 0.5
            },
            {
                x: canvas.width * 0.05, y: canvas.height * 0.75,
                r: 10, color1: '#a78bfa', color2: '#ede9fe',
                glow: 'rgba(167, 139, 250, 0.25)',
                ring: false, pulseSpeed: 0.015, pulseDir: 1, pulse: 0.2
            },
            {
                x: canvas.width * 0.5, y: canvas.height * 0.08,
                r: 14, color1: '#fb7185', color2: '#fecdd3',
                glow: 'rgba(251, 113, 133, 0.28)',
                ring: false, pulseSpeed: 0.009, pulseDir: -1, pulse: 0.8
            }
        ];
    }

    function drawPlanets() {
        planets.forEach(p => {
            p.pulse += p.pulseSpeed * p.pulseDir;
            if (p.pulse > 1) { p.pulse = 1; p.pulseDir = -1; }
            if (p.pulse < 0) { p.pulse = 0; p.pulseDir = 1; }

            const glowSize = p.r * 2.5 + p.pulse * p.r * 0.5;

            // Outer glow
            const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
            glowGrad.addColorStop(0, p.glow.replace(')', ', 0.6)').replace('rgba(', 'rgba(').replace(', 0.6)', `, ${0.25 + p.pulse * 0.2})`));
            glowGrad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
            ctx.fillStyle = glowGrad;
            ctx.fill();

            // Planet body gradient
            const bodyGrad = ctx.createRadialGradient(
                p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.1,
                p.x, p.y, p.r
            );
            bodyGrad.addColorStop(0, p.color2);
            bodyGrad.addColorStop(0.6, p.color1);
            bodyGrad.addColorStop(1, p.color1.replace('f', 'd'));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = bodyGrad;
            ctx.fill();

            // Ring for Saturn-like planets
            if (p.ring) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.scale(1, 0.3);
                ctx.beginPath();
                ctx.arc(0, 0, p.r * 1.85, 0, Math.PI * 2);
                ctx.strokeStyle = p.ringColor;
                ctx.lineWidth = p.r * 0.45;
                ctx.stroke();
                ctx.restore();
            }

            // Tiny highlight
            ctx.beginPath();
            ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fill();
        });
    }

    function createComet() {
        if (Math.random() > 0.991 && comets.length < 3) {
            comets.push({
                x: Math.random() * canvas.width * 0.7,
                y: 0,
                dx: 3 + Math.random() * 4,
                dy: 2 + Math.random() * 3,
                length: 45 + Math.random() * 55,
                alpha: 1,
                width: 1 + Math.random() * 1.5
            });
        }
    }

    function drawStarfield() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Soft pink pastel gradient background
        const skyGrad = ctx.createLinearGradient(0, 0, canvas.width * 0.5, canvas.height);
        skyGrad.addColorStop(0, '#fff0f5');
        skyGrad.addColorStop(0.4, '#fce7f3');
        skyGrad.addColorStop(0.75, '#fdf2f8');
        skyGrad.addColorStop(1, '#f5f3ff');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Soft pink nebula blobs for depth
        const nebula1 = ctx.createRadialGradient(canvas.width * 0.2, canvas.height * 0.3, 20, canvas.width * 0.2, canvas.height * 0.3, canvas.width * 0.35);
        nebula1.addColorStop(0, 'rgba(249, 168, 212, 0.18)');
        nebula1.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = nebula1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const nebula2 = ctx.createRadialGradient(canvas.width * 0.8, canvas.height * 0.6, 10, canvas.width * 0.8, canvas.height * 0.6, canvas.width * 0.3);
        nebula2.addColorStop(0, 'rgba(196, 181, 253, 0.15)');
        nebula2.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = nebula2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw planets behind stars
        drawPlanets();

        // Draw and update twinkling stars
        stars.forEach(star => {
            star.alpha += star.twinkleSpeed * star.dir;
            if (star.alpha > 1) { star.alpha = 1; star.dir = -1; }
            else if (star.alpha < 0.08) { star.alpha = 0.08; star.dir = 1; }

            // Main star dot
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `${star.color}${star.alpha})`;
            ctx.fill();

            // Cross sparkle on larger stars
            if (star.size > 1.5) {
                ctx.save();
                ctx.globalAlpha = star.alpha * 0.5;
                ctx.strokeStyle = star.color + '0.7)';
                ctx.lineWidth = 0.5;
                const s = star.size * 2.5;
                ctx.beginPath();
                ctx.moveTo(star.x - s, star.y);
                ctx.lineTo(star.x + s, star.y);
                ctx.moveTo(star.x, star.y - s);
                ctx.lineTo(star.x, star.y + s);
                ctx.stroke();
                ctx.restore();
            }
        });

        // Trigger shooting stars
        createComet();

        // Draw and update shooting stars (comets) — now pink
        comets.forEach((comet, idx) => {
            comet.x += comet.dx;
            comet.y += comet.dy;
            comet.alpha -= 0.013;

            if (comet.alpha <= 0 || comet.x > canvas.width || comet.y > canvas.height) {
                comets.splice(idx, 1);
            } else {
                const grad = ctx.createLinearGradient(
                    comet.x, comet.y,
                    comet.x - comet.length * (comet.dx / 5),
                    comet.y - comet.length * (comet.dy / 5)
                );
                grad.addColorStop(0, `rgba(236, 72, 153, ${comet.alpha})`);
                grad.addColorStop(1, `rgba(249, 168, 212, 0)`);
                ctx.strokeStyle = grad;
                ctx.lineWidth = comet.width;
                ctx.beginPath();
                ctx.moveTo(comet.x, comet.y);
                ctx.lineTo(comet.x - comet.length * (comet.dx / 5), comet.y - comet.length * (comet.dy / 5));
                ctx.stroke();
            }
        });

        requestAnimationFrame(drawStarfield);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawStarfield();


    // --- 3. AMBIENT AUDIO SYSTEM (WEB AUDIO API SYNTHESIZER) ---
    let audioCtx = null;
    let droneOsc = null;
    let droneGain = null;
    let chimeGain = null;
    let pianoTimer = null;

    const scaleNotes = [
        146.83, // D3
        164.81, // E3
        196.00, // G3
        220.00, // A3
        261.63, // C4
        293.66, // D4
        329.63, // E4
        392.00, // G4
        440.00, // A4
        523.25, // C5
        587.33, // D5
        659.25, // E5
        783.99  // G5
    ];

    function initAudio() {
        if (appState.soundInitialized) return;
        
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Low Frequency Ambient Space Drone
            droneOsc = audioCtx.createOscillator();
            droneOsc.type = 'triangle';
            droneOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // A1 note
            
            const lowpass = audioCtx.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.setValueAtTime(150, audioCtx.currentTime);

            droneGain = audioCtx.createGain();
            droneGain.gain.setValueAtTime(0.04, audioCtx.currentTime); // Soft background hum

            droneOsc.connect(lowpass);
            lowpass.connect(droneGain);
            droneGain.connect(audioCtx.destination);
            droneOsc.start();

            // Chime Gain node for piano plucks
            chimeGain = audioCtx.createGain();
            chimeGain.gain.setValueAtTime(0.06, audioCtx.currentTime);
            chimeGain.connect(audioCtx.destination);

            appState.soundInitialized = true;
            triggerProceduralNotes();
            
        } catch(e) {
            console.warn("Web Audio API not supported or blocked in this environment: ", e);
        }
    }

    function playPianoPluck(freq) {
        if (!audioCtx || audioCtx.state === 'suspended') return;

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const pluckGain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Mix in a bit of triangle for rich piano warmth
        const triangleSub = audioCtx.createOscillator();
        triangleSub.type = 'triangle';
        triangleSub.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        // Pluck Envelope: Instant attack, long decaying tail
        pluckGain.gain.setValueAtTime(0, now);
        pluckGain.gain.linearRampToValueAtTime(0.05, now + 0.05);
        pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);

        osc.connect(filter);
        triangleSub.connect(filter);
        filter.connect(pluckGain);
        pluckGain.connect(chimeGain);

        osc.start(now);
        triangleSub.start(now);

        osc.stop(now + 4.1);
        triangleSub.stop(now + 4.1);
    }

    function triggerProceduralNotes() {
        if (!appState.soundActive) return;

        // Choose random pentatonic note
        const randomNote = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
        playPianoPluck(randomNote);

        // Occasional harmonics
        if (Math.random() > 0.6) {
            setTimeout(() => {
                const companionNote = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
                playPianoPluck(companionNote * 1.5);
            }, 300);
        }

        // Schedule next random note (between 4 and 8 seconds)
        const delay = 4000 + Math.random() * 4000;
        pianoTimer = setTimeout(triggerProceduralNotes, delay);
    }

    function playTransitSound() {
        if (!audioCtx || !appState.soundActive) return;
        const now = audioCtx.currentTime;
        
        // Rising sweep sound
        const osc = audioCtx.createOscillator();
        const sweepGain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 1.2);
        
        sweepGain.gain.setValueAtTime(0, now);
        sweepGain.gain.linearRampToValueAtTime(0.04, now + 0.3);
        sweepGain.gain.linearRampToValueAtTime(0, now + 1.2);
        
        osc.connect(sweepGain);
        sweepGain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 1.3);
    }

    function toggleSound() {
        const soundToggleBtn = document.getElementById('sound-toggle');
        const icon = soundToggleBtn.querySelector('i');
        const text = soundToggleBtn.querySelector('span');

        if (!appState.soundInitialized) {
            initAudio();
        }

        if (appState.soundActive) {
            // Mute
            appState.soundActive = false;
            if (audioCtx) audioCtx.suspend();
            icon.className = 'fas fa-volume-mute';
            text.innerText = 'تشغيل الأثير 🎵';
            clearTimeout(pianoTimer);
        } else {
            // Unmute
            appState.soundActive = true;
            if (audioCtx) {
                audioCtx.resume();
            }
            icon.className = 'fas fa-volume-up';
            text.innerText = 'كتم الأثير 🤫';
            triggerProceduralNotes();
            playPianoPluck(220); // D3 starter chord
            playPianoPluck(440);
        }
    }

    document.getElementById('sound-toggle').addEventListener('click', toggleSound);


    // --- 4. SCREEN NAVIGATION & FADE EFFECTS ---
    function navigateTo(screenId, callback = null) {
        const currentScreenEl = document.getElementById(appState.currentScreen);
        const targetScreenEl = document.getElementById(screenId);

        if (!targetScreenEl) return;

        // Fade Out Current Screen
        if (currentScreenEl) {
            currentScreenEl.style.opacity = '0';
            currentScreenEl.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                currentScreenEl.classList.remove('active');
                
                // Fade In Target Screen
                targetScreenEl.classList.add('active');
                // Force layout reflow
                targetScreenEl.offsetHeight;
                
                targetScreenEl.style.opacity = '1';
                targetScreenEl.style.transform = 'translateY(0)';
                appState.currentScreen = screenId;
                
                // Play procedural sound for screen transit
                playTransitSound();

                if (callback) callback();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 600); // Matches transition duration
        } else {
            targetScreenEl.classList.add('active');
            targetScreenEl.style.opacity = '1';
            targetScreenEl.style.transform = 'translateY(0)';
            appState.currentScreen = screenId;
            if (callback) callback();
        }
    }

    // Story line by line animation trigger helper
    function revealStoryLines(screenId) {
        const lines = document.querySelectorAll(`#${screenId} .fade-line`);
        lines.forEach(line => line.classList.remove('show-line'));
        
        lines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('show-line');
            }, (index + 1) * 800); // 800ms between lines for reading pause
        });
    }


    // --- 5. STAGE 1: WELCOME & QUESTIONNAIRE ---
    // Start button handler
    document.getElementById('btn-start').addEventListener('click', () => {
        if (!appState.soundInitialized) {
            // Implicit audio init if user starts
            initAudio();
        }
        navigateTo('screen-intro-questions', () => {
            revealStoryLines('screen-intro-questions');
        });
    });

    // Welcome screen initial text animation
    revealStoryLines('screen-welcome');

    // Ready button handler
    document.getElementById('btn-ready').addEventListener('click', () => {
        navigateTo('screen-questions', () => {
            loadQuestion(0);
        });
    });

    // Questionnaire rendering engine
    const questionTextEl = document.getElementById('question-text');
    const inputFieldWrapper = document.getElementById('input-field-wrapper');
    const qProgressBar = document.getElementById('question-progress-bar');
    const qNumberEl = document.getElementById('question-number');

    function loadQuestion(index) {
        appState.currentQuestionIndex = index;
        const q = questions[index];

        // Fade out previous question text
        questionTextEl.style.opacity = '0';
        inputFieldWrapper.style.opacity = '0';

        setTimeout(() => {
            questionTextEl.innerText = q.text;
            
            // Build appropriate input element
            let inputHtml = '';
            const previousVal = appState.answers[index] || '';

            if (q.type === 'textarea') {
                inputHtml = `<textarea id="question-input" class="fancy-textarea" placeholder="اكتب رسالتك وتأملاتك العميقة هنا..." rows="6">${previousVal}</textarea>`;
            } else {
                inputHtml = `<input type="text" id="question-input" class="fancy-input" placeholder="اكتب إجابتك هنا..." autocomplete="off" value="${previousVal}">`;
            }

            inputFieldWrapper.innerHTML = inputHtml;

            // Apply focus with a slight delay
            const inputEl = document.getElementById('question-input');
            setTimeout(() => {
                inputEl.focus();
            }, 100);

            // Handle press enter to submit for inputs
            if (q.type === 'text') {
                inputEl.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        document.getElementById('btn-question-next').click();
                    }
                });
            }

            // Fade in question elements
            questionTextEl.style.opacity = '1';
            inputFieldWrapper.style.opacity = '1';

            // Show/Hide Back Button
            const backBtn = document.getElementById('btn-question-back');
            if (index === 0) {
                backBtn.style.visibility = 'hidden';
            } else {
                backBtn.style.visibility = 'visible';
            }

            // Progress bar and index display
            const progressPct = ((index + 1) / questions.length) * 100;
            qProgressBar.style.width = `${progressPct}%`;
            qNumberEl.innerText = `${index + 1} / ${questions.length}`;

            // Make the Next button display as "احفظ وأكمل" on final question
            const nextBtn = document.getElementById('btn-question-next');
            if (index === questions.length - 1) {
                nextBtn.innerHTML = `أنهيت الأسئلة <i class="fas fa-check btn-icon"></i>`;
            } else {
                nextBtn.innerHTML = `التالي <i class="fas fa-chevron-left btn-icon"></i>`;
            }

        }, 300);
    }

    // Questionnaire navigation clicks
    document.getElementById('btn-question-next').addEventListener('click', () => {
        const inputEl = document.getElementById('question-input');
        const val = inputEl ? inputEl.value.trim() : '';

        // Save current response (even empty, but encourage users)
        appState.answers[appState.currentQuestionIndex] = val;

        if (appState.currentQuestionIndex < questions.length - 1) {
            loadQuestion(appState.currentQuestionIndex + 1);
        } else {
            // Last question completed! Show reflection screen.
            navigateTo('screen-reflection', () => {
                const phrases = document.querySelectorAll('#screen-reflection .reflection-phrase');
                phrases.forEach(p => p.classList.remove('show'));
                
                // Cascade fade-in reflection lines
                phrases.forEach((phrase, idx) => {
                    setTimeout(() => {
                        phrase.classList.add('show');
                    }, (idx + 1) * 800);
                });

                // Stay on reflection screen for exactly 3.5 seconds total, then proceed to the envelope drafting stage.
                setTimeout(() => {
                    navigateTo('screen-write-letter', () => {
                        initLetterDrafting();
                    });
                }, 3800);
            });
        }
    });

    document.getElementById('btn-question-back').addEventListener('click', () => {
        if (appState.currentQuestionIndex > 0) {
            loadQuestion(appState.currentQuestionIndex - 1);
        }
    });


    // --- 6. STAGE 2: DRAFTING THE MAIN LETTER & DATE CHOICE ---
    let helpTimer = null;
    let helpIndex = 0;

    function initLetterDrafting() {
        const letterArea = document.getElementById('main-letter-text');
        
        // Auto populate with what they answered in Q18 if available, to link them together
        if (appState.answers[17] && !letterArea.value) {
            letterArea.value = appState.answers[17];
        }

        // Focus letter area
        letterArea.focus();

        // Start hint carousel
        startHelpCarousel();
    }

    function startHelpCarousel() {
        const helpTextEl = document.getElementById('help-question-text');
        if (!helpTextEl) return;
        
        clearInterval(helpTimer);
        helpIndex = 0;
        
        const showNextPrompt = () => {
            helpTextEl.classList.remove('fade-in-help');
            setTimeout(() => {
                helpTextEl.innerText = helpPrompts[helpIndex];
                helpTextEl.classList.add('fade-in-help');
                helpIndex = (helpIndex + 1) % helpPrompts.length;
            }, 500);
        };

        showNextPrompt();
        helpTimer = setInterval(showNextPrompt, 5000); // Rotates prompts every 5 seconds
    }

    // Save letter drafting button click
    document.getElementById('btn-save-letter').addEventListener('click', () => {
        const letterArea = document.getElementById('main-letter-text');
        const textVal = letterArea.value.trim();

        if (!textVal) {
            alert('الرجاء كتابة شيء ما لرسالتك المستقبلية قبل الحفظ 🤍');
            return;
        }

        appState.mainLetter = textVal;
        clearInterval(helpTimer); // stop helper hints

        // Animation of envelope closing and packing
        const envPreview = document.querySelector('.envelope-wrapper');
        envPreview.classList.add('open');
        
        setTimeout(() => {
            navigateTo('screen-select-date', () => {
                initDatePicker();
            });
        }, 1200);
    });

    // Custom Date Selector setup
    function initDatePicker() {
        const selectDay = document.getElementById('select-day');
        const selectMonth = document.getElementById('select-month');
        const selectYear = document.getElementById('select-year');
        const systemDate = getSystemDate();
        
        const currentYear = systemDate.getFullYear();
        const currentMonth = systemDate.getMonth() + 1;
        const currentDay = systemDate.getDate();

        // 1. Populate Years: currentYear to +40 years
        selectYear.innerHTML = '';
        for (let y = currentYear; y <= currentYear + 40; y++) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.innerText = `${y} م`;
            selectYear.appendChild(opt);
        }

        // Set initial selected values to current time + 1 year
        selectYear.value = currentYear + 1;
        selectMonth.value = currentMonth;

        // 2. Populate Days helper taking leap years and months into account
        function updateDaysDropdown() {
            const y = parseInt(selectYear.value);
            const m = parseInt(selectMonth.value);
            const daysInMonth = new Date(y, m, 0).getDate();
            
            const savedDay = parseInt(selectDay.value) || currentDay;
            selectDay.innerHTML = '';

            for (let d = 1; d <= daysInMonth; d++) {
                const opt = document.createElement('option');
                opt.value = d;
                opt.innerText = d;
                selectDay.appendChild(opt);
            }
            
            if (savedDay <= daysInMonth) {
                selectDay.value = savedDay;
            } else {
                selectDay.value = daysInMonth;
            }
            
            updateDisplayDate();
        }

        function updateDisplayDate() {
            const d = selectDay.value;
            const m = selectMonth.value;
            const y = selectYear.value;
            
            const formatted = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            appState.targetDate = formatted;

            // Beautiful display text format
            const monthText = selectMonth.options[selectMonth.selectedIndex].text.split(' ')[0];
            document.getElementById('display-selected-date').innerText = `${d} ${monthText} ${y}`;
            document.getElementById('recap-target-date').innerText = `${d} ${monthText} ${y}`;
            document.getElementById('envelope-stamp-text').innerText = `${d} / ${m} / ${y}`;
        }

        // Listen for date select changes
        selectMonth.addEventListener('change', updateDaysDropdown);
        selectYear.addEventListener('change', updateDaysDropdown);
        selectDay.addEventListener('change', updateDisplayDate);

        // Preset Quick clickers: +1, +3, +5 years
        const presets = document.querySelectorAll('.btn-preset');
        presets.forEach(btn => {
            btn.onclick = () => {
                const yearsToAdd = parseInt(btn.getAttribute('data-years'));
                selectYear.value = currentYear + yearsToAdd;
                selectMonth.value = currentMonth;
                updateDaysDropdown();
            };
        });

        // Trigger first rendering
        updateDaysDropdown();
    }

    // Edit letter button
    document.getElementById('btn-edit-letter').addEventListener('click', () => {
        navigateTo('screen-write-letter');
    });

    // Confirm Date: goes to Final emotional questions instead of saving directly (id="8m2xqa")
    document.getElementById('btn-confirm-date').addEventListener('click', () => {
        // Validation: Verify if date is in the future
        const targetTime = new Date(appState.targetDate).getTime();
        const systemTime = getSystemDate().getTime();

        if (targetTime <= systemTime) {
            alert('الرجاء اختيار تاريخ مستقبلي! لا يمكنك إرسال رسالة إلى الماضي ⏳');
            return;
        }

        navigateTo('screen-final-questions', () => {
            initFinalQuestions();
        });
    });


    // --- 7. STAGE 3: THE 4 EMOTIONAL QUESTIONS & BLESSING (8m2xqa) ---
    function initFinalQuestions() {
        const monologues = document.querySelectorAll('#screen-final-questions .monologue-part');
        monologues.forEach(m => m.classList.remove('reveal'));

        // Fade in reflective texts slow and deep
        monologues.forEach((m, index) => {
            setTimeout(() => {
                m.classList.add('reveal');
            }, index * 2000); // 2s pacing
        });

        // Clear previous inputs
        document.getElementById('fq-1').value = '';
        document.getElementById('fq-2').value = '';
        document.getElementById('fq-3').value = '';
        document.getElementById('fq-4').value = '';
    }

    // Submit final questions
    document.getElementById('btn-submit-final').addEventListener('click', () => {
        appState.finalAnswers = {
            1: document.getElementById('fq-1').value.trim(),
            2: document.getElementById('fq-2').value.trim(),
            3: document.getElementById('fq-3').value.trim(),
            4: document.getElementById('fq-4').value.trim()
        };

        navigateTo('screen-aya-blessing', () => {
            revealStoryLines('screen-aya-blessing');
        });
    });


    // --- 8. STAGE 4: SENDING CINEMATIC SEQUENCE & SUCCESS ---
    document.getElementById('btn-final-send-trigger').addEventListener('click', () => {
        navigateTo('screen-sending-cinema', () => {
            runCosmicSendingSequence();
        });
    });

    function runCosmicSendingSequence() {
        const envelope = document.getElementById('traveling-envelope');
        const portal = document.querySelector('.cosmic-portal');
        
        // Reset animations state
        envelope.style.transition = 'none';
        envelope.style.transform = 'scale(1) rotateY(0deg) rotateX(15deg)';
        portal.classList.remove('activate');

        // Play space sounds if active
        if (audioCtx && appState.soundActive) {
            playPianoPluck(293.66); // D4
            setTimeout(() => playPianoPluck(440.00), 200); // A4
            setTimeout(() => playPianoPluck(587.33), 400); // D5
        }

        setTimeout(() => {
            // 1. Clock hands speed up spinning (done in CSS automatically, we just highlight it)
            // 2. Open portal
            portal.classList.add('activate');
            
            setTimeout(() => {
                // 3. Envelope shrinks and flys to the portal center
                envelope.style.transition = 'all 2.5s cubic-bezier(0.7, -0.3, 0.9, 0.5)';
                envelope.style.transform = 'translate(-50%, -50%) scale(0) rotate(720deg)';
                envelope.style.left = '50%';
                envelope.style.top = '40%';
                envelope.style.position = 'absolute';
                envelope.style.opacity = '0';

                // Save letter data locally
                saveLetterToDatabase();

                // 4. Transit to success outro screen
                setTimeout(() => {
                    navigateTo('screen-success');
                }, 2800);

            }, 2000);
        }, 500);
    }


    // --- 9. DATABASE STORAGE & RETRIEVAL (LOCAL STORAGE) ---
    function saveLetterToDatabase() {
        const qLog = questions.map((q, idx) => ({
            question: q.text,
            answer: appState.answers[idx] || ''
        }));

        const finalQLog = [
            { question: "ما الشيء الذي تتمنى أن يشكرك عليه شخصك المستقبلي؟", answer: appState.finalAnswers[1] || '' },
            { question: "ما الشيء الذي تتمنى ألا يسمح شخصك المستقبلي لنفسه أن ينساه؟", answer: appState.finalAnswers[2] || '' },
            { question: "إذا فتح شخصك المستقبلي هذه الرسالة في يوم صعب... ما الجملة التي تريد أن يسمعها منك؟", answer: appState.finalAnswers[3] || '' },
            { question: "ما الوعد الصغير الذي ستبدأ بتنفيذه من اليوم؟", answer: appState.finalAnswers[4] || '' }
        ];

        const newLetter = {
            id: Date.now().toString(),
            originDate: getSystemDateString(),
            targetDate: appState.targetDate,
            mainLetter: appState.mainLetter,
            questions: qLog,
            finalQuestions: finalQLog
        };

        const existing = JSON.parse(localStorage.getItem('aya_future_letters') || '[]');
        existing.push(newLetter);
        localStorage.setItem('aya_future_letters', JSON.stringify(existing));

        // Update list in Time Travel Panel
        renderStoredLetters();
    }

    // Core Check: run to see if system date has crossed targetDate of any letter
    let activeLetterToOpen = null;

    function checkArrivalOfLetters() {
        const letters = JSON.parse(localStorage.getItem('aya_future_letters') || '[]');
        const sysDateStr = getSystemDateString();
        
        // Find letters whose target date has arrived (targetDate <= systemDate)
        // and have not been opened yet, or can be opened again.
        const arrived = letters.filter(l => l.targetDate <= sysDateStr);

        if (arrived.length > 0) {
            // Trigger the most recent arrived letter to open!
            activeLetterToOpen = arrived[arrived.length - 1];
            
            // Trigger global arrival sequence
            setTimeout(() => {
                triggerLetterArrivalScreen(activeLetterToOpen);
            }, 600);
        }
    }

    function triggerLetterArrivalScreen(letter) {
        // Navigate to received screen directly
        navigateTo('screen-received', () => {
            // Setup vintage elements
            const env = document.getElementById('vintage-envelope-interactive');
            env.classList.remove('open-action');
            
            const intro = document.getElementById('arrival-intro-text');
            intro.classList.remove('hidden');
            
            const doc = document.getElementById('full-letter-doc');
            doc.classList.add('hidden');
            
            // Format dates
            document.getElementById('doc-origin-date').innerText = `كتبت في: ${letter.originDate}`;
            document.getElementById('letter-display-body').innerText = letter.mainLetter;

            // Fill 18 questions list
            const qListEl = document.getElementById('letter-display-questions');
            qListEl.innerHTML = '';
            letter.questions.forEach(item => {
                if (item.answer.trim()) {
                    const li = document.createElement('li');
                    li.innerHTML = `<span class="q-title">${item.question}</span><p class="q-ans">${item.answer}</p>`;
                    qListEl.appendChild(li);
                }
            });

            // Fill final questions list
            const fListEl = document.getElementById('letter-display-final-questions');
            fListEl.innerHTML = '';
            letter.finalQuestions.forEach(item => {
                if (item.answer.trim()) {
                    const li = document.createElement('li');
                    li.innerHTML = `<span class="q-title">${item.question}</span><p class="q-ans">${item.answer}</p>`;
                    fListEl.appendChild(li);
                }
            });
        });
    }

    // Interactive Vintage Envelope Open Clicking
    const vintageEnv = document.getElementById('vintage-envelope-interactive');
    const openEnvBtn = document.getElementById('btn-open-envelope');

    function openEnvelopeSequence() {
        vintageEnv.classList.add('open-action');
        
        if (audioCtx && appState.soundActive) {
            // Soft paper tearing/chime synthesizer sounds
            playPianoPluck(523.25); // C5
            setTimeout(() => playPianoPluck(659.25), 150); // E5
            setTimeout(() => playPianoPluck(783.99), 300); // G5
        }

        setTimeout(() => {
            // Hide intro prompts
            document.getElementById('arrival-intro-text').classList.add('hidden');
            
            // Show the letter scroll doc
            const doc = document.getElementById('full-letter-doc');
            doc.classList.remove('hidden');
            doc.style.opacity = '0';
            doc.offsetHeight;
            doc.style.opacity = '1';
        }, 1000);
    }

    vintageEnv.addEventListener('click', openEnvelopeSequence);
    openEnvBtn.addEventListener('click', openEnvelopeSequence);

    // Document close reader
    document.getElementById('btn-close-reader').addEventListener('click', () => {
        navigateTo('screen-welcome', () => {
            revealStoryLines('screen-welcome');
        });
    });

    // Success screen actions
    document.getElementById('btn-restart').addEventListener('click', () => {
        // Clear working answers
        appState.answers = {};
        appState.mainLetter = '';
        appState.finalAnswers = {};
        navigateTo('screen-welcome', () => {
            revealStoryLines('screen-welcome');
        });
    });

    document.getElementById('btn-open-simulator').addEventListener('click', () => {
        // Expand the simulator bar so they can fast forward directly
        const panel = document.getElementById('time-travel-panel');
        panel.classList.add('expanded');
        
        // Suggest target date into date picker input
        document.getElementById('simulated-date-input').value = appState.targetDate;
    });

    // Print / Save PDF letter
    document.getElementById('btn-print-letter').addEventListener('click', () => {
        window.print();
    });


    // --- 10. TIME TRAVEL SIMULATOR DRAWER LOGIC ---
    const simToggle = document.getElementById('simulator-toggle-btn');
    const simPanel = document.getElementById('time-travel-panel');

    simToggle.addEventListener('click', () => {
        simPanel.classList.toggle('expanded');
    });

    // Setup dates in Time travel controls
    function renderSimulatorControls() {
        const sysDateStr = getSystemDateString();
        document.getElementById('current-system-date').innerText = sysDateStr;
        document.getElementById('simulated-date-input').value = sysDateStr;
    }

    // Apply Time Travel Date
    document.getElementById('btn-apply-time-travel').addEventListener('click', () => {
        const inputVal = document.getElementById('simulated-date-input').value;
        if (!inputVal) return;

        appState.simulatedDate = inputVal;
        renderSimulatorControls();
        
        // Play temporal warp sound
        if (audioCtx && appState.soundActive) {
            playPianoPluck(146.83); // Deep warp chords
            playPianoPluck(220.00);
        }

        // Check if this date triggers any letter arrivals!
        checkArrivalOfLetters();
    });

    // Reset Time Travel
    document.getElementById('btn-reset-time-travel').addEventListener('click', () => {
        appState.simulatedDate = null;
        renderSimulatorControls();
        checkArrivalOfLetters();
    });

    // Render local storage database entries into simulator list for convenience
    function renderStoredLetters() {
        const listEl = document.getElementById('stored-letters-list');
        listEl.innerHTML = '';

        const letters = JSON.parse(localStorage.getItem('aya_future_letters') || '[]');

        if (letters.length === 0) {
            listEl.innerHTML = '<li>لا توجد رسائل مخزنة بعد.</li>';
            return;
        }

        letters.forEach(letter => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <strong>إلى: ${letter.targetDate}</strong>
                    <span style="opacity: 0.6; margin-right: 10px;">(كتبت: ${letter.originDate})</span>
                </div>
                <button class="letter-del-btn" data-id="${letter.id}" title="حذف الرسالة">
                    <i class="fas fa-trash-can"></i>
                </button>
            `;
            listEl.appendChild(li);
        });

        // Delete letter functionality
        const delBtns = listEl.querySelectorAll('.letter-del-btn');
        delBtns.forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                let existing = JSON.parse(localStorage.getItem('aya_future_letters') || '[]');
                existing = existing.filter(l => l.id !== id);
                localStorage.setItem('aya_future_letters', JSON.stringify(existing));
                renderStoredLetters();
            };
        });
    }

    // Startup initializations
    renderSimulatorControls();
    renderStoredLetters();
    checkArrivalOfLetters();
});
