const CACHE_NAME = "two-cities-russia-v1";

const FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.svg"
];


/* ==============================
   УСТАНОВКА
============================== */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches.open(CACHE_NAME)
                .then(cache => {

                    return cache.addAll(
                        FILES
                    );

                })

        );

        self.skipWaiting();
    }
);


/* ==============================
   АКТИВАЦИЯ
============================== */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
                .then(names => {

                    return Promise.all(

                        names
                            .filter(
                                name =>
                                    name !==
                                    CACHE_NAME
                            )
                            .map(
                                name =>
                                    caches.delete(
                                        name
                                    )
                            )

                    );

                })

        );

        self.clients.claim();
    }
);


/* ==============================
   ЗАПРОСЫ
============================== */

self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches.match(
                event.request
            )
            .then(cached => {

                if (cached) {

                    return cached;
                }

                return fetch(
                    event.request
                )
                .then(response => {

                    if (
                        !response ||
                        response.status !== 200
                    ) {

                        return response;
                    }

                    const copy =
                        response.clone();

                    caches.open(
                        CACHE_NAME
                    )
                    .then(cache => {

                        cache.put(
                            event.request,
                            copy
                        );

                    });

                    return response;

                })
                .catch(() => {

                    return caches.match(
                        "./index.html"
                    );

                });

            })

        );
    }
); 