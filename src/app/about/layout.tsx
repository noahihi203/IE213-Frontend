export async function generateMetadata() {
  const baseUrl = "https://your-domain.com";

  return {
    title: {
      template: "%s | UniSync",
      default: "Về chúng tôi",
    },

    description:
      "Tìm hiểu về UniSync – nền tảng blog dành cho sinh viên Việt Nam, nơi chia sẻ câu chuyện, kiến thức và định hướng nghề nghiệp trong môi trường đại học.",

    keywords: [
      "about unisync",
      "về chúng tôi",
      "blog sinh viên",
      "nền tảng viết lách",
      "định hướng đại học",
      "câu chuyện startup việt",
    ],

    openGraph: {
      title: "Về UniSync - Nền tảng viết lách cho sinh viên Việt Nam",
      description:
        "Khám phá hành trình xây dựng UniSync, sứ mệnh và giá trị cốt lõi trong việc phát triển cộng đồng viết lách và chia sẻ tri thức cho sinh viên.",

      url: `${baseUrl}/about`,
      siteName: "UniSync",

      images: [
        {
          url: `/about-us-logo.png`,
          width: 1200,
          height: 630,
          alt: "UniSync - Câu chuyện và sứ mệnh",
        },
      ],

      locale: "vi_VN",
      type: "website",
      countryName: "Việt Nam",
    },

    alternates: {
      canonical: `${baseUrl}/about`,
    },

    metadataBase: new URL(`${baseUrl}/about`),
  };
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
