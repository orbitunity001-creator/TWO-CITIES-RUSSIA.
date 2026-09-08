const CACHE_NAME = "avia-v1";

const FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./sw.js",
    "./icon.png"
];


self.addEventListener(
    "install",
    event => {

        self.skipWaiting();

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(cache => {

                    return cache.addAll(
                        FILES
                    );

                })

        );

    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(keys => {

                    return Promise.all(

                        keys.map(key => {

                            if (
                                key !==
                                CACHE_NAME
                            ) {

                                return caches.delete(
                                    key
                                );

                            }

                        })

                    );

                })
                .then(() => {

                    return self.clients.claim();

                })

        );

    }
);


self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !==
            "GET"
        ) {
            return;
        }

        event.respondWith(

            fetch(event.request)

                .then(response => {

                    if (
                        response &&
                        response.ok
                    ) {

                        const copy =
                            response.clone();

                        caches
                            .open(CACHE_NAME)
                            .then(cache => {

                                cache.put(
                                    event.request,
                                    copy
                                );

                            });

                    }

                    return response;

                })

                .catch(() => {

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);