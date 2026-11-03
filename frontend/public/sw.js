// Service worker simples: guarda o "casco" do app para abrir rápido e
// mostrar uma página de aviso quando não houver internet.
const CACHE = "cidade-conectada-v1";
const ARQUIVOS = ["/", "/manifest.webmanifest", "/icones/icone-192.png", "/icones/icone-512.png"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  const req = evento.request;
  const url = new URL(req.url);

  // API, uploads e métodos que alteram dados sempre vão direto para a rede
  if (req.method !== "GET" || url.pathname.startsWith("/api") || url.pathname.startsWith("/uploads") || url.port === "3000") {
    return;
  }

  // Navegação: tenta a rede e, sem internet, usa a página guardada
  if (req.mode === "navigate") {
    evento.respondWith(fetch(req).catch(() => caches.match("/")));
    return;
  }

  // Demais arquivos: usa o cache e atualiza em segundo plano
  evento.respondWith(
    caches.match(req).then((guardado) => {
      const rede = fetch(req)
        .then((resp) => {
          if (resp.ok && url.origin === self.location.origin) {
            const copia = resp.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copia));
          }
          return resp;
        })
        .catch(() => guardado);
      return guardado || rede;
    })
  );
});
