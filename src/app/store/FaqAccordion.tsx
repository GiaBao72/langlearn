'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Sách phù hợp với trình độ nào?',
    a: 'Sách được thiết kế cho người mới bắt đầu hoàn toàn (A1) đến trung cấp (B1). Nếu bạn chưa học tiếng Đức bao giờ, đây là điểm khởi đầu lý tưởng.',
  },
  {
    q: 'File audio ở đâu và cách tải?',
    a: 'Sau khi đặt mua thành công, bạn sẽ nhận link tải audio qua Messenger/Zalo trong vòng 24 giờ. File MP3 chất lượng cao, dùng được trên mọi thiết bị.',
  },
  {
    q: 'Tôi có thể đặt nhiều cuốn để được giảm giá không?',
    a: 'Có! Đặt từ 2 cuốn trở lên nhận giảm thêm 10%, từ 3 cuốn giảm 15%. Liên hệ Messenger để đặt combo.',
  },
]

export default function FaqAccordion() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-[#334155] hover:bg-slate-50 transition-colors"
          >
            <span>{faq.q}</span>
            <svg
              className={`w-5 h-5 text-[#64748B] shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openFaq === i && (
            <div className="px-5 pb-4 text-sm text-[#64748B] leading-relaxed border-t border-[#E2E8F0] pt-3">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
