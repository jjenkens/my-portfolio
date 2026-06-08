(function () {
    const script = document.querySelector('script[src$="js/includes.js"]');
    const siteRoot = script ? new URL("../", script.src) : new URL("./", window.location.href);

    const toUrl = (path) => new URL(path, siteRoot).href;

    const includePartials = async () => {
        const targets = Array.from(document.querySelectorAll("[data-include]"));

        await Promise.all(targets.map(async (target) => {
            const response = await fetch(toUrl(target.dataset.include));
            if (!response.ok) {
                throw new Error(`Unable to load ${target.dataset.include}`);
            }

            const headerClass = target.dataset.headerClass || "";
            const html = (await response.text())
                .replaceAll("{{ROOT}}", siteRoot.href)
                .replaceAll("{{HEADER_CLASS}}", headerClass);

            target.outerHTML = html;
        }));
    };

    const loadScript = (path) => new Promise((resolve, reject) => {
        const element = document.createElement("script");
        element.src = toUrl(path);
        element.onload = resolve;
        element.onerror = reject;
        document.body.appendChild(element);
    });

    const loadForty = async () => {
        const scripts = [
            "assets/js/jquery.min.js",
            "assets/js/jquery.scrolly.min.js",
            "assets/js/jquery.scrollex.min.js",
            "assets/js/browser.min.js",
            "assets/js/breakpoints.min.js",
            "assets/js/util.js",
            "assets/js/main.js"
        ];

        for (const path of scripts) {
            await loadScript(path);
        }
    };

    includePartials()
        .then(loadForty)
        .then(() => {
            window.dispatchEvent(new Event("load"));
            document.body.classList.remove("is-preload");
        })
        .catch((error) => {
            console.error(error);
        });
})();
