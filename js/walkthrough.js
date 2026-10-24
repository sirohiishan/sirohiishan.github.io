(function() {
    const kits = {
        audit: () => window.AuditScreens,
        nb: () => window.NbScreens,
        thero: () => window.TheroScreens,
        rider: () => window.RiderScreens,
        med: () => window.MedScreens
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const icon = n => '<span class="ms fill" aria-hidden="true">' + n + "</span>";
    const clock = t => {
        t = Math.floor(t / 1e3);
        return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
    };
    const span = sec => Math.floor(sec / 3600) + " hr " + Math.floor(sec % 3600 / 60) + " m";
    const esc = t => String(t).replace(/[&<>"]/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;"
    }[c]));
    document.querySelectorAll(".walk").forEach(root => {
        const kit = kits[root.dataset.kit] && kits[root.dataset.kit]();
        const data = root.querySelector('script[type="application/json"]');
        if (!kit || !data) return;
        const scenes = JSON.parse(data.textContent).scenes;
        scenes.forEach(s => s.ms = s.ms || 3400);
        const starts = [];
        const total = scenes.reduce((at, s, i) => (starts[i] = at, at + s.ms), 0);
        const head = root.dataset.title ? '<div class="walk__head"><strong>' + esc(root.dataset.title) + '</strong><span class="walk__state walk__state--' + esc(root.dataset.state || "shipped") + '">' + esc(root.dataset.note || "") + "</span></div>" : "";
        root.innerHTML = '<div class="walk__stage">' + head + '<ol class="walk__steps" aria-hidden="true">' + scenes.map((s, i) => '<li><button type="button" tabindex="-1"><span class="walk__n">' + (i + 1) + '</span><span class="walk__st"><strong>' + esc(s.t) + (s.sys ? " <em>System</em>" : "") + "</strong><small>" + esc(s.d) + "</small></span></button></li>").join("") + "</ol>" + '<div class="walk__device"><div class="phone" aria-hidden="true"><span class="walk__tap"></span></div></div>' + '<div class="walk__cap" aria-hidden="true"><span class="walk__count"></span><strong class="walk__title"></strong><p class="walk__text"></p></div>' + "</div>" + '<div class="walk__bar">' + '<button class="walk__play" type="button" aria-label="Play walkthrough">' + icon("play_arrow") + "</button>" + '<div class="walk__segs">' + scenes.map((s, i) => '<button class="walk__seg" type="button" aria-label="Step ' + (i + 1) + ": " + esc(s.t) + '"><i></i></button>').join("") + "</div>" + '<span class="walk__time" aria-hidden="true">0:00 / ' + clock(total) + "</span>" + "</div>" + '<ol class="sr-only">' + scenes.map(s => "<li>" + esc(s.t) + ". " + esc(s.d) + "</li>").join("") + "</ol>";
        const phone = root.querySelector(".phone");
        if (root.dataset.kit === "nb") phone.classList.add("phone--night");
        if (root.dataset.kit === "thero") phone.classList.add("phone--shot");
        const marker = root.querySelector(".walk__tap");
        const cap = root.querySelector(".walk__cap");
        const count = root.querySelector(".walk__count");
        const title = root.querySelector(".walk__title");
        const text = root.querySelector(".walk__text");
        const play = root.querySelector(".walk__play");
        const time = root.querySelector(".walk__time");
        const segs = [ ...root.querySelectorAll(".walk__seg") ];
        const fills = segs.map(b => b.firstElementChild);
        const steps = [ ...root.querySelectorAll(".walk__steps li") ];
        let idx = 0, elapsed = 0, playing = false, ended = false, userPaused = false;
        let layer = null, tapped = false, tickEl = null, tickSec = 0, tickAcc = 0, raf = 0, last = 0;
        function target(sel) {
            if (!sel || !layer) return null;
            if (sel.indexOf("text:") === 0) {
                const want = sel.slice(5);
                const hits = [ ...layer.querySelectorAll("*") ].filter(e => e.textContent.trim() === want);
                return hits[hits.length - 1] || null;
            }
            return layer.querySelector(sel);
        }
        function show(i) {
            const s = scenes[i];
            idx = i;
            elapsed = 0;
            tapped = false;
            marker.classList.remove("is-on", "is-press");
            if (!(s.keep && layer)) {
                const el = document.createElement("div");
                el.className = "phone__screen walk__screen" + (s.fx === "fade" ? " walk__screen--fade" : "");
                el.innerHTML = kit[s.s](s.a);
                phone.appendChild(el);
                const old = layer;
                layer = el;
                void el.offsetWidth;
                el.classList.add("is-in");
                if (old) {
                    old.classList.add("is-out");
                    setTimeout(() => old.remove(), 600);
                }
            } else {
                layer.querySelectorAll(".walk-pressed").forEach(e => e.classList.remove("walk-pressed"));
            }
            tickEl = s.tick ? layer.querySelector("[data-tick]") : null;
            tickSec = s.tick || 0;
            tickAcc = 0;
            if (tickEl) tickEl.textContent = span(tickSec);
            phone.classList.toggle("is-dim", !!s.dim);
            count.textContent = "Step " + (i + 1) + " of " + scenes.length + (s.sys ? " · System screen" : "");
            title.textContent = s.t;
            text.textContent = s.d;
            cap.classList.remove("is-swap");
            void cap.offsetWidth;
            cap.classList.add("is-swap");
            paint();
        }
        function doTap(sel) {
            tapped = true;
            const t = target(sel);
            if (!t) return;
            const r = t.getBoundingClientRect(), p = phone.getBoundingClientRect();
            marker.style.left = r.left - p.left + r.width / 2 + "px";
            marker.style.top = r.top - p.top + r.height / 2 + "px";
            marker.classList.add("is-on");
            setTimeout(() => {
                if (layer && layer.contains(t)) {
                    marker.classList.add("is-press");
                    t.classList.add("walk-pressed");
                }
            }, 380);
        }
        function paint() {
            fills.forEach((f, j) => f.style.width = j < idx ? "100%" : j > idx ? "0%" : Math.min(100, elapsed / scenes[idx].ms * 100) + "%");
            segs.forEach((b, j) => b.classList.toggle("is-on", j === idx));
            steps.forEach((li, j) => {
                li.classList.toggle("is-on", j === idx);
                li.classList.toggle("is-done", j < idx);
            });
            time.textContent = clock(starts[idx] + elapsed) + " / " + clock(total);
        }
        function frame(now) {
            const dt = Math.min(64, now - last);
            last = now;
            elapsed += dt;
            const s = scenes[idx];
            if (s.tap && !tapped && elapsed >= s.ms - 1100) doTap(s.tap);
            if (tickEl && (tickAcc += dt) > 450) {
                tickAcc = 0;
                tickSec += 60;
                tickEl.textContent = span(tickSec);
            }
            if (elapsed >= s.ms) {
                show(idx < scenes.length - 1 ? idx + 1 : 0);
            }
            paint();
            raf = requestAnimationFrame(frame);
        }
        function setIcon(name, label) {
            play.innerHTML = icon(name);
            play.setAttribute("aria-label", label);
        }
        function start() {
            if (playing) return;
            if (ended) {
                ended = false;
                show(0);
            }
            playing = true;
            root.classList.add("is-playing");
            setIcon("pause", "Pause walkthrough");
            last = performance.now();
            raf = requestAnimationFrame(frame);
        }
        function stop() {
            playing = false;
            cancelAnimationFrame(raf);
            root.classList.remove("is-playing");
            setIcon("play_arrow", "Play walkthrough");
        }
        function finish() {
            stop();
            ended = true;
            elapsed = scenes[idx].ms;
            paint();
            setIcon("replay", "Replay walkthrough");
        }
        play.addEventListener("click", () => {
            if (playing) {
                userPaused = true;
                stop();
            } else {
                userPaused = false;
                start();
            }
        });
        root.querySelector(".walk__stage").addEventListener("click", () => play.click());
        const jump = i => {
            ended = false;
            userPaused = true;
            stop();
            show(i);
        };
        segs.forEach((b, i) => b.addEventListener("click", () => jump(i)));
        steps.forEach((li, i) => li.firstElementChild.addEventListener("click", e => {
            e.stopPropagation();
            jump(i);
        }));
        show(0);
        if (!reduce && "IntersectionObserver" in window) {
            new IntersectionObserver(entries => entries.forEach(e => {
                if (e.isIntersecting && e.intersectionRatio >= .55) {
                    if (!userPaused && !ended) start();
                } else if (playing) stop();
            }), {
                threshold: [ 0, .55 ]
            }).observe(root);
        }
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && playing) stop();
        });
    });
})();
