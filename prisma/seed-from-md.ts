import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function parseMd(content: string) {
  const lessons: { title: string; exercises: { question: string; options: string[]; answer: string; explanation: string }[] }[] = [];

  // Split by "## " to get lesson blocks
  const lessonBlocks = content.split(/\n(?=## )/);

  for (const block of lessonBlocks) {
    const titleMatch = block.match(/^## (.+)/);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();

    // Parse answer key if present: "### Đáp án Bài X:\n1-B, 2-A, ..."
    const answerKeyMatch = block.match(/### Đáp án[^\n]*\n([^\n]+)/);
    const answerMap: Record<number, string> = {};
    if (answerKeyMatch) {
      const pairs = answerKeyMatch[1].split(",").map(s => s.trim());
      for (const pair of pairs) {
        const m = pair.match(/^(\d+)-([A-D])$/);
        if (m) answerMap[parseInt(m[1])] = m[2];
      }
    }

    // Parse questions: **Câu N:** question text
    const qRegex = /\*\*Câu (\d+):\*\*\s*(.+?)\n((?:[A-D]\..+\n?)+)/g;
    const exercises: { question: string; options: string[]; answer: string; explanation: string }[] = [];

    let match: RegExpExecArray | null;
    while ((match = qRegex.exec(block)) !== null) {
      const qNum = parseInt(match[1]);
      const question = match[2].trim();
      const optBlock = match[3];
      const opts: string[] = [];
      const optRegex = /^([A-D])\.\s*(.+)/gm;
      let om: RegExpExecArray | null;
      while ((om = optRegex.exec(optBlock)) !== null) {
        opts.push(om[2].trim());
      }
      if (opts.length === 4) {
        const ansLetter = answerMap[qNum] || "";
        const ansText = ansLetter ? opts[["A","B","C","D"].indexOf(ansLetter)] : "";
        exercises.push({ question, options: opts, answer: ansLetter, explanation: "" });
      }
    }

    if (exercises.length > 0) {
      lessons.push({ title, exercises });
    }
  }

  return lessons;
}

async function main() {
  const content = fs.readFileSync(path.join(__dirname, "../data/baitap-a1-chuan.md"), "utf-8");
  const lessons = parseMd(content);
  console.log("Parsed:", lessons.length, "lessons");

  const course = await prisma.course.upsert({
    where: { id: "german-a1" },
    update: {},
    create: {
      id: "german-a1",
      title: "Tiếng Đức A1",
      language: "de",
      level: "A1",
      description: "Bài tập trắc nghiệm A1",
      published: true,
    },
  });

  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    const lid = `german-a1-${i + 1}`;
    const lesson = await prisma.lesson.upsert({
      where: { id: lid },
      update: { title: l.title },
      create: {
        id: lid,
        courseId: course.id,
        title: l.title,
        order: i + 1,
        content: l.title,
        published: true,
      },
    });

    await prisma.exercise.deleteMany({ where: { lessonId: lesson.id } });

    for (let j = 0; j < l.exercises.length; j++) {
      const ex = l.exercises[j];
      await prisma.exercise.create({
        data: {
          lessonId: lesson.id,
          type: "MULTIPLE_CHOICE",
          question: ex.question,
          data: { options: ex.options, answer: ex.answer, explanation: ex.explanation },
          points: 1,
          order: j + 1,
        },
      });
    }
    console.log(`Lesson ${i + 1} "${l.title}": ${l.exercises.length} exercises`);
  }

  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
