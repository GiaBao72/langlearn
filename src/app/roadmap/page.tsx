export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Navbar from '@/components/Navbar'

const levels = [
  {
    code: 'A1',
    name: 'Người mới bắt đầu',
    weeks: 8,
    description: 'Làm quen với ngôn ngữ mới, học cách chào hỏi, giới thiệu bản thân và những câu giao tiếp cơ bản nhất trong cuộc sống hàng ngày.',
    skills: [
      'Chào hỏi và giới thiệu bản thân',
      'Số đếm, màu sắc, ngày tháng',
      'Gọi đồ ăn và mua sắm đơn giản',
      'Nghe hiểu câu nói chậm, rõ ràng',
    ],
    badgeColor: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    borderColor: 'border-emerald-200',
    btnColor: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  },
  {
    code: 'A2',
    name: 'Sơ cấp',
    weeks: 10,
    description: 'Mở rộng vốn từ và cấu trúc câu, có thể giao tiếp trong các tình huống quen thuộc như đi chợ, hỏi đường, kể về gia đình.',
    skills: [
      'Mô tả thói quen và lịch trình hàng ngày',
      'Hỏi và cho đường đi',
      'Viết tin nhắn, email ngắn',
      'Hiểu văn bản đơn giản',
    ],
    badgeColor: 'bg-blue-100 text-blue-700 border border-blue-200',
    borderColor: 'border-blue-200',
    btnColor: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  {
    code: 'B1',
    name: 'Trung cấp',
    weeks: 12,
    description: 'Đủ khả năng giao tiếp tự nhiên trong hầu hết tình huống khi đi du lịch hoặc làm việc. Hiểu được nội dung chính của văn bản phức tạp hơn.',
    skills: [
      'Trình bày quan điểm, ý kiến cá nhân',
      'Hiểu podcast và video tốc độ bình thường',
      'Viết bài luận ngắn có lập luận',
      'Giao tiếp công việc căn bản',
    ],
    badgeColor: 'bg-amber-100 text-amber-700 border border-amber-200',
    borderColor: 'border-amber-200',
    btnColor: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  {
    code: 'B2',
    name: 'Nâng cao',
    weeks: 16,
    description: 'Giao tiếp trôi chảy, tự nhiên với người bản xứ. Hiểu sâu văn bản chuyên môn, có thể làm việc hoặc học tập bằng ngôn ngữ đích.',
    skills: [
      'Thảo luận chủ đề phức tạp, trừu tượng',
      'Đọc báo, tài liệu chuyên ngành',
      'Viết báo cáo, thư trang trọng',
      'Nghe hiểu giọng vùng miền và tiếng lóng',
    ],
    badgeColor: 'bg-purple-100 text-purple-700 border border-purple-200',
    borderColor: 'border-purple-200',
    btnColor: 'bg-purple-500 hover:bg-purple-600 text-white',
  },
]

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* Hero */}
      <section className="bg-white border-b border-[#E2E8F0] py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-widest mb-3">Lộ trình học</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#334155] leading-tight mb-4">
            Lộ trình học rõ ràng —<br className="hidden sm:block" /> biết mình đang ở đâu
          </h1>
          <p className="text-[#64748B] text-lg leading-relaxed">
            Từng bước từ con số 0 đến giao tiếp tự tin. Mỗi cấp độ được thiết kế khoa học,
            có mục tiêu cụ thể và thời gian ước tính rõ ràng.
          </p>
        </div>
      </section>

      {/* Levels Grid */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {levels.map((level) => (
            <div
              key={level.code}
              className={`bg-white rounded-2xl border-2 ${level.borderColor} p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow`}
            >
              {/* Badge + name */}
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${level.badgeColor}`}>
                  {level.code}
                </span>
                <h2 className="text-lg font-bold text-[#334155]">{level.name}</h2>
              </div>

              {/* Description */}
              <p className="text-[#64748B] text-sm leading-relaxed">{level.description}</p>

              {/* Weeks */}
              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Ước tính <strong className="text-[#334155]">{level.weeks} tuần</strong> học đều đặn</span>
              </div>

              {/* Skills */}
              <ul className="flex flex-col gap-2">
                {level.skills.map((skill) => (
                  <li key={skill} className="flex items-start gap-2 text-sm text-[#334155]">
                    <svg className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {skill}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/register"
                className={`mt-auto inline-block text-center px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${level.btnColor}`}
              >
                Bắt đầu cấp này →
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center shadow-sm">
          <p className="text-[#64748B] text-base mb-2">Chưa biết level của mình?</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-[#2563EB] font-semibold text-lg hover:underline"
          >
            Làm bài test miễn phí <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
