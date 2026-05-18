import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lumus | Tu película",
  description: "El resultado de tu búsqueda de película",
};

export default function MovieLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
