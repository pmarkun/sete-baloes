# Revamp dos andares 14–16

## Problemas encontrados

Os testes anteriores disparavam eventos com a personagem reposicionada, mas não completavam as fases. A corda permitia reagarre após soltar, tinha impulso diferente da velocidade desenhada e podia deixar a personagem cair indefinidamente. A chuva mudava a velocidade e logo congelava o motor, portanto a queda não aparecia. O perseguidor ficava no chão enquanto a porta estava a menos de dois segundos de corrida.

## Propostas implementadas

| Andar | Novo desafio | Leitura visual | Como o erro funciona |
| --- | --- | --- | --- |
| 14 · Entre dois balanços | Agarrar uma corda, escolher quando soltar e atravessar dois vãos em sentidos opostos. | Copa verde, cordas com pegadores claros, arco de movimento, indicação de soltar e bandeiras de retorno. | Piso inferior seguro; retornos após cada travessia. Não há reagarre automático. |
| 15 · As calhas da árvore | Observar rajadas, cruzar dois vãos e alcançar a chave e a porta no alto. Água cai e depois corre pelo piso até a borda. | Calhas conectadas às laterais, gota que cresce antes da rajada, poças móveis, respingos e abrigos verdes. | Acerto empurra e derruba com animação física; proteção por 1,1 s evita acertos em sequência. Retornos preservam o avanço. |
| 16 · A fuga do guaxinim | Subir três escadas, saltar um obstáculo e tocar dois sinos para liberar a porta e distrair a criatura. | Amanhecer dourado, criatura adormecida, aviso de investida, sino tocado e duas luzes na porta. | Contato reinicia apenas este andar. A criatura anuncia a investida e descansa após ela. |

## Controles e decisões

- Corda: ↑ ou AÇÃO perto do pegador para agarrar; PULAR para soltar. A escada tem prioridade sobre ↑. O impulso segue a direção e a velocidade do balanço; é possível corrigir o salto com o direcional.
- Chuva: a gota âmbar crescendo anuncia 0,65 s antes da rajada. Os abrigos verdes protegem da chuva e drenam a água do piso. É possível esperar em segurança ou saltar sobre a água.
- Guaxinim: começa adormecido, acorda quando o jogador avança. Sinos desviam sua atenção por 3 s e recarregam em 6 s. A investida fixa a direção após o aviso; pular durante o ataque ou sair da linha cria espaço.

## Verificação

As três rotas completas usam apenas caminhada, escada, salto, espera e AÇÃO; não alteram posição, inventário ou conclusão diretamente. Foram executadas com passos de 30, 60 e 120 Hz. Os testes incluem soltura sem reagarre, queda e retorno, abrigos, imunidade temporária, captura, esquiva, recarga dos sinos e importação/exportação pelo editor.

O renderer e as mesmas regras são usados na campanha e na prévia do editor. As novas opções ficam no JSON avançado da fase. A animação ambiental respeita redução de movimento; as animações que comunicam a mecânica continuam visíveis.
