# Biblioteca da Casa na Árvore

`levels.mjs` define as fases. `engine.mjs` controla física e puzzles sem DOM. `render.mjs` usa o atlas e o fundo. `app.mjs` liga teclado, ponteiros, pausa, progressão e armazenamento à interface HTML.

Ao sair do último andar (atualmente o décimo), `finale.mjs` conduz a cena da copa: a menina repousa sobre as folhas por 2,5 segundos, sobe ao céu e recebe a mensagem de vitória aos 6 segundos. A vitória permanece salva neste navegador, inclusive após recarregar; a única ação no encerramento volta ao menu. Não há reinício do primeiro andar nesse fluxo. Com redução de movimento, a cena fica estática e a mensagem aparece no mesmo intervalo.

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

Mundo lógico: 240 × 360. Origem no canto superior esquerdo, y aumenta para baixo. A posição da menina corresponde ao centro horizontal e à base dos pés. Plataformas e escadas devem formar rotas alcançáveis; o salto sobe cerca de 35 unidades. A física usa passos limitados a 1/30 s.

Para adicionar um andar, acrescente um objeto em `levels` com `name`, `hint`, `spawn`, `platforms`, `ladders`, `objects` e `door`. Use flags distintas para mecanismos independentes. Inclua um teste de percurso que caminhe, pule e escale até a saída; não teletransporte a personagem no teste de resolução. O inventário reinicia entre andares.

Limites do MVP: uma chave comum por andar; sem editor visual. Algumas flags e regras dos novos puzzles (`weight`, `song`, três cristais) são convencionais e documentadas acima. O contador acompanha a lista de fases; os textos narrativos descrevem dez andares.

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
- `assets/sprites.png`: atlas transparente com menina parada, andando e escalando, chave, porta, alavanca, plataforma e escada.
- `assets/time-objects-alpha.png`: atlas RGBA de manto parado/andando, portal, roupa, caixa, sino, planta e cristal. Gerado com ImageGen a partir da identidade original; uma segunda edição removeu o fundo. O rosto da skin de manto fica inteiramente encoberto. A skin normal foi preservada.

Os recortes normalizados ficam em `render.mjs`. Colisões são definidas pelo motor, independentemente da resolução dos PNGs. Interface e indicadores de estado são nativos; a arte dos componentes vem do atlas.
