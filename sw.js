const CACHE = "avia-v6";

const FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.svg",
    "./sw.js"
];


self.addEventListener(
    "install",
    event => {

        self.skipWaiting();

        event.waitUntil(

            caches
                .open(CACHE)
                .then(cache => {

                    return cache.addAll(FILES);

                })

        );

    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys().then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if (key !== CACHE) {

                            return caches.delete(key);

                        }

                    })

                );

            }).then(() => {

                return self.clients.claim();

            })

        );

    }
);


self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !== "GET"
        ) {
            return;
        }


        event.respondWith(

            fetch(event.request)

                .catch(() => {

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);