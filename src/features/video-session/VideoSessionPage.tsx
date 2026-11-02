import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Notice } from '../../components/ui/Notice'
import { useAuth } from '../../app/providers/useAuth'
import { JitsiDemoSession } from './JitsiDemoSession'

const sampleCaptions = [
  'Olá, esta é uma legenda de demonstração.',
  'Estou testando a leitura e o tamanho das legendas.',
  'Nenhuma fala ou áudio real está sendo transcrito.',
]

function LocalDeviceTestPage() {
  const { profile } = useAuth()
  const localVideo = useRef<HTMLVideoElement>(null)
  const remoteVideo = useRef<HTMLVideoElement>(null)
  const peerA = useRef<RTCPeerConnection | null>(null)
  const peerB = useRef<RTCPeerConnection | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [captionIndex, setCaptionIndex] = useState(-1)
  const [error, setError] = useState('')

  function endCall() {
    peerA.current?.close()
    peerB.current?.close()
    peerA.current = null
    peerB.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (localVideo.current) localVideo.current.srcObject = null
    if (remoteVideo.current) remoteVideo.current.srcObject = null
    setCallState('idle')
  }

  useEffect(() => endCall, [])

  async function startCall() {
    setCallState('connecting')
    setError('')
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
        throw new Error('Seu navegador não oferece os recursos de chamada necessários.')
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      streamRef.current = stream
      if (localVideo.current) localVideo.current.srcObject = stream

      // Loopback local para testar câmera e microfone sem conectar a outra pessoa.
      const sender = new RTCPeerConnection()
      const receiver = new RTCPeerConnection()
      peerA.current = sender
      peerB.current = receiver
      sender.onicecandidate = (event) => {
        if (event.candidate) void receiver.addIceCandidate(event.candidate).catch(() => undefined)
      }
      receiver.onicecandidate = (event) => {
        if (event.candidate) void sender.addIceCandidate(event.candidate).catch(() => undefined)
      }
      receiver.ontrack = (event) => {
        if (remoteVideo.current) remoteVideo.current.srcObject = event.streams[0] ?? null
      }
      stream.getTracks().forEach((track) => sender.addTrack(track, stream))
      const offer = await sender.createOffer()
      await sender.setLocalDescription(offer)
      await receiver.setRemoteDescription(offer)
      const answer = await receiver.createAnswer()
      await receiver.setLocalDescription(answer)
      await sender.setRemoteDescription(answer)
      setCallState('connected')
    } catch (cause) {
      endCall()
      setCallState('error')
      setError(
        cause instanceof Error
          ? cause.name === 'NotAllowedError'
            ? 'Permita o uso de câmera e microfone nas configurações do navegador para iniciar o teste.'
            : cause.message
          : 'Não foi possível iniciar a chamada de teste.',
      )
    }
  }

  return (
    <section className="section inner-page test-session-page">
      <span className="eyebrow">Ambiente privado de teste</span>
      <h1>Teste de chamada e legendas</h1>
      <p className="page-intro">
        Olá, {profile?.display_name || 'pessoa usuária'}. Este ambiente usa sua câmera e seu
        microfone apenas para uma chamada local de loopback: você verá a própria imagem duplicada,
        sem conexão com outra pessoa.
      </p>
      <Notice title="Demonstração, não é atendimento">
        As legendas abaixo são frases fictícias para testar a interface. Não há reconhecimento de
        fala, gravação, envio ou armazenamento de áudio, vídeo ou transcrição.
      </Notice>

      <div className="test-call-videos" aria-label="Prévia da chamada de teste">
        <figure>
          <video ref={localVideo} autoPlay muted playsInline aria-label="Prévia local da sua câmera" />
          <figcaption>Sua câmera</figcaption>
        </figure>
        <figure>
          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            aria-label="Retorno local da chamada de teste"
          />
          <figcaption>Retorno local (loopback)</figcaption>
        </figure>
      </div>

      <div className="test-call-controls">
        {callState === 'idle' || callState === 'error' ? (
          <Button onClick={() => void startCall()}>Iniciar chamada local</Button>
        ) : callState === 'connecting' ? (
          <Button disabled>Conectando…</Button>
        ) : (
          <Button onClick={endCall}>Encerrar chamada</Button>
        )}
        <span role="status" aria-live="polite">
          {callState === 'connected' && 'Chamada local conectada; câmera e microfone ativos.'}
          {callState === 'idle' && 'Câmera e microfone desligados.'}
          {callState === 'connecting' && 'Solicitando acesso à câmera e ao microfone.'}
        </span>
      </div>
      {error && <Notice title="Chamada não iniciada" kind="error">{error}</Notice>}

      <section className="test-captions" aria-labelledby="captions-title">
        <h2 id="captions-title">Legendas de demonstração</h2>
        <p>Acione frases fictícias para conferir a leitura e a acessibilidade do componente.</p>
        <Button onClick={() => setCaptionIndex((current) => (current + 1) % sampleCaptions.length)}>
          Exibir próxima legenda
        </Button>
        <div className="test-caption-output" role="status" aria-live="polite" aria-atomic="true">
          {captionIndex < 0 ? 'As legendas de exemplo aparecerão aqui.' : sampleCaptions[captionIndex]}
        </div>
      </section>
      <p className="field-hint">
        Para testar com sua própria conta de paciente, entre ou crie uma conta em{' '}
        <Link to="/entrar">Entrar</Link>. A rota exige autenticação real do Supabase.
      </p>
    </section>
  )
}

export function VideoSessionPage() {
  const { appointmentId } = useParams()
  return appointmentId
    ? <JitsiDemoSession appointmentId={appointmentId} />
    : <LocalDeviceTestPage />
}
