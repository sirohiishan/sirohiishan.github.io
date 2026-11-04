(function() {
    const guide = document.querySelector("[data-scroll-guide]");
    const hint = document.querySelector("[data-scroll-hint]");
    if (!guide || !hint) return;
    const process = document.querySelector("[data-bbi]");
    const showcase = document.querySelector("[data-selected-work]");
    const film = document.querySelector("[data-bfilm]");
    const journey = document.querySelector("[data-xp]");
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = value => Math.min(1, Math.max(0, value));
    const idleDelay = () => parseFloat(getComputedStyle(guide).getPropertyValue("--scroll-hint-delay")) || 5e3;
    let frame = 0, timer = 0, state = null;
    const pinned = (el, light) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect(), span = rect.height - innerHeight;
        if (span < 2 || rect.top > 1 || rect.bottom <= innerHeight + 1) return null;
        return {
            progress: clamp(-rect.top / span),
            fade: clamp((rect.bottom - innerHeight) / (innerHeight * .3)),
            light: light
        };
    };
    const showcaseState = () => {
        if (!process || !showcase) return null;
        const p = process.getBoundingClientRect(), s = showcase.getBoundingClientRect();
        const enhanced = showcase.classList.contains("is-enhanced");
        const ending = parseFloat(showcase.style.getPropertyValue("--ending-progress")) || 0;
        if (s.top <= 1 && (enhanced ? s.bottom > innerHeight + 1 && ending < .5 : s.bottom > innerHeight * 1.5)) {
            const hold = parseFloat(getComputedStyle(showcase).getPropertyValue("--selected-work-hold")) || 0;
            const frames = showcase.querySelectorAll("[data-showcase-frame]").length;
            const span = enhanced ? innerHeight * (frames - 1 + hold) : s.height - innerHeight;
            return {
                progress: clamp(-s.top / Math.max(1, span)),
                fade: 1 - ending,
                light: false
            };
        }
        if (p.top <= 1 && p.bottom > 0) return {
            progress: clamp(-p.top / Math.max(1, p.height - innerHeight)),
            fade: 1,
            light: false
        };
        return null;
    };
    const clearHint = () => {
        clearTimeout(timer);
        timer = 0;
        hint.classList.remove("is-on");
        guide.classList.remove("is-hinting");
    };
    const armHint = () => {
        clearHint();
        if (!state || document.hidden) return;
        timer = setTimeout(() => {
            timer = 0;
            if (!state || document.hidden) return;
            hint.classList.add("is-on");
            guide.classList.add("is-hinting");
        }, idleDelay());
    };
    const update = () => {
        frame = 0;
        const next = still.matches || document.hidden ? null : showcaseState() || pinned(film && film.classList.contains("is-enhanced") ? film : null, true) || pinned(journey, false);
        const was = !!state;
        state = next;
        guide.classList.toggle("is-visible", !!state);
        if (!state) {
            clearHint();
            return;
        }
        guide.classList.toggle("is-light", state.light);
        hint.classList.toggle("is-light", state.light);
        guide.style.opacity = state.fade.toFixed(3);
        guide.style.setProperty("--guide-progress", state.progress.toFixed(4));
        if (!was) armHint();
    };
    const activity = () => {
        if (state) armHint();
    };
    window.addEventListener("scroll", () => {
        activity();
        if (!frame) frame = requestAnimationFrame(update);
    }, {
        passive: true
    });
    [ "wheel", "pointermove", "pointerdown", "touchstart", "touchmove", "keydown" ].forEach(type => window.addEventListener(type, activity, {
        passive: true
    }));
    document.addEventListener("visibilitychange", update);
    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    still.addEventListener("change", update);
    update();
})();
