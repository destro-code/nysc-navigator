import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { RuntimeErrorBoundary } from "./components/RuntimeErrorBoundary";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  document.body.innerHTML = '<div style="padding:24px;font-family:system-ui">NYSC Navigator could not find the application root.</div>';
  throw new Error("Missing #root element");
}

createRoot(root).render(
  <RuntimeErrorBoundary>
    <App />
  </RuntimeErrorBoundary>,
);
