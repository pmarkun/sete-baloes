# Validação mais recente — três fases novas e proporção do canvas

## Revamp de jogabilidade dos andares 14–16 — 5 de setembro de 2026

59 testes passam. As três fases são concluídas por comandos públicos em passos de 30, 60 e 120 Hz, sem teletransportar a personagem ou alterar flags para resolver os desafios. Regressões cobrem impulso tangencial, soltura sem reagarre, quedas/retornos, abrigo seco, água escorrendo e proteção após acerto, captura/reinício, esquiva da investida e distração dos sinos. Uma rota de fuga admite pausas de 0,75 s junto a cada sino.

Chrome conectado: as três sequências de comandos foram reproduzidas por eventos de teclado na interface com relógio de animação determinístico. Andares 14 e 15 exibiram conclusão; 16 chegou à copa e a “Você ganhou!”. Nenhuma chave de progresso/vitória foi gravada pelos atalhos de teste. A cópia da fase 15 foi concluída na prévia do editor. A verificação encontrou e corrigiu o índice incorreto em “Duplicar fase oficial”; cópias dos andares 14 e 15 preservaram as mecânicas. JSON avançado inválido apresenta erro sem derrubar o renderer.

Visual: screenshots em 390×844 conferiram copa verde com duas cordas/bandeiras, calhas e abrigos sob chuva azulada, amanhecer e sinos na perseguição. Viewports do jogo: 360×800, 390×844, 768×1024, 1366×768 e 1440×900. Canvas 2:3, rodapé visível, alvos de 44 px e sem overflow horizontal. A tela inicial ganhou espaçamento compacto em alturas menores para acomodar o seletor. Editor conferido em desktop. Console sem erros/avisos nos fluxos.

Limitações: Chrome apenas; Firefox/WebKit e aparelhos físicos Safari/iOS/Android não foram executados. Os percursos no navegador usam comandos sintéticos com relógio controlado; início por clique e a apresentação com animação normal também foram inspecionados. Não é uma avaliação de dificuldade com jogadores externos nem de multitouch físico. Nenhuma dependência ou atlas novo.

## Três fases novas e seletor de desenvolvedor — 5 de setembro de 2026

45 testes aprovados. Os andares 14, 15 e 16 cobrem balanço e soltura da corda com impulso, gotas com recuo/queda e perseguição no claro com captura. O validador do editor reconhece `ropes`, `droplets` e `chaser`, e o `Game` continua aceitando fonte opcional de fases.

Chrome DevTools conferido em 1366 × 768 e 1440 × 900, além de 390 × 844: seletor com 16 opções, abertura real de `?floor=15` pelo botão de desenvolvedor, canvas 2:3 e nenhum overflow. Screenshots dos andares 14 e 15 mostraram a corda, o rastro das gotas, a porta e os controles. Console sem erros na navegação e início das fases 14, 15 e 16.

Limitações: a perseguição foi validada no Chrome e no motor, sem Safari/Firefox/WebKit ou aparelho físico; a seleção de fase é uma ferramenta local de teste e não publica rascunhos. A nova arte das gotas, corda e criatura usa geometria nativa e os assets existentes.

## Editor visual de fases — 5 de setembro de 2026

42 testes aprovados, incluindo catálogo, limites 240 × 360, referências de flags, round-trip JSON, duplicação de fases, validação das fases oficiais e execução de uma fase customizada pelo `Game`. Chrome DevTools conferido em 1366 × 768 e 1440 × 900: layout em três colunas, sem overflow horizontal, aviso desktop oculto acima de 1000 px e canvas 2:3 preservado. Em largura de 900 px, o aviso aparece e o editor mantém o conteúdo acessível.

Interações conferidas: adicionar por clique, arrastar da paleta para o canvas, seleção, edição de coordenada no inspetor, exclusão por Delete, desfazer/refazer, duplicação da fase 13, persistência local após reload, abertura da prévia e conclusão de uma fase mínima. A prévia usou `Game` com fonte em memória e exibiu “Prévia concluída” sem gravar progresso oficial. Console sem erros; preview sem overflow em 1366 × 768 e 1440 × 900.

Limitações: importação via seletor de arquivo e teste físico em MacBook não foram repetidos nesta rodada; o teste de importação inválida e round-trip está coberto no módulo do editor. Firefox, WebKit e dispositivos móveis permanecem fora do escopo do editor desktop.

35 testes aprovados. O novo andar 13 é fisicamente alcançável; tocar o espelho inverte a paleta do mundo, troca direita/esquerda e cima/baixo, emite um evento sonoro único e exige a flag para abrir a saída. A fase leva corretamente à copa como último andar.

O canvas agora usa `object-fit: contain`, preservando a proporção 2:3 dentro do espaço disponível e evitando o achatamento observado em telas altas de MacBook. Chrome conectado foi conferido em 390×844, 768×1024, 1366×768 e 1440×900: sem rolagem horizontal, controles visíveis e alvos de pelo menos 44 px; a imagem da fase 13 foi inspecionada no tamanho de MacBook.

