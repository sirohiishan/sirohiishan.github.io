(function() {
    const ms = (n, cls) => '<span class="ms' + (cls ? " " + cls : "") + '" aria-hidden="true">' + n + "</span>";
    const status = dark => '<div class="phone__status' + (dark ? " md-status--dark" : "") + '"><span>9:41</span><span class="phone__notch"></span><span>' + ms("signal_cellular_alt") + ms("battery_full") + "</span></div>";
    const bar = title => '<div class="md-bar">' + ms("arrow_back") + "<b>" + title + "</b></div>";
    const steps = n => '<div class="md-steps">' + [ "Upload", "Read", "Review" ].map((s, i) => '<span class="' + (i < n ? "on" : "") + '"><i>' + (i + 1 < n ? ms("check") : i + 1) + "</i>" + s + "</span>").join("") + "</div>";
    const pill = c => '<span class="md-pill">' + ms("medication") + "</span>";
    const meds = [ {
        n: "Livora 5 mg",
        d: "1 tablet",
        t: "8:30 am",
        w: "Before breakfast",
        days: "10 days"
    }, {
        n: "Vitamin D3",
        d: "1 capsule",
        t: "1:30 pm",
        w: "After lunch",
        days: "8 weeks"
    } ];
    const doc = '<div class="md-doc" aria-hidden="true"><i class="w60"></i><i class="w40"></i><i class="gap"></i>' + '<i class="w80"></i><i class="w70"></i><i class="w50"></i><i class="gap"></i><i class="w80"></i><i class="w60"></i><span class="md-doc__sig"></span></div>';
    const found = '<div class="md-found"><div class="md-note">' + ms("auto_awesome") + "Read automatically. Check it against your prescription.</div>" + '<small class="md-label">Medicines found</small>' + meds.map(m => '<div class="md-row">' + pill() + "<span><b>" + m.n + "</b><small>" + m.d + " · " + m.w.toLowerCase() + "</small></span></div>").join("") + "</div>";
    const card = (m, i, missing) => '<div class="md-card">' + '<div class="md-card__top">' + pill() + "<span><b>" + m.n + "</b><small>" + m.d + '</small></span><em data-k="edit' + i + '">Edit</em></div>' + '<div class="md-card__grid"><span><small>Starts</small>Today</span><span><small>For</small>' + m.days + "</span></div>" + (missing ? '<div class="md-missing" data-k="add">' + ms("schedule") + "<span>Add a time<small>Not on the prescription</small></span>" + ms("add") + "</div>" : '<div class="md-time"><b>' + m.t + "</b><span>" + m.w + "</span></div>") + "</div>";
    const today = state => {
        const m = meds[0];
        const foot = {
            0: '<div class="md-acts"><span data-k="skip">Skip</span><span data-k="snooze">Later</span><span class="md-acts__main" data-k="taken">Taken</span></div>',
            1: '<div class="md-state md-state--ok">' + ms("check_circle", "fill") + '<span>Taken<small>Today at 8:31 am</small></span><em data-k="undo">' + ms("undo") + "Undo</em></div>",
            2: '<div class="md-state md-state--wait">' + ms("snooze") + '<span>Snoozed<small>Next at 9:00 am</small></span><em class="md-state__btn" data-k="taken">Taken</em></div>',
            3: '<div class="md-state md-state--skip">' + ms("cancel", "fill") + '<span>Skipped<small>Today at 8:31 am</small></span><em data-k="undo">' + ms("undo") + "Undo</em></div>"
        }[state || 0];
        return '<div class="md-today"><div class="md-today__top">' + pill() + "<span><b>" + m.n + "</b><small>" + m.d + '</small></span><span class="r"><b>' + m.t + "</b><small>" + m.w + "</small></span></div>" + foot + "</div>";
    };
    const homeBlocks = '<div class="md-block"><span class="md-block__i">' + ms("folder_open") + "</span><span><b>Health records</b><small>Reports, prescriptions and visits</small></span></div>" + '<div class="md-block"><span class="md-block__i">' + ms("upload_file") + "</span><span><b>Add a record</b><small>Photo or file</small></span></div>";
    const tabs = '<div class="md-tabs"><span class="on">' + ms("home", "fill") + "Home</span><span>" + ms("folder") + "Records</span><span>" + ms("medication") + "Medicines</span><span>" + ms("person") + "Profile</span></div>";
    window.MedScreens = {
        upload: () => status() + '<div class="md">' + bar("Add a prescription") + steps(1) + '<div class="md-body">' + doc + '<p class="md-hint">Prescription photo</p></div>' + '<div class="md-foot"><div class="md-btn" data-k="read">Read prescription</div></div></div>',
        read: () => status() + '<div class="md">' + bar("Add a prescription") + steps(3) + '<div class="md-body">' + found + "</div>" + '<div class="md-foot"><div class="md-btn" data-k="done">Save prescription</div></div></div>',
        nudge: () => status() + '<div class="md">' + bar("Add a prescription") + steps(3) + '<div class="md-body">' + found + "</div>" + '<div class="md-dim"></div><div class="md-sheet"><span class="md-sheet__i">' + ms("notifications") + "</span>" + "<strong>Set reminders for these medicines?</strong><p>Your prescription has 2 medicines. The times are already filled in.</p>" + '<div class="md-btn" data-k="set">Set up reminders</div><div class="md-link">Maybe later</div></div></div>',
        prefill: a => status() + '<div class="md">' + bar("New reminders") + '<div class="md-body md-body--list">' + card(meds[0], 1) + card(meds[1], 2, !a) + "</div>" + '<div class="md-foot"><div class="md-btn' + (a ? "" : " md-btn--off") + '" data-k="create">Create 2 reminders</div></div></div>',
        home: a => status() + '<div class="md md--home"><div class="md-hello"><small>Good morning</small><b>Hi Riya</b></div>' + '<div class="md-sec"><b>Today\'s medicines</b><span>See all</span></div>' + today(a) + '<div class="md-sec"><b>Your health</b></div>' + homeBlocks + tabs + "</div>",
        call: () => status(true) + '<div class="md-call"><span class="md-call__chip">8:30 am · Before breakfast</span>' + '<div class="md-call__who"><span class="md-pill md-pill--lg">' + ms("medication") + "</span><b>Livora 5 mg</b><small>1 tablet</small></div>" + '<div class="md-call__acts"><span>' + ms("snooze") + "<small>Snooze</small></span><span>" + ms("close") + "<small>Skip</small></span></div>" + '<div class="md-call__swipe" data-k="swipe"><i>' + ms("chevron_right") + "</i>Swipe to mark as taken</div></div>",
        remind: () => status() + '<div class="md md-rem">' + bar("Reminder") + '<div class="md-rem__body"><span class="md-call__chip md-rem__chip">' + ms("schedule") + "8:30 am · Before breakfast</span>" + '<span class="md-pill md-rem__pill">' + ms("medication") + "</span><b>Livora 5 mg</b><small>1 tablet</small></div>" + '<div class="md-rem__acts"><div class="md-btn" data-k="taken">' + ms("check") + "Mark as taken</div>" + '<div class="md-rem__two"><span data-k="snooze">' + ms("snooze") + 'Snooze</span><span data-k="skip">' + ms("close") + "Skip</span></div></div></div>"
    };
    document.querySelectorAll("[data-med]").forEach(el => {
        const f = window.MedScreens[el.dataset.med];
        if (f) el.innerHTML = '<div class="phone__screen">' + f(el.dataset.a ? +el.dataset.a : undefined) + "</div>";
    });
})();
