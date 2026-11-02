export type SpeechResult = { isFinal: boolean; 0: { transcript: string } }
export type SpeechResultEvent = { resultIndex: number; results: ArrayLike<SpeechResult> }

export function splitSpeechResults(event: SpeechResultEvent) {
  const final: string[] = []
  const partial: string[] = []
  for (let index = event.resultIndex; index < event.results.length; index += 1) {
    const result = event.results[index]
    const transcript = result?.[0].transcript.trim()
    if (!transcript) continue
    if (result.isFinal) final.push(transcript)
    else partial.push(transcript)
  }
  return { final, partial }
}