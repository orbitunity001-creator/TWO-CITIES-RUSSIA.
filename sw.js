const CACHE = "avia-ai-v1";

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

        event.waitUntil(

            caches
                .open(CACHE)
                .then(
                    cache =>
                        cache.addAll(FILES)
                )

        );

        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(keys =>

                    Promise.all(

                        keys
                            .filter(
                                key =>
                                    key !== CACHE
                            )
                            .map(
                                key =>
                                    caches.delete(key)
                            )

                    )

                )

        );

        self.clients.claim();

    }
);


self.addEventListener(
    "fetch",
    event => {

        /*
         * API никогда не берём
         * из старого кэша.
         */

        if(
            new URL(
                event.request.url
            ).pathname.startsWith("/api/")
        ){
            return;
        }


        event.respondWith(

            caches
                .match(event.request)
                .then(cached => {

                    if(cached){
                        return cached;
                    }

                    return fetch(
                        event.request
                    );

                })

        );

    }
);