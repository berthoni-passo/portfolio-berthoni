import type { Metadata } from "next";
import "./globals.css";
import Chatbot from "./components/Chatbot";
import Background3DWrapper from "./components/Background3DWrapper";

export const metadata: Metadata = {
  title: "Berthoni Passo | Data Engineer & Architecte IA",
  description: "Portfolio de Berthoni Passo, Ingénieur Data & IA doublement certifié Microsoft Fabric & Power BI. Solutions Cloud, ETL, Dashboards & Machine Learning.",
  keywords: ["Berthoni Passo", "Data Engineer Paris", "Data Analyst", "Machine Learning", "Microsoft Fabric", "Power BI", "IoT", "AWS", "Oracle 23ai", "Portfolio"],
  authors: [{ name: "Berthoni Passo", url: "https://berthoni-passo.com" }],
  creator: "Berthoni Passo",
  openGraph: {
    title: "Berthoni Passo | Data Engineer & Architecte IA",
    description: "Découvrez mes projets en Data Engineering, Machine Learning, et Cloud (AWS/Oracle). Ingénieur certifié Microsoft Fabric.",
    url: "https://berthoni-passo.com",
    siteName: "Portfolio Berthoni Passo",
    images: [
      {
        url: "/img/berthoni_thinking.png.jpeg",
        width: 1200,
        height: 630,
        alt: "Berthoni Passo - Data Engineer & AI Specialist",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Berthoni Passo | Data Engineer & Architecte IA",
    description: "Ingénieur Data & IA certifié. Solutions Cloud, ETL, Dashboards & Machine Learning.",
    images: ["/img/berthoni_thinking.png.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
