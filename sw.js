const CACHE = "avia-v4";

const FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./sw.js"
];

self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE)
            .then(cache => cache.addAll(FILES))
    );

});


self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys =>

            Promise.all(
                keys.map(key => {

                    if (key !== CACHE) {
                        return caches.delete(key);
                    }

                })
            )

        ).then(() => self.clients.claim())

    );

});


self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .catch(() => caches.match(event.request))

    );

});