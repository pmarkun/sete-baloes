# Pequenos jogos

[Jogar no GitHub Pages](https://pmarkun.github.io/sete-baloes/) · [Casa na Árvore](https://pmarkun.github.io/sete-baloes/treehouse/) · [Sete Balões](https://pmarkun.github.io/sete-baloes/game/)

Dois jogos independentes, acessíveis pelo menu inicial. O Sete Balões original permanece em `game/`, sem alterações em seu código ou assets.

## Rodar

Na raiz do repositório, execute `uv run python -m http.server 4173` e abra http://localhost:4173. Não há dependências npm, build ou serviços externos.

## Casa na Árvore de X Andares

Uma menina explora dez andares de uma árvore em pixel art. O X faz parte do nome: novos andares podem ser acrescentados à biblioteca.

- Setas ou WASD: andar; subir e descer somente junto às escadas.
- Espaço: pular. E ou botão AÇÃO perto de um mecanismo: interagir. Proximidade e ↑ não acionam mecanismos.
- Celular: direcional, PULAR e AÇÃO. É possível segurar uma direção e pular ao mesmo tempo.
- P / Esc: pausa. Sair da aba pausa automaticamente.
- ♪: silenciar ou ativar música e efeitos. O áudio começa após uma interação; sua preferência fica salva.
- O último andar iniciado fica salvo neste navegador. O menu de pausa permite recomeçar.

| Andar | Mecânica |
| --- | --- |
| 1 | Escadas e primeira porta |
| 2 | Chave e fechadura |
| 3 | Alavanca e ponte |
| 4 | Alçapão, uma falsa SAÍDA e uma visita misteriosa |
| 5 | Saltos, chave e alçapão |
| 6 | Empurrar uma caixa sobre um contrapeso |
| 7 | Tocar a sequência de sinos 2 → 1 → 3 |
| 8 | Plantar uma semente e fazer crescer uma escada viva |
| 9 | Vestir o manto, voltar ao andar 4 e roubar a chave antes de ser alcançado pelo próprio passado |
| 10 | Três cristais e uma passagem que fecha em 12 segundos |

A conclusão do décimo andar leva à copa e ao céu, mantendo o encerramento “Você ganhou!”. Quem já havia concluído os cinco andares antigos continua a partir do sexto; use RECOMEÇAR para ver a nova cena do quarto andar desde o início.

Atalhos de teste: `treehouse/?floor=4` e `treehouse/?floor=9` abrem as duas partes do paradoxo. `?floor=N`, de 1 a 10, não altera seu progresso salvo. No passado, uma captura reinicia apenas a tentativa de roubo, sem apagar a subida.

## Criar outros andares

Veja [a biblioteca e o formato das fases](treehouse/README.md). O motor e os dados são módulos independentes da renderização e da interface.

## Verificar

```sh
node treehouse/engine.test.mjs
node treehouse/finale.test.mjs
node treehouse/expansion.test.mjs
node --check treehouse/app.mjs
```

22 testes verificam os dez percursos, bloqueios, ações explícitas, eventos sonoros, perseguição temporal, fuga, recuperação após captura, passagem temporizada e encerramento. [Relatório de validação visual e limitações](docs/validation.md).

Depois da vitória o jogo permanece concluído, sem retornar ao primeiro andar; `treehouse/?finale=1` permite ver a cena sem alterar o progresso.

## Publicação

O workflow `.github/workflows/pages.yml` publica um diretório contendo apenas o menu e os dois jogos. A branch `feat/casa-na-arvore` está habilitada para a publicação deste protótipo; o PR registra a mudança sem precisar de merge. O endereço antigo da raiz passa a ser o menu; o jogo anterior fica em `/game/`.
