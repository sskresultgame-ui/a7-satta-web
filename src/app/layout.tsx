
// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

// import { Header } from "@/components/layout/Header";
// import { Footer } from "@/components/layout/Footer";
// import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
// import { LanguageProvider } from "@/context/LanguageContext";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export async function generateMetadata(): Promise<Metadata> {
//   const today = new Date();

//   const formattedDate = today.toLocaleDateString("en-GB", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//     timeZone: "Asia/Kolkata",
//   });

//   const description = `Check the latest ${formattedDate} A7 Satta King Result with live updates, Satta Matka results, old charts, previous winning numbers, and daily updated results of all popular games.`;

//   return {
//     title: {
//       default: `${formattedDate} A7 Satta Result | Live A7 Satta | Gali Desawar Faridabad Ghaziabad`,
//       // default:
//       //   "A7 Satta | Live A7 Satta Result 2026 | Gali Desawar Faridabad Ghaziabad",
//       template: "%s | A7 Satta",
//     },

//     description,

//     verification: {
//       google: "iwfZBGPCqdL74ht1H9V0bVgdfHVKvW-qXETMj6c7_Uk",
//     },

//     keywords: [
//       "a7 satta",
//       "a7satta",
//       "satta king",
//       "satta king result",
//       "today satta king result",
//       "today satta result",
//       "live satta result",
//       "satta matka",
//       "satta matka result",
//       "gali result",
//       "desawar result",
//       "faridabad result",
//       "ghaziabad result",
//       "shri ganesh result",
//       "delhi bazar result",
//       "old satta chart",
//       "satta chart",
//       "monthly chart",
//       "winning numbers",
//       "2026 satta result",
//     ],

//     openGraph: {
//       type: "website",
//       locale: "en_IN",
//       url: "https://a7satta.co",
//       siteName: "A7 Satta",

//       title: `A7 Satta | ${formattedDate} Live Satta King Result`,

//       description,

//       images: [
//         {
//           url: "/og-image.jpg",
//           width: 1200,
//           height: 630,
//           alt: "A7 Satta",
//         },
//       ],
//     },

//     twitter: {
//       card: "summary_large_image",
//       title: `A7 Satta | ${formattedDate} Live Satta King Result`,
//       description,
//       images: ["/og-image.jpg"],
//     },

//     robots: {
//       index: true,
//       follow: true,
//       googleBot: {
//         index: true,
//         follow: true,
//         "max-image-preview": "large",
//         "max-snippet": -1,
//         "max-video-preview": -1,
//       },
//     },

//     alternates: {
//       canonical: "https://a7satta.co",
//     },

//     metadataBase: new URL("https://a7satta.co"),
//   };
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html
//       lang="en"
//       className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
//     >
//       <body className="min-h-full flex flex-col">
//         <LanguageProvider>
//           <Header />

//           <main className="flex-1">{children}</main>

//           {/* <Footer /> */}
//           <WhatsAppButton />
//         </LanguageProvider>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Schema.org JSON-LD
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.a7satta.co/#website",
      url: "https://www.a7satta.co/",
      name: "A7 Satta",
      description:
        "A7 Satta provides Satta King result information, charts and previous result records.",
      inLanguage: "en-IN",
      publisher: {
        "@id": "https://www.a7satta.co/#organization",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://www.a7satta.co/#organization",
      name: "A7 Satta",
      url: "https://www.a7satta.co/",
    },
    {
      "@type": "WebPage",
      "@id": "https://www.a7satta.co/#webpage",
      url: "https://www.a7satta.co/",
      name: "A7 Satta Result Today | Satta King Chart & Updates",
      description:
        "Check A7 Satta result information, Satta King charts, Gali, Disawar, Delhi Bazar, Faridabad and other market result updates.",
      isPartOf: {
        "@id": "https://www.a7satta.co/#website",
      },
      publisher: {
        "@id": "https://www.a7satta.co/#organization",
      },
      breadcrumb: {
        "@id": "https://www.a7satta.co/#breadcrumb",
      },
      inLanguage: "en-IN",
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.a7satta.co/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.a7satta.co/",
        },
      ],
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const description = `Check the latest ${formattedDate} A7 Satta King Result with live updates, Satta Matka results, old charts, previous winning numbers, and daily updated results of all popular games.`;

  return {
    title: {
      default: `${formattedDate} A7 Satta Result | Live A7 Satta | Gali Desawar Faridabad Ghaziabad`,
      template: "%s | A7 Satta",
    },

    description,

    verification: {
      google: "iwfZBGPCqdL74ht1H9V0bVgdfHVKvW-qXETMj6c7_Uk",
    },

    keywords: [
      "a7 satta",
      "a7satta",
      "satta king",
      "satta king result",
      "today satta king result",
      "today satta result",
      "live satta result",
      "satta matka",
      "satta matka result",
      "gali result",
      "desawar result",
      "faridabad result",
      "ghaziabad result",
      "shri ganesh result",
      "delhi bazar result",
      "old satta chart",
      "satta chart",
      "monthly chart",
      "winning numbers",
      "2026 satta result",
    ],

    openGraph: {
      type: "website",
      locale: "en_IN",
      url: "https://a7satta.co",
      siteName: "A7 Satta",

      title: `A7 Satta | ${formattedDate} Live Satta King Result`,

      description,

      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "A7 Satta",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `A7 Satta | ${formattedDate} Live Satta King Result`,
      description,
      images: ["/og-image.jpg"],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    alternates: {
      canonical: "https://www.a7satta.co",
    },

    metadataBase: new URL("https://a7satta.co"),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>

      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <Header />

          <main className="flex-1">{children}</main>

          {/* <Footer /> */}

          <WhatsAppButton />
        </LanguageProvider>
      </body>
    </html>
  );
}