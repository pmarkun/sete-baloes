# Biblioteca da Casa na Árvore

Cada andar tem seu próprio arquivo em `levels/01-first-branches.mjs` até `levels/12-night-watch.mjs`. `levels/index.mjs` registra a ordem; `levels.mjs` mantém o ponto de importação. `components.mjs` fornece as fábricas reutilizáveis. `physics.mjs` compartilha gravidade, colisões, objetos em queda e impactos. `engine.mjs` controla física e puzzles sem DOM. `render.mjs` usa o atlas e o fundo. `app.mjs` liga teclado, ponteiros, pausa, progressão e armazenamento à interface HTML.

Ao sair do último andar (atualmente o décimo segundo), `finale.mjs` conduz a cena da copa: a menina repousa sobre as folhas por 2,5 segundos, sobe ao céu e recebe a mensagem de vitória aos 6 segundos. A vitória permanece salva neste navegador, inclusive após recarregar; voltar ao menu pelo botão de vitória ou pelo cabeçalho limpa a fase salva e a marca de vitória. A próxima entrada começa no primeiro andar. A tela de vitória permanece até essa saída explícita. Com redução de movimento, a cena fica estática e a mensagem aparece no mesmo intervalo.

Para inspecionar a animação sem jogar nem alterar o progresso salvo, abra `?finale=1`. Verifique a lógica com `node treehouse/finale.test.mjs`.

## Componentes

| Componente | Contrato |
| --- | --- |
| `platform(x, y, w, requires?)` | Piso sólido ao cair; pode atravessar de baixo para cima durante um salto. Uma flag pode ativá-lo. |
| `ladder(x, top, bottom, requires?)` | Movimento vertical apenas próximo à escada. Uma flag bloqueia a subida até abrir o alçapão. |
| `key(x, y)` | Coletada por proximidade, ativa `key` no inventário do andar. |
| `lever(x, y, target)` | Somente AÇÃO/E próximo ativa a flag. O alvo `timer` abre por 12 segundos e pode ser reativado. |
| `door(x, y, requires[])` | Conclui o andar por interação quando todas as flags exigidas estão presentes. |
| `hatch: {x, y, requires}` | Tampa visual associada à mesma flag de uma escada bloqueada. |
| `object('crate', x, y)` / `object('plate', x, y)` | AÇÃO empurra 18 unidades na direção do olhar; o alinhamento com a placa ativa `weight`. |
| `object('bell', x, y, {note})` | AÇÃO toca uma nota. `level.melody` define a sequência; erro reinicia a sequência. |
| `object('seed', x, y)` / `object('pot', x, y)` | Coleta da semente e plantio por AÇÃO ativam `grown`; uma escada com `vine: true` aparece. |
| `object('cloak', x, y)` | AÇÃO veste a skin de rosto coberto e torna o portal disponível. |
| `object('crystal', x, y)` | Coletável. Três cristais ativam `crystals`. |
| `portal: {x,y}` | AÇÃO entra no passado quando há manto; no passado, exige a chave para retornar. |
| `falseExit: {x,y}` / `object('exitKey', x, y)` | Porta SAÍDA narrativa; chave retirada pela figura do futuro na primeira visita, coletada com AÇÃO no retorno. |

Mundo lógico: 240 × 360. Origem no canto superior esquerdo, y aumenta para baixo. A posição da menina corresponde ao centro horizontal e à base dos pés. Plataformas e escadas devem formar rotas alcançáveis; o salto normal sobe cerca de 35 unidades, o lunar cerca de 63 e o pesado cerca de 21. A física usa passos limitados a 1/30 s.

Para adicionar um andar, crie um arquivo em `levels/` exportando um objeto baseado em `base()`, com `name`, `spawn`, `platforms`, `ladders`, `objects` e `door`. Registre o import em `levels/index.mjs`. Não adicione `hint`: as pistas devem estar nos objetos, sons e suas reações. Use flags distintas para mecanismos independentes. Inclua um teste de percurso que caminhe, pule e escale até a saída; não teletransporte a personagem no teste de resolução. O inventário reinicia entre andares.

Limites do MVP: uma chave comum por andar; sem editor visual. Algumas flags e regras dos novos puzzles (`weight`, `song`, três cristais) são convencionais e documentadas acima. O contador acompanha a lista de fases; os textos narrativos descrevem doze andares.

## Paradoxo temporal

`temporal.mjs` define as trajetórias da figura encapuzada e do passado. Na primeira passagem pelo quarto andar, `y <= 255` abre o portal: a figura pega a chave da SAÍDA e desaparece. A porta continua trancada, restando a subida normal.

No nono andar, vestir o manto permite abrir o portal. O motor guarda um snapshot do andar atual e carrega **os mesmos dados do andar 4**, com a chave presente, a personagem no portal e sua versão anterior subindo. AÇÃO pega a chave e AÇÃO no portal devolve o snapshot com `timeKey`. Contato com a versão passada, ou demora de 10 segundos, causa uma pausa de 1,5 segundos e restaura só esse encontro. O inventário temporal não vaza para o andar errado. A trajetória do passado é encenada, não uma gravação dos inputs reais.

## Áudio

