self.addEventListener("install",e=>{
e.waitUntil(
caches.open("app").then(c=>{
return c.addAll(["index.html","app.js"]);
})
);
});

self.addEventListener("fetch",e=>{
e.respondWith(
caches.match(e.request).then(r=>r||fetch(e.request))
);
});