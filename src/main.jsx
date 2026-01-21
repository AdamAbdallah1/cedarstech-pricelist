import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const params = new URLSearchParams(window.location.search);
const redirect = params.get("redirect");

if (redirect) {
  window.history.replaceState(null, "", "/cedarstech-pricelist" + redirect);
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter basename="/cedarstech-pricelist">
    <App />
  </BrowserRouter>
);
