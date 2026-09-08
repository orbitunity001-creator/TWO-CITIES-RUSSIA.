const CACHE_NAME = "avia-phone-v1";

const FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.svg",
    "./sw.js"
];


self.addEventListener("install", function(event){

    event.waitUntil(

        caches
            .open(CACHE_NAME)
            .then(function(cache){

                return cache.addAll(FILES);

            })

    );

    self.skipWaiting();

});


self.addEventListener("activate", function(event){

    event.waitUntil(

        caches
            .keys()
            .then(function(keys){

                return Promise.all(

                    keys
                        .filter(function(key){

                            return key !== CACHE_NAME;

                        })
                        .map(function(key){

                            return caches.delete(key);

                        })

                );

            })

    );

    self.clients.claim();

});


self.addEventListener("fetch", function(event){

    event.respondWith(

        caches
            .match(event.request)
            .then(function(cached){

                if(cached){

                    return cached;

                }

                return fetch(event.request);

            })

    );

});