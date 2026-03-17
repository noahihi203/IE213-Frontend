import Link from "next/link";
import { BookOpen, Github, Twitter, Linkedin, Instagram, Facebook, GraduationCap } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-8 h-8 text-sky-500" />
              <span className="text-white font-bold text-lg">UniScope HCM</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Khám phá đại học — Kết nối sinh viên
            </p>
            <p className="text-sm text-gray-400">
              Diễn đàn trao đổi của sinh viên các trường đại học tại TP. Hồ Chí
              Minh
            </p>
          </div>

          {/* Danh Mục */}
          <div>
            <h3 className="text-white font-semibold mb-4">Danh Mục</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/categories"
                  className="text-sm hover:text-white transition-colors"
                >
                  Khối ĐHQG
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm hover:text-white transition-colors"
                >
                  Trường Khác
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm hover:text-white transition-colors"
                >
                  Đời Sống Sinh Viên
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm hover:text-white transition-colors"
                >
                  Tuyển Sinh
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ Trợ */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ Trợ</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-white transition-colors"
                >
                  Liên hệ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-white transition-colors"
                >
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-white transition-colors"
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-white transition-colors"
                >
                  Hướng dẫn
                </a>
              </li>
            </ul>
          </div>

          {/* Mạng Xã Hội */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kết Nối</h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-600 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {currentYear} UniScopeHCM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
