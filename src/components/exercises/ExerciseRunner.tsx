'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
// @ts-ignore
import confetti from 'canvas-confetti'
import FlashcardExercise from './FlashcardExercise'
import FillBlankExercise from './FillBlankExercise'
import MultipleChoiceExercise from './MultipleChoiceExercise'
import MultipleChoiceMultiExercise from './MultipleChoiceMultiExercise'
import DictationExercise from './DictationExercise'
import SortWordsExercise from './SortWordsExercise'

type ExerciseData = Record<string, unknown>

interface Exercise {
  id: string
  type: string
  question: string
  points: number
  data: ExerciseData
}

interface Props {
  exercises: Exercise[]
  lessonId: string
  courseId?: string
}

function checkCorrectness(exercise: Exercise, answer: string): boolean {
  const data = exercise.data as Record<string, unknown>
  const normalize = (s: string) => s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.!?,;:]/g, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  switch (exercise.type) {
    case 'FLASHCARD':   return answer === 'known'
    case 'FILL_BLANK': {
      const norm = normalize(answer)
      // Ưu tiên mảng answers[], fallback về answer string
      const correctAnswers: string[] = Array.isArray(data.answers) && (data.answers as string[]).length > 0
        ? (data.answers as string[])
        : [data.answer as string]
      return correctAnswers.some(a => normalize(a) === norm)
    }
    case 'MULTIPLE_CHOICE': return answer === (data.answer as string)
    case 'MULTIPLE_CHOICE_PARTIAL':
    case 'MULTIPLE_CHOICE_ALL': {
      let selected: string[] = []
      try { selected = JSON.parse(answer) } catch { selected = [] }
      const correctAnswers: string[] = Array.isArray(data.answers) ? data.answers as string[] : []
      if (exercise.type === 'MULTIPLE_CHOICE_ALL') {
        return selected.length === correctAnswers.length &&
          correctAnswers.every(a => selected.includes(a)) &&
          selected.every(a => correctAnswers.includes(a))
      }
      // PARTIAL: tính tỉ lệ — "correct" ở đây nghĩa là >= 50% đúng (để hiển thị banner xanh)
      const correctSelected = selected.filter(s => correctAnswers.includes(s)).length
      const wrongSelected = selected.filter(s => !correctAnswers.includes(s)).length
      const net = Math.max(0, correctSelected - wrongSelected)
      return net > 0 && correctSelected === correctAnswers.length && wrongSelected === 0
    }
    case 'DICTATION':   return normalize(answer) === normalize(String(data.audio_text ?? data.answer ?? ''))
    case 'SORT_WORDS':  return normalize(answer) === normalize(data.answer as string)
    default: return false
  }
}

function ScorePopup({ points, onDone }: { points: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1000)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -60, scale: 1.2 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="fixed pointer-events-none z-50 text-2xl font-extrabold text-[#10B981] drop-shadow-lg"
      style={{ top: '40%', left: '50%', transform: 'translateX(-50%)' }}
    >
      +{points}đ ✨
    </motion.div>
  )
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function shuffleExercises(exercises: Exercise[]): Exercise[] {
  const flashcards = shuffleArray(exercises.filter(e => e.type === 'FLASHCARD'))
  const others = shuffleArray(exercises.filter(e => e.type !== 'FLASHCARD'))
  const result: Exercise[] = []
  let fi = 0
  for (let i = 0; i < others.length; i++) {
    result.push(others[i])
    if ((i + 1) % 3 === 0 && fi < flashcards.length) result.push(flashcards[fi++])
  }
  while (fi < flashcards.length) result.push(flashcards[fi++])
  return result
}

