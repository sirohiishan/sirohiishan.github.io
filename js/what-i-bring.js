(function() {
    const film = document.querySelector("[data-bfilm]");
    if (!film) return;
    const svg = film.querySelector(".bfilm__svg");
    const caps = [ ...film.querySelectorAll("[data-bfilm-cap]") ];
    const part = name => svg.querySelector('[data-f="' + name + '"]');
    const f = {};
    [ "tray", "phone1", "frame1", "ui1", "bars", "head", "pill", "normal", "offline", "done", "btn", "note1", "arrow1", "bubble", "strike", "note2", "ripple", "cursor", "piecesA", "phone2", "frame2", "piecesB" ].forEach(n => f[n] = part(n));
    const bars = [ ...f.bars.children ];
    const note2Line = f.note2.querySelector("path");
    const piecesA = [ ...f.piecesA.children ], piecesB = [ ...f.piecesB.children ];
    const short = matchMedia("(max-height: 559px)");
    const clamp = v => Math.min(1, Math.max(0, v));
    const ease = t => t * t * (3 - 2 * t);
    const seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
    const lerp = (a, b, t) => a + (b - a) * t;
    let frame = 0;
    const op = (el, v) => el.style.opacity = v.toFixed(3);
    const sketch = (el, done) => {
        el.style.strokeDasharray = done < 1 ? "1" : "none";
        el.style.strokeDashoffset = (1 - done).toFixed(4);
    };
    const pieces = (list, t, stagger) => list.forEach((el, i) => {
        const [dx, dy] = el.dataset.from.split(",").map(Number);
        const k = seg(t, i * stagger, i * stagger + (1 - stagger * (list.length - 1)));
        el.setAttribute("transform", "translate(" + (dx * (1 - k)).toFixed(1) + " " + (dy * (1 - k)).toFixed(1) + ")");
        op(el, t > 0 ? 1 : 0);
    });
    const draw = p => {
        sketch(f.frame1, seg(p, 0, .06));
        f.frame1.style.fillOpacity = seg(p, .03, .07).toFixed(3);
        op(f.ui1, seg(p, .04, .09));
        const lost = seg(p, .1, .17), back = seg(p, .58, .62);
        bars.forEach((bar, i) => op(bar, lerp(1, .15, seg(p, .1 + (3 - i) * .015, .13 + (3 - i) * .015)) + .85 * back));
        op(f.pill, seg(p, .14, .18) * (1 - back));
        op(f.head, 1 - seg(p, .14, .18) + back);
        const offline = seg(p, .16, .22) * (1 - back);
        const done = back * (1 - seg(p, .67, .71));
        op(f.offline, offline);
        op(f.done, done);
        op(f.normal, 1 - Math.max(offline, done, lost > 0 && back === 0 ? seg(p, .16, .22) : 0));
        op(f.note1, seg(p, .2, .24) * (1 - seg(p, .32, .35)));
        f.arrow1.style.strokeDashoffset = 1 - seg(p, .22, .29);
        op(f.bubble, seg(p, .36, .4) * (1 - seg(p, .5, .53)));
        f.strike.style.strokeDashoffset = 1 - seg(p, .42, .47);
        const move = seg(p, .47, .56);
        op(f.cursor, seg(p, .46, .48) * (1 - seg(p, .66, .68)));
        f.cursor.setAttribute("transform", "translate(" + lerp(470, 300, move).toFixed(1) + " " + lerp(410, 352, move).toFixed(1) + ")");
        const tap = clamp((p - .56) / .05);
        f.ripple.setAttribute("r", (6 + 26 * tap).toFixed(1));
        op(f.ripple, tap > 0 && tap < 1 ? 1 - tap : 0);
        f.btn.style.transformOrigin = "280px 354px";
        f.btn.style.transform = "scale(" + (1 - .05 * Math.sin(Math.PI * tap)).toFixed(3) + ")";
        op(f.note2, seg(p, .6, .63) * (1 - seg(p, .66, .68)));
        note2Line.style.strokeDashoffset = 1 - seg(p, .61, .65);
        f.phone1.setAttribute("transform", "translate(" + (-186 * seg(p, .69, .76)).toFixed(1) + " 0)");
        op(f.tray, seg(p, .72, .76));
        pieces(piecesA, clamp((p - .75) / .1), .12);
        op(f.phone2, seg(p, .83, .86));
        sketch(f.frame2, seg(p, .83, .88));
        f.frame2.style.fillOpacity = seg(p, .86, .89).toFixed(3);
        pieces(piecesB, clamp((p - .88) / .1), .12);
        caps.forEach((cap, i) => cap.classList.toggle("is-active", i === (p < .34 ? 0 : p < .67 ? 1 : 2)));
    };
    const render = () => {
        frame = 0;
        if (!film.classList.contains("is-enhanced")) return;
        const rect = film.getBoundingClientRect();
        draw(clamp(-rect.top / Math.max(1, rect.height - window.innerHeight)));
    };
    const size = () => {
        film.classList.toggle("is-enhanced", !short.matches);
        if (film.classList.contains("is-enhanced")) render(); else draw(1);
    };
    window.addEventListener("scroll", () => {
        if (!frame) frame = requestAnimationFrame(render);
    }, {
        passive: true
    });
    window.addEventListener("resize", size);
    short.addEventListener("change", size);
    size();
})();
