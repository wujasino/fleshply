import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { LocaleProvider } from './lib/locale';
import { ThemeProvider } from 'next-themes';

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="bb_theme">
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </ThemeProvider>
);
