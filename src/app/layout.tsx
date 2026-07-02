import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted via next/font/local, no network calls at build or runtime.
// Files are pulled straight from the installed @fontsource packages (real,
// independently-published open-source typefaces — SIL Open Font License 1.1
// for all three, redistribution-safe) rather than a system-font substitute.
// Only the static weights actually used in the app (font-normal/medium/
// semibold) are loaded — no unused weight files shipped.
//
// Fraunces: a display serif with real presence at large sizes (soft/wonk
// detailing, built for headline/editorial use) — not a book-serif substitute
// like Times. Used for headings and the hero balance figure.
const fontDisplay = localFont({
  src: "../../node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff2",
  weight: "600",
  style: "normal",
  variable: "--font-display",
  display: "swap",
});

// Space Grotesk: geometric/grotesk sans with distinctive character (squared
// apertures, Space Mono lineage) for body and UI text — not Inter/Roboto.
const fontSans = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

// JetBrains Mono: real tabular-figure mono face for treasury numerics.
const fontNumeric = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-numeric-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Veil — Treasury",
  description: "Private team treasury and payroll, built on Miden.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark h-full antialiased ${fontDisplay.variable} ${fontSans.variable} ${fontNumeric.variable}`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
