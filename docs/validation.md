# Validação do MVP — 5 de setembro de 2026

## Expansão para dez andares, áudio e paradoxo

22 testes aprovados: os dez percursos completos, AÇÃO explícita (↑ e proximidade não acionam alavancas), melodia correta/incorreta, contrapeso, plantio, coleta, alçapão temporizado e descida após expiração, retorno ao mesmo andar 4, roubo, fuga, restauração do andar 9, captura com nova tentativa, eventos sonoros e vitória só após o décimo andar.

Chrome conectado: 360×800, 390×844, 768×1024, 1366×768 e 600×719. Cabeçalho com áudio, controles com alvos de 44 px, rodapé e instruções sem overflow horizontal. A primeira visita ao andar 4 foi acionada com eventos de teclado: escada até o threshold, aparição, roubo e desaparecimento observados. Na visita do futuro, vestir e entrar usaram E real via Chrome; a coleta e retorno usaram o botão AÇÃO da interface, com deslocamentos acelerados pelo mesmo motor em contexto isolado. A versão anterior foi vista subindo e a chave temporal voltou ao andar 9. Screenshots de manto, passado, sinos e primeira aparição foram inspecionados com `view_image`.

Web Audio iniciou em estado `running` após clique real. Trilha com saída RMS não nula; mute reduziu a saída para próximo de zero; pausa zerou as vozes ativas. Efeitos de salto, alavanca e alçapão geraram sinais distintos (RMS amostrado ~0,032 / 0,023 / 0,013). A conferência comprova geração e controle do áudio no navegador, não calibração acústica em alto-falantes físicos. Console sem erros e todos os módulos/assets com HTTP 200. Atlas novo com alpha real verificado (mais de um milhão de pixels transparentes); o rascunho com fundo quadriculado não foi publicado.

Mantidas as limitações: sem Firefox/WebKit, Safari/iOS ou Android físicos; sem nova validação de multitouch real. As rotas completas de todos os andares estão cobertas no motor, não repetidas manualmente em todos os viewports. A perseguição usa uma trajetória encenada coerente com o andar, não replay dos comandos do usuário.

Migração conferida em contexto isolado: vitória legada (`true`, cinco andares) abre o sexto andar; vitória atual (`10`) restaura “Você ganhou!” sem botão de reinício. Atalhos `?floor=N` mantêm o progresso de jogo intacto.

## Revisão: copa e vitória

Tronco revisado com galhos voltados para fora; arte dedicada de copa e céu. Ao concluir a última saída, a personagem repousa sobre a copa, sobe e recebe “Você ganhou!”. Vitória persistida; recarregar mantém o encerramento. Sem botão de reinício nessa tela, apenas retorno ao menu. `?finale=1` demonstra a cena sem alterar o progresso.

Onze testes aprovados: oito do motor e três de transição final, estabilidade da vitória e redução de movimento. Chrome em 360×800, 390×844 e 1366×768: vitória, ausência de reinício, botão visível, ausência de overflow e restauração após reload. O teste da integração injetou a conclusão da última fase em um contexto isolado e observou a transição real por seis segundos; os percursos completos continuam cobertos pelos testes do motor. Console sem erros. Arte do tronco, pose de repouso sobre a copa e screenshots de vitória mobile/desktop inspecionados com `view_image`; a pose inicial também foi conferida em fixture do renderer. Não foram adicionadas verificações em outros motores ou aparelhos físicos.

## Mecânicas

`node treehouse/engine.test.mjs`: oito testes aprovados. Cinco percorrem andares completos com os mesmos comandos aceitos pelo motor, sem teletransporte: caminhar, escalar, saltar, pegar objetos e interagir. Os demais verificam movimento vertical restrito às escadas, aterrissagem, descida, porta trancada, alçapão bloqueado e reinício.

Sintaxe verificada com `node --check` para os módulos da interface e renderização. `git diff --check` aprovado. Nenhuma dependência adicionada; aplicação estática sem etapa de build.

## Navegador

Chrome conectado, via Chrome DevTools. Árvore verificada em 360×800, 390×844, 768×1024, 1366×768, 600×719 e 601×720. Menu em 360×800, 599×800, 600×800, 601×800 e 1366×768. Sem rolagem horizontal; controles da árvore com alvos de pelo menos 44 px. Ajustado o layout de 719 px de altura para manter o rodapé dentro da janela.

Interações: iniciar, mover pelo teclado com mudança real do canvas, pausar e continuar; emulação mobile/touch 390×844 com clique em iniciar e PULAR; abertura e início de partida do Sete Balões. Estado inicial e assets carregaram via HTTP 200. Sem erros ou avisos no console após as correções. Um erro em evento sintético de teclado foi corrigido com verificação da existência de `closest` no alvo.

Limitações: sem Firefox, WebKit, Safari real, Android/iOS físico ou multitouch real. A resolução integral das fases foi testada no motor; não foi repetida manualmente em todos os viewports. Não há alegação de compatibilidade entre navegadores. Janelas com menos de 480 px de altura podem exigir rolagem vertical.

## Comparação visual

Conceito: `treehouse/assets/concept.png`, gerado com ImageGen integrado. Screenshot final do Chrome em 390×844 inspecionado com `view_image`, junto ao conceito. O conceito nativo é 853×1844; a conferência foi feita no tamanho de celular, não na resolução nativa do PNG.

| Ponto | Resultado e decisão |
| --- | --- |
| Paleta | Preservados fundo ameixa, madeira âmbar, folhagem verde e texto creme. |
| Composição | Tronco nas laterais, jogo no centro, título acima, controles abaixo. |
| Tipografia | Monoespaçada nativa para leitura e acessibilidade; não é a fonte rasterizada do conceito. |
| Arte | Fundo e atlas gerados dedicados, com transparência e recortes; personagem ampliada após inspeção. |
| Controles | Direcional, pausa e pulo; AÇÃO explícita adicionada para os puzzles. |
| Plataformas | Layouts determinados pelos cinco percursos jogáveis, em vez da disposição ilustrativa única. |
| Texto | Nome preservado com X literal; instruções variam por mecânica. Primeiro andar não anuncia uma chave inexistente. |

O conceito foi usado como direção visual, não como reprodução pixel a pixel: ornamentos e adereços decorativos foram reduzidos, e o layout dos pisos atende à biblioteca de fases. As diferenças acima são escolhas do protótipo. O jogo mantém a composição, paleta e linguagem de pixel art verificadas visualmente.
