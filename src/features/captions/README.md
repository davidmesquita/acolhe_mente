# Legendas experimentais

## Escolha e privacidade

A interface usa `SpeechRecognition` do navegador somente quando ele comprova suporte ao modo local (`processLocally`) e o pacote `pt-BR` está disponível. O usuário inicia a captura explicitamente; resultados parciais e finais vivem apenas em estado React. Não há `localStorage`, banco, gravação ou fallback para reconhecimento remoto. O botão de instalação do pacote de idioma também é explícito.

O `SpeechRecognition` padrão pode enviar áudio a um serviço remoto, não funciona offline e não tem suporte interoperável. Por isso o modo de rede não é habilitado. Se o navegador não informar suporte local, o controle fica desabilitado e explica a indisponibilidade.

## Comparação

- Web Speech API com `processLocally`: nenhum áudio/transcrição enviado a terceiro durante reconhecimento; depende de navegador, versão, sistema, idioma instalado e Permissions Policy. `processLocally`, `available()` e `install()` ainda são experimentais. Na tabela MDN consultada em 23/10/2026, a API básica aparecia em Chrome/Edge desktop e Safari com prefixo; Firefox estável não tinha suporte. O modo local era suportado em Chromium desktop recente, mas não listado em Safari, Firefox estável nem Chrome Android. A detecção em runtime é obrigatória.
- Alternativa local: `whisper.cpp`/WASM tem licença MIT e exemplos de reconhecimento contínuo e WebAssembly. A inferência não requer serviço remoto, mas exige baixar e armazenar um modelo grande, memória/CPU consideráveis, adaptação de áudio em tempo real e testes de desempenho por aparelho. Não foi incluído no bundle.
- Serviço externo opcional, não integrado: a tabela oficial OpenAI consultada em 23/10/2026 indicava estimativa de US$ 0,003/min para `gpt-4o-mini-transcribe`, US$ 0,006/min para `gpt-4o-transcribe`/Whisper e US$ 0,017/min para transcrição ao vivo (`gpt-live-transcribe`/`gpt-realtime-whisper`). O áudio sairia do dispositivo. A documentação OpenAI informa que conteúdo da API não é usado para treino por padrão, mas abuse-monitoring logs podem reter conteúdo até 30 dias; ZDR/MAM depende de elegibilidade e aprovação e tem limitações por endpoint. Exigiria consentimento explícito, revisão contratual/retention e nova análise antes de qualquer ativação.

As legendas podem omitir, atrasar ou trocar palavras, nomes e contexto. Não são prontuário, transcrição clínica confiável ou substituto de intérprete de Libras. A demonstração deve usar apenas diálogos sintéticos.

## Fontes oficiais consultadas em 23/10/2026

- [MDN: Web Speech API, reconhecimento local e remoto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- [MDN: SpeechRecognition e compatibilidade](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition#browser_compatibility)
- [OpenAI: preços de transcrição](https://developers.openai.com/api/docs/pricing#transcription)
- [OpenAI: retenção e controles de dados](https://developers.openai.com/api/docs/guides/your-data)
- [ggml-org/whisper.cpp](https://github.com/ggml-org/whisper.cpp)