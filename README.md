# Pequenos jogos

[Jogar no GitHub Pages](https://pmarkun.github.io/sete-baloes/) · [Casa na Árvore](https://pmarkun.github.io/sete-baloes/treehouse/) · [Sete Balões](https://pmarkun.github.io/sete-baloes/game/)

Dois jogos independentes, acessíveis pelo menu inicial. O Sete Balões original permanece em `game/`, sem alterações em seu código ou assets.

## Rodar

Na raiz do repositório, execute `uv run python -m http.server 4173` e abra http://localhost:4173. Não há dependências npm, build ou serviços externos.

## Casa na Árvore de X Andares

Uma menina explora doze andares de uma árvore em pixel art. O X faz parte do nome: novos andares podem ser acrescentados à biblioteca. A personagem usa máscara branca de coruja com duas orelhas, pele parda e cabelo castanho escuro cacheado. Os puzzles não exibem textos com soluções; objetos, sons e mudanças no cenário oferecem as pistas.

- Setas ou WASD: andar; subir e descer somente junto às escadas.
- Espaço: pular. E ou botão AÇÃO perto de um mecanismo: interagir. Proximidade e ↑ não acionam mecanismos.
- Celular: direcional, PULAR e AÇÃO. É possível segurar uma direção e pular ao mesmo tempo.
- P / Esc: pausa. Sair da aba pausa automaticamente.
- ♪: silenciar ou ativar música e efeitos. O áudio começa após uma interação; sua preferência fica salva.
- O último andar iniciado fica salvo neste navegador. O menu de pausa permite recomeçar.

| Andar | Mecânica |
| --- | --- |
| 1 | Escadas e primeira porta |
| 2 | Chave e saltos entre passarelas partidas |
| 3 | Alavanca e três apoios separados por vãos |
| 4 | Alçapão, uma falsa SAÍDA e uma visita misteriosa |
| 5 | Gravidade lunar e plataformas alternadas |
| 6 | Gravidade pesada, contrapeso e chave suspensa |
| 7 | Descobrir nos grupos de batidas da trilha a ordem dos sinos |
| 8 | Plantar uma semente e saltar entre galhos |
| 9 | Vestir o manto, voltar ao andar 4 e roubar a chave antes de ser alcançado pelo próprio passado |
| 10 | Três cristais, passagem temporizada e lampião junto à saída |
| 11 | Lampião, escuridão, vãos e espinhos |
| 12 | Luz intermitente e criatura mecânica que só avança no escuro |

A conclusão do décimo segundo andar leva à copa e ao céu, mantendo o encerramento “Você ganhou!”. Quem concluiu os dez andares anteriores entra no 11 com o lampião. Quem já havia concluído os cinco andares antigos continua a partir do sexto; use RECOMEÇAR para ver a nova cena do quarto andar desde o início.

Atalhos de teste: `treehouse/?floor=4` e `treehouse/?floor=9` abrem as duas partes do paradoxo. `?floor=N`, de 1 a 12, não altera seu progresso salvo. No passado, uma captura reinicia apenas a tentativa de roubo, sem apagar a subida.

## Criar outros andares

Veja [a biblioteca e o formato das fases](treehouse/README.md). O motor e os dados são módulos independentes da renderização e da interface.

## Verificar

```sh
node treehouse/engine.test.mjs
node treehouse/finale.test.mjs
node treehouse/expansion.test.mjs
node treehouse/gravity.test.mjs
node treehouse/night.test.mjs
node --check treehouse/app.mjs
```

34 testes verificam os doze percursos, bloqueios, ações explícitas, eventos sonoros, perseguição temporal, fuga, recuperação após captura, passagem temporizada e encerramento. [Relatório de validação visual e limitações](docs/validation.md).

Depois da vitória, voltar ao menu limpa a fase salva e a marca de conclusão, preparando uma nova partida no primeiro andar. Sair no meio da subida preserva o progresso; `treehouse/?finale=1` permite ver a cena sem alterar o progresso.

## Publicação

O workflow `.github/workflows/pages.yml` publica um diretório contendo apenas o menu e os dois jogos. A branch `feat/casa-na-arvore` está habilitada para a publicação deste protótipo; o PR registra a mudança sem precisar de merge. O endereço antigo da raiz passa a ser o menu; o jogo anterior fica em `/game/`.
