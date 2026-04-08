import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yoshi x Boletomovil — Prototipo Interactivo",
  description:
    "Demo visual de los principales recorridos: checkout, marketplace, QR/canje y delivery a asiento.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
