(function() {
    const section = document.querySelector("[data-selected-work]");
    if (!section) return;
    const pin = section.querySelector(".selected-work__pin");
    const projects = [ ...section.querySelectorAll(".selected-work__project") ];
    const frames = [ ...section.querySelectorAll("[data-showcase-frame]") ];
    const lights = [ ...section.querySelectorAll(".selected-work__light") ];
    const ending = section.querySelector(".selected-work__ending");
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const stacked = matchMedia("(max-width: 900px)");
    const clamp = value => Math.min(1, Math.max(0, value));
    let frameHeight = 0, hold = 0, transition = 0, endingHold = 0, endingProgress = 0, frame = 0;
    let enter = 0, exit = 0, exitScale = 1, activeIndex = -1, endingFocused = false;
    let introEnterWindow = .5;
    const activate = (index, focusEnding) => {
        if (index === activeIndex && focusEnding === endingFocused) return;
        activeIndex = index;
        endingFocused = focusEnding;
        frames.forEach((panel, i) => {
            const active = i === index;
            panel.classList.toggle("is-active", active);
            panel.inert = !active || focusEnding;
            if (active && !focusEnding) panel.removeAttribute("aria-hidden"); else panel.setAttribute("aria-hidden", "true");
        });
    };
    const render = () => {
        frame = 0;
        if (!section.classList.contains("is-enhanced")) return;
        const sectionTop = section.getBoundingClientRect().top;
        const arrival = clamp(1 - Math.max(0, sectionTop) / (frameHeight * introEnterWindow));
        const position = Math.max(0, -sectionTop / frameHeight);
        const current = Math.min(frames.length - 1, Math.floor(position));
        const blend = current === frames.length - 1 ? 0 : clamp((position - current - hold) / transition);
        const eased = blend * blend * (3 - 2 * blend);
        const opacities = frames.map((panel, i) => {
            const incoming = i === current + 1;
            const opacity = (i === current ? 1 - eased : incoming ? eased : 0) * (i === 0 ? arrival : 1);
            panel.style.setProperty("--project-opacity", opacity);
            panel.style.setProperty("--project-y", (i === current ? -exit * eased : incoming ? enter * (1 - eased) : enter) + "px");
            panel.style.setProperty("--project-scale", i === current ? 1 - (1 - exitScale) * eased : 1);
            panel.style.setProperty("--frame-drift", clamp((position - i) / (i === frames.length - 1 ? hold + endingHold : hold)).toFixed(4));
            return opacity;
        });
        lights.forEach((light, i) => light.style.opacity = opacities[i + 1]);
        endingProgress = clamp((position - (frames.length - 1 + hold)) / transition);
        section.style.setProperty("--ending-progress", endingProgress);
        const endingActive = endingProgress >= .5;
        section.classList.toggle("is-ending", endingActive);
        ending.inert = !endingActive;
        if (endingActive) ending.removeAttribute("aria-hidden"); else ending.setAttribute("aria-hidden", "true");
        activate(current + (blend >= .5 ? 1 : 0), endingActive);
    };
    const fitArtwork = () => {
        const style = getComputedStyle(section);
        const overlap = parseFloat(style.getPropertyValue("--selected-work-art-overlap"));
        const inset = parseFloat(style.getPropertyValue("--selected-work-art-inset"));
        const maxScale = parseFloat(style.getPropertyValue("--selected-work-phone-max-scale"));
        projects.forEach(panel => {
            const stage = panel.querySelector(".wcard__stage");
            const phone = panel.querySelector(".phone");
            const span = phone.offsetWidth * 3 - overlap * 2 + inset * 2;
            const height = phone.offsetHeight + inset * 3;
            const available = stage.getBoundingClientRect();
            const scale = Math.max(.1, Math.min(maxScale, available.width / span, available.height / height));
            panel.style.setProperty("--selected-work-phone-scale", scale.toFixed(4));
        });
    };
    const reset = () => {
        section.classList.remove("is-ending", "is-enhanced");
        section.style.height = "";
        section.style.removeProperty("--ending-progress");
        activeIndex = -1;
        endingFocused = false;
        endingProgress = 0;
        frames.forEach(panel => {
            panel.inert = false;
            panel.removeAttribute("aria-hidden");
            panel.classList.remove("is-active");
            [ "--project-opacity", "--project-y", "--project-scale", "--frame-drift" ].forEach(name => panel.style.removeProperty(name));
        });
        ending.inert = false;
        ending.removeAttribute("aria-hidden");
        lights.forEach(light => light.style.opacity = "");
    };
    const size = () => {
        reset();
        const style = getComputedStyle(section);
        const value = name => parseFloat(style.getPropertyValue(name));
        introEnterWindow = value("--selected-work-intro-enter-window");
        hold = value("--selected-work-hold");
        transition = value("--selected-work-transition");
        endingHold = value("--selected-work-ending-hold");
        enter = value("--selected-work-enter");
        exit = value("--selected-work-exit");
        exitScale = value("--selected-work-exit-scale");
        if (!preference.matches && window.innerHeight >= 600) {
            section.classList.add("is-enhanced");
            frameHeight = pin.offsetHeight;
            const body = section.querySelector(".selected-work__panels");
            const maxCopy = Math.max(...projects.map(panel => panel.querySelector(".wcard__text").offsetHeight));
            const minimum = stacked.matches ? maxCopy + value("--selected-work-copy-gap") + value("--selected-work-art-min") : maxCopy;
            if (body.clientHeight >= minimum) {
                section.style.height = frameHeight * (frames.length + hold + endingHold) + "px";
                render();
            } else reset();
        }
        fitArtwork();
    };
    window.addEventListener("scroll", () => {
        if (!frame) frame = requestAnimationFrame(render);
    }, {
        passive: true
    });
    window.addEventListener("resize", size);
    window.addEventListener("load", size);
    preference.addEventListener("change", size);
    document.fonts.ready.then(size);
    size();
})();
