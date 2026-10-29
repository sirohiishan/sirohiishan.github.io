(function() {
    const doc = document.documentElement;
    doc.classList.remove("no-js");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionVideos = [ ...document.querySelectorAll("video[data-motion]") ];
    const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
        motionVideos.forEach(video => {
            video.muted = video.defaultMuted = true;
            if (motionPreference.matches || document.hidden) video.pause(); else video.play().catch(() => {});
        });
    };
    motionPreference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateMotion);
    updateMotion();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
    let toastTimer;
    window.showToast = function(msg, icon) {
        toast.innerHTML = (icon ? '<span class="ms">' + icon + "</span>" : "") + msg;
        toast.classList.add("is-on");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2400);
    };
    function scribblePath(seed) {
        let s = seed;
        const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
        let d = "M2," + (16 + rnd() * 6).toFixed(1);
        let x = 2;
        while (x < 96) {
            const nx = Math.min(98, x + 3 + rnd() * 4);
            const up = 2 + rnd() * 5, dn = 25 + rnd() * 4;
            d += " C" + (x + 2).toFixed(1) + "," + up.toFixed(1) + " " + (nx - 1).toFixed(1) + "," + up.toFixed(1) + " " + ((x + nx) / 2).toFixed(1) + "," + (8 + rnd() * 6).toFixed(1);
            d += " S" + (nx + 2).toFixed(1) + "," + dn.toFixed(1) + " " + nx.toFixed(1) + "," + (14 + rnd() * 8).toFixed(1);
            x = nx;
        }
        return d;
    }
    const tip = document.createElement("div");
    tip.className = "nda-tip";
    tip.id = "ndaTip";
    tip.setAttribute("role", "tooltip");
    tip.innerHTML = '<b><span class="ms" aria-hidden="true">lock</span>Under NDA</b>The client name stays scribbled out. Everything else here (the problem, the flows, the decisions) is the real work, told with generic placeholders.<i class="nda-tip__arrow"></i>';
    document.body.appendChild(tip);
    let tipOwner = null;
    let shownAt = 0;
    function showTip(el) {
        if (tipOwner !== el || !tip.classList.contains("is-on")) shownAt = Date.now();
        tipOwner = el;
        tip.classList.add("is-on");
        tip.classList.toggle("is-light", !!el.closest(".case-card, .section--dark, .footer, .cover"));
        const r = el.getBoundingClientRect();
        const tw = tip.offsetWidth, th = tip.offsetHeight, pad = 12;
        let left = r.left + r.width / 2 - tw / 2;
        left = Math.max(pad, Math.min(left, window.innerWidth - tw - pad));
        let top = r.top - th - 14;
        const below = top < pad;
        if (below) top = r.bottom + 14;
        tip.style.left = left + "px";
        tip.style.top = top + "px";
        tip.classList.toggle("is-below", below);
        tip.style.setProperty("--ax", r.left + r.width / 2 - left + "px");
    }
    function hideTip() {
        tip.classList.remove("is-on");
        tipOwner = null;
    }
    document.querySelectorAll(".redact").forEach((el, i) => {
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");
        el.setAttribute("aria-label", "Client name redacted under NDA. Show note.");
        el.setAttribute("aria-describedby", "ndaTip");
        const seed = 11 + i * 37;
        el.innerHTML = '<svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="' + scribblePath(seed) + '"/><path pathLength="1" d="' + scribblePath(seed + 5) + '"/><path pathLength="1" d="' + scribblePath(seed + 13) + '"/></svg>';
        el.addEventListener("pointerenter", e => {
            if (e.pointerType === "mouse") showTip(el);
        });
        el.addEventListener("pointerleave", e => {
            if (e.pointerType === "mouse") hideTip();
        });
        el.addEventListener("focus", () => showTip(el));
        el.addEventListener("blur", hideTip);
        el.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            const open = tipOwner === el && tip.classList.contains("is-on");
            open && Date.now() - shownAt > 400 ? hideTip() : showTip(el);
        });
        el.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                el.click();
            }
            if (e.key === "Escape") hideTip();
        });
    });
    document.addEventListener("click", hideTip);
    window.addEventListener("scroll", () => tipOwner && hideTip(), {
        passive: true
    });
    const nav = document.querySelector(".nav");
    const caseToc = document.querySelector(".case-layout .toc");
    const horizontalCaseNav = matchMedia("(max-width: 1199px)");
    let lastY = window.scrollY, travel = 0;
    function setHidden(h) {
        nav.classList.toggle("is-hidden", h);
        document.body.classList.toggle("nav-up", h);
    }
    const darkSel = ".cover, .section--dark, .footer, .walk, .mnav";
    function navTheme() {
        if (!nav) return;
        const pill = nav.querySelector(".nav__in");
        const tocRect = caseToc?.getBoundingClientRect();
        const caseBand = !!(horizontalCaseNav.matches && tocRect && tocRect.top <= nav.offsetHeight && tocRect.bottom > 0);
        nav.classList.toggle("has-case-band", caseBand);
        const under = document.elementsFromPoint(window.innerWidth / 2, pill.offsetTop + pill.offsetHeight / 2).find(el => !nav.contains(el));
        nav.classList.toggle("is-dark", !caseBand && !!(under && under.closest(darkSel) && !under.closest(".mnav")));
    }
    function onScroll() {
        if (!nav || document.body.classList.contains("menu-open")) return;
        const y = Math.max(0, window.scrollY);
        const dy = y - lastY;
        lastY = y;
        nav.classList.toggle("is-solid", y > 40);
        navTheme();
        if (y < 120) {
            travel = 0;
            setHidden(false);
            return;
        }
        if (dy === 0) return;
        travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy;
        if (travel > 12) setHidden(true); else if (travel < -12) setHidden(false);
    }
    window.addEventListener("scroll", onScroll, {
        passive: true
    });
    window.addEventListener("resize", navTheme, {
        passive: true
    });
    onScroll();
    document.querySelectorAll("[data-fallback] img").forEach(img => {
        const fail = () => {
            const alt = img.dataset.alt;
            if (alt) {
                delete img.dataset.alt;
                img.src = alt;
                return;
            }
            img.closest("[data-fallback]").classList.add("is-empty");
        };
        if (img.complete && img.naturalWidth === 0) fail();
        img.addEventListener("error", fail);
    });
    const menuBtn = document.querySelector(".nav__menu");
    const mnav = document.getElementById("mnav");
    if (menuBtn && mnav) {
        const setMenu = open => {
            mnav.hidden = !open;
            menuBtn.setAttribute("aria-expanded", open);
            menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
            menuBtn.querySelector(".ms").textContent = open ? "close" : "menu";
            document.body.classList.toggle("menu-open", open);
        };
        menuBtn.addEventListener("click", () => setMenu(mnav.hidden));
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && !mnav.hidden) {
                setMenu(false);
                menuBtn.focus();
            }
        });
        window.matchMedia("(min-width: 761px)").addEventListener("change", m => m.matches && setMenu(false));
    }
    document.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", async () => {
        const v = b.dataset.copy;
        try {
            await navigator.clipboard.writeText(v);
            showToast("Email copied. Talk soon.", "check_circle");
        } catch (e) {
            showToast(v, "mail");
        }
    }));
    const revIO = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                en.target.classList.add("is-in");
                revIO.unobserve(en.target);
            }
        });
    }, {
        threshold: .12,
        rootMargin: "0px 0px -40px 0px"
    });
    document.querySelectorAll(".reveal").forEach(el => reduce ? el.classList.add("is-in") : revIO.observe(el));
    const cv = document.querySelector(".cover[data-case-video]");
    if (cv && cv.dataset.caseVideo) {
        const project = /(?:^|\/)(attendance|neighbourhood|thero|rider|medicine)-case\.mp4$/.exec(cv.dataset.caseVideo)?.[1];
        if (project) {
            const link = document.createElement("a");
            link.className = "cover__watch";
            const params = new URLSearchParams({
                project: project
            });
            const from = new URLSearchParams(location.search).get("from");
            if (from === "home" || from === "work") params.set("from", from);
            link.href = "watch.html?" + params;
            link.innerHTML = '<span class="cover__watch-ic"><span class="ms" aria-hidden="true">play_arrow</span></span>' + (cv.dataset.caseCaption || "Watch a quick video");
            (cv.querySelector(".cover__main") || cv.querySelector(".cover__text")).appendChild(link);
        }
    }
    const b15 = document.querySelector(".bring15");
    if (b15) {
        const bcards = b15.querySelectorAll(".bcard");
        const pin = b15.querySelector(".bring15__pin");
        const track = b15.querySelector(".bring15__track");
        const wide = matchMedia("(min-width: 901px) and (min-height: 600px)");
        let travel = 0, raf = 0;
        const cardObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-in");
                    cardObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: .25,
            rootMargin: "0px 0px -10% 0px"
        });
        bcards.forEach(card => cardObserver.observe(card));
        const move = () => {
            raf = 0;
            if (!b15.classList.contains("is-h")) return;
            const p = travel ? Math.min(1, Math.max(0, -b15.getBoundingClientRect().top / travel)) : 0;
            track.style.transform = "translateX(" + (-p * travel).toFixed(1) + "px)";
            const vw = window.innerWidth;
            bcards.forEach(card => {
                const r = card.getBoundingClientRect();
                if (r.left < vw * .8 && r.top < window.innerHeight * .85) card.classList.add("is-in");
            });
        };
        const size = () => {
            const horizontal = wide.matches && !motionPreference.matches;
            b15.classList.toggle("is-h", horizontal);
            b15.style.height = "";
            track.style.transform = "";
            travel = 0;
            if (motionPreference.matches) bcards.forEach(card => card.classList.add("is-in"));
            if (horizontal) {
                travel = Math.max(0, track.scrollWidth - pin.clientWidth);
                b15.style.height = pin.offsetHeight + travel + "px";
                move();
            }
        };
        window.addEventListener("scroll", () => {
            if (!raf && b15.classList.contains("is-h")) raf = requestAnimationFrame(move);
        }, {
            passive: true
        });
        window.addEventListener("resize", size);
        window.addEventListener("load", size);
        wide.addEventListener("change", size);
        motionPreference.addEventListener("change", size);
        document.fonts.ready.then(size);
        size();
    }
    const pageKey = {
        "": "home",
        "index.html": "home",
        "work.html": "work",
        "about.html": "about",
        "playground.html": "playground"
    };
    const here = location.pathname.split("/").pop();
    const onCase = /^case-/.test(here);
    let cameFrom = new URLSearchParams(location.search).get("from");
    if (Object.values(pageKey).indexOf(cameFrom) < 0) cameFrom = null;
    if (onCase && !cameFrom) {
        try {
            const ref = new URL(document.referrer);
            if (ref.origin === location.origin) cameFrom = pageKey[ref.pathname.split("/").pop()] || null;
        } catch (e) {}
    }
    const tag = onCase ? cameFrom : pageKey[here];
    if (tag) {
        document.querySelectorAll('a[href^="case-"]').forEach(a => {
            const [path, hash] = a.getAttribute("href").split("#");
            if (/[?&]from=/.test(path)) return;
            a.setAttribute("href", path + (path.indexOf("?") > -1 ? "&" : "?") + "from=" + tag + (hash ? "#" + hash : ""));
        });
    }
    const back = document.querySelector(".cover__back");
    if (back && onCase) {
        const dest = {
            home: [ "index.html#work", "Home" ],
            work: [ "work.html", "All Work" ],
            about: [ "about.html", "About" ],
            playground: [ "playground.html", "Playground" ]
        };
        const d = dest[cameFrom] || dest.work;
        back.setAttribute("href", d[0]);
        back.lastChild.textContent = d[1];
    }
    const mark = document.querySelector(".footer__mark");
    if (mark) {
        let fitting = 0;
        const fit = () => {
            fitting = 0;
            mark.style.fontSize = "";
            const avail = mark.clientWidth;
            const used = [ ...mark.children ].reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
            if (avail && used) mark.style.fontSize = parseFloat(getComputedStyle(mark).fontSize) * (avail / used) * .985 + "px";
        };
        fit();
        if (document.fonts) document.fonts.ready.then(fit);
        addEventListener("resize", () => {
            if (!fitting) fitting = requestAnimationFrame(fit);
        });
    }
    document.querySelectorAll("[data-year]").forEach(el => el.textContent = (new Date).getFullYear());
})();
