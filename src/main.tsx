import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { LocaleProvider } from './lib/locale';
import { ThemeProvider } from 'next-themes';

// Self-XSS protection
if (typeof console !== 'undefined') {
  const stop = [
    '%cSTOP!',
    'color:#FF0000;font-size:48px;font-weight:bold;-webkit-text-stroke:2px black',
  ];
  const warn = [
    '%cTo jest funkcja przeglądarki przeznaczona dla deweloperów.\nJeśli ktoś kazał Ci tu coś wkleić, aby uzyskać dostęp do Twojego konta — jest to atak (Self-XSS).\nNIE wklejaj żadnego kodu.',
    'font-size:14px;color:#333;',
  ];
  // eslint-disable-next-line no-console
  console.log(...stop);
  // eslint-disable-next-line no-console
  console.log(...warn);
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="bb_theme">
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </ThemeProvider>
);
