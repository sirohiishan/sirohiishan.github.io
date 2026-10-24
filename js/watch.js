(function() {
    const projects = {
        attendance: {
            title: "Geotagged attendance",
            page: "case-attendance.html"
        },
        neighbourhood: {
            title: "Neighbourhood app",
            page: "case-neighbourhood.html"
        },
        thero: {
            title: "Thero",
            page: "case-thero.html"
        },
        rider: {
            title: "After the ride",
            page: "case-rider.html"
        },
        medicine: {
            title: "Medicine reminders",
            page: "case-medicine.html"
        }
    };
    const params = new URLSearchParams(location.search);
    const id = params.get("project");
    const project = Object.hasOwn(projects, id) ? projects[id] : null;
    const screen = document.getElementById("video-screen");
    const status = document.getElementById("video-status");
    if (!project) {
        document.getElementById("video-back").lastChild.textContent = "Back to work";
        if (id) {
            document.title = "Video not found | Ishan Sirohi";
            screen.querySelector("h2").textContent = "Video not found";
            status.textContent = "Choose one of the project videos above.";
        }
        return;
    }
    document.title = project.title + " | Project video | Ishan Sirohi";
    const from = params.get("from");
    document.getElementById("video-back").href = project.page + (from === "home" || from === "work" ? "?from=" + from : "");
    const video = document.createElement("video");
    video.controls = true;
    video.autoplay = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", project.title + " project video");
    video.poster = "assets/video/" + id + "-case-poster.jpg";
    video.src = "assets/video/" + id + "-case.mp4";
    const track = document.createElement("track");
    track.kind = "captions";
    track.srclang = "en";
    track.label = "English";
    track.src = "assets/video/" + id + "-case.en.vtt";
    track.default = false;
    video.appendChild(track);
    screen.replaceChildren(video);
    track.track.mode = "disabled";
    track.addEventListener("error", () => {
        status.textContent = "Captions could not load. Try refreshing the page.";
    });
    video.addEventListener("error", () => {
        status.textContent = "The video could not load. Please try refreshing the page.";
    });
    video.play().catch(() => {});
    video.addEventListener("play", () => {
        status.textContent = "";
    });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) video.pause();
    });
    window.addEventListener("pagehide", () => video.pause());
})();