Limitações desta rodada: a emulação foi feita no Chrome, não em um MacBook físico; Firefox, WebKit, Safari/iOS/Android físicos e toque longo real não foram repetidos. A proporção interna foi validada visualmente e pela regra CSS `contain`; a caixa externa do elemento canvas continua ocupando o mundo inteiro por design.

# Validação do MVP — 5 de setembro de 2026

## Expansão atual: andares 11 e 12

34 testes aprovados, incluindo oito novos: lampião obrigatório antes da saída do andar 10 e restaurado no 11; percurso completo de parkour e espinhos; reinício local após contato; surgimento da criatura na segunda plataforma; imobilidade na luz/movimento no escuro; captura e nova tentativa; fuga completa; perseguição pelas escadas para baixo; intervalos do ciclo. Os testes de vitória agora identificam o andar 12 como último.

Chrome conectado em 390×844, 360×800, 768×1024 e 1366×768: botões >=44 px e sem overflow horizontal. Screenshots da auréola e da criatura na luz foram inspecionados. Leitura de pixels confirmou preto opaco fora da auréola e na fase escura; área próxima da personagem iluminada; modo de redução de movimento mantém o cenário visível com escurecimento constante. Pausa congelou relógio e posição da criatura. Migração com vitória antiga 10 abriu 11/12. Um percurso do andar 12, acelerado pelo mesmo motor no navegador, chegou à copa, gravou vitória 12 e limpou progresso/conclusão ao voltar ao menu. Atlas com alpha real, 1.058.542 pixels transparentes, sem dependências novas.

Limitações: sem aparelhos físicos iOS/Android, Firefox ou WebKit; sem avaliação acústica dos novos efeitos em alto-falantes físicos. Percursos completos validados no motor, sem teletransporte nos testes de resolução; o navegador usa estado controlado para inspecionar luz, escuridão e pausa. Um aviso de desempenho de getImageData foi produzido pela instrumentação de QA, não pelo jogo. A auréola não calcula sombras por obstáculos: o campo de visão é radial, como solicitado.

## Correção: toque longo e nova partida após vitória

CSS `user-select: none`, prefixo WebKit e `-webkit-touch-callout: none` aplicados à interface do jogo; `selectstart` e `contextmenu` cancelados dentro dela. Controles mantêm captura de ponteiro, cancelamento, teclado e foco. Ao sair da vitória pelo botão ou pelo menu do cabeçalho, somente as duas chaves de progresso/conclusão da árvore são removidas. Partida incompleta, preferência sonora e atalhos de preview são preservados.

Chrome conectado em 390×844, 360×800 e 1366×768: botões >=44 px, sem overflow, seleção vazia e eventos de menu/seleção cancelados. Movimento mantido por 800 ms, cancelamento parou o movimento, pulo e soltura funcionaram com ponteiro sintético. Tentativa de simular um segundo ponteiro inexistente foi rejeitada por `setPointerCapture`; isso limita esse teste, não representa uma falha com ponteiro real. Multitouch real e o menu nativo de iOS/Android não foram validados em aparelho físico; Firefox/WebKit não executados.

Regressão de persistência no navegador: vitória salva → botão VOLTAR AO MENU → duas chaves ausentes → entrada no andar 1. Menu do cabeçalho após vitória também limpa. Saída no andar 6 mantém progresso 5; `?finale=1` conclui sem apagar essa partida; mute permanece salvo. Os 26 testes existentes, sintaxe de app e `git diff --check` passaram. Nenhuma dependência adicionada.

## Revisão atual: personagem, parkour, gravidade e ritmo

26 testes aprovados. Percursos dos dez andares executam caminhada, escada, saltos e ações no motor, sem teletransporte nos testes de resolução. Novas verificações comparam tempo de voo normal/lunar/pesado, gravidade em objetos, três impactos para soltar a chave, ausência de impactos ao ficar em pé, pouso da chave e igualdade entre grupos rítmicos e solução. O encerramento mantém os três testes anteriores e sua animação não foi alterada.

Chrome conectado: 360×800, 390×844, 768×1024, 1366×768 e 600×719 sem overflow, rodapé visível e botões de pelo menos 44 px. Screenshot mobile do andar lunar inspecionado: sprite com máscara clara e duas orelhas, sem fundo opaco. PNG RGBA verificado: 1725×912, 1.167.108 pixels totalmente transparentes. Saltos via botão de ponteiro e teclado produziram movimento real; três aterrissagens pesadas dispararam três impactos e soltaram a chave. Render com redução de movimento manteve transformação [0,0], enquanto o normal tremeu.

Áudio iniciou após clique real, estado running. Instrumentação do agendador observou grupos 1/3/2 por três ciclos: intervalos 0,96 / 0,32 / 0,32 / 0,96 / 0,32 / 3,20 segundos. Mute reduziu o ganho para próximo de zero; pausa encerrou as vozes. A pista foi validada pelo sinal e agendamento, sem avaliação acústica em aparelho físico. Nenhum erro/aviso de console.

Limitações atuais: Chrome somente; sem Firefox/WebKit, Safari/iOS/Android físicos ou multitouch real. Os dez percursos completos foram validados no motor; não foram todos repetidos manualmente no navegador. A pista musical requer som ligado. Registros abaixo descrevem revisões anteriores e não substituem esta matriz.

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