export default function ExerciseRunner({ exercises: rawExercises, lessonId, courseId }: Props) {
  const router = useRouter()
  const [queue] = useState<Exercise[]>(() => shuffleExercises(rawExercises))
  const [currentIndex, setCurrentIndex] = useState(0)
  const skippedIds = useRef<Set<string>>(new Set())
  const [userAnswer, setUserAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [sessionResults, setSessionResults] = useState<Array<{
    type: string; question: string; userAnswer: string; correctAnswer: string; correct: boolean; flagged: boolean
  }>>([])
  const flaggedIds = useRef<Set<string>>(new Set())
  const [flagCount, setFlagCount] = useState(0)
  const [scorePopups, setScorePopups] = useState<{id: number; points: number}[]>([])
  const [skippedCount, setSkippedCount] = useState(0)
  const popupIdRef = useRef(0)

  // Track kết quả từng câu theo exerciseId (persist khi nhảy qua lại)
  const [doneMap, setDoneMap] = useState<Map<string, { answer: string; correct: boolean }>>(new Map())

  function toggleFlag() {
    if (!exercise) return
    if (flaggedIds.current.has(exercise.id)) {
      flaggedIds.current.delete(exercise.id)
    } else {
      flaggedIds.current.add(exercise.id)
    }
    setFlagCount(flaggedIds.current.size) // trigger re-render
  }

  useEffect(() => {
    if (finished) {
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 }, colors: ['#2563EB','#10B981','#F59E0B','#EF4444'] })
    }
  }, [finished])

  const exercise = queue[currentIndex]
  const isFlashcard = exercise?.type === 'FLASHCARD'
  const canSkip = exercise && !skippedIds.current.has(exercise.id) && !submitted
  // Số câu còn lại phía sau (để biết có câu nào sau để nhảy vào không)
  const remainingAfter = queue.length - currentIndex - 1
  const progress = queue.length > 0 ? Math.min(100, (currentIndex / queue.length) * 100) : 0

  // Tìm index câu tiếp theo chưa làm và chưa bị bỏ qua vĩnh viễn
  // Ưu tiên tìm về phía trước (forward), nếu không có thì tìm wrap-around
  function findNextPending(fromIndex: number): number | null {
    // Tìm phía sau trước
    for (let i = fromIndex + 1; i < queue.length; i++) {
      if (!doneMap.has(queue[i].id) && !skippedIds.current.has(queue[i].id)) return i
    }
    // Tìm phía trước (wrap)
    for (let i = 0; i < fromIndex; i++) {
      if (!doneMap.has(queue[i].id) && !skippedIds.current.has(queue[i].id)) return i
    }
    // Tất cả đã làm hoặc bỏ qua — tìm câu bỏ qua chưa làm (quay vòng)
    for (let i = fromIndex + 1; i < queue.length; i++) {
      if (!doneMap.has(queue[i].id)) return i
    }
    for (let i = 0; i < fromIndex; i++) {
      if (!doneMap.has(queue[i].id)) return i
    }
    return null
  }

  function handleSkip() {
    if (!exercise || skippedIds.current.has(exercise.id)) return
    skippedIds.current.add(exercise.id)
    setSkippedCount(c => c + 1)

    // Không thay đổi thứ tự queue — câu bỏ qua giữ nguyên vị trí
    const next = findNextPending(currentIndex)
    if (next === null) {
      setFinished(true)
      return
    }
    setCurrentIndex(next)
    setUserAnswer('')
    setSubmitted(false)
    setCorrect(false)
  }

  function handleFlashcardAnswer(answer: string) {
    const isCorrect = answer === 'known'
    setUserAnswer(answer)
    setCorrect(isCorrect)
    setSubmitted(true)
    if (isCorrect) {
      setTotalScore(s => s + exercise.points)
      setCorrectCount(c => c + 1)
    }
    const data = exercise.data as Record<string, unknown>
    setSessionResults(prev => [...prev, {
      type: exercise.type,
      question: String(data.front ?? ''),
      userAnswer: answer,
      correctAnswer: String(data.back ?? ''),
      correct: isCorrect,
      flagged: flaggedIds.current.has(exercise.id),
    }])
    saveProgress(exercise.id, answer)
    // Mark done
    setDoneMap(prev => new Map(prev).set(exercise.id, { answer, correct: isCorrect }))
    setTimeout(() => nextExercise(), 600)
  }

  function checkAnswer() {
    // Multi-answer: cho phép submit dù value là "[]" nhưng không submit khi chưa chọn gì
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

    // Tính điểm earned (partial scoring phía client để hiển thị popup)
    let earnedPoints = 0
    if (exercise.type === 'MULTIPLE_CHOICE_PARTIAL') {
      const data = exercise.data as Record<string, unknown>
      const correctAnswers: string[] = Array.isArray(data.answers) ? data.answers as string[] : []
      let selected: string[] = []
      try { selected = JSON.parse(userAnswer) } catch { selected = [] }
      const correctSelected = selected.filter(s => correctAnswers.includes(s)).length
      const wrongSelected = selected.filter(s => !correctAnswers.includes(s)).length
      const net = Math.max(0, correctSelected - wrongSelected)
      const ratio = correctAnswers.length > 0 ? net / correctAnswers.length : 0
      earnedPoints = Math.round(exercise.points * ratio)
    } else {
      earnedPoints = isCorrect ? exercise.points : 0
    }

    if (earnedPoints > 0) {
      setTotalScore(s => s + earnedPoints)
      if (isCorrect) setCorrectCount(c => c + 1)
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } })
      const id = ++popupIdRef.current
      setScorePopups(prev => [...prev, { id, points: earnedPoints }])
    } else if (!isCorrect && exercise.type !== 'MULTIPLE_CHOICE_PARTIAL') {
      // Partial sai hoàn toàn thì không hiện popup, nhưng cũng không tăng correctCount
    }
    const data = exercise.data as Record<string, unknown>
    const correctAnswer = String(data.answer ?? (Array.isArray((data as Record<string, unknown>).answers) ? ((data as Record<string, unknown>).answers as string[]).join(', ') : ''))
    setSessionResults(prev => [...prev, {
      type: exercise.type,
      question: exercise.question,
      userAnswer,
      correctAnswer,
      correct: isCorrect,
      flagged: flaggedIds.current.has(exercise.id),
    }])
    saveProgress(exercise.id, userAnswer)
    // Mark done theo exerciseId
    setDoneMap(prev => new Map(prev).set(exercise.id, { answer: userAnswer, correct: isCorrect }))
  }

  function saveProgress(exerciseId: string, answer: string) {
    fetch(`/api/exercises/${exerciseId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    }).catch(() => {})
  }

  function nextExercise() {
    const next = findNextPending(currentIndex)
    if (next === null) {
      setFinished(true)
    } else {
      setCurrentIndex(next)
      setUserAnswer('')
      setSubmitted(false)
      setCorrect(false)
    }
  }

  // Finished screen
  if (finished) {
    const totalPoints = queue.reduce((s, e) => s + e.points, 0)
    const pct = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0
    const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚'
    const wrongExercises = sessionResults.filter(r => !r.correct)
    const flaggedExercises = sessionResults.filter(r => r.flagged)

    return (
      <div className="space-y-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">{emoji}</div>
          <h2 className="text-3xl font-bold text-[#334155] mb-1">{pct}%</h2>
          <p className="text-[#64748B] text-sm mb-1">chính xác</p>
          <p className="text-[#64748B] text-sm mb-2">
            {correctCount}/{queue.length} câu đúng · {totalScore}/{totalPoints} điểm
            {skippedCount > 0 && ` · ${skippedCount} câu bỏ qua`}
            {flaggedExercises.length > 0 && ` · 🚩 ${flaggedExercises.length} đánh dấu`}
          </p>

          <div className="h-2 bg-slate-200 rounded-full mx-auto max-w-xs mb-8">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: pct >= 80 ? '#10B981' : pct >= 50 ? '#2563EB' : '#EF4444' }} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                          setCurrentIndex(0); setUserAnswer(''); setSubmitted(false)
                setCorrect(false); setTotalScore(0); setCorrectCount(0)
                setFinished(false); setSessionResults([]); setSkippedCount(0)
                skippedIds.current.clear(); flaggedIds.current.clear(); setFlagCount(0)
                setDoneMap(new Map())
              }}
              className="px-5 py-2.5 border-2 border-[#E2E8F0] rounded-xl text-[#334155] hover:bg-slate-50 font-medium transition-colors text-sm w-full sm:w-auto">
              Học lại
            </button>
            <button
              onClick={() => courseId ? router.push(`/courses/${courseId}`) : router.push('/practice')}
              className="px-5 py-2.5 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm shadow-sm w-full sm:w-auto">
              Về khóa học
            </button>
          </div>
        </div>

        {wrongExercises.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-[#334155] mb-4 text-sm">❌ Câu làm sai ({wrongExercises.length})</h3>
            <div className="space-y-3">
              {wrongExercises.map((r, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#64748B] text-xs uppercase tracking-widest">{r.type.replace(/_/g, ' ')}</span>
                    {r.flagged && <span className="text-xs text-amber-500 font-medium">🚩 Đã đánh dấu</span>}
                  </div>
                  <p className="text-[#334155] text-sm font-medium mb-2">{r.question || '(Flashcard)'}</p>
                  <div className="flex flex-col sm:flex-row gap-2 text-xs">
                    <span className="text-red-500">✗ Bạn: <span className="font-medium">{r.userAnswer || '(trống)'}</span></span>
                    <span className="text-green-600">✓ Đúng: <span className="font-medium">{r.correctAnswer}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {flaggedExercises.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-[#334155] mb-4 text-sm">🚩 Câu đã đánh dấu ({flaggedExercises.length})</h3>
            <div className="space-y-3">
              {flaggedExercises.map((r, i) => (
                <div key={i} className={`border rounded-xl p-4 ${r.correct ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#64748B] text-xs uppercase tracking-widest">{r.type.replace(/_/g, ' ')}</span>
                    <span className={`text-xs font-medium ${r.correct ? 'text-green-600' : 'text-red-500'}`}>
                      {r.correct ? '✅ Đúng' : '❌ Sai'}
                    </span>
                  </div>
                  <p className="text-[#334155] text-sm font-medium mb-2">{r.question || '(Flashcard)'}</p>
                  {!r.correct && (
                    <div className="flex flex-col sm:flex-row gap-2 text-xs">
                      <span className="text-red-500">✗ Bạn: <span className="font-medium">{r.userAnswer || '(trống)'}</span></span>
                      <span className="text-green-600">✓ Đúng: <span className="font-medium">{r.correctAnswer}</span></span>
                    </div>
                  )}
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
              const isDone = !!done
              const isSkipped = skippedIds.current.has(ex.id) && !isDone
              // Câu chưa đến, chưa làm, chưa bỏ qua — không cho click
              const isLocked = !isDone && !isSkipped && !isCurrent
              return (
                <button key={ex.id}
                  onClick={() => {
                    if (isCurrent || isLocked) return
                    setCurrentIndex(i)
                    if (done) {
                      setUserAnswer(done.answer)
                      setSubmitted(true)
                      setCorrect(done.correct)
                    } else {
                      // Câu bỏ qua — mở ra để làm lại
                      setUserAnswer('')
                      setSubmitted(false)
                      setCorrect(false)
                    }
                  }}
                  title={`Câu ${i+1}${isDone ? (done.correct ? ' ✓' : ' ✗') : isSkipped ? ' — bỏ qua (click để làm lại)' : ''}`}
                  disabled={isLocked}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#2563EB] text-white ring-2 ring-blue-300 scale-110'
                      : isDone && done.correct
                        ? 'bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer'
                        : isDone && !done.correct
                          ? 'bg-red-100 text-red-400 hover:bg-red-200 cursor-pointer'
                          : isSkipped
                            ? 'bg-amber-100 text-amber-500 hover:bg-amber-200 cursor-pointer ring-1 ring-amber-300'
                            : 'bg-slate-100 text-[#CBD5E1] cursor-not-allowed opacity-40'
                  }`}>
                  {i + 1}
                </button>
              )
            })}
          </div>
          {/* Legend */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]"><span className="w-3 h-3 rounded bg-[#2563EB] inline-block" /> Đang làm</div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]"><span className="w-3 h-3 rounded bg-green-200 inline-block" /> Đúng</div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]"><span className="w-3 h-3 rounded bg-red-200 inline-block" /> Sai</div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]"><span className="w-3 h-3 rounded bg-amber-200 inline-block" /> Bỏ qua</div>
          </div>
        </div>
        {/* Tiến độ */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 text-center space-y-1">
          <p className="text-2xl font-bold text-[#2563EB]">{totalScore}</p>
          <p className="text-xs text-[#64748B]">điểm</p>
          <p className="text-xs text-[#94A3B8]">{correctCount}/{doneMap.size} đúng</p>
          {skippedCount > 0 && (
            <p className="text-xs text-amber-500">{skippedCount} bỏ qua</p>
          )}
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
          <div className="flex items-center gap-3">
            {skippedCount > 0 && (
              <span className="text-amber-500">⏭ {skippedCount} đã bỏ qua</span>
            )}
            {flagCount > 0 && (
              <span className="text-amber-500">🚩 {flagCount}</span>
            )}
            <span>{exercise.points} điểm</span>
          </div>
        </div>
        <div className="h-2 bg-[#E2E8F0] rounded-full">
          <motion.div
            className="h-full bg-[#2563EB] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Exercise type badge + skip + flag buttons */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#64748B] bg-slate-100 px-3 py-1 rounded-full">
          {exercise.type === 'FLASHCARD' && 'Thẻ từ'}
          {exercise.type === 'FILL_BLANK' && 'Điền vào chỗ trống'}
          {exercise.type === 'MULTIPLE_CHOICE' && 'Trắc nghiệm'}
          {exercise.type === 'MULTIPLE_CHOICE_PARTIAL' && 'Nhiều đáp án (điểm tỉ lệ)'}
          {exercise.type === 'MULTIPLE_CHOICE_ALL' && 'Nhiều đáp án (toàn bộ hoặc 0)'}
          {exercise.type === 'DICTATION' && 'Nghe và gõ'}
          {exercise.type === 'SORT_WORDS' && 'Sắp xếp từ'}
        </span>

        <div className="flex items-center gap-2">
          {/* Nút flag — luôn hiển thị */}
          <button
            onClick={toggleFlag}
            title={flaggedIds.current.has(exercise.id) ? 'Bỏ đánh dấu' : 'Đánh dấu câu này'}
            className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-colors border ${
              flaggedIds.current.has(exercise.id)
                ? 'bg-amber-100 border-amber-300 text-amber-600 font-semibold'
                : 'bg-slate-100 border-transparent text-[#94A3B8] hover:bg-amber-50 hover:text-amber-500 hover:border-amber-200'
            }`}
          >
            🚩 {flaggedIds.current.has(exercise.id) ? 'Đã đánh dấu' : 'Đánh dấu'}
          </button>

          {/* Nút bỏ qua */}
          {canSkip && remainingAfter > 0 && !isFlashcard && (
            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-amber-500 bg-slate-100 hover:bg-amber-50 px-3 py-1 rounded-full transition-colors border border-transparent hover:border-amber-200"
            >
              ⏭ Bỏ qua
            </button>
          )}
        </div>
      </div>

      {/* Exercise card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex + '-' + exercise.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6 mb-4"
        >
          {/* Badge nhỏ nếu là câu quay lại sau khi bỏ qua */}
          {skippedIds.current.has(exercise.id) && (
            <div className="flex justify-center mb-3">
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                ↩ Câu bỏ qua lúc trước
              </span>
            </div>
          )}

          {exercise.type === 'FLASHCARD' && (
            <FlashcardExercise data={exercise.data} onAnswer={handleFlashcardAnswer} />
          )}
          {exercise.type === 'FILL_BLANK' && (
            <FillBlankExercise
              question={exercise.question} data={exercise.data}
              value={userAnswer} onChange={setUserAnswer}
              onSubmit={checkAnswer} submitted={submitted} correct={correct}
            />
          )}
          {exercise.type === 'MULTIPLE_CHOICE' && (
            <MultipleChoiceExercise
              question={exercise.question} data={exercise.data}
              value={userAnswer} onChange={setUserAnswer}
              submitted={submitted} correct={correct}
            />
          )}
          {(exercise.type === 'MULTIPLE_CHOICE_PARTIAL' || exercise.type === 'MULTIPLE_CHOICE_ALL') && (
            <MultipleChoiceMultiExercise
              question={exercise.question} data={exercise.data}
              value={userAnswer} onChange={setUserAnswer}
              submitted={submitted} correct={correct}
              scoreMode={exercise.type === 'MULTIPLE_CHOICE_PARTIAL' ? 'partial' : 'all'}
            />
          )}
          {exercise.type === 'DICTATION' && (
            <DictationExercise
              question={exercise.question} data={exercise.data as {audio_text?: string; sentence?: string; answer: string; hint?: string}}
              value={userAnswer} onChange={setUserAnswer}
              submitted={submitted} correct={correct}
            />
          )}
          {exercise.type === 'SORT_WORDS' && (
            <SortWordsExercise
              question={exercise.question} data={exercise.data}
              value={userAnswer} onChange={setUserAnswer}
              submitted={submitted} correct={correct}
              exerciseId={exercise.id}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Feedback banner */}
      {submitted && !isFlashcard && (
        <div className={`flex items-start sm:items-center gap-3 p-4 rounded-xl mb-4 border ${
          correct ? 'bg-green-50 border-green-200 text-[#10B981]' : 'bg-red-50 border-red-200 text-[#EF4444]'
        }`}>
          <span className="text-2xl">{correct ? '✅' : '❌'}</span>
          <div>
            <p className="font-semibold text-sm">{correct ? 'Chính xác!' : 'Chưa đúng rồi!'}</p>
            {correct
              ? <p className="text-xs opacity-80">+{exercise.points} điểm</p>
              : <p className="text-xs opacity-90">
                  Đáp án đúng: <span className="font-semibold">
                    {(() => {
                      const d = exercise.data as Record<string, unknown>
                      if (Array.isArray(d.answers) && (d.answers as string[]).length > 0) {
                        return (d.answers as string[]).join(' / ')
                      }
                      return String(d.answer ?? '')
                    })()}
                  </span>
                </p>
            }
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isFlashcard && (
        <div className="flex justify-end">
          {!submitted ? (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring' }}
              onClick={checkAnswer} disabled={!canSubmit}
              className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
              Kiểm tra
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring' }}
              onClick={nextExercise}
              className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm">
              {currentIndex + 1 >= queue.length ? 'Xem kết quả' : 'Tiếp theo →'}
            </motion.button>
          )}
        </div>
      )}
      </div>{/* end content chính */}
    </div>
  )
}
