// =====================================
// MOBILE MENU
// =====================================

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

menuToggle.addEventListener("click", () => {
    setMenu(!navLinks.classList.contains("open"));
});

navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
});

// =====================================
// ACTIVE NAV LINK WHILE SCROLLING
// =====================================

const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = [...sectionLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                sectionLinks.forEach((link) => {
                    link.classList.toggle(
                        "active",
                        link.getAttribute("href") === "#" + entry.target.id
                    );
                });
            });
        },
        { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => navObserver.observe(section));
}

// =====================================
// ACHIEVEMENT COUNTER (78% counts up once)
// =====================================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";

    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const counterObserver = new IntersectionObserver(
        (entries, observer) => {
            if (!entries[0].isIntersecting) return;
            observer.disconnect();

            const duration = 1200;
            const start = performance.now();

            function tick(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        },
        { threshold: 0.6 }
    );
    counterObserver.observe(el);
});

// =====================================
// MAPBOX
// =====================================

// Paste a NEW public token (pk...) here, then restrict it to your website's
// URL in the Mapbox dashboard (Account > Tokens > URL restrictions).
const MAPBOX_TOKEN = "YOUR_NEW_RESTRICTED_MAPBOX_TOKEN";

// Change these coordinates [longitude, latitude] to your city if you want a precise pin.
const locations = {
    southAfrica: {
        center: [25.6, -33.9],
        zoom: 5,
        caption: "South Africa · Open to opportunities nationwide."
    },
    global: {
        center: [20, 0],
        zoom: 1.5,
        caption: "Global outlook · Open to international and remote opportunities."
    }
};

const mapElement = document.getElementById("portfolio-map");
const mapCaption = document.getElementById("map-caption");
const mapTabs = document.querySelectorAll(".map-tab");

function showMapFallback() {
    mapElement.removeAttribute("role");
    mapElement.innerHTML =
        '<p style="padding:24px;color:#b4b2c5">The interactive map is unavailable right now. ' +
        "I'm based in South Africa and open to opportunities worldwide.</p>";
}

if (typeof mapboxgl === "undefined" || MAPBOX_TOKEN.startsWith("YOUR_")) {
    showMapFallback();
} else {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
        container: "portfolio-map",
        style: "mapbox://styles/mapbox/dark-v11",
        center: locations.southAfrica.center,
        zoom: locations.southAfrica.zoom,
        scrollZoom: false // stops the map hijacking page scrolling
    });

    map.on("error", showMapFallback);
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    new mapboxgl.Marker({ color: "#a78bfa" })
        .setLngLat(locations.southAfrica.center)
        .setPopup(
            new mapboxgl.Popup().setHTML(
                "<strong>South Africa</strong><br>Open to opportunities."
            )
        )
        .addTo(map);

    mapTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const destination =
                tab.dataset.map === "world" ? locations.global : locations.southAfrica;

            map.flyTo({
                center: destination.center,
                zoom: destination.zoom,
                essential: true
            });

            mapCaption.textContent = destination.caption;
            mapTabs.forEach((item) => item.classList.remove("active"));
            tab.classList.add("active");
        });
    });
}
