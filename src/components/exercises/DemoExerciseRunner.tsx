'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import Link from 'next/link'
import FlashcardExercise from './FlashcardExercise'
import FillBlankExercise from './FillBlankExercise'
import MultipleChoiceExercise from './MultipleChoiceExercise'
import MultipleChoiceMultiExercise from './MultipleChoiceMultiExercise'
import DictationExercise from './DictationExercise'
import SortWordsExercise from './SortWordsExercise'

type ExerciseType =
  | 'FLASHCARD' | 'FILL_BLANK' | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_CHOICE_PARTIAL' | 'MULTIPLE_CHOICE_ALL'
  | 'DICTATION' | 'SORT_WORDS'

interface Exercise {
  id: string
  type: ExerciseType
  question: string
  data: Record<string, unknown>
  points: number
}

interface Props {
  exercises: Exercise[]
  courseId: string
}

interface SessionResult {
  type: string
  question: string
  userAnswer: string
  correctAnswer: string
  correct: boolean
}

function checkCorrectness(exercise: Exercise, userAnswer: string): boolean {
  const data = exercise.data
  if (exercise.type === 'FLASHCARD') return true
  if (exercise.type === 'FILL_BLANK') {
    return String(data.answer ?? '').trim().toLowerCase() === userAnswer.trim().toLowerCase()
  }
  if (exercise.type === 'MULTIPLE_CHOICE') {
    return String(data.answer ?? '') === userAnswer
  }
  if (exercise.type === 'MULTIPLE_CHOICE_ALL') {
    const correct = Array.isArray(data.answers) ? [...(data.answers as string[])].sort() : []
    let selected: string[] = []
    try { selected = JSON.parse(userAnswer) } catch { selected = [] }
    return JSON.stringify(correct) === JSON.stringify([...selected].sort())
  }
  if (exercise.type === 'MULTIPLE_CHOICE_PARTIAL') {
    const correct = Array.isArray(data.answers) ? (data.answers as string[]) : []
    let selected: string[] = []
    try { selected = JSON.parse(userAnswer) } catch { selected = [] }
    return selected.every(s => correct.includes(s)) && correct.every(c => selected.includes(c))
  }
  if (exercise.type === 'DICTATION') {
    const target = String(data.audio_text ?? data.sentence ?? '').trim().toLowerCase()
    return target === userAnswer.trim().toLowerCase()
  }
  if (exercise.type === 'SORT_WORDS') {
    const correct = Array.isArray(data.words) ? (data.words as string[]).join(' ') : ''
    return correct.trim().toLowerCase() === userAnswer.trim().toLowerCase()
  }
  return false
}

// Score popup
function ScorePopup({ points, onDone }: { points: number; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={onDone}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white font-bold px-4 py-2 rounded-full shadow-lg text-sm pointer-events-none"
    >
      +{points} điểm ✨
    </motion.div>
  )
}

export default function DemoExerciseRunner({ exercises, courseId }: Props) {
  const [queue] = useState<Exercise[]>(exercises)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [sessionResults, setSessionResults] = useState<SessionResult[]>([])
  const [doneMap, setDoneMap] = useState<Map<string, { answer: string; correct: boolean }>>(new Map())
  const [scorePopups, setScorePopups] = useState<{ id: number; points: number }[]>([])
  const popupIdRef = useRef(0)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const exercise = queue[currentIndex]
  const isFlashcard = exercise?.type === 'FLASHCARD'
  const progress = queue.length > 0 ? ((currentIndex + 1) / queue.length) * 100 : 0

  function handleFlashcardAnswer(answer: string) {
    const known = answer === 'known'
    if (known) {
      setTotalScore(s => s + exercise.points)
      setCorrectCount(c => c + 1)
      const id = ++popupIdRef.current
      setScorePopups(prev => [...prev, { id, points: exercise.points }])
    }
    setDoneMap(prev => new Map(prev).set(exercise.id, { answer, correct: known }))
    setSessionResults(prev => [...prev, { type: exercise.type, question: exercise.question, userAnswer: known ? '✓ Biết rồi' : '✗ Chưa biết', correctAnswer: '', correct: known }])
    const next = currentIndex + 1
    if (next >= queue.length) setFinished(true)
    else { setCurrentIndex(next); setUserAnswer(''); setSubmitted(false); setCorrect(false) }
  }

  function checkAnswer() {
    const isMulti = exercise.type === 'MULTIPLE_CHOICE_PARTIAL' || exercise.type === 'MULTIPLE_CHOICE_ALL'
    if (!isMulti && !userAnswer.trim()) return
    if (isMulti) {
      let sel: string[] = []
      try { sel = JSON.parse(userAnswer) } catch { sel = [] }
      if (sel.length === 0) return
    }

    const isCorrect = checkCorrectness(exercise, userAnswer)
    setCorrect(isCorrect)
    setSubmitted(true)

    let earnedPoints = 0
    if (exercise.type === 'MULTIPLE_CHOICE_PARTIAL') {
      const correctAnswers: string[] = Array.isArray(exercise.data.answers) ? exercise.data.answers as string[] : []
      let selected: string[] = []
      try { selected = JSON.parse(userAnswer) } catch { selected = [] }
      const net = Math.max(0, selected.filter(s => correctAnswers.includes(s)).length - selected.filter(s => !correctAnswers.includes(s)).length)
      earnedPoints = Math.round(exercise.points * (correctAnswers.length > 0 ? net / correctAnswers.length : 0))
    } else {
      earnedPoints = isCorrect ? exercise.points : 0
    }

    if (earnedPoints > 0) {
      setTotalScore(s => s + earnedPoints)
      if (isCorrect) setCorrectCount(c => c + 1)
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } })
      const id = ++popupIdRef.current
      setScorePopups(prev => [...prev, { id, points: earnedPoints }])
    }

    const d = exercise.data
    const correctAnswer = String(d.answer ?? (Array.isArray(d.answers) ? (d.answers as string[]).join(', ') : ''))
    setSessionResults(prev => [...prev, { type: exercise.type, question: exercise.question, userAnswer, correctAnswer, correct: isCorrect }])
    setDoneMap(prev => new Map(prev).set(exercise.id, { answer: userAnswer, correct: isCorrect }))
  }

  function nextExercise() {
    const next = currentIndex + 1
    if (next >= queue.length) setFinished(true)
    else { setCurrentIndex(next); setUserAnswer(''); setSubmitted(false); setCorrect(false) }
  }

  // Finished screen
  if (finished) {
    const totalPoints = queue.reduce((s, e) => s + e.points, 0)
    const pct = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0
    const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚'
    const wrongExercises = sessionResults.filter(r => !r.correct)

    return (
      <div className="space-y-4">
        {/* Result card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">{emoji}</div>
          <h2 className="text-3xl font-bold text-[#334155] mb-1">{pct}%</h2>
          <p className="text-[#64748B] text-sm mb-1">chính xác</p>
          <p className="text-[#64748B] text-sm mb-2">{correctCount}/{queue.length} câu đúng · {totalScore}/{totalPoints} điểm</p>
          <div className="h-2 bg-slate-200 rounded-full mx-auto max-w-xs mb-6">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: pct >= 80 ? '#10B981' : pct >= 50 ? '#2563EB' : '#EF4444' }} />
          </div>
          <button onClick={() => { setCurrentIndex(0); setUserAnswer(''); setSubmitted(false); setCorrect(false); setTotalScore(0); setCorrectCount(0); setFinished(false); setSessionResults([]); setDoneMap(new Map()) }}
            className="px-5 py-2.5 border-2 border-[#E2E8F0] rounded-xl text-[#334155] hover:bg-slate-50 font-medium transition-colors text-sm">
            Học lại
          </button>
        </div>

        {/* CTA đăng ký - nổi bật */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white shadow-lg">
          <div className="text-3xl mb-3">🎉</div>
          <h3 className="font-bold text-xl mb-2">Bạn học tốt đấy!</h3>
          <p className="text-blue-100 text-sm mb-6">Đăng ký miễn phí để mở khóa toàn bộ khóa học, lưu tiến độ và học mọi lúc mọi nơi.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/register"
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm">
              🚀 Đăng ký miễn phí
            </Link>
            <Link href="/login"
              className="px-6 py-3 border border-white/40 text-white rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">
              Đăng nhập
            </Link>
          </div>
        </div>

        {/* Câu sai */}
        {wrongExercises.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-[#334155] mb-4 text-sm">❌ Câu làm sai ({wrongExercises.length})</h3>
            <div className="space-y-3">
              {wrongExercises.map((r, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <span className="text-[#64748B] text-xs uppercase tracking-widest">{r.type.replace(/_/g, ' ')}</span>
                  <p className="text-[#334155] text-sm font-medium mb-2 mt-1">{r.question || '(Flashcard)'}</p>
                  <div className="flex flex-col sm:flex-row gap-2 text-xs">
                    <span className="text-red-500">✗ Bạn: <span className="font-medium">{r.userAnswer || '(trống)'}</span></span>
                    <span className="text-green-600">✓ Đúng: <span className="font-medium">{r.correctAnswer}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!exercise) return null
  const canSubmit = userAnswer.trim().length > 0 && !submitted

  return (
    <div className="flex gap-0 md:gap-5 lg:gap-6 items-start">
      {/* Panel trái — navigator */}
      <aside className="hidden md:flex flex-col gap-3 w-44 lg:w-52 shrink-0 sticky top-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3">
          <p className="text-xs text-[#94A3B8] mb-2 font-medium">Câu hỏi</p>
          <div className="grid grid-cols-4 lg:grid-cols-5 gap-1.5">
            {queue.map((ex, i) => {
              const isCurrent = i === currentIndex
              const done = doneMap.get(ex.id)
              return (
                <button key={ex.id} disabled={!done && !isCurrent}
                  onClick={() => {
                    if (!done && !isCurrent) return
                    setCurrentIndex(i)
                    if (done) { setUserAnswer(done.answer); setSubmitted(true); setCorrect(done.correct) }
                    else { setUserAnswer(''); setSubmitted(false); setCorrect(false) }
                  }}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    isCurrent ? 'bg-[#2563EB] text-white ring-2 ring-blue-300 scale-110'
                    : done?.correct ? 'bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer'
                    : done && !done.correct ? 'bg-red-100 text-red-400 hover:bg-red-200 cursor-pointer'
                    : 'bg-slate-100 text-[#CBD5E1] cursor-not-allowed opacity-40'
                  }`}>
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 text-center space-y-1">
          <p className="text-2xl font-bold text-[#2563EB]">{totalScore}</p>
          <p className="text-xs text-[#64748B]">điểm</p>
          <p className="text-xs text-[#94A3B8]">{correctCount}/{doneMap.size} đúng</p>
        </div>
        {/* Nhắc đăng ký */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
          <p className="text-xs text-[#64748B] mb-2">Lưu tiến độ?</p>
          <Link href="/register" className="block text-xs font-semibold text-[#2563EB] hover:underline">Đăng ký miễn phí →</Link>
        </div>
      </aside>

      {/* Content chính */}
      <div className="flex-1 min-w-0">
        {scorePopups.map(p => (
          <ScorePopup key={p.id} points={p.points} onDone={() => setScorePopups(prev => prev.filter(x => x.id !== p.id))} />
        ))}

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-[#64748B] mb-2">
            <span>Bài {currentIndex + 1} / {queue.length}</span>
            <span>{exercise.points} điểm</span>
          </div>
          <div className="h-2 bg-[#E2E8F0] rounded-full">
            <motion.div className="h-full bg-[#2563EB] rounded-full"
              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
          </div>
        </div>

        {/* Exercise type badge */}
        <div className="mb-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#64748B] bg-slate-100 px-3 py-1 rounded-full">
            {exercise.type === 'FLASHCARD' && 'Thẻ từ'}
            {exercise.type === 'FILL_BLANK' && 'Điền vào chỗ trống'}
            {exercise.type === 'MULTIPLE_CHOICE' && 'Trắc nghiệm'}
            {exercise.type === 'MULTIPLE_CHOICE_PARTIAL' && 'Nhiều đáp án (điểm tỉ lệ)'}
            {exercise.type === 'MULTIPLE_CHOICE_ALL' && 'Nhiều đáp án (toàn bộ hoặc 0)'}
            {exercise.type === 'DICTATION' && 'Nghe và gõ'}
            {exercise.type === 'SORT_WORDS' && 'Sắp xếp từ'}
          </span>
        </div>

        {/* Exercise card */}
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex + '-' + exercise.id}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6 mb-4">
            {exercise.type === 'FLASHCARD' && <FlashcardExercise data={exercise.data} onAnswer={handleFlashcardAnswer} />}
            {exercise.type === 'FILL_BLANK' && <FillBlankExercise question={exercise.question} data={exercise.data} value={userAnswer} onChange={setUserAnswer} onSubmit={checkAnswer} submitted={submitted} correct={correct} />}
            {exercise.type === 'MULTIPLE_CHOICE' && <MultipleChoiceExercise question={exercise.question} data={exercise.data} value={userAnswer} onChange={setUserAnswer} submitted={submitted} correct={correct} />}
            {(exercise.type === 'MULTIPLE_CHOICE_PARTIAL' || exercise.type === 'MULTIPLE_CHOICE_ALL') && <MultipleChoiceMultiExercise question={exercise.question} data={exercise.data} value={userAnswer} onChange={setUserAnswer} submitted={submitted} correct={correct} scoreMode={exercise.type === 'MULTIPLE_CHOICE_PARTIAL' ? 'partial' : 'all'} />}
            {exercise.type === 'DICTATION' && <DictationExercise question={exercise.question} data={exercise.data as {audio_text?: string; sentence?: string; answer: string; hint?: string}} value={userAnswer} onChange={setUserAnswer} submitted={submitted} correct={correct} />}
            {exercise.type === 'SORT_WORDS' && <SortWordsExercise question={exercise.question} data={exercise.data} value={userAnswer} onChange={setUserAnswer} submitted={submitted} correct={correct} exerciseId={exercise.id} />}
          </motion.div>
        </AnimatePresence>

        {/* Feedback banner */}
        {submitted && !isFlashcard && (
          <div className={`flex items-start sm:items-center gap-3 p-4 rounded-xl mb-4 border ${correct ? 'bg-green-50 border-green-200 text-[#10B981]' : 'bg-red-50 border-red-200 text-[#EF4444]'}`}>
            <span className="text-2xl">{correct ? '✅' : '❌'}</span>
            <div>
              <p className="font-semibold text-sm">{correct ? 'Chính xác!' : 'Chưa đúng rồi!'}</p>
              {correct
                ? <p className="text-xs opacity-80">+{exercise.points} điểm</p>
                : <p className="text-xs opacity-90">Đáp án đúng: <span className="font-semibold">{(() => { const d = exercise.data; if (Array.isArray(d.answers) && (d.answers as string[]).length > 0) return (d.answers as string[]).join(' / '); return String(d.answer ?? '') })()}</span></p>
              }
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!isFlashcard && (
          <div className="flex justify-end">
            {!submitted ? (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring' }}
                onClick={checkAnswer} disabled={!canSubmit}
                className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                Kiểm tra
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring' }}
                onClick={nextExercise}
                className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                {currentIndex + 1 >= queue.length ? 'Xem kết quả' : 'Tiếp theo →'}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
