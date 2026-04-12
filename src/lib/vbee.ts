/**
 * Vbee TTS server-side helper
 * Generates German mp3 files for Dictation exercises
 * Saves to /public/audio/dictation/ and updates mapping.json
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const VBEE_APP_ID = process.env.VBEE_APP_ID ?? ''
const VBEE_TOKEN  = process.env.VBEE_TOKEN ?? ''
const VBEE_VOICE  = 'de-DE-Standard-A'
const VBEE_URL    = 'https://vbee.vn/api/v1/tts'
const AUDIO_DIR   = path.join(process.cwd(), 'public', 'audio', 'dictation')
const MAPPING_PATH = path.join(AUDIO_DIR, 'mapping.json')

function textToFilename(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex').slice(0, 12) + '.mp3'
}

function loadMapping(): Record<string, string> {
  try {
    if (fs.existsSync(MAPPING_PATH)) {
      return JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8'))
    }
  } catch {}
  return {}
}

function saveMapping(map: Record<string, string>): void {
  fs.mkdirSync(AUDIO_DIR, { recursive: true })
  fs.writeFileSync(MAPPING_PATH, JSON.stringify(map, null, 2), 'utf8')
}

async function callVbee(text: string): Promise<string> {
  const res = await fetch(VBEE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${VBEE_TOKEN}` },
    body: JSON.stringify({
      app_id: VBEE_APP_ID,
      input_text: text,
      voice_code: VBEE_VOICE,
      audio_type: 'mp3',
      speed_rate: 0.9,
      callback_url: 'https://tuhoctiengduc.giabaobooks.vn/api/vbee-callback',
    }),
  })
  const data = await res.json() as { result?: { request_id?: string } }
  const requestId = data?.result?.request_id
  if (!requestId) throw new Error(`Vbee no request_id: ${JSON.stringify(data)}`)
  return requestId
}

async function pollVbee(requestId: string, maxWait = 30): Promise<string> {
  for (let i = 0; i < maxWait; i++) {
    await new Promise(r => setTimeout(r, 1500))
    const res = await fetch(`${VBEE_URL}/${requestId}`, {
      headers: { 'Authorization': `Bearer ${VBEE_TOKEN}`, 'app_id': VBEE_APP_ID },
    })
    const data = await res.json() as { result?: { status?: string; audio_link?: string } }
    const result = data?.result
    if (result?.status === 'SUCCESS' && result.audio_link) return result.audio_link
    if (result?.status === 'FAILED') throw new Error('Vbee FAILED')
  }
  throw new Error('Vbee timeout')
}

async function downloadFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, buf)
}

/**
 * Generate audio for a single text. Skips if already exists.
 * Returns filename (e.g. "abc123.mp3") or null on error.
 */
export async function generateDictationAudio(text: string): Promise<string | null> {
  if (!text?.trim()) return null

  const mapping  = loadMapping()
  const filename = textToFilename(text)
  const outPath  = path.join(AUDIO_DIR, filename)

  // Already exists
  if (mapping[text] && fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
    return filename
  }

  try {
    const requestId = await callVbee(text)
    const audioLink = await pollVbee(requestId)
    await downloadFile(audioLink, outPath)
    mapping[text] = filename
    saveMapping(mapping)
    return filename
  } catch (e) {
    console.error(`[vbee] Failed for "${text.slice(0, 50)}":`, e)
    return null
  }
}

/**
 * Generate audio for multiple texts in parallel (max 3 concurrent).
 */
export async function generateDictationAudioBatch(texts: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {}
  const CONCURRENCY = 3

  for (let i = 0; i < texts.length; i += CONCURRENCY) {
    const batch = texts.slice(i, i + CONCURRENCY)
    const settled = await Promise.allSettled(batch.map(t => generateDictationAudio(t)))
    settled.forEach((res, idx) => {
      if (res.status === 'fulfilled' && res.value) {
        results[batch[idx]] = res.value
      }
    })
    if (i + CONCURRENCY < texts.length) await new Promise(r => setTimeout(r, 500))
  }

  return results
}
