# Biblioteca da Casa na Árvore

`levels.mjs` define as fases. `engine.mjs` controla física e puzzles sem DOM. `render.mjs` usa o atlas e o fundo. `app.mjs` liga teclado, ponteiros, pausa, progressão e armazenamento à interface HTML.

Ao sair do quinto andar, `finale.mjs` conduz a cena da copa: a menina repousa sobre as folhas por 2,5 segundos, sobe ao céu e recebe a mensagem de vitória aos 6 segundos. A vitória permanece salva neste navegador, inclusive após recarregar; a única ação no encerramento volta ao menu. Não há reinício do primeiro andar nesse fluxo. Com redução de movimento, a cena fica estática e a mensagem aparece no mesmo intervalo.

Para inspecionar a animação sem jogar nem alterar o progresso salvo, abra `?finale=1`. Verifique a lógica com `node treehouse/finale.test.mjs`.

## Componentes

| Componente | Contrato |
| --- | --- |
| `platform(x, y, w, requires?)` | Piso sólido ao cair; pode atravessar de baixo para cima durante um salto. Uma flag pode ativá-lo. |
| `ladder(x, top, bottom, requires?)` | Movimento vertical apenas próximo à escada. Uma flag bloqueia a subida até abrir o alçapão. |
| `key(x, y)` | Coletada por proximidade, ativa `key` no inventário do andar. |
| `lever(x, y, target)` | AÇÃO ou ↑ próximo ativa permanentemente a flag indicada. |
| `door(x, y, requires[])` | Conclui o andar por interação quando todas as flags exigidas estão presentes. |
| `hatch: {x, y, requires}` | Tampa visual associada à mesma flag de uma escada bloqueada. |

Mundo lógico: 240 × 360. Origem no canto superior esquerdo, y aumenta para baixo. A posição da menina corresponde ao centro horizontal e à base dos pés. Plataformas e escadas devem formar rotas alcançáveis; o salto sobe cerca de 35 unidades. A física usa passos limitados a 1/30 s.

Para adicionar um andar, acrescente um objeto em `levels` com `name`, `hint`, `spawn`, `platforms`, `ladders`, `objects` e `door`. Use flags distintas para mecanismos independentes. Inclua um teste de percurso que caminhe, pule e escale até a saída; não teletransporte a personagem no teste de resolução. O inventário reinicia entre andares.

Limites do MVP: uma chave por andar; alavancas sem alternância; sem inimigos, som ou editor visual. O contador do HUD acompanha automaticamente a lista de fases; os textos narrativos de abertura e encerramento descrevem este MVP de cinco andares.

## Arte

Assets produzidos com ImageGen integrado, sem API externa em runtime:

- `assets/concept.png`: conceito de tela completa em pixel art, árvore em corte vertical, paleta ameixa/madeira/verde, HUD e controles para celular.
- `assets/tree.png`: tronco oco frontal, bordas com casca e folhas, centro escuro desocupado para plataformas.
- `assets/tree-outward.png`: revisão usada pelo jogo; colunas laterais com todos os galhos projetados para o exterior, mantendo o miolo livre.
- `assets/canopy.png`: cena exterior da copa, com folhas sob a menina e céu aberto acima.
- `assets/sprites.png`: atlas transparente com menina parada, andando e escalando, chave, porta, alavanca, plataforma e escada.

Os recortes normalizados ficam em `render.mjs`. Colisões são definidas pelo motor, independentemente da resolução dos PNGs. Interface e indicadores de estado são nativos; a arte dos componentes vem do atlas.
