// ============================================================
// O.J.V. — Service Worker
// Recebe notificações push e mostra ao utilizador
// ============================================================

self.addEventListener("install", function(event) {
  console.log("[SW] Instalado");
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  console.log("[SW] Ativado");
  event.waitUntil(self.clients.claim());
});

// Recebe a notificação push do servidor
self.addEventListener("push", function(event) {
  console.log("[SW] Push recebido");
  
  let dados = {
    titulo: "O.J.V.",
    mensagem: "Nova notificação",
    link: "/"
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      dados.titulo = payload.titulo || dados.titulo;
      dados.mensagem = payload.mensagem || payload.body || dados.mensagem;
      dados.link = payload.link || dados.link;
    } catch (e) {
      dados.mensagem = event.data.text();
    }
  }
  
  const opcoes = {
    body: dados.mensagem,
    icon: "logo.png",
    badge: "logo.png",
    vibrate: [200, 100, 200],
    tag: "ojv-notif",
    renotify: true,
    data: { link: dados.link },
    actions: [
      { action: "abrir", title: "Abrir" },
      { action: "fechar", title: "Fechar" }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(dados.titulo, opcoes)
  );
});

// Quando o utilizador clica na notificação
self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  
  if (event.action === "fechar") return;
  
  const link = (event.notification.data && event.notification.data.link) || "/";
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(clientList) {
      // Se já tiver uma aba aberta, foca nela
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      // Senão, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow(link);
      }
    })
  );
});