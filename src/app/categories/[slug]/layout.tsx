import type { Metadata } from "next";
import { categoryService } from "@/lib/api/category.service";

const SITE_URL = process.env.NEXT_PUBLIC_API_URL;

interface MetadataProps {
  params: {
    slug: string;
  };
}

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const res = await categoryService.getCategoryBySlug(params.slug);
  const cat = res.metadata;
  if (!cat) {
    return {
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
  }

  return {
    title: {
      template: "%s | UniSync",
      default: `[${cat.abbreviation}] ${cat.name}`,
    },
    description: `${cat.description}`,
    keywords: [
      `${cat.abbreviation}`,
      `${cat.name}`,
      `${cat.slug}`,
      "Sinh viên",
      "UniSync",
      "Đại học quốc gia",
      "VNU HCM",
    ],
    openGraph: {
      title: `${cat.name}`,
      description: `${cat.description}`,
      url: `${baseUrl}/${params.slug}`,
      siteName: "UniSync",
      images: {
        url: cat.icon ? `${toAbsoluteUrl(cat.icon)}` : "./chikawa.webp",
        width: 1200,
        height: 630,
        alt: `[${cat.abbreviation}] ${cat.name}`,
      },
      locale: "vi_VN",
      phoneNumbers: "0363636363",
      emails: "hoaThanhQue@gmail.com",
      type: "website",
      countryName: "Việt Nam",
    },
    alternates: {
      canonical: `${baseUrl}/categories/${params.slug}`,
    },
    metadataBase: new URL(`${baseUrl}`),
  };
}

export default function CatSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
