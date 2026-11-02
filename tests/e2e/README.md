# Roteiro manual da sessão demo

Executar em projeto Supabase local e conta JaaS de desenvolvimento com dois usuários sintéticos, um paciente e um psicólogo. Marcar somente o agendamento fictício confirmado como `is_demo=true`. Não usar dados reais, gravações ou produção. Não há runner de navegador no projeto; registrar navegador/dispositivo e resultado fora da transcrição.

## Sala e autorização

- Abrir a sessão como paciente participante e como psicólogo participante; ambos recebem token JaaS apenas durante a janela permitida.
- Abrir o mesmo `appointmentId` como usuário autenticado que não participa, paciente de outro agendamento, profissional diferente e admin; a Edge Function deve negar todos.
- Tentar agendamento `requested`, `cancelled`, `completed`, sem `is_demo`, fora da janela, UUID inválido e sessão sem bearer. Não deve criar iframe/token.
- Procurar token e links em URL, localStorage, sessionStorage, IndexedDB, banco e logs: não devem ser persistidos nem retornados a não participantes.
- Confirmar que claims JaaS são de sala exata e curta duração, papel profissional limitado a moderador e gravação/transcrição/livestreaming desativados.

## Câmera, microfone e conexão

- Em Chrome/Edge desktop, Safari desktop e Firefox desktop, aceitar as permissões e confirmar que mídia começa silenciada/desligada; ativar e desativar microfone e câmera e sair da reunião.
- Negar permissões, revogar permissões enquanto a reunião está aberta, ocupar o microfone em outra aplicação e testar ausência de câmera. A mensagem deve indicar como recuperar permissões/dispositivos.
- Simular perda e retorno de rede; observar estado reconectando, retorno à chamada, erro fatal e nova tentativa sem iframe duplicado.
- Testar HTTPS, localhost, origem não permitida e tentativa HTTP remota. `getUserMedia()` deve ser recusado em contexto inseguro.
- Em Safari iOS e Chrome Android, testar retrato/paisagem, iframe sem overflow, altura de teclado, áudio, troca/pausa de app e saída. O browser pode exigir gesto explícito para tocar mídia.

## Legendas

- Com Chromium desktop atual e pacote local `pt-BR`, ativar apenas após aviso/ação do usuário e conferir estados listening, parcial e final.
- Com pacote ausente, instalar somente pelo botão explícito; sem suporte local, confirmar mensagem de indisponibilidade e que não há fallback remoto.
- Testar permissão de microfone negada/revogada, erro de idioma, desativar, limpar, sair/reabrir e recarregar. Confirmar que a transcrição desaparece e não existe no storage, logs, Supabase ou requests de rede.
- Repetir em Safari desktop/iOS, Firefox estável e navegadores móveis. Compatibilidade da API básica não implica suporte a `processLocally`.
- Usar exclusivamente falas inventadas. Não avaliar o recurso como registro clínico nem como substituto de Libras.

## Critérios

Guardar evidência de estados, permissões, tamanhos desktop/mobile, logs de requests sem payload de áudio e verificação de storage vazio. Não habilitar para atendimento real até revisão de segurança, privacidade, acessibilidade, contratos, disponibilidade e validação clínica independentes.