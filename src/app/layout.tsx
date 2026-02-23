import type { Metadata } from "next";
import "./globals.css";
import Chatbot from "./components/Chatbot";
import Background3DWrapper from "./components/Background3DWrapper";

export const metadata: Metadata = {
  title: "Berthoni Passo — Data Engineer & ML Specialist",
  description: "Portfolio professionnel de Berthoni Passo : projets IoT, Machine Learning, Data Engineering, et plus encore.",
  keywords: ["Data Engineer", "Machine Learning", "IoT", "AWS", "Oracle", "Portfolio"],
  openGraph: {
    title: "Berthoni Passo — Portfolio",
    description: "Data Engineer & ML Specialist",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Background3DWrapper />
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
