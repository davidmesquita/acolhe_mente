import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Notice } from '../../components/ui/Notice'
import { splitSpeechResults, type SpeechResultEvent } from './speechResults'

type CaptionResultEvent = Event & SpeechResultEvent
type CaptionRecognitionError = Event & { error: string }
type LocalRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  processLocally?: boolean
  onresult: ((event: CaptionResultEvent) => void) | null
  onerror: ((event: CaptionRecognitionError) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
type LocalRecognitionConstructor = {
  new (): LocalRecognition
  available?: (options: { langs: string[]; processLocally: boolean }) => Promise<string>
  install?: (options: { langs: string[] }) => Promise<boolean>
}
type LocalRecognitionWindow = Window & {
  SpeechRecognition?: LocalRecognitionConstructor
  webkitSpeechRecognition?: LocalRecognitionConstructor
}
type CaptionSupport = 'checking' | 'available' | 'downloadable' | 'unavailable' | 'unsupported'

function supportMessage(support: CaptionSupport) {
  if (support === 'checking') return 'Verificando reconhecimento local de português...'
  if (support === 'downloadable') return 'O pacote local de português precisa ser baixado antes do primeiro uso.'
  if (support === 'unavailable') return 'Este dispositivo não tem o pacote local de português disponível.'
  if (support === 'unsupported') return 'Este navegador não oferece reconhecimento local compatível. Nenhum serviço remoto será usado.'
  return 'Reconhecimento local de português disponível.'
}

function speechErrorMessage(code: string) {
  if (code === 'not-allowed' || code === 'service-not-allowed')
    return 'Permita o microfone nas configurações do navegador e tente novamente.'
  if (code === 'language-not-supported')
    return 'O pacote local de português brasileiro não está instalado neste navegador.'
  if (code === 'audio-capture') return 'Nenhum microfone disponível. Conecte um dispositivo e tente novamente.'
  return 'O reconhecimento foi interrompido. Você pode tentar ativá-lo novamente.'
}

export function CaptionPanel() {
  const recognitionRef = useRef<LocalRecognition | null>(null)
  const [support, setSupport] = useState<CaptionSupport>('checking')
  const [listening, setListening] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [finalCaptions, setFinalCaptions] = useState<string[]>([])
  const [partialCaption, setPartialCaption] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function checkLocalRecognition() {
      const speechWindow = window as LocalRecognitionWindow
      const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
      if (!Recognition || typeof Recognition.available !== 'function') {
        if (active) setSupport('unsupported')
        return
      }
      const recognition = new Recognition()
      if (!('processLocally' in recognition)) {
        if (active) setSupport('unsupported')
        return
      }
      recognitionRef.current = recognition
      try {
        const availability = await Recognition.available({ langs: ['pt-BR'], processLocally: true })
        if (active) {
          setSupport(
            availability === 'available'
              ? 'available'
              : availability === 'downloadable' || availability === 'downloading'
                ? 'downloadable'
                : 'unavailable',
          )
        }
      } catch {
        if (active) setSupport('unsupported')
      }
    }
    void checkLocalRecognition()
    return () => {
      active = false
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  async function installLanguagePack() {
    const speechWindow = window as LocalRecognitionWindow
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!Recognition?.install) {
      setSupport('unsupported')
      return
    }
    setInstalling(true)
    setError('')
    try {
      const installed = await Recognition.install({ langs: ['pt-BR'] })
      setSupport(installed ? 'available' : 'unavailable')
      if (!installed) setError('Não foi possível instalar o pacote local. Nenhum áudio foi enviado.')
    } catch {
      setError('Não foi possível instalar o pacote local. Nenhum áudio foi enviado.')
      setSupport('unavailable')
    } finally {
      setInstalling(false)
    }
  }

  function startRecognition() {
    const speechWindow = window as LocalRecognitionWindow
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!Recognition || support !== 'available') return
    const recognition = new Recognition()
    if (!('processLocally' in recognition)) {
      setSupport('unsupported')
      return
    }
    recognition.processLocally = true
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (event) => {
      const results = splitSpeechResults(event)
      if (results.final.length) setFinalCaptions((current) => [...current, ...results.final])
      setPartialCaption(results.partial.join(' '))
    }
    recognition.onerror = (event) => {
      setError(speechErrorMessage(event.error))
      setListening(false)
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current?.abort()
    recognitionRef.current = recognition
    setError('')
    setListening(true)
    try {
      recognition.start()
    } catch {
      setListening(false)
      setError('O navegador não conseguiu iniciar o microfone. Feche outra captura de áudio e tente novamente.')
    }
  }

  function stopRecognition() {
    recognitionRef.current?.stop()
    setListening(false)
    setPartialCaption('')
  }

  function clearTranscript() {
    setFinalCaptions([])
    setPartialCaption('')
  }

  return (
    <section className="caption-panel" aria-labelledby="caption-panel-heading">
      <div className="caption-panel-heading">
        <div>
          <span className="eyebrow">Recurso experimental</span>
          <h2 id="caption-panel-heading">Legendas locais em português</h2>
        </div>
        <span className={`caption-state ${listening ? 'is-listening' : ''}`} role="status" aria-live="polite">
          {listening ? 'Reconhecendo fala' : support === 'available' ? 'Pronto' : 'Indisponível'}
        </span>
      </div>
      <Notice title="Privacidade e limites">
        As legendas só começam quando você ativar o microfone. Este modo exige processamento local
        do navegador; não há fallback para reconhecimento em nuvem e nenhum texto é salvo. Use
        somente diálogos fictícios. A transcrição pode errar e não substitui intérprete de Libras.
      </Notice>
      <p className="caption-support" role="status">{supportMessage(support)}</p>
      {support === 'downloadable' && (
        <Button type="button" variant="secondary" disabled={installing} onClick={() => void installLanguagePack()}>
          {installing ? 'Instalando pacote local...' : 'Baixar pacote local de português'}
        </Button>
      )}
      {error && <Notice kind="error" title="Legendas interrompidas">{error}</Notice>}
      <div className="caption-actions">
        {listening ? (
          <Button type="button" variant="secondary" onClick={stopRecognition}>Desativar legendas</Button>
        ) : (
          <Button type="button" disabled={support !== 'available'} onClick={startRecognition}>
            Ativar legendas e permitir microfone
          </Button>
        )}
        <Button type="button" variant="quiet" disabled={!finalCaptions.length && !partialCaption} onClick={clearTranscript}>
          Limpar transcrição
        </Button>
      </div>
      <div className="caption-transcript" aria-live="polite" aria-relevant="additions text">
        {finalCaptions.length ? (
          <ol>{finalCaptions.map((caption, index) => (
            <li key={`${index}-${caption}`}><span className="caption-final-label">Final</span>{caption}</li>
          ))}</ol>
        ) : <p>Nenhuma transcrição em andamento.</p>}
        {partialCaption && <p className="caption-partial"><span>Parcial</span>{partialCaption}</p>}
      </div>
    </section>
  )
}