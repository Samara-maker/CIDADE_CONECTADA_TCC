import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";

const idGoogle = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

const aplicacao = (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {idGoogle ? <GoogleOAuthProvider clientId={idGoogle}>{aplicacao}</GoogleOAuthProvider> : aplicacao}
  </React.StrictMode>
);

// Registra o service worker para o sistema poder ser instalado como aplicativo
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
