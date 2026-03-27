import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const course = await prisma.course.findFirst({ where: { title: { contains: 'A1' } } })
  if (!course) throw new Error('Course A1 not found. Run prisma db seed first.')

  const lessonsData: any[] = [
  {
    "order": 1,
    "title": "Bài 1: Chào hỏi cơ bản (Begrüßung)",
    "published": true,
    "exercises": [
      {
        "type": "FLASHCARD",
        "question": "Guten Morgen nghĩa là gì?",
        "data": {
          "front": "Guten Morgen",
          "back": "Chào buổi sáng",
          "pronunciation": "GOO-ten MOR-gen"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Guten Tag nghĩa là gì?",
        "data": {
          "front": "Guten Tag",
          "back": "Xin chào (ban ngày)",
          "pronunciation": "GOO-ten TAHK"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Guten Abend nghĩa là gì?",
        "data": {
          "front": "Guten Abend",
          "back": "Chào buổi tối",
          "pronunciation": "GOO-ten AH-bent"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Gute Nacht nghĩa là gì?",
        "data": {
          "front": "Gute Nacht",
          "back": "Chúc ngủ ngon",
          "pronunciation": "GOO-te NAKHT"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Entschuldigung nghĩa là gì?",
        "data": {
          "front": "Entschuldigung",
          "back": "Xin lỗi",
          "pronunciation": "ent-SHOOL-di-goong"
        },
        "points": 5
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Buổi sáng bạn nói gì?",
        "data": {
          "options": [
            "Guten Morgen",
            "Guten Abend",
            "Gute Nacht",
            "Auf Wiedersehen"
          ],
          "answer": "Guten Morgen",
          "explanation": "Morgen = buổi sáng"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Tạm biệt trang trọng là gì?",
        "data": {
          "options": [
            "Tschüss",
            "Hallo",
            "Auf Wiedersehen",
            "Danke"
          ],
          "answer": "Auf Wiedersehen",
          "explanation": "Auf Wiedersehen dùng trong hoàn cảnh trang trọng"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Wie geht es Ihnen? dùng với ai?",
        "data": {
          "options": [
            "Bạn thân",
            "Người trang trọng",
            "Trẻ em",
            "Gia đình"
          ],
          "answer": "Người trang trọng",
          "explanation": "Ihnen là đại từ kính ngữ"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Danke schön nghĩa là gì?",
        "data": {
          "options": [
            "Xin lỗi",
            "Cảm ơn nhiều",
            "Không có gì",
            "Tạm biệt"
          ],
          "answer": "Cảm ơn nhiều",
          "explanation": "schön = đẹp, Danke schön = cảm ơn nhiều"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Bitte nghĩa là gì?",
        "data": {
          "options": [
            "Cảm ơn",
            "Xin lỗi",
            "Xin mời / Không có chi",
            "Tạm biệt"
          ],
          "answer": "Xin mời / Không có chi",
          "explanation": "Bitte dùng nhiều nghĩa tùy ngữ cảnh"
        },
        "points": 8
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: ___ Morgen!",
        "data": {
          "sentence": "___ Morgen!",
          "answer": "Guten",
          "hint": "Tính từ tốt chia trung tính"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Auf ___!",
        "data": {
          "sentence": "Auf ___!",
          "answer": "Wiedersehen",
          "hint": "Gặp lại"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: ___ geht es dir?",
        "data": {
          "sentence": "___ geht es dir?",
          "answer": "Wie",
          "hint": "Từ để hỏi như thế nào"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Danke, ___ geht es gut!",
        "data": {
          "sentence": "Danke, ___ geht es gut!",
          "answer": "mir",
          "hint": "Dativ ngôi 1 số ít"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: ___ sehr! (Không có chi)",
        "data": {
          "sentence": "Bitte ___!",
          "answer": "sehr",
          "hint": "Rất"
        },
        "points": 10
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Chào buổi tối",
        "data": {
          "words": [
            "Guten",
            "Abend",
            "!"
          ],
          "answer": "Guten Abend !"
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Bạn có khỏe không (thân mật)",
        "data": {
          "words": [
            "Wie",
            "geht",
            "es",
            "dir",
            "?"
          ],
          "answer": "Wie geht es dir ?"
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Cảm ơn tôi khỏe",
        "data": {
          "words": [
            "Danke",
            "es",
            "geht",
            "mir",
            "gut"
          ],
          "answer": "Danke es geht mir gut"
        },
        "points": 12
      },
      {
        "type": "DICTATION",
        "question": "Viết câu chào hỏi",
        "data": {
          "audio_text": "Guten Morgen, wie geht es Ihnen?",
          "answer": "Guten Morgen wie geht es Ihnen",
          "hint": "Chào sáng + hỏi thăm"
        },
        "points": 15
      },
      {
        "type": "DICTATION",
        "question": "Viết câu tạm biệt",
        "data": {
          "audio_text": "Auf Wiedersehen und Tschüss!",
          "answer": "Auf Wiedersehen und Tschüss",
          "hint": "Trang trọng + thân mật"
        },
        "points": 15
      }
    ]
  },
  {
    "order": 2,
    "title": "Bài 2: Giới thiệu bản thân (Vorstellung)",
    "published": true,
    "exercises": [
      {
        "type": "FLASHCARD",
        "question": "Ich heiße nghĩa là gì?",
        "data": {
          "front": "Ich heiße",
          "back": "Tôi tên là",
          "pronunciation": "ikh HY-se"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Ich komme aus nghĩa là gì?",
        "data": {
          "front": "Ich komme aus",
          "back": "Tôi đến từ",
          "pronunciation": "ikh KOM-e ows"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Ich wohne in nghĩa là gì?",
        "data": {
          "front": "Ich wohne in",
          "back": "Tôi sống ở",
          "pronunciation": "ikh VOH-ne in"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Wie alt bist du? nghĩa là gì?",
        "data": {
          "front": "Wie alt bist du?",
          "back": "Bạn bao nhiêu tuổi?",
          "pronunciation": "vee alt bist doo"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Ich bin ... Jahre alt nghĩa là gì?",
        "data": {
          "front": "Ich bin 20 Jahre alt",
          "back": "Tôi 20 tuổi",
          "pronunciation": "ikh bin ... YAH-re alt"
        },
        "points": 5
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Cách hỏi tên ai đó (thân mật)?",
        "data": {
          "options": [
            "Wie heißen Sie?",
            "Wie heißt du?",
            "Wer bist Sie?",
            "Was ist dein Name?"
          ],
          "answer": "Wie heißt du?",
          "explanation": "Wie heißt du = bạn tên gì (thân mật)"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Cách hỏi 'Bạn đến từ đâu?' (trang trọng)?",
        "data": {
          "options": [
            "Woher kommst du?",
            "Woher kommen Sie?",
            "Wo wohnst du?",
            "Wie alt sind Sie?"
          ],
          "answer": "Woher kommen Sie?",
          "explanation": "Sie = đại từ trang trọng"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Ich bin Vietnamesin' nghĩa là gì?",
        "data": {
          "options": [
            "Tôi là người Việt (nữ)",
            "Tôi ở Việt Nam",
            "Tôi đến từ Việt Nam",
            "Tôi nói tiếng Việt"
          ],
          "answer": "Tôi là người Việt (nữ)",
          "explanation": "Vietnamesin là danh từ nữ giới"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Điền vào: Ich ___ aus Vietnam.",
        "data": {
          "options": [
            "bin",
            "heiße",
            "komme",
            "wohne"
          ],
          "answer": "komme",
          "explanation": "kommen aus = đến từ"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Freut mich!' nghĩa là gì?",
        "data": {
          "options": [
            "Tôi mệt",
            "Rất vui được gặp",
            "Tôi hiểu",
            "Xin lỗi"
          ],
          "answer": "Rất vui được gặp",
          "explanation": "Freut mich = rất vui được gặp bạn"
        },
        "points": 8
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich ___ Maria. (Tên tôi là Maria)",
        "data": {
          "sentence": "Ich ___ Maria.",
          "answer": "heiße",
          "hint": "Động từ heißen chia ngôi 1"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich ___ aus Vietnam.",
        "data": {
          "sentence": "Ich ___ aus Vietnam.",
          "answer": "komme",
          "hint": "Động từ kommen chia ngôi 1"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich ___ in Hanoi.",
        "data": {
          "sentence": "Ich ___ in Hanoi.",
          "answer": "wohne",
          "hint": "Động từ wohnen chia ngôi 1"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich ___ 25 Jahre alt.",
        "data": {
          "sentence": "Ich ___ 25 Jahre alt.",
          "answer": "bin",
          "hint": "Động từ sein ngôi 1"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Wie ___ du?",
        "data": {
          "sentence": "Wie ___ du?",
          "answer": "heißt",
          "hint": "heißen chia ngôi 2"
        },
        "points": 10
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Tôi tên là Lan",
        "data": {
          "words": [
            "Ich",
            "heiße",
            "Lan",
            "."
          ],
          "answer": "Ich heiße Lan ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Tôi đến từ Việt Nam",
        "data": {
          "words": [
            "Ich",
            "komme",
            "aus",
            "Vietnam",
            "."
          ],
          "answer": "Ich komme aus Vietnam ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Bạn bao nhiêu tuổi?",
        "data": {
          "words": [
            "Wie",
            "alt",
            "bist",
            "du",
            "?"
          ],
          "answer": "Wie alt bist du ?"
        },
        "points": 12
      },
      {
        "type": "DICTATION",
        "question": "Viết câu giới thiệu",
        "data": {
          "audio_text": "Ich heiße Anna und ich komme aus Deutschland.",
          "answer": "Ich heiße Anna und ich komme aus Deutschland",
          "hint": "Tên + đến từ"
        },
        "points": 15
      },
      {
        "type": "DICTATION",
        "question": "Viết câu hỏi tên",
        "data": {
          "audio_text": "Wie heißt du? Woher kommst du?",
          "answer": "Wie heißt du Woher kommst du",
          "hint": "2 câu hỏi giới thiệu"
        },
        "points": 15
      }
    ]
  },
  {
    "order": 3,
    "title": "Bài 3: Số đếm 1-100 (Zahlen)",
    "published": true,
    "exercises": [
      {
        "type": "FLASHCARD",
        "question": "1-5 tiếng Đức?",
        "data": {
          "front": "1,2,3,4,5",
          "back": "eins, zwei, drei, vier, fünf",
          "pronunciation": "ayns, tsvay, dry, feer, fuenf"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "6-10 tiếng Đức?",
        "data": {
          "front": "6,7,8,9,10",
          "back": "sechs, sieben, acht, neun, zehn",
          "pronunciation": "zeks, ZEE-ben, akht, noyn, tsayn"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "11,12 tiếng Đức?",
        "data": {
          "front": "11, 12",
          "back": "elf, zwölf",
          "pronunciation": "elf, tsvoelf"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "20, 30 tiếng Đức?",
        "data": {
          "front": "20, 30",
          "back": "zwanzig, dreißig",
          "pronunciation": "TSVAN-tsikh, DRY-sikh"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "100 tiếng Đức?",
        "data": {
          "front": "100",
          "back": "hundert",
          "pronunciation": "HOON-dert"
        },
        "points": 5
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Số 7 tiếng Đức là?",
        "data": {
          "options": [
            "sechs",
            "sieben",
            "acht",
            "neun"
          ],
          "answer": "sieben",
          "explanation": "sieben = 7"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Số 12 tiếng Đức là?",
        "data": {
          "options": [
            "zehn",
            "elf",
            "zwölf",
            "dreizehn"
          ],
          "answer": "zwölf",
          "explanation": "zwölf = 12, số đặc biệt"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Số 50 tiếng Đức là?",
        "data": {
          "options": [
            "dreißig",
            "vierzig",
            "fünfzig",
            "sechzig"
          ],
          "answer": "fünfzig",
          "explanation": "fünfzig = 5x10 = 50"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Số 21 tiếng Đức là?",
        "data": {
          "options": [
            "zwanzigeins",
            "einundzwanzig",
            "zwanzig und ein",
            "einzwanzig"
          ],
          "answer": "einundzwanzig",
          "explanation": "Quy tắc: đơn vị + und + chục"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Wie viel kostet das?' nghĩa là gì?",
        "data": {
          "options": [
            "Đây là cái gì?",
            "Cái này bao nhiêu tiền?",
            "Bạn có bao nhiêu?",
            "Số này là gì?"
          ],
          "answer": "Cái này bao nhiêu tiền?",
          "explanation": "viel kostet = bao nhiêu tiền"
        },
        "points": 8
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Das kostet ___ Euro. (5 Euro)",
        "data": {
          "sentence": "Das kostet ___ Euro.",
          "answer": "fünf",
          "hint": "Số 5"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich bin ___ Jahre alt. (25 tuổi)",
        "data": {
          "sentence": "Ich bin ___ Jahre alt.",
          "answer": "fünfundzwanzig",
          "hint": "25 = fünf + und + zwanzig"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: ___ plus drei ist zehn. (7+3=10)",
        "data": {
          "sentence": "___ plus drei ist zehn.",
          "answer": "Sieben",
          "hint": "Số 7"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich habe ___ Bücher. (12 quyển)",
        "data": {
          "sentence": "Ich habe ___ Bücher.",
          "answer": "zwölf",
          "hint": "Số 12, đặc biệt trong tiếng Đức"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Das ist Nummer ___. (Số 1)",
        "data": {
          "sentence": "Das ist Nummer ___.",
          "answer": "eins",
          "hint": "Số đầu tiên"
        },
        "points": 10
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Tôi có 3 quyển sách",
        "data": {
          "words": [
            "Ich",
            "habe",
            "drei",
            "Bücher",
            "."
          ],
          "answer": "Ich habe drei Bücher ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Cái này giá 10 Euro",
        "data": {
          "words": [
            "Das",
            "kostet",
            "zehn",
            "Euro",
            "."
          ],
          "answer": "Das kostet zehn Euro ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Tôi 20 tuổi",
        "data": {
          "words": [
            "Ich",
            "bin",
            "zwanzig",
            "Jahre",
            "alt",
            "."
          ],
          "answer": "Ich bin zwanzig Jahre alt ."
        },
        "points": 12
      },
      {
        "type": "DICTATION",
        "question": "Viết dãy số",
        "data": {
          "audio_text": "eins, zwei, drei, vier, fünf",
          "answer": "eins zwei drei vier fünf",
          "hint": "Đếm từ 1 đến 5"
        },
        "points": 15
      },
      {
        "type": "DICTATION",
        "question": "Viết câu về số",
        "data": {
          "audio_text": "Das kostet zwanzig Euro.",
          "answer": "Das kostet zwanzig Euro",
          "hint": "Giá 20 Euro"
        },
        "points": 15
      }
    ]
  },
  {
    "order": 4,
    "title": "Bài 4: Màu sắc & hình dạng (Farben & Formen)",
    "published": true,
    "exercises": [
      {
        "type": "FLASHCARD",
        "question": "rot nghĩa là gì?",
        "data": {
          "front": "rot",
          "back": "màu đỏ",
          "pronunciation": "roht"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "blau nghĩa là gì?",
        "data": {
          "front": "blau",
          "back": "màu xanh dương",
          "pronunciation": "blow"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "grün nghĩa là gì?",
        "data": {
          "front": "grün",
          "back": "màu xanh lá",
          "pronunciation": "grüün"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "gelb nghĩa là gì?",
        "data": {
          "front": "gelb",
          "back": "màu vàng",
          "pronunciation": "gelp"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "schwarz/weiß nghĩa là gì?",
        "data": {
          "front": "schwarz / weiß",
          "back": "đen / trắng",
          "pronunciation": "shvarts / vyss"
        },
        "points": 5
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Màu gì là 'blau'?",
        "data": {
          "options": [
            "Đỏ",
            "Xanh dương",
            "Vàng",
            "Xanh lá"
          ],
          "answer": "Xanh dương",
          "explanation": "blau = xanh dương như bầu trời"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Màu cỏ là?",
        "data": {
          "options": [
            "rot",
            "gelb",
            "grün",
            "blau"
          ],
          "answer": "grün",
          "explanation": "grün = xanh lá như cỏ"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Der Kreis' nghĩa là gì?",
        "data": {
          "options": [
            "Hình vuông",
            "Hình tròn",
            "Hình tam giác",
            "Hình chữ nhật"
          ],
          "answer": "Hình tròn",
          "explanation": "Kreis = hình tròn"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Das Dreieck' nghĩa là gì?",
        "data": {
          "options": [
            "Hình vuông",
            "Hình tròn",
            "Hình tam giác",
            "Hình thoi"
          ],
          "answer": "Hình tam giác",
          "explanation": "Drei = 3, Eck = góc → tam giác"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Die Flagge Deutschlands hat ___ Farben'",
        "data": {
          "options": [
            "zwei",
            "drei",
            "vier",
            "fünf"
          ],
          "answer": "drei",
          "explanation": "Cờ Đức: schwarz-rot-gold = 3 màu"
        },
        "points": 8
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Der Himmel ist ___. (Bầu trời màu xanh)",
        "data": {
          "sentence": "Der Himmel ist ___.",
          "answer": "blau",
          "hint": "Màu xanh dương"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Das Gras ist ___. (Cỏ màu xanh lá)",
        "data": {
          "sentence": "Das Gras ist ___.",
          "answer": "grün",
          "hint": "Màu xanh lá cây"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Die Rose ist ___. (Hoa hồng màu đỏ)",
        "data": {
          "sentence": "Die Rose ist ___.",
          "answer": "rot",
          "hint": "Màu đỏ"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Das Quadrat hat ___ Seiten. (4 cạnh)",
        "data": {
          "sentence": "Das Quadrat hat ___ Seiten.",
          "answer": "vier",
          "hint": "Số 4"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Welche ___ hat das Auto? (Màu gì)",
        "data": {
          "sentence": "Welche ___ hat das Auto?",
          "answer": "Farbe",
          "hint": "Từ màu sắc"
        },
        "points": 10
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Bầu trời màu xanh",
        "data": {
          "words": [
            "Der",
            "Himmel",
            "ist",
            "blau",
            "."
          ],
          "answer": "Der Himmel ist blau ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Xe hơi của tôi màu đỏ",
        "data": {
          "words": [
            "Mein",
            "Auto",
            "ist",
            "rot",
            "."
          ],
          "answer": "Mein Auto ist rot ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Hình tròn màu vàng",
        "data": {
          "words": [
            "Der",
            "Kreis",
            "ist",
            "gelb",
            "."
          ],
          "answer": "Der Kreis ist gelb ."
        },
        "points": 12
      },
      {
        "type": "DICTATION",
        "question": "Viết câu về màu sắc",
        "data": {
          "audio_text": "Das Haus ist weiß und blau.",
          "answer": "Das Haus ist weiß und blau",
          "hint": "Nhà màu trắng và xanh"
        },
        "points": 15
      },
      {
        "type": "DICTATION",
        "question": "Viết câu hỏi màu sắc",
        "data": {
          "audio_text": "Welche Farbe hat der Ball?",
          "answer": "Welche Farbe hat der Ball",
          "hint": "Quả bóng màu gì?"
        },
        "points": 15
      }
    ]
  },
  {
    "order": 5,
    "title": "Bài 5: Gia đình (Familie)",
    "published": true,
    "exercises": [
      {
        "type": "FLASHCARD",
        "question": "die Mutter nghĩa là gì?",
        "data": {
          "front": "die Mutter",
          "back": "mẹ",
          "pronunciation": "dee MOO-ter"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "der Vater nghĩa là gì?",
        "data": {
          "front": "der Vater",
          "back": "bố/cha",
          "pronunciation": "dehr FAH-ter"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "der Bruder / die Schwester?",
        "data": {
          "front": "der Bruder / die Schwester",
          "back": "anh/em trai / chị/em gái",
          "pronunciation": "BROO-der / SHVES-ter"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "die Großmutter / der Großvater?",
        "data": {
          "front": "die Großmutter / der Großvater",
          "back": "bà / ông",
          "pronunciation": "GROHS-moo-ter / GROHS-fah-ter"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "das Kind / die Kinder?",
        "data": {
          "front": "das Kind / die Kinder",
          "back": "đứa con / các con",
          "pronunciation": "kint / KIN-der"
        },
        "points": 5
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'die Schwester' nghĩa là?",
        "data": {
          "options": [
            "Anh trai",
            "Em trai",
            "Chị/em gái",
            "Mẹ"
          ],
          "answer": "Chị/em gái",
          "explanation": "Schwester = chị hoặc em gái"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Mein Vater heißt...' nghĩa là?",
        "data": {
          "options": [
            "Mẹ tôi tên là",
            "Bố tôi tên là",
            "Anh tôi tên là",
            "Ông tôi tên là"
          ],
          "answer": "Bố tôi tên là",
          "explanation": "Vater = bố/cha"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Ich habe zwei Geschwister' nghĩa là?",
        "data": {
          "options": [
            "Tôi có 2 con",
            "Tôi có 2 anh chị em",
            "Tôi có 2 ông bà",
            "Tôi có 2 bạn"
          ],
          "answer": "Tôi có 2 anh chị em",
          "explanation": "Geschwister = anh chị em (tập hợp)"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Ông nội/ngoại tiếng Đức là?",
        "data": {
          "options": [
            "Großmutter",
            "Großvater",
            "Onkel",
            "Tante"
          ],
          "answer": "Großvater",
          "explanation": "Großvater = ông, groß = lớn/già"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Die Familie ist wichtig' nghĩa là?",
        "data": {
          "options": [
            "Gia đình đông vui",
            "Gia đình rất quan trọng",
            "Gia đình hạnh phúc",
            "Gia đình nhỏ"
          ],
          "answer": "Gia đình rất quan trọng",
          "explanation": "wichtig = quan trọng"
        },
        "points": 8
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Meine ___ heißt Anna. (Mẹ)",
        "data": {
          "sentence": "Meine ___ heißt Anna.",
          "answer": "Mutter",
          "hint": "Mẹ, giới tính nữ"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Mein ___ ist Arzt. (Bố)",
        "data": {
          "sentence": "Mein ___ ist Arzt.",
          "answer": "Vater",
          "hint": "Bố, giới tính nam"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich habe einen ___. (Một anh trai)",
        "data": {
          "sentence": "Ich habe einen ___.",
          "answer": "Bruder",
          "hint": "Anh/em trai"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Meine ___ sind alt. (Ông bà - chung)",
        "data": {
          "sentence": "Meine ___ sind alt.",
          "answer": "Großeltern",
          "hint": "Ông bà (số nhiều)"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Das ___ ist klein. (Đứa con)",
        "data": {
          "sentence": "Das ___ ist klein.",
          "answer": "Kind",
          "hint": "Con nhỏ, giới tính trung"
        },
        "points": 10
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Mẹ tôi rất tốt",
        "data": {
          "words": [
            "Meine",
            "Mutter",
            "ist",
            "sehr",
            "gut",
            "."
          ],
          "answer": "Meine Mutter ist sehr gut ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Tôi có một em gái",
        "data": {
          "words": [
            "Ich",
            "habe",
            "eine",
            "Schwester",
            "."
          ],
          "answer": "Ich habe eine Schwester ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Gia đình tôi có 4 người",
        "data": {
          "words": [
            "Meine",
            "Familie",
            "hat",
            "vier",
            "Personen",
            "."
          ],
          "answer": "Meine Familie hat vier Personen ."
        },
        "points": 12
      },
      {
        "type": "DICTATION",
        "question": "Viết câu về gia đình",
        "data": {
          "audio_text": "Mein Vater ist 50 Jahre alt.",
          "answer": "Mein Vater ist 50 Jahre alt",
          "hint": "Bố tôi 50 tuổi"
        },
        "points": 15
      },
      {
        "type": "DICTATION",
        "question": "Viết câu giới thiệu gia đình",
        "data": {
          "audio_text": "Ich habe eine Schwester und einen Bruder.",
          "answer": "Ich habe eine Schwester und einen Bruder",
          "hint": "Có chị gái và anh trai"
        },
        "points": 15
      }
    ]
  },
  {
    "order": 6,
    "title": "Bài 6: Thức ăn & đồ uống (Essen & Trinken)",
    "published": true,
    "exercises": [
      {
        "type": "FLASHCARD",
        "question": "das Brot nghĩa là gì?",
        "data": {
          "front": "das Brot",
          "back": "bánh mì",
          "pronunciation": "broht"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "der Käse nghĩa là gì?",
        "data": {
          "front": "der Käse",
          "back": "phô mai",
          "pronunciation": "KAY-ze"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "das Wasser nghĩa là gì?",
        "data": {
          "front": "das Wasser",
          "back": "nước",
          "pronunciation": "VAS-ser"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "der Kaffee nghĩa là gì?",
        "data": {
          "front": "der Kaffee",
          "back": "cà phê",
          "pronunciation": "KAF-feh"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "das Obst / das Gemüse?",
        "data": {
          "front": "das Obst / das Gemüse",
          "back": "hoa quả / rau củ",
          "pronunciation": "ohpst / ge-MÜ-ze"
        },
        "points": 5
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Ich möchte Wasser' nghĩa là?",
        "data": {
          "options": [
            "Tôi có nước",
            "Tôi muốn nước",
            "Tôi uống nước",
            "Tôi mua nước"
          ],
          "answer": "Tôi muốn nước",
          "explanation": "möchte = muốn (dạng lịch sự)"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Schmeckt es dir?' nghĩa là?",
        "data": {
          "options": [
            "Bạn đói không?",
            "Bạn có khát không?",
            "Bạn có thích ăn không?",
            "Cái gì ngon?"
          ],
          "answer": "Bạn có thích ăn không?",
          "explanation": "schmecken = ngon/có vị ngon"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Ich esse gern Brot' nghĩa là?",
        "data": {
          "options": [
            "Tôi không ăn bánh mì",
            "Tôi thích ăn bánh mì",
            "Tôi mua bánh mì",
            "Tôi làm bánh mì"
          ],
          "answer": "Tôi thích ăn bánh mì",
          "explanation": "gern = thích (làm gì đó)"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Bữa sáng tiếng Đức là?",
        "data": {
          "options": [
            "Mittagessen",
            "Abendessen",
            "Frühstück",
            "Snack"
          ],
          "answer": "Frühstück",
          "explanation": "früh = sáng sớm, Stück = miếng → bữa sáng"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Ich trinke keinen Alkohol' nghĩa là?",
        "data": {
          "options": [
            "Tôi uống rượu",
            "Tôi không uống rượu",
            "Tôi mua rượu",
            "Tôi ghét rượu"
          ],
          "answer": "Tôi không uống rượu",
          "explanation": "kein = không có, phủ định danh từ"
        },
        "points": 8
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich ___ Kaffee. (uống)",
        "data": {
          "sentence": "Ich ___ Kaffee.",
          "answer": "trinke",
          "hint": "Động từ trinken chia ngôi 1"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Das ___ ist lecker! (Bánh mì ngon)",
        "data": {
          "sentence": "Das ___ ist lecker!",
          "answer": "Brot",
          "hint": "Bánh mì, giới tính trung"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich ___ gern Obst. (thích ăn)",
        "data": {
          "sentence": "Ich ___ gern Obst.",
          "answer": "esse",
          "hint": "essen chia ngôi 1"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: ___ du Tee oder Kaffee? (Uống)",
        "data": {
          "sentence": "___ du Tee oder Kaffee?",
          "answer": "Trinkst",
          "hint": "trinken chia ngôi 2"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Das Frühstück ist ___. (Ngon)",
        "data": {
          "sentence": "Das Frühstück ist ___.",
          "answer": "lecker",
          "hint": "Từ diễn tả ngon miệng"
        },
        "points": 10
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Tôi muốn một tách cà phê",
        "data": {
          "words": [
            "Ich",
            "möchte",
            "einen",
            "Kaffee",
            "."
          ],
          "answer": "Ich möchte einen Kaffee ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Tôi thích ăn phô mai",
        "data": {
          "words": [
            "Ich",
            "esse",
            "gern",
            "Käse",
            "."
          ],
          "answer": "Ich esse gern Käse ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Bạn thích uống gì?",
        "data": {
          "words": [
            "Was",
            "trinkst",
            "du",
            "gern",
            "?"
          ],
          "answer": "Was trinkst du gern ?"
        },
        "points": 12
      },
      {
        "type": "DICTATION",
        "question": "Viết câu về thức ăn",
        "data": {
          "audio_text": "Ich esse Brot und trinke Tee zum Frühstück.",
          "answer": "Ich esse Brot und trinke Tee zum Frühstück",
          "hint": "Bữa sáng: bánh mì + trà"
        },
        "points": 15
      },
      {
        "type": "DICTATION",
        "question": "Viết câu gọi đồ",
        "data": {
          "audio_text": "Ich möchte ein Glas Wasser, bitte.",
          "answer": "Ich möchte ein Glas Wasser bitte",
          "hint": "Xin một ly nước"
        },
        "points": 15
      }
    ]
  },
  {
    "order": 7,
    "title": "Bài 7: Ngày giờ & lịch (Zeit & Kalender)",
    "published": true,
    "exercises": [
      {
        "type": "FLASHCARD",
        "question": "Các ngày trong tuần (1-3)?",
        "data": {
          "front": "Montag, Dienstag, Mittwoch",
          "back": "Thứ 2, Thứ 3, Thứ 4",
          "pronunciation": "MOHN-tahk, DEENS-tahk, MIT-vokh"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Các ngày trong tuần (4-7)?",
        "data": {
          "front": "Donnerstag, Freitag, Samstag, Sonntag",
          "back": "Thứ 5, Thứ 6, Thứ 7, Chủ nhật",
          "pronunciation": "DON-ners-tahk, FRY-tahk, ZAMS-tahk, ZON-tahk"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "heute / morgen / gestern?",
        "data": {
          "front": "heute / morgen / gestern",
          "back": "hôm nay / ngày mai / hôm qua",
          "pronunciation": "HOY-te / MOR-gen / GES-tern"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Wie spät ist es? / Es ist ... Uhr?",
        "data": {
          "front": "Wie spät ist es?",
          "back": "Mấy giờ rồi? / Đây là... giờ",
          "pronunciation": "vee shpayt ist es"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Tháng 1-4 tiếng Đức?",
        "data": {
          "front": "Januar, Februar, März, April",
          "back": "Tháng 1, 2, 3, 4",
          "pronunciation": "YA-noo-ar, FAY-broo-ar, mairts, ah-PRIL"
        },
        "points": 5
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Thứ 3 tiếng Đức là?",
        "data": {
          "options": [
            "Montag",
            "Dienstag",
            "Mittwoch",
            "Donnerstag"
          ],
          "answer": "Dienstag",
          "explanation": "Dienstag = thứ 3 (ngày của Tiw)"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Es ist drei Uhr' nghĩa là?",
        "data": {
          "options": [
            "3 giờ chiều",
            "3 giờ",
            "3 phút",
            "30 phút"
          ],
          "answer": "3 giờ",
          "explanation": "Es ist... Uhr = bây giờ là... giờ"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Am Montag' nghĩa là?",
        "data": {
          "options": [
            "Thứ 2 này",
            "Vào thứ 2",
            "Sau thứ 2",
            "Trước thứ 2"
          ],
          "answer": "Vào thứ 2",
          "explanation": "am + ngày = vào ngày đó"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "Tháng 12 tiếng Đức là?",
        "data": {
          "options": [
            "Oktober",
            "November",
            "Dezember",
            "September"
          ],
          "answer": "Dezember",
          "explanation": "Dezember = tháng 12 (decem = 10 trong Latin)"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Wann hast du Geburtstag?' nghĩa là?",
        "data": {
          "options": [
            "Bạn sinh ở đâu?",
            "Sinh nhật bạn khi nào?",
            "Bạn bao nhiêu tuổi?",
            "Bạn tên gì?"
          ],
          "answer": "Sinh nhật bạn khi nào?",
          "explanation": "Geburtstag = sinh nhật, wann = khi nào"
        },
        "points": 8
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: ___ ist Montag. (Hôm nay)",
        "data": {
          "sentence": "___ ist Montag.",
          "answer": "Heute",
          "hint": "Hôm nay"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Es ist ___ Uhr. (10 giờ)",
        "data": {
          "sentence": "Es ist ___ Uhr.",
          "answer": "zehn",
          "hint": "Số 10"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: ___ war Sonntag. (Hôm qua)",
        "data": {
          "sentence": "___ war Sonntag.",
          "answer": "Gestern",
          "hint": "Hôm qua"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Mein Geburtstag ist im ___. (Tháng 5)",
        "data": {
          "sentence": "Mein Geburtstag ist im ___.",
          "answer": "Mai",
          "explanation": "Mai = tháng 5"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Am ___ gehe ich zum Arzt. (Thứ 5)",
        "data": {
          "sentence": "Am ___ gehe ich zum Arzt.",
          "answer": "Donnerstag",
          "hint": "Thứ 5"
        },
        "points": 10
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Hôm nay là thứ 2",
        "data": {
          "words": [
            "Heute",
            "ist",
            "Montag",
            "."
          ],
          "answer": "Heute ist Montag ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Bây giờ là mấy giờ?",
        "data": {
          "words": [
            "Wie",
            "spät",
            "ist",
            "es",
            "?"
          ],
          "answer": "Wie spät ist es ?"
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Sinh nhật tôi là ngày 15 tháng 3",
        "data": {
          "words": [
            "Mein",
            "Geburtstag",
            "ist",
            "am",
            "15.",
            "März",
            "."
          ],
          "answer": "Mein Geburtstag ist am 15. März ."
        },
        "points": 12
      },
      {
        "type": "DICTATION",
        "question": "Viết câu về thời gian",
        "data": {
          "audio_text": "Heute ist Dienstag, der 10. März.",
          "answer": "Heute ist Dienstag der 10 März",
          "hint": "Ngày + tháng"
        },
        "points": 15
      },
      {
        "type": "DICTATION",
        "question": "Viết câu hỏi giờ",
        "data": {
          "audio_text": "Wie spät ist es? Es ist halb zehn.",
          "answer": "Wie spät ist es Es ist halb zehn",
          "hint": "Hỏi giờ + 9 giờ rưỡi"
        },
        "points": 15
      }
    ]
  },
  {
    "order": 8,
    "title": "Bài 8: Mua sắm (Einkaufen)",
    "published": true,
    "exercises": [
      {
        "type": "FLASHCARD",
        "question": "Was kostet das? nghĩa là gì?",
        "data": {
          "front": "Was kostet das?",
          "back": "Cái này giá bao nhiêu?",
          "pronunciation": "vas KOS-tet das"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "teuer / billig nghĩa là gì?",
        "data": {
          "front": "teuer / billig",
          "back": "đắt / rẻ",
          "pronunciation": "TOY-er / BIL-ikh"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "der Supermarkt nghĩa là gì?",
        "data": {
          "front": "der Supermarkt",
          "back": "siêu thị",
          "pronunciation": "ZOO-per-markt"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "kaufen / verkaufen?",
        "data": {
          "front": "kaufen / verkaufen",
          "back": "mua / bán",
          "pronunciation": "KOW-fen / fer-KOW-fen"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "der Euro / der Cent?",
        "data": {
          "front": "Euro / Cent",
          "back": "đồng Euro / xu",
          "pronunciation": "OY-ro / tsent"
        },
        "points": 5
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Das ist zu teuer' nghĩa là?",
        "data": {
          "options": [
            "Cái này rất rẻ",
            "Cái này quá đắt",
            "Cái này tốt",
            "Tôi muốn cái này"
          ],
          "answer": "Cái này quá đắt",
          "explanation": "zu = quá, teuer = đắt"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Haben Sie das in Größe M?' nghĩa là?",
        "data": {
          "options": [
            "Bạn có màu M không?",
            "Bạn có cỡ M không?",
            "Giá M là bao nhiêu?",
            "M ở đâu?"
          ],
          "answer": "Bạn có cỡ M không?",
          "explanation": "Größe = kích cỡ, quần áo"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Ich möchte das bezahlen' nghĩa là?",
        "data": {
          "options": [
            "Tôi muốn đổi cái này",
            "Tôi muốn trả tiền",
            "Tôi muốn hỏi giá",
            "Tôi không muốn"
          ],
          "answer": "Tôi muốn trả tiền",
          "explanation": "bezahlen = trả tiền"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Das Wechselgeld' nghĩa là?",
        "data": {
          "options": [
            "Tiền đổi/thối lại",
            "Tiền xu",
            "Thẻ tín dụng",
            "Hóa đơn"
          ],
          "answer": "Tiền đổi/thối lại",
          "explanation": "Wechsel = đổi, Geld = tiền"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Wo ist die Kasse?' nghĩa là?",
        "data": {
          "options": [
            "Lối vào ở đâu?",
            "Thu ngân ở đâu?",
            "Nhà vệ sinh ở đâu?",
            "Lối ra ở đâu?"
          ],
          "answer": "Thu ngân ở đâu?",
          "explanation": "Kasse = quầy thu ngân"
        },
        "points": 8
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Das ___ 10 Euro. (Giá)",
        "data": {
          "sentence": "Das ___ 10 Euro.",
          "answer": "kostet",
          "hint": "kosten chia ngôi 3 số ít"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich ___ ein T-Shirt. (Mua)",
        "data": {
          "sentence": "Ich ___ ein T-Shirt.",
          "answer": "kaufe",
          "hint": "kaufen chia ngôi 1"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Das ist sehr ___! (Rẻ)",
        "data": {
          "sentence": "Das ist sehr ___!",
          "answer": "billig",
          "hint": "Ngược với teuer"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: ___ kostet das Brot? (Giá bao nhiêu?)",
        "data": {
          "sentence": "___ kostet das Brot?",
          "answer": "Was",
          "hint": "Từ để hỏi 'cái gì'"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich ___ mit Karte. (Trả bằng thẻ)",
        "data": {
          "sentence": "Ich ___ mit Karte.",
          "answer": "bezahle",
          "hint": "bezahlen chia ngôi 1"
        },
        "points": 10
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Cái này giá bao nhiêu?",
        "data": {
          "words": [
            "Was",
            "kostet",
            "das",
            "?"
          ],
          "answer": "Was kostet das ?"
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Tôi muốn mua áo này",
        "data": {
          "words": [
            "Ich",
            "möchte",
            "dieses",
            "Hemd",
            "kaufen",
            "."
          ],
          "answer": "Ich möchte dieses Hemd kaufen ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Còn cỡ lớn không?",
        "data": {
          "words": [
            "Haben",
            "Sie",
            "das",
            "in",
            "Größe",
            "L",
            "?"
          ],
          "answer": "Haben Sie das in Größe L ?"
        },
        "points": 12
      },
      {
        "type": "DICTATION",
        "question": "Viết câu mua sắm",
        "data": {
          "audio_text": "Das kostet fünfzehn Euro neunzig.",
          "answer": "Das kostet fünfzehn Euro neunzig",
          "hint": "Giá 15,90 Euro"
        },
        "points": 15
      },
      {
        "type": "DICTATION",
        "question": "Viết câu trả tiền",
        "data": {
          "audio_text": "Ich möchte bezahlen, bitte.",
          "answer": "Ich möchte bezahlen bitte",
          "hint": "Muốn trả tiền"
        },
        "points": 15
      }
    ]
  },
  {
    "order": 9,
    "title": "Bài 9: Giao thông & địa điểm (Verkehr & Orte)",
    "published": true,
    "exercises": [
      {
        "type": "FLASHCARD",
        "question": "der Bus / der Zug?",
        "data": {
          "front": "der Bus / der Zug",
          "back": "xe buýt / tàu hỏa",
          "pronunciation": "boos / tsook"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "das Auto / das Fahrrad?",
        "data": {
          "front": "das Auto / das Fahrrad",
          "back": "xe hơi / xe đạp",
          "pronunciation": "OW-to / FAR-rat"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "der Bahnhof / der Flughafen?",
        "data": {
          "front": "der Bahnhof / der Flughafen",
          "back": "ga tàu / sân bay",
          "pronunciation": "BAHN-hohf / FLOOK-hah-fen"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "links / rechts / geradeaus?",
        "data": {
          "front": "links / rechts / geradeaus",
          "back": "trái / phải / thẳng",
          "pronunciation": "links / rekhts / ge-RA-de-ows"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Wo ist...? / Wie komme ich zu...?",
        "data": {
          "front": "Wo ist...? / Wie komme ich zu...?",
          "back": "... ở đâu? / Làm sao đến...?",
          "pronunciation": "voh ist / vee KOM-e ikh tsoo"
        },
        "points": 5
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Wo ist der Bahnhof?' nghĩa là?",
        "data": {
          "options": [
            "Bahnhof đi đâu?",
            "Ga tàu ở đâu?",
            "Tàu mấy giờ?",
            "Bao nhiêu tiền?"
          ],
          "answer": "Ga tàu ở đâu?",
          "explanation": "Wo ist = ở đâu"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Biegen Sie links ab' nghĩa là?",
        "data": {
          "options": [
            "Đi thẳng",
            "Rẽ trái",
            "Rẽ phải",
            "Quay lại"
          ],
          "answer": "Rẽ trái",
          "explanation": "abbiegen = rẽ, links = trái"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Ich fahre mit dem Bus' nghĩa là?",
        "data": {
          "options": [
            "Tôi đi bộ",
            "Tôi đi xe buýt",
            "Tôi đi taxi",
            "Tôi lái xe"
          ],
          "answer": "Tôi đi xe buýt",
          "explanation": "mit dem Bus = bằng xe buýt"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Wie weit ist es?' nghĩa là?",
        "data": {
          "options": [
            "Đi bao lâu?",
            "Còn bao xa?",
            "Hướng nào?",
            "Ở đâu?"
          ],
          "answer": "Còn bao xa?",
          "explanation": "weit = xa, wie weit = bao xa"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Die Ampel' nghĩa là?",
        "data": {
          "options": [
            "Bảng hiệu",
            "Đèn giao thông",
            "Biển báo",
            "Vạch kẻ đường"
          ],
          "answer": "Đèn giao thông",
          "explanation": "Ampel = đèn giao thông"
        },
        "points": 8
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Der ___ fährt um 10 Uhr. (Tàu)",
        "data": {
          "sentence": "Der ___ fährt um 10 Uhr.",
          "answer": "Zug",
          "hint": "Tàu hỏa"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Biegen Sie ___ ab. (Rẽ phải)",
        "data": {
          "sentence": "Biegen Sie ___ ab.",
          "answer": "rechts",
          "hint": "Ngược với links"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich fahre mit dem ___. (Xe đạp)",
        "data": {
          "sentence": "Ich fahre mit dem ___.",
          "answer": "Fahrrad",
          "hint": "Xe đạp, giới tính trung"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Der Flughafen ist ___ hier. (Gần đây)",
        "data": {
          "sentence": "Der Flughafen ist ___ hier.",
          "answer": "in der Nähe von",
          "hint": "Gần, ở gần"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: ___ ist die nächste U-Bahn? (Ở đâu)",
        "data": {
          "sentence": "___ ist die nächste U-Bahn?",
          "answer": "Wo",
          "hint": "Từ để hỏi địa điểm"
        },
        "points": 10
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Ga tàu ở đâu?",
        "data": {
          "words": [
            "Wo",
            "ist",
            "der",
            "Bahnhof",
            "?"
          ],
          "answer": "Wo ist der Bahnhof ?"
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Tôi đi bằng xe buýt",
        "data": {
          "words": [
            "Ich",
            "fahre",
            "mit",
            "dem",
            "Bus",
            "."
          ],
          "answer": "Ich fahre mit dem Bus ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Đi thẳng rồi rẽ trái",
        "data": {
          "words": [
            "Gehen",
            "Sie",
            "geradeaus",
            "und",
            "dann",
            "links",
            "."
          ],
          "answer": "Gehen Sie geradeaus und dann links ."
        },
        "points": 12
      },
      {
        "type": "DICTATION",
        "question": "Viết câu hỏi đường",
        "data": {
          "audio_text": "Entschuldigung, wo ist der Bahnhof?",
          "answer": "Entschuldigung wo ist der Bahnhof",
          "hint": "Xin lỗi, ga tàu ở đâu?"
        },
        "points": 15
      },
      {
        "type": "DICTATION",
        "question": "Viết câu chỉ đường",
        "data": {
          "audio_text": "Gehen Sie geradeaus, dann rechts.",
          "answer": "Gehen Sie geradeaus dann rechts",
          "hint": "Thẳng rồi rẽ phải"
        },
        "points": 15
      }
    ]
  },
  {
    "order": 10,
    "title": "Bài 10: Sở thích & hoạt động (Hobbys & Aktivitäten)",
    "published": true,
    "exercises": [
      {
        "type": "FLASHCARD",
        "question": "lesen / schreiben nghĩa là gì?",
        "data": {
          "front": "lesen / schreiben",
          "back": "đọc / viết",
          "pronunciation": "LAY-zen / SHRY-ben"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "spielen / kochen nghĩa là gì?",
        "data": {
          "front": "spielen / kochen",
          "back": "chơi / nấu ăn",
          "pronunciation": "SHPEE-len / KO-khen"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "reisen / Sport treiben?",
        "data": {
          "front": "reisen / Sport treiben",
          "back": "du lịch / chơi thể thao",
          "pronunciation": "RY-zen / shport TRY-ben"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Ich mag / Ich liebe nghĩa là gì?",
        "data": {
          "front": "Ich mag / Ich liebe",
          "back": "Tôi thích / Tôi yêu (rất thích)",
          "pronunciation": "ikh mahk / ikh LEE-be"
        },
        "points": 5
      },
      {
        "type": "FLASHCARD",
        "question": "Mein Hobby ist... nghĩa là gì?",
        "data": {
          "front": "Mein Hobby ist...",
          "back": "Sở thích của tôi là...",
          "pronunciation": "mayn HO-bee ist"
        },
        "points": 5
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Ich lese gern Bücher' nghĩa là?",
        "data": {
          "options": [
            "Tôi mua sách",
            "Tôi thích đọc sách",
            "Tôi viết sách",
            "Tôi có nhiều sách"
          ],
          "answer": "Tôi thích đọc sách",
          "explanation": "lesen = đọc, gern = thích"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Was machst du in deiner Freizeit?' nghĩa là?",
        "data": {
          "options": [
            "Bạn làm gì ở đây?",
            "Bạn làm gì lúc rảnh?",
            "Bạn thích gì?",
            "Bạn làm nghề gì?"
          ],
          "answer": "Bạn làm gì lúc rảnh?",
          "explanation": "Freizeit = thời gian rảnh"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Ich spiele Fußball' nghĩa là?",
        "data": {
          "options": [
            "Tôi xem bóng đá",
            "Tôi chơi bóng đá",
            "Tôi mua bóng đá",
            "Tôi yêu bóng đá"
          ],
          "answer": "Tôi chơi bóng đá",
          "explanation": "spielen = chơi"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Ich reise gern ins Ausland' nghĩa là?",
        "data": {
          "options": [
            "Tôi ở nhà",
            "Tôi thích du lịch nước ngoài",
            "Tôi làm việc ở nước ngoài",
            "Tôi học ngoại ngữ"
          ],
          "answer": "Tôi thích du lịch nước ngoài",
          "explanation": "Ausland = nước ngoài, reisen = đi du lịch"
        },
        "points": 8
      },
      {
        "type": "MULTIPLE_CHOICE",
        "question": "'Ich höre gern Musik' nghĩa là?",
        "data": {
          "options": [
            "Tôi chơi nhạc",
            "Tôi thích nghe nhạc",
            "Tôi ghét nhạc",
            "Tôi học nhạc"
          ],
          "answer": "Tôi thích nghe nhạc",
          "explanation": "hören = nghe"
        },
        "points": 8
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Mein Hobby ist ___. (Đọc sách)",
        "data": {
          "sentence": "Mein Hobby ist ___.",
          "answer": "lesen",
          "hint": "Động từ nguyên mẫu = danh từ khi dùng làm chủ ngữ"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich ___ gern Musik. (Nghe)",
        "data": {
          "sentence": "Ich ___ gern Musik.",
          "answer": "höre",
          "hint": "hören chia ngôi 1"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Er ___ gern Fußball. (Chơi)",
        "data": {
          "sentence": "Er ___ gern Fußball.",
          "answer": "spielt",
          "hint": "spielen chia ngôi 3 số ít"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Wir ___ gern ins Ausland. (Du lịch)",
        "data": {
          "sentence": "Wir ___ gern ins Ausland.",
          "answer": "reisen",
          "hint": "reisen chia ngôi 1 số nhiều"
        },
        "points": 10
      },
      {
        "type": "FILL_BLANK",
        "question": "Điền: Ich ___ Kochen sehr. (Thích)",
        "data": {
          "sentence": "Ich ___ Kochen sehr.",
          "answer": "mag",
          "hint": "mögen chia ngôi 1"
        },
        "points": 10
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Sở thích của tôi là du lịch",
        "data": {
          "words": [
            "Mein",
            "Hobby",
            "ist",
            "reisen",
            "."
          ],
          "answer": "Mein Hobby ist reisen ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Tôi thích đọc sách",
        "data": {
          "words": [
            "Ich",
            "lese",
            "gern",
            "Bücher",
            "."
          ],
          "answer": "Ich lese gern Bücher ."
        },
        "points": 12
      },
      {
        "type": "SORT_WORDS",
        "question": "Sắp xếp: Bạn làm gì lúc rảnh?",
        "data": {
          "words": [
            "Was",
            "machst",
            "du",
            "in",
            "deiner",
            "Freizeit",
            "?"
          ],
          "answer": "Was machst du in deiner Freizeit ?"
        },
        "points": 12
      },
      {
        "type": "DICTATION",
        "question": "Viết câu về sở thích",
        "data": {
          "audio_text": "Mein Hobby ist Musik hören und Reisen.",
          "answer": "Mein Hobby ist Musik hören und Reisen",
          "hint": "2 sở thích"
        },
        "points": 15
      },
      {
        "type": "DICTATION",
        "question": "Viết câu hỏi sở thích",
        "data": {
          "audio_text": "Was machst du in deiner Freizeit?",
          "answer": "Was machst du in deiner Freizeit",
          "hint": "Hỏi sở thích lúc rảnh"
        },
        "points": 15
      }
    ]
  }
]

  for (const lessonData of lessonsData) {
    const { exercises, ...lessonFields } = lessonData
    let lesson = await prisma.lesson.findFirst({ where: { courseId: course.id, order: lessonFields.order } })
    if (lesson) {
      lesson = await prisma.lesson.update({ where: { id: lesson.id }, data: lessonFields })
    } else {
      lesson = await prisma.lesson.create({ data: { ...lessonFields, courseId: course.id } })
    }
    await prisma.exercise.deleteMany({ where: { lessonId: lesson.id } })
    await prisma.exercise.createMany({
      data: exercises.map((e: any, i: number) => ({ ...e, lessonId: lesson.id, order: i + 1 }))
    })
    console.log(`✓ ${lessonFields.title}: ${exercises.length} exercises`)
  }
  console.log('\nSeed complete!')
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
