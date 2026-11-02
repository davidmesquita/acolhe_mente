import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../app/providers/useAuth'
import { Button } from '../../components/ui/Button'
import { Notice } from '../../components/ui/Notice'
import { requireSupabase } from '../../lib/supabaseClient'
import { CaptionPanel } from '../captions/CaptionPanel'

type MeetingState = 'idle' | 'authorizing' | 'connecting' | 'connected' | 'reconnecting' | 'ended' | 'error'
type MeetingToken = { appId: string; roomName: string; token: string; expiresAt: number }
type JitsiEvent = {
  message?: string
  name?: string
  isFatal?: boolean
  wasConnected?: boolean
  type?: string
  muted?: boolean
  supported?: boolean
}
type JitsiApi = {
  addListener: (event: string, listener: (payload: JitsiEvent) => void) => void
  executeCommand: (command: string) => void
  dispose: () => void
}
type JitsiWindow = Window & {
  JitsiMeetExternalAPI?: new (
    domain: string,
    options: Record<string, unknown>,
  ) => JitsiApi
}

let jitsiApiLoading: Promise<NonNullable<JitsiWindow['JitsiMeetExternalAPI']>> | null = null

function loadJitsiApi(appId: string) {
  const jitsiWindow = window as JitsiWindow
  if (jitsiWindow.JitsiMeetExternalAPI) return Promise.resolve(jitsiWindow.JitsiMeetExternalAPI)
  if (jitsiApiLoading) return jitsiApiLoading
  const source = `https://8x8.vc/${encodeURIComponent(appId)}/external_api.js`
  const script = document.createElement('script')
  script.src = source
  script.async = true
  jitsiApiLoading = new Promise<NonNullable<JitsiWindow['JitsiMeetExternalAPI']>>((resolve, reject) => {
    script.onload = () => {
      if (jitsiWindow.JitsiMeetExternalAPI) resolve(jitsiWindow.JitsiMeetExternalAPI)
      else reject(new Error('A API de reunião não carregou corretamente.'))
    }
    script.onerror = () => reject(new Error('Não foi possível conectar ao provedor JaaS. Verifique a conexão.'))
    document.head.append(script)
  }).catch((cause: unknown) => {
    script.remove()
    jitsiApiLoading = null
    throw cause
  })
  return jitsiApiLoading
}

function statusText(state: MeetingState) {
  switch (state) {
    case 'authorizing': return 'Validando seu acesso à sessão de demonstração...'
    case 'connecting': return 'Conectando à sala de demonstração...'
    case 'connected': return 'Conectado. Câmera e microfone começam desligados.'
    case 'reconnecting': return 'Problema de mídia detectado. Tente reconectar ou saia da sala.'
    case 'ended': return 'Você saiu da sala.'
    case 'error': return 'A sala não pôde ser aberta.'
    default: return 'Pronto para entrar na sala de demonstração.'
  }
}

function meetingErrorMessage(message: string) {
  if (message.includes('Permission') || message.includes('NotAllowed') || message.includes('camera') || message.includes('mic'))
    return 'Permita câmera e microfone para o domínio 8x8.vc nas configurações do navegador. HTTPS é obrigatório fora de localhost.'
  return message || 'Verifique sua conexão e as permissões de câmera e microfone antes de tentar novamente.'
}

export function JitsiDemoSession({ appointmentId }: { appointmentId: string }) {
  const auth = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<JitsiApi | null>(null)
  const [state, setState] = useState<MeetingState>('idle')
  const [roomAuthorized, setRoomAuthorized] = useState(false)
  const [muted, setMuted] = useState(true)
  const [cameraOff, setCameraOff] = useState(true)
  const [error, setError] = useState('')

  function leaveMeeting() {
    const api = apiRef.current
    apiRef.current = null
    if (api) {
      try {
        api.executeCommand('hangup')
      } catch {}
      api.dispose()
    }
    containerRef.current?.replaceChildren()
    setState('ended')
    setMuted(true)
    setCameraOff(true)
  }

  useEffect(() => () => {
    apiRef.current?.dispose()
    apiRef.current = null
  }, [])

  async function joinMeeting() {
    if (!auth.user || !containerRef.current) return
    apiRef.current?.dispose()
    apiRef.current = null
    containerRef.current.replaceChildren()
    setState('authorizing')
    setError('')
    try {
      const { data, error: tokenError } = await requireSupabase().functions.invoke<MeetingToken>(
        'meeting-room-token',
        { body: { appointmentId } },
      )
      if (tokenError) throw tokenError
      if (!data?.appId || !data.roomName || !data.token) throw new Error('A autorização da sala expirou.')
      setRoomAuthorized(true)
      setState('connecting')
      const JitsiMeetExternalAPI = await loadJitsiApi(data.appId)
      if (!containerRef.current) return
      const api = new JitsiMeetExternalAPI('8x8.vc', {
        roomName: `${data.appId}/${data.roomName}`,
        jwt: data.token,
        parentNode: containerRef.current,
        userInfo: { displayName: auth.profile?.display_name ?? 'Participante' },
        configOverwrite: {
          disableDeepLinking: true,
          prejoinConfig: { enabled: true },
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          toolbarButtons: ['microphone', 'camera', 'hangup'],
        },
        interfaceConfigOverwrite: { MOBILE_APP_PROMO: false },
      })
      apiRef.current = api
      const meetingFrame = containerRef.current.querySelector('iframe')
      if (meetingFrame) meetingFrame.allow = 'camera; microphone; fullscreen; display-capture; autoplay'
      api.addListener('videoConferenceJoined', () => setState('connected'))
      api.addListener('browserSupport', (event) => {
        if (event.supported === false) {
          setState('error')
          setError('Este navegador não é compatível com esta sala. Atualize-o ou tente outro navegador.')
        }
      })
      api.addListener('videoConferenceLeft', () => {
        api.dispose()
        if (apiRef.current === api) apiRef.current = null
        setState('ended')
      })
      api.addListener('readyToClose', () => {
        api.dispose()
        if (apiRef.current === api) apiRef.current = null
        setState('ended')
      })
      api.addListener('audioMuteStatusChanged', (event) => setMuted(Boolean(event.muted)))
      api.addListener('videoMuteStatusChanged', (event) => setCameraOff(Boolean(event.muted)))
      api.addListener('peerConnectionFailure', (event) => {
        setState(event.wasConnected ? 'reconnecting' : 'error')
        setError('A conexão de mídia falhou. Verifique a rede e tente reconectar.')
      })
      api.addListener('cameraError', (event) => setError(meetingErrorMessage(event.message ?? event.type ?? '')))
      api.addListener('micError', (event) => setError(meetingErrorMessage(event.message ?? event.type ?? '')))
      api.addListener('errorOccurred', (event) => {
        if (event.isFatal) {
          setState('error')
          setError(meetingErrorMessage(event.message ?? event.name ?? ''))
        }
      })
    } catch (cause) {
      setState('error')
      setError(meetingErrorMessage(cause instanceof Error ? cause.message : ''))
    }
  }

  function toggleMicrophone() {
    if (!apiRef.current) return
    apiRef.current.executeCommand('toggleAudio')
    setMuted((current) => !current)
  }

  function toggleCamera() {
    if (!apiRef.current) return
    apiRef.current.executeCommand('toggleVideo')
    setCameraOff((current) => !current)
  }

  return (
    <section className="section inner-page demo-session-page">
      <span className="eyebrow">Sala de demonstração</span>
      <h1>Sessão de teste</h1>
      <p className="page-intro">
        Esta sala aceita somente participantes de um agendamento fictício confirmado. Use diálogos
        de teste, sem dados reais de pacientes.
      </p>
      <Notice title="Privacidade da chamada">
        O vídeo, o áudio e o nome de exibição do perfil são enviados ao serviço JaaS da 8x8 durante
        a chamada. Câmera e microfone iniciam desligados; gravação e transcrição do provedor são
        desativadas. Não compartilhe informações pessoais ou clínicas nesta demonstração.
      </Notice>
      <div className="meeting-toolbar">
        <span className={`meeting-connection meeting-${state}`} role="status" aria-live="polite">
          {statusText(state)}
        </span>
        <div className="meeting-controls">
          {state === 'connected' || state === 'reconnecting' ? (
            <>
              {state === 'reconnecting' && (
                <Button type="button" variant="secondary" onClick={() => void joinMeeting()}>Reconectar</Button>
              )}
              <Button type="button" variant="secondary" onClick={toggleMicrophone}>
                {muted ? 'Ativar microfone' : 'Silenciar microfone'}
              </Button>
              <Button type="button" variant="secondary" onClick={toggleCamera}>
                {cameraOff ? 'Ligar câmera' : 'Desligar câmera'}
              </Button>
              <Button type="button" variant="quiet" onClick={leaveMeeting}>Sair da chamada</Button>
            </>
          ) : (
            <Button type="button" disabled={state === 'authorizing' || state === 'connecting'} onClick={() => void joinMeeting()}>
              {state === 'authorizing' ? 'Validando acesso...' : state === 'connecting' ? 'Conectando...' : state === 'ended' ? 'Entrar novamente' : 'Entrar na sessão'}
            </Button>
          )}
        </div>
      </div>
      {error && (
        <Notice kind="error" title="Não foi possível iniciar ou manter a chamada">
          {error} Feche outras abas que usem câmera/microfone e tente novamente.
        </Notice>
      )}
      <div className="jaas-frame-wrap" aria-label="Sala de vídeo de demonstração">
        <div ref={containerRef} className="jaas-frame" />
        {state === 'idle' && <p className="jaas-placeholder">A sala aparece aqui após validar o agendamento.</p>}
      </div>
      {roomAuthorized && (state === 'connected' || state === 'reconnecting') && <CaptionPanel />}
      <p className="field-hint">
        Se não for possível entrar, verifique sua conexão, use um navegador atualizado em HTTPS e
        autorize câmera/microfone para 8x8.vc. <Link to="/ajuda">Ajuda</Link>
      </p>
    </section>
  )
}