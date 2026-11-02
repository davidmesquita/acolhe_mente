# Sala de videochamada experimental

## Decisão

Usamos a IFrame API do Jitsi as a Service (JaaS/8x8) para reuniões remotas de demonstração. O `meet.jit.si` público não é usado: um nome aleatório de sala não autentica participantes nem vincula a entrada ao agendamento. A IFrame API suporta integração desktop e mobile; câmera/microfone dependem de HTTPS (localhost é exceção), permissão do usuário, permissões do iframe e compatibilidade do navegador.

JaaS foi escolhido porque aceita JWT assinado no servidor, com `room` restrito, validade curta e identidade/role. `meeting-room-token` valida o bearer do Supabase, consulta o perfil e o agendamento com a chave server-side e só emite token quando:

- o usuário é o paciente ou psicólogo daquele atendimento;
- o agendamento está `confirmed` e `is_demo=true`;
- a chamada está entre 15 minutos antes do início e 15 minutos depois do final.

`is_demo` é `false` por padrão e não pode ser alterado pelo cliente. O JWT só autoriza a sala daquele agendamento e expira até 15 minutos depois da emissão, limitado à janela de admissão. A rota em si não é a barreira de segurança. Não persistimos URL, senha de sala ou token; não usamos o serviço público. A chave privada JaaS só existe como secret da Edge Function.

O JWT entregue ao navegador continua sendo um bearer token: alguém que o capture pode tentar reutilizá-lo até `exp`. A validade curta, o escopo de sala, HTTPS e a ausência de logs reduzem exposição, mas não permitem revogar instantaneamente uma cópia já emitida nem vinculá-la criptograficamente à sessão Supabase. Não copiar/compartilhar o token; revisar rate limiting, política de expiração e controles adicionais antes de qualquer uso real.

## Custos e operação

Instantâneo do [preço oficial JaaS](https://jaas.8x8.vc/#/pricing) consultado em 23/10/2026: plano Dev gratuito para 25 Monthly Active Users; Basic US$ 99/mês para 300 MAUs; Standard US$ 499/mês para 1.500; Business US$ 999/mês para 3.000. Add-ons publicados: gravação US$ 0,01/min e transcrição em tempo real US$ 0,03/min; excedente de MAU indicado como US$ 0,99 por usuário. Valores, franquias, impostos e disponibilidade podem mudar; confirme no portal comercial antes de contratar. As claims JaaS mantêm gravação, transcrição e livestreaming desativados.

O serviço processa mídia em tempo real e depende de internet, disponibilidade/região e políticas do fornecedor. A opção de criptografia ponta a ponta da plataforma não é assumida nem declarada como habilitada aqui. O serviço não é certificado por este projeto para uso clínico.

Alternativa: Jitsi Meet self-hosted é software livre, sem tarifa por usuário do software, e tem autenticação JWT/documentada. Em contrapartida, a equipe opera Prosody, Jicofo, Videobridge, TURN, TLS, capacidade de banda, atualizações, monitoramento e resposta a incidentes. A autenticação e a separação de domínios precisam estar configuradas corretamente. O domínio público `meet.jit.si` é um serviço distinto, não equivale a self-hosted ou JaaS com JWT.

## Configuração

Publique `meeting-room-token` e configure secrets somente no projeto Supabase:

- `APP_ALLOWED_ORIGIN`
- `APP_SUPABASE_PUBLISHABLE_KEY`
- `APP_SUPABASE_SECRET_KEY`
- `DEMO_SESSIONS_ENABLED=true` (ausente/desativado por padrão)
- `JAAS_APP_ID`
- `JAAS_API_KEY_ID`
- `JAAS_PRIVATE_KEY` em PEM PKCS#8

Nunca exponha esses secrets em `VITE_*`, SQL público, logs ou navegador. Para criar um atendimento de teste, use contas fictícias e um operador de banco para marcar explicitamente `is_demo=true`; não habilite essa flag em atendimentos reais.

## Fontes oficiais consultadas em 23/10/2026

- [Jitsi IFrame API e suporte mobile](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe)
- [Jitsi eventos da IFrame API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events)
- [JaaS IFrame API](https://developer.8x8.com/jaas/docs/iframe-api-overview)
- [JaaS JWT e restrição da claim de sala](https://developer.8x8.com/jaas/docs/api-keys-jwt)
- [JaaS planos e add-ons](https://jaas.8x8.vc/#/pricing)
- [Jitsi self-hosted JWT authentication](https://jitsi.github.io/handbook/docs/devops-guide/token-authentication)
- [MDN: permissões de câmera/microfone e HTTPS](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#privacy_and_security)