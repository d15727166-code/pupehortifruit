import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "HortaFresh — Gestão de Verduras",
  description: "Controle de compras, vendas, gastos e fechamento semanal para feirantes e distribuidores de verduras.",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1B4332",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, background: "#F8FAF5" }}>
        {children}
      </body>
    </html>
  );
}
