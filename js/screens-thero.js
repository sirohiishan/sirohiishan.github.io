(function() {
    const W = 1320, H = 2868;
    const spot = (k, x, y, w, h) => '<i class="tshot__k" data-k="' + k + '" style="left:' + (x - w / 2) / W * 100 + "%;top:" + (y - h / 2) / H * 100 + "%;width:" + w / W * 100 + "%;height:" + h / H * 100 + '%"></i>';
    const fab = spot("add", 1140, 2646, 190, 190);
    const menu = spot("menu", 78, 284, 110, 90);
    const row = n => spot("row" + n, 170, 1510 + 237 * (n - 1), 90, 90);
    const shot = (file, alt, spots) => '<div class="tshot"><img src="assets/img/thero/walk/' + file + '.jpg" alt="' + alt + '">' + (spots || "") + "</div>";
    window.TheroScreens = {
        start: () => shot("start", "Get started screen", spot("go", 660, 2556, 1180, 120)),
        name: () => shot("name", "Name screen, optional and stored on the device", spot("go", 648, 1430, 1180, 120)),
        tutAdd: () => shot("tut-add", "Tutorial step one, pointing at the add button", spot("go", 642, 2233, 1050, 110)),
        tutRank: () => shot("tut-rank", "Tutorial step on priority: lower numbers come first", spot("go", 900, 1116, 500, 110)),
        empty: () => shot("empty", "Empty task list", fab),
        home3: () => shot("home3", "Today's list with three tasks", fab + menu),
        pick: () => shot("pick", "Priority wheel set to 3 for the new task", spot("done", 1160, 2090, 200, 100)),
        chips: () => shot("chips", "Add a task with date, time and priority chips", spot("save", 1168, 1310, 160, 160)),
        home4: () => shot("home4", "Today's list with four tasks, the new one at priority 3", fab + menu + row(1)),
        tick: () => shot("tick", "First task ticked, its check turning blue", row(1)),
        ticked: () => shot("ticked", "The done task moved under the open ones, struck through", menu),
        notify: () => shot("notify", "Reminder banner for the design review call", spot("banner", 660, 336, 1200, 180)),
        notifyMenu: () => shot("notify-menu", "Reminder actions: mark as complete or remind later", spot("complete", 575, 575, 700, 90)),
        notified: () => shot("notified", "The reminded task marked done from the notification"),
        widgets: () => shot("widgets", "Medium and small home screen widgets with today's four tasks", spot("tick", 707, 357, 70, 70)),
        widgetsTick: () => shot("widgets-tick", "First task ticked from the widget"),
        menu: () => shot("menu", "Side menu with My Month, My Tasks and Settings", spot("month", 190, 471, 300, 90)),
        month: () => shot("month", "My Month with a productivity score", spot("back", 108, 275, 90, 90)),
        calendar: () => shot("calendar", "Calendar with a dot for each day")
    };
})();
