import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const metadata: Metadata = {
  title: {
    template: "%s | UniSync",
    default: "Blog sinh viên & định hướng đại học | UniSync",
  },
  description:
    "UniSync là nền tảng chia sẻ thông tin về trường đại học, ngành học, định hướng nghề nghiệp và đời sống sinh viên tại TP.HCM.",
  keywords: [
    "unisync",
    "VNU-HCM",
    "Làng đại học",
    "Thông tin",
    "Tra cứu thông tin",
    "Đời sống sinh viên",
    "Học phí",
    "Blog sinh viên",
  ],
  openGraph: {
    title: "UniSync - Blog sinh viên & định hướng đại học",
    description:
      "Khám phá ngành học, review trường đại học và đời sống sinh viên tại TP.HCM cùng UniSync.",
    url: `${baseUrl}`,
    siteName: "UniSync",
    images: {
      url: "./chikawa.webp",
      width: 1200,
      height: 630,
      alt: "UniSync - Blog sinh viên và giáo dục",
    },
    locale: "vi_VN",
    phoneNumbers: "0363636363",
    emails: "hoaThanhQue@gmail.com",
    type: "website",
    countryName: "Việt Nam",
  },
  alternates: {
    canonical: `${baseUrl}`,
  },
  metadataBase: new URL(`${baseUrl}`),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <AuthProvider>
          <div className="flex min-h-[100dvh] flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
