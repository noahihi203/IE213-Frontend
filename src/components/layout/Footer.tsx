import Link from "next/link";
import { Montserrat } from "next/font/google";
import {
  FacebookLogo,
  InstagramLogo,
  MapPinLine,
  Student,
  TwitterLogo,
} from "@phosphor-icons/react/dist/ssr";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const categoryLinks = [
  {
    title: "NỀN TẢNG",
    links: [
      { href: "/posts", label: "Bài viết" },
      { href: "/categories", label: "Danh mục" },
      { href: "/about", label: "Về chúng tôi" },
      { href: "/about/faq", label: "FAQ" },
    ],
  },
  {
    title: "TÀI KHOẢN",
    links: [
      { href: "/login", label: "Đăng nhập" },
      { href: "/register", label: "Đăng ký" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/posts", label: "Viết bài" },
    ],
  },
  {
    title: "PHÁP LÝ",
    links: [
      { href: "/", label: "Điều khoản dịch vụ" },
      { href: "/", label: "Chính sách bảo mật" },
      { href: "/", label: "Cookie Policy" },
    ],
  },
];

const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", icon: FacebookLogo },
  { href: "https://twitter.com", label: "X", icon: TwitterLogo },
  { href: "https://instagram.com", label: "Instagram", icon: InstagramLogo },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-white border-t border-[#F0F0F0] pb-28 md:pb-8">
      <div className="max-w-6xl mx-auto px-5 pt-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-1">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
              <span className="text-white text-[14px] font-bold">U</span>
            </div>
            <span className="text-[#000] text-[16px] font-bold">UniSync</span>
          </div>
          <p className="text-[#888] text-[13px] leading-relaxed">
            UniSync là diễn đàn dành cho sinh viên TP.HCM, nơi chia sẻ kiến
            thức, kinh nghiệm và kết nối cộng đồng giữa các trường đại học.
          </p>
          <div className="flex gap-2.5 mt-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full bg-[#F8F8F8] flex items-center justify-center text-[#888] text-[11px] font-semibold hover:bg-[#F0F0F0] transition-colors"
                >
                  <Icon size={18} weight="duotone" />
                </a>
              );
            })}
          </div>
        </div>

        {categoryLinks.map((col) => (
          <div key={col.title}>
            <p className="text-[11px] font-bold text-[#888] tracking-widest mb-3">
              {col.title}
            </p>
            <div className="flex flex-col gap-2">
              {col.links.map((link) => (
                <Link
                  href={link.href}
                  className="text-[13px] text-[#555] hover:text-[#000] cursor-pointer transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-5 pt-8 mt-8 border-t border-[#F0F0F0] flex flex-col md:flex-row items-center justify-between gap-2">
        <span className="text-[#888] text-[12px]">
          © {currentYear} UniSync. Bảo lưu mọi quyền.
        </span>
        <span className="text-[#888] text-[12px]">
          Được xây dựng với ♥ dành cho cộng đồng sinh viên Việt Nam.
        </span>
      </div>
    </footer>
  );
}
