'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
// @ts-ignore
import confetti from 'canvas-confetti'
import FlashcardExercise from './FlashcardExercise'
import FillBlankExercise from './FillBlankExercise'
import MultipleChoiceExercise from './MultipleChoiceExercise'
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
    .replace(/[.!?,]/g, '')
    // Chấp nhận cả ký tự đặc biệt tiếng Đức lẫn dạng thay thế
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  switch (exercise.type) {
    case 'FLASHCARD':
      return answer === 'known'
    case 'FILL_BLANK':
      return normalize(answer) === normalize(data.answer as string)
    case 'MULTIPLE_CHOICE':
      return answer === (data.answer as string)
    case 'DICTATION':
      return normalize(answer) === normalize(data.answer as string)
    case 'SORT_WORDS':
      return normalize(answer) === normalize(data.answer as string)
    default:
      return false
  }
}

export default function ExerciseRunner({ exercises, lessonId, courseId }: Props) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [sessionResults, setSessionResults] = useState<Array<{
    type: string
    question: string
    userAnswer: string
    correctAnswer: string
    correct: boolean
  }>>([])

  useEffect(() => {
    if (finished) {
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 }, colors: ['#2563EB','#10B981','#F59E0B','#EF4444'] })
    }
  }, [finished])

  const exercise = exercises[currentIndex]
  const isFlashcard = exercise?.type === 'FLASHCARD'
  const progress = exercises.length > 0 ? ((currentIndex) / exercises.length) * 100 : 0

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
    }])
    saveProgress(exercise.id, isCorrect ? exercise.points : 0)
    setTimeout(() => nextExercise(), 600)
  }

  function checkAnswer() {
    if (!userAnswer.trim()) return
    const isCorrect = checkCorrectness(exercise, userAnswer)
    setCorrect(isCorrect)
    setSubmitted(true)
    if (isCorrect) {
      setTotalScore(s => s + exercise.points)
      setCorrectCount(c => c + 1)
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } })
    }
    const data = exercise.data as Record<string, unknown>
    const correctAnswer =
      exercise.type === 'MULTIPLE_CHOICE' ? String(data.answer ?? '') :
      exercise.type === 'SORT_WORDS' ? String(data.answer ?? '') :
      exercise.type === 'FILL_BLANK' ? String(data.answer ?? '') :
      exercise.type === 'DICTATION' ? String(data.answer ?? '') : ''
    setSessionResults(prev => [...prev, {
      type: exercise.type,
      question: exercise.question,
      userAnswer,
      correctAnswer,
      correct: isCorrect,
    }])
    saveProgress(exercise.id, isCorrect ? exercise.points : 0)
  }

  function saveProgress(exerciseId: string, score: number) {
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId, score }),
    }).catch(() => {})
  }

  function nextExercise() {
    if (currentIndex + 1 >= exercises.length) {
      setFinished(true)
    } else {
      setCurrentIndex(i => i + 1)
      setUserAnswer('')
      setSubmitted(false)
      setCorrect(false)
    }
  }

  // Finished screen
  if (finished) {
    const totalPoints = exercises.reduce((s, e) => s + e.points, 0)
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
          <p className="text-[#64748B] text-sm mb-2">
            {correctCount}/{exercises.length} câu đúng · {totalScore}/{totalPoints} điểm
          </p>

          {/* Score bar */}
          <div className="h-2 bg-slate-200 rounded-full mx-auto max-w-xs mb-8">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: pct >= 80 ? '#10B981' : pct >= 50 ? '#2563EB' : '#EF4444' }} />
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setCurrentIndex(0); setUserAnswer(''); setSubmitted(false)
                setCorrect(false); setTotalScore(0); setCorrectCount(0)
                setFinished(false); setSessionResults([])
              }}
              className="px-5 py-2.5 border-2 border-[#E2E8F0] rounded-xl text-[#334155] hover:bg-slate-50 font-medium transition-colors text-sm">
              Học lại
            </button>
            <button
              onClick={() => courseId ? router.push(`/courses/${courseId}`) : router.push('/practice')}
              className="px-5 py-2.5 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm shadow-sm">
              Về khóa học
            </button>
          </div>
        </div>

        {/* Bài sai */}
        {wrongExercises.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-[#334155] mb-4 text-sm">❌ Bài làm sai ({wrongExercises.length})</h3>
            <div className="space-y-3">
              {wrongExercises.map((r, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="text-[#64748B] text-xs uppercase tracking-widest mb-1">{r.type.replace('_', ' ')}</p>
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
      </div>
    )
  }

  if (!exercise) return null

  const canSubmit = userAnswer.trim().length > 0 && !submitted

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-[#64748B] mb-2">
          <span>Bài {currentIndex + 1} / {exercises.length}</span>
          <span>{exercise.points} điểm</span>
        </div>
        <div className="h-2 bg-[#E2E8F0] rounded-full">
          <motion.div
            className="h-full bg-[#2563EB] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Exercise type badge */}
      <div className="flex justify-center mb-5">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#64748B] bg-slate-100 px-3 py-1 rounded-full">
          {exercise.type === 'FLASHCARD' && 'Thẻ từ'}
          {exercise.type === 'FILL_BLANK' && 'Điền vào chỗ trống'}
          {exercise.type === 'MULTIPLE_CHOICE' && 'Trắc nghiệm'}
          {exercise.type === 'DICTATION' && 'Nghe và gõ'}
          {exercise.type === 'SORT_WORDS' && 'Sắp xếp từ'}
        </span>
      </div>

      {/* Exercise card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6 mb-4"
        >
          {exercise.type === 'FLASHCARD' && (
            <FlashcardExercise
              data={exercise.data}
              onAnswer={handleFlashcardAnswer}
            />
          )}
          {exercise.type === 'FILL_BLANK' && (
            <FillBlankExercise
              question={exercise.question}
              data={exercise.data}
              value={userAnswer}
              onChange={setUserAnswer}
              onSubmit={checkAnswer}
              submitted={submitted}
              correct={correct}
            />
          )}
          {exercise.type === 'MULTIPLE_CHOICE' && (
            <MultipleChoiceExercise
              question={exercise.question}
              data={exercise.data}
              value={userAnswer}
              onChange={setUserAnswer}
              submitted={submitted}
              correct={correct}
            />
          )}
          {exercise.type === 'DICTATION' && (
            <DictationExercise
              question={exercise.question}
              data={exercise.data}
              value={userAnswer}
              onChange={setUserAnswer}
              submitted={submitted}
              correct={correct}
            />
          )}
          {exercise.type === 'SORT_WORDS' && (
            <SortWordsExercise
              question={exercise.question}
              data={exercise.data}
              value={userAnswer}
              onChange={setUserAnswer}
              submitted={submitted}
              correct={correct}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Feedback banner */}
      {submitted && !isFlashcard && (
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 border ${
          correct
            ? 'bg-green-50 border-green-200 text-[#10B981]'
            : 'bg-red-50 border-red-200 text-[#EF4444]'
        }`}>
          <span className="text-2xl">{correct ? '✅' : '❌'}</span>
          <div>
            <p className="font-semibold text-sm">{correct ? 'Chính xác!' : 'Chưa đúng rồi!'}</p>
            {correct
              ? <p className="text-xs opacity-80">+{exercise.points} điểm</p>
              : <p className="text-xs opacity-90">
                  Đáp án đúng: <span className="font-semibold">
                    {exercise.type === 'MULTIPLE_CHOICE'
                      ? String(exercise.data.answer)
                      : exercise.type === 'SORT_WORDS'
                      ? String(exercise.data.answer)
                      : String(exercise.data.answer ?? '')}
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring" }}
              onClick={checkAnswer}
              disabled={!canSubmit}
              className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Kiểm tra
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring" }}
              onClick={nextExercise}
              className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              {currentIndex + 1 >= exercises.length ? 'Xem kết quả' : 'Tiếp theo →'}
            </motion.button>
          )}
        </div>
      )}
    </div>
  )
}
