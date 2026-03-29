import Link from "next/link";
import { Montserrat } from "next/font/google";
import {
  BookOpenText,
  Lightning,
  TrendUp,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const highlights = [
  {
    title: "Quy trình biên tập",
    description:
      "Lập kế hoạch, soạn thảo và xuất bản với các trạng thái rõ ràng để mỗi bài viết luôn tiến triển đúng hướng.",
    icon: BookOpenText,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Nhịp tăng trưởng trực tiếp",
    description:
      "Theo dõi nội dung độc giả phản hồi tốt để định hướng bài viết tiếp theo sát với mối quan tâm thực tế.",
    icon: TrendUp,
    tone: "bg-emerald-100/70 text-emerald-700",
  },
  {
    title: "Cộng đồng tập trung",
    description:
      "Bình luận, lượt thích và chia sẻ được thiết kế để tạo phản hồi có giá trị thay vì tương tác nhiễu.",
    icon: UsersThree,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Nền tảng xuất bản nhanh",
    description:
      "Xây dựng trên Next.js 14 với giao diện gọn gàng, tương thích tốt và mượt mà trên nhiều thiết bị.",
    icon: Lightning,
    tone: "bg-emerald-100/70 text-emerald-700",
  },
];

export default function HomePage() {
  return (
    <div
      className={`${montserrat.className} min-h-[100dvh] bg-slate-50 text-slate-900`}
    >
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-emerald-100/70 to-transparent" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-12 md:gap-8 md:px-6 md:py-20 lg:px-10">
          <div className="md:col-span-7 md:pr-6">
            <p className="mb-5 inline-flex items-center rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-sm font-medium text-emerald-700">
              Không gian xuất bản cho cộng đồng IE213
            </p>
            <h1 className="text-4xl font-semibold leading-none tracking-tighter text-slate-950 md:text-6xl">
              Chào mừng đến với IE213 Blog
            </h1>
            <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-slate-600 md:text-lg">
              Viết những bài đăng chất lượng, làm nổi bật ý tưởng hữu ích và giữ
              thảo luận quanh mỗi bài viết rõ ràng, thực tế.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/posts"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-emerald-700 active:scale-[0.98]"
              >
                Khám phá bài viết
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-slate-400 hover:bg-slate-100 active:scale-[0.98]"
              >
                Tạo tài khoản
              </Link>
            </div>
          </div>

          <aside className="md:col-span-5">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <p className="text-sm font-semibold text-slate-800">
                  Nhịp biên tập
                </p>
                <span className="inline-flex items-center gap-2 text-xs text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Đồng bộ ổn định
                </span>
              </div>

              <div className="space-y-4 py-5">
                <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Hàng đợi tải
                  </p>
                  <div className="h-2.5 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-2.5 w-5/6 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Bản nháp trống
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Bạn chưa có bản nháp nào đang thực hiện. Hãy bắt đầu bài
                    viết đầu tiên từ khu vực soạn thảo.
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Ví dụ trạng thái lỗi
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Tải lên media thất bại ở một tệp. Hãy thử lại từ trình biên
                    tập bài viết để tiếp tục xuất bản.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 text-xs text-slate-500">
                Thiết kế tối ưu cho chiều sâu trên desktop và rõ ràng trên di
                động với bố cục một cột dự phòng.
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Vì sao đội nhóm viết ở đây
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Không gian sáng sủa dành cho viết nội dung dài, quy trình duyệt rõ
            ràng và phản hồi độc giả có thể đo lường.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-7 space-y-5">
            {highlights.slice(0, 2).map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]"
                >
                  <div
                    className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}
                  >
                    <Icon size={22} weight="duotone" />
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="md:col-span-5 space-y-5 md:pt-16">
            {highlights.slice(2).map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]"
                >
                  <div
                    className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}
                  >
                    <Icon size={22} weight="duotone" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 md:grid-cols-12 md:items-end md:px-6 md:py-20 lg:px-10">
          <div className="md:col-span-8">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Sẵn sàng xuất bản bài viết đầu tiên?
            </h2>
            <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-slate-600">
              Tham gia không gian viết IE213, mở bản nháp và chia sẻ ý tưởng
              thực tiễn với những người coi trọng chiều sâu kỹ thuật.
            </p>
          </div>
          <div className="md:col-span-4 md:justify-self-end">
            <Link
              href="/register"
              className="inline-flex items-center rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-emerald-700 active:-translate-y-[1px]"
            >
              Tạo tài khoản của bạn
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
