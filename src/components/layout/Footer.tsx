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
  { href: "/about/faq", label: "Khoi DHQG" },
  { href: "/categories", label: "Truong khac" },
  { href: "/categories", label: "Doi song sinh vien" },
  { href: "/categories", label: "Tuyen sinh" },
];

const supportLinks = [
  { href: "#", label: "Lien he" },
  { href: "#", label: "Dieu khoan su dung" },
  { href: "#", label: "Chinh sach bao mat" },
  { href: "#", label: "Huong dan" },
];

const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", icon: FacebookLogo },
  { href: "https://twitter.com", label: "Twitter", icon: TwitterLogo },
  { href: "https://instagram.com", label: "Instagram", icon: InstagramLogo },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`${montserrat.className} border-t border-slate-200 bg-slate-50 text-slate-700`}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-10">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)] md:p-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Student size={22} weight="duotone" />
                </span>
                <span className="text-lg font-semibold tracking-tight text-slate-900">
                  UniScope HCM
                </span>
              </div>
              <p className="mb-3 max-w-[36ch] text-sm leading-relaxed text-slate-600">
                Kham pha dai hoc va ket noi sinh vien trong mot khong gian trao
                doi ro rang, de theo doi.
              </p>
              <p className="max-w-[36ch] text-sm leading-relaxed text-slate-600">
                Dien dan chia se thong tin cua sinh vien cac truong dai hoc tai
                TP. Ho Chi Minh.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                  <MapPinLine size={14} weight="duotone" />
                  Ho Chi Minh City
                </span>
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-1.5 font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-emerald-700 active:-translate-y-[1px]"
                >
                  Join community
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3 lg:pl-6">
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-900">
                  Danh muc
                </h3>
                <ul className="space-y-3">
                  {categoryLinks.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 transition-colors hover:text-emerald-700"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-900">
                  Ho tro
                </h3>
                <ul className="space-y-3">
                  {supportLinks.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <a
                        href={link.href}
                        className="text-sm text-slate-600 transition-colors hover:text-emerald-700"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-900">
                  Ket noi
                </h3>
                <div className="flex gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-emerald-300 hover:text-emerald-700 active:scale-[0.98]"
                      >
                        <Icon size={18} weight="duotone" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-500">
              © {currentYear} UniScopeHCM. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
