(function() {
    const stage = document.querySelector("#pg-stage");
    const dlg = document.querySelector("#pg-view");
    if (!stage || !dlg) return;
    const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
    let motionPaused = motionPreference.matches;
    motionPreference.addEventListener("change", event => {
        motionPaused = event.matches;
        render();
    });
    const dir = "assets/playground/";
    const media = [ [ "jolly", "Jolly", .998, true ], [ "lamp-chair", "Lamp and chair", .562, true ], [ "open-eyes", "Open eyes", 1 ], [ "render", "Little creature", .462, true ], [ "skull-on-stone", "Skull on stone", 1.781 ], [ "uwu-vision", "UwU vision", 1.779, true ], [ "back", "TV head, from behind", 1 ], [ "black-background", "Battery pack", .998, true ], [ "cat", "Furry friend", 1.781 ], [ "front", "TV head", 1 ], [ "glassy", "Glassy", .998, true ], [ "my-character", "My character", .562, true ], [ "ig-post", "Neon strands", .998, true ], [ "lamp-chair-2", "Lamp and chair, take two", .562, true ] ].map(([slug, title, aspect, video]) => ({
        title: title,
        aspect: aspect,
        video: !!video,
        thumb: dir + slug + "-thumb.jpg",
        loop: video ? dir + slug + "-loop.mp4" : null,
        full: dir + slug + (video ? ".mp4" : ".jpg")
    }));
    const bands = [ [ 0, 1, 2 ], [ 3, 4, 5 ], [ 6, 7, 8 ], [ 9, 10 ], [ 11, 12, 13 ] ];
    const rowFactors = [ 1.08, .94, 1.12, .9, 1.02 ];
    const rowShifts = [ -120, 72, -240, 136, -64 ];
    const S = {
        scale0: .9,
        min: .55,
        max: 2.2,
        gap: 16,
        gapSm: 10,
        maxVideos: 10,
        drag: 8,
        key: 96,
        zoom: 1.12
    };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
    const world = document.createElement("div");
    world.className = "pg-world";
    stage.append(world);
    const tiles = new Map;
    const pointers = new Map;
    const st = {
        x: -96,
        y: -72,
        scale: S.scale0,
        queued: false,
        moved: false,
        sel: null,
        pinch: null,
        gScale: 1,
        vt: null,
        sx: 0,
        sy: 0
    };
    const thumbImg = m => {
        const i = new Image;
        i.src = m.thumb;
        i.alt = "";
        i.decoding = "async";
        i.draggable = false;
        return i;
    };
    const stopVideo = tile => {
        const v = tile.querySelector("video");
        if (!v) return;
        v.pause();
        v.removeAttribute("src");
        v.load();
        tile.replaceChildren(thumbImg(media[+tile.dataset.i]));
    };
    const queue = () => {
        if (st.queued) return;
        st.queued = true;
        requestAnimationFrame(() => {
            st.queued = false;
            render();
        });
    };
    const syncLater = () => {
        clearTimeout(st.vt);
        st.vt = setTimeout(syncVideos, 240);
    };
    function syncVideos() {
        if (motionPaused) {
            for (const [, tile] of tiles) stopVideo(tile);
            return;
        }
        if (dlg.open || document.hidden || reduce) return;
        const b = stage.getBoundingClientRect();
        const cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2;
        const near = [];
        for (const [k, t] of tiles) {
            if (!media[+t.dataset.i].video) continue;
            const r = t.getBoundingClientRect();
            if (r.right < b.left || r.left > b.right || r.bottom < b.top || r.top > b.bottom) continue;
            near.push([ k, (r.left + r.right) / 2 - cx, (r.top + r.bottom) / 2 - cy ]);
        }
        near.sort((a, c) => a[1] * a[1] + a[2] * a[2] - (c[1] * c[1] + c[2] * c[2]));
        const on = new Set(near.slice(0, S.maxVideos).map(n => n[0]));
        for (const [k, t] of tiles) {
            if (!on.has(k)) {
                stopVideo(t);
                continue;
            }
            const v0 = t.querySelector("video");
            if (v0) {
                if (v0.paused) v0.play().catch(() => {});
                continue;
            }
            const m = media[+t.dataset.i];
            const v = document.createElement("video");
            v.muted = v.defaultMuted = v.loop = v.playsInline = v.autoplay = true;
            v.preload = "metadata";
            v.poster = m.thumb;
            v.src = m.loop;
            t.replaceChildren(v);
            v.play().catch(() => {});
        }
    }
    function render() {
        const w = stage.clientWidth, h = stage.clientHeight, sc = st.scale;
        const base = clamp(w * .17, 150, 280);
        const gap = w <= 640 ? S.gapSm : S.gap;
        const heights = rowFactors.map(f => Math.round(base * f));
        const starts = [];
        let cycle = 0;
        for (const rh of heights) {
            starts.push(cycle);
            cycle += rh + gap;
        }
        const cyc = cycle * sc;
        if (Math.abs(st.y) > cyc * 20) st.y %= cyc;
        const c0 = Math.floor((-st.y - base * sc) / cyc) - 1, c1 = Math.ceil((h - st.y + base * sc) / cyc) + 1;
        const need = new Set;
        for (let c = c0; c <= c1; c++) {
            bands.forEach((idx, band) => {
                const rh = heights[band] * sc;
                const y = st.y + (c * cycle + starts[band]) * sc;
                if (y + rh < -rh || y > h + rh) return;
                const xs = [];
                let rw = 0;
                for (const i of idx) {
                    xs.push(rw);
                    rw += Math.round(heights[band] * media[i].aspect) + gap;
                }
                const period = rw * sc, shift = rowShifts[band] * sc;
                const r0 = Math.floor((-st.x - shift - period) / period), r1 = Math.ceil((w - st.x - shift + period) / period);
                for (let r = r0; r <= r1; r++) {
                    idx.forEach((i, p) => {
                        const tw = Math.round(heights[band] * media[i].aspect) * sc;
                        const x = st.x + shift + (r * rw + xs[p]) * sc;
                        if (x + tw < -tw || x > w + tw) return;
                        const key = c + ":" + band + ":" + r + ":" + p;
                        need.add(key);
                        let t = tiles.get(key);
                        if (!t) {
                            const m = media[i];
                            t = document.createElement("button");
                            t.type = "button";
                            t.className = "pg-tile";
                            t.dataset.i = i;
                            t.setAttribute("aria-label", "Open " + m.title + (m.video ? " (video)" : ""));
                            t.append(thumbImg(m));
                            world.append(t);
                            tiles.set(key, t);
                        }
                        t.style.transform = "translate3d(" + Math.round(x - st.x) + "px," + Math.round(y - st.y) + "px,0)";
                        t.style.width = Math.round(tw) + "px";
                        t.style.height = Math.round(rh) + "px";
                    });
                }
            });
        }
        for (const [k, t] of tiles) if (!need.has(k)) {
            stopVideo(t);
            t.remove();
            tiles.delete(k);
        }
        world.style.transform = "translate3d(" + st.x + "px," + st.y + "px,0)";
        syncLater();
    }
    function zoomAt(next, x, y) {
        const old = st.scale;
        st.scale = clamp(next, S.min, S.max);
        const k = st.scale / old;
        st.x = x - (x - st.x) * k;
        st.y = y - (y - st.y) * k;
        queue();
    }
    const frame = dlg.querySelector(".pg-view__media");
    const cap = dlg.querySelector(".pg-view__cap");
    let lastFocus = null;
    function open(i) {
        const m = media[i];
        lastFocus = document.activeElement;
        for (const t of tiles.values()) t.querySelector("video")?.pause();
        let el;
        if (m.video) {
            el = document.createElement("video");
            el.controls = el.loop = el.playsInline = el.autoplay = true;
            el.preload = "metadata";
            el.poster = m.thumb;
        } else {
            el = new Image;
            el.alt = m.title;
            el.decoding = "async";
        }
        el.src = m.full;
        frame.replaceChildren(el);
        cap.textContent = m.title;
        dlg.showModal();
        if (m.video) el.play().catch(() => {});
    }
    function shut() {
        if (dlg.open) dlg.close();
    }
    dlg.addEventListener("close", () => {
        const v = frame.querySelector("video");
        if (v) {
            v.pause();
            v.removeAttribute("src");
            v.load();
        }
        frame.replaceChildren();
        syncLater();
        lastFocus?.focus?.({
            preventScroll: true
        });
    });
    dlg.querySelector(".vdlg__close").addEventListener("click", shut);
    dlg.addEventListener("click", e => {
        if (e.target === dlg) shut();
    });
    stage.addEventListener("pointerdown", e => {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        stage.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, {
            x: e.clientX,
            y: e.clientY
        });
        if (pointers.size === 1) {
            st.moved = false;
            st.sx = e.clientX;
            st.sy = e.clientY;
            st.sel = e.target.closest(".pg-tile")?.dataset.i ?? null;
            stage.classList.add("is-dragging");
        }
        if (pointers.size === 2) {
            const [a, b] = [ ...pointers.values() ];
            st.pinch = {
                d: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
                s: st.scale
            };
            st.moved = true;
        }
    });
    stage.addEventListener("pointermove", e => {
        const prev = pointers.get(e.pointerId);
        if (!prev) return;
        const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
        pointers.set(e.pointerId, {
            x: e.clientX,
            y: e.clientY
        });
        if (pointers.size === 2 && st.pinch) {
            const [a, b] = [ ...pointers.values() ];
            const r = stage.getBoundingClientRect();
            zoomAt(st.pinch.s * Math.hypot(a.x - b.x, a.y - b.y) / st.pinch.d, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
        } else if (pointers.size === 1) {
            st.x += dx;
            st.y += dy;
            if (Math.hypot(e.clientX - st.sx, e.clientY - st.sy) > S.drag) st.moved = true;
            queue();
        }
    });
    const release = e => {
        if (!pointers.has(e.pointerId)) return;
        pointers.delete(e.pointerId);
        if (!pointers.size) {
            stage.classList.remove("is-dragging");
            if (!st.moved && st.sel !== null && e.type === "pointerup") open(+st.sel);
            st.sel = null;
            st.pinch = null;
        } else if (pointers.size === 1) st.pinch = null;
    };
    stage.addEventListener("pointerup", release);
    stage.addEventListener("pointercancel", release);
    stage.addEventListener("click", e => {
        if (e.detail === 0) {
            const t = e.target.closest(".pg-tile");
            if (t) open(+t.dataset.i);
        }
    });
    stage.addEventListener("wheel", e => {
        e.preventDefault();
        if (e.ctrlKey) {
            const r = stage.getBoundingClientRect();
            zoomAt(st.scale * Math.exp(-e.deltaY * .01), e.clientX - r.left, e.clientY - r.top);
            return;
        }
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? stage.clientHeight : 1;
        st.x -= e.deltaX * unit;
        st.y -= e.deltaY * unit;
        queue();
    }, {
        passive: false
    });
    stage.addEventListener("gesturestart", e => {
        e.preventDefault();
        st.gScale = st.scale;
    }, {
        passive: false
    });
    stage.addEventListener("gesturechange", e => {
        e.preventDefault();
        zoomAt(st.gScale * e.scale, stage.clientWidth / 2, stage.clientHeight / 2);
    }, {
        passive: false
    });
    stage.addEventListener("keydown", e => {
        const k = S.key, cx = stage.clientWidth / 2, cy = stage.clientHeight / 2;
        if (e.key === "ArrowLeft") st.x += k; else if (e.key === "ArrowRight") st.x -= k; else if (e.key === "ArrowUp") st.y += k; else if (e.key === "ArrowDown") st.y -= k; else if (e.key === "+" || e.key === "=") return e.preventDefault(), 
        zoomAt(st.scale * S.zoom, cx, cy); else if (e.key === "-") return e.preventDefault(), 
        zoomAt(st.scale / S.zoom, cx, cy); else return;
        e.preventDefault();
        queue();
    });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) for (const t of tiles.values()) t.querySelector("video")?.pause(); else syncLater();
    });
    const intro = document.querySelector(".pg__intro");
    let idle = null;
    const showIntro = () => {
        if (!dlg.open) intro?.classList.remove("is-gone");
    };
    const wake = hide => {
        if (hide) intro?.classList.add("is-gone");
        clearTimeout(idle);
        idle = setTimeout(showIntro, 6e3);
    };
    [ "wheel", "pointerdown", "keydown", "touchstart", "gesturestart" ].forEach(ev => stage.addEventListener(ev, () => wake(true), {
        passive: true
    }));
    stage.addEventListener("pointermove", () => {
        if (intro?.classList.contains("is-gone")) wake(false);
    }, {
        passive: true
    });
    dlg.addEventListener("close", () => wake(false));
    new ResizeObserver(queue).observe(stage);
    render();
})();