`audio.mjs` contém a composição original “Galhos de amanhã”: valsa em dó maior a 96 BPM, melodia de triângulo e acompanhamento suave. Música e efeitos são sintetizados com Web Audio; não há downloads de trilha, bibliotecas novas ou serviços. `Game.emit()` produz eventos (`jump`, `lever`, `hatch`, `portal`, `bell`, etc.) drenados pela interface. Mecanismos já abertos não repetem efeitos; um salto recusado no ar também não toca.

Áudio liberado por gesto, preferência de mute persistida e vozes encerradas na pausa ou ao sair da aba. O limite de polifonia e a desconexão de osciladores evitam acúmulo. O jogo funciona sem Web Audio disponível.

## Arte

Assets produzidos com ImageGen integrado, sem API externa em runtime:

- `assets/concept.png`: conceito de tela completa em pixel art, árvore em corte vertical, paleta ameixa/madeira/verde, HUD e controles para celular.
- `assets/tree.png`: tronco oco frontal, bordas com casca e folhas, centro escuro desocupado para plataformas.
- `assets/tree-outward.png`: revisão usada pelo jogo; colunas laterais com todos os galhos projetados para o exterior, mantendo o miolo livre.
- `assets/canopy.png`: cena exterior da copa, com folhas sob a menina e céu aberto acima.
- `assets/sprites.png`: atlas original, mantido para chave, porta, alavanca, plataforma e escada.
- `assets/character-owl.png`: três poses RGBA da personagem aprovada, com pele parda, bob castanho escuro de cachos largos, máscara branca e duas orelhas. Usado na subida, na versão passada e na copa.
- `assets/time-objects-alpha.png`: atlas RGBA de manto parado/andando, portal, roupa, caixa, sino, planta e cristal. Gerado com ImageGen a partir da identidade original; uma segunda edição removeu o fundo. O rosto da skin de manto fica inteiramente encoberto. O manto continua cobrindo a identidade.

Os recortes normalizados ficam em `render.mjs`. Colisões são definidas pelo motor, independentemente da resolução dos PNGs. Interface e indicadores de estado são nativos; a arte dos componentes vem do atlas.

## Gravidade e parkour

`physics: {gravity, jumpSpeed, impactThreshold?}` pertence a cada fase. O andar 5 usa 110/118, o normal 430/175 e o pesado 850/190. A velocidade horizontal permanece 76. Pisos são atravessáveis de baixo para cima e sólidos na queda; errar um vão devolve a personagem a um piso inferior, sem reiniciar o puzzle.

`key(x,y,{falling:true,vy:0})` participa da mesma gravidade e pousa 12 unidades acima do piso. No andar 6, `{suspended:true,impacts:0,releaseAfter:3,vy:0}` segura a chave até três aterrissagens acima de `impactThreshold:150`. Andar não conta como impacto; chave suspensa não é coletável. A queda forte gera `impact`, treme o cenário e a chave. `prefers-reduced-motion` suprime os deslocamentos visuais, preservando a física e o som.

## Pista rítmica

O andar 7 declara uma única sequência `[1,3,2]`, compartilhada por `melody` e `music.rhythm`. `rhythm.mjs` intercala dois ticks vazios entre grupos e sete adicionais ao fim; cada tick dura 0,32 s. A trilha troca a valsa por batidas de madeira sobre um fundo suave, com intervalo final de 3,2 s entre a última batida e a próxima repetição. Não há solução em texto na interface. Pausar e retomar reinicia o ciclo; mudar de fase restaura a valsa. O botão ♪ silencia também esta pista, portanto é preciso reativá-lo para ouvi-la.

## Lampião, espinhos e vigília

O andar 10 coloca `object('lantern',145,58)` no caminho entre a última escada e a porta. A saída exige a coleta. O andar 11 declara `entryFlags:{lantern:true}`: a posse é garantida ao entrar, inclusive após recarregar, usar preview ou migrar uma vitória antiga. Não é um inventário global; esse contrato de entrada mantém o lampião nas tentativas sem afetar os outros puzzles.

`lighting:{mode:'lantern',radius:52}` desenha uma máscara preta com abertura radial que acompanha a personagem. `object('spikes',x,y,{w})` tem colisão na faixa de oito unidades acima do piso. Contato congela a tentativa por 0,8 s e recarrega somente o andar atual. O parkour tem percurso físico testado, com quedas e saltos sobre espinhos.

`lighting:{mode:'cycle',lightSeconds:3.5,darkSeconds:2.5,fade:.35}` controla a vigília no andar 12. O mesmo relógio da simulação define a máscara visual e a permissão de movimento da criatura. Pausar congela ambos. Com redução de movimento, o cenário permanece visível e escurecido de modo constante; um pequeno indicador mostra o ciclo, preservando a regra da perseguição.

`hunter:{triggerY:250,spawn:{x:200,y:250},speed:46}` faz a criatura aparecer na segunda plataforma. O sistema reutilizável em `night.mjs` persegue no mesmo piso e usa as escadas do andar para subir ou descer. Captura durante o escuro reinicia só essa fase. A criatura é um guaxinim mecânico original, tributo à atmosfera de animatrônicos de FNAF. `creature`, `powerOff` e `powerOn` têm efeitos sintetizados próprios.

Arte: `assets/night-objects.png`, duas poses da criatura e lampião. ImageGen integrado; [prompt e registro do asset](assets/night-objects.prompt.md). Espinhos e máscara de iluminação são geometria nativa de canvas.
