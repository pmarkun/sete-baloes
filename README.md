# Pequenos jogos

[Jogar no GitHub Pages](https://pmarkun.github.io/sete-baloes/) · [Casa na Árvore](https://pmarkun.github.io/sete-baloes/treehouse/) · [Sete Balões](https://pmarkun.github.io/sete-baloes/game/)

Dois jogos independentes, acessíveis pelo menu inicial. O Sete Balões original permanece em `game/`, sem alterações em seu código ou assets.

## Rodar

Na raiz do repositório, execute `uv run python -m http.server 4173` e abra http://localhost:4173. Não há dependências npm, build ou serviços externos.

## Casa na Árvore de X Andares

Uma menina explora cinco andares de uma árvore em pixel art. O X faz parte do nome: novos andares podem ser acrescentados à biblioteca.

- Setas ou WASD: andar; subir e descer somente junto às escadas.
- Espaço: pular. E ou ↑ perto de um objeto: interagir.
- Celular: direcional, PULAR e AÇÃO. É possível segurar uma direção e pular ao mesmo tempo.
- P / Esc: pausa. Sair da aba pausa automaticamente.
- O último andar iniciado fica salvo neste navegador. O menu de pausa permite recomeçar.

Os cinco andares apresentam escadas; chave e porta; alavanca e ponte; salto e alçapão; e a combinação de chave, salto e alçapão. A conclusão do quinto andar mostra o encerramento do MVP.

## Criar outros andares

Veja [a biblioteca e o formato das fases](treehouse/README.md). O motor e os dados são módulos independentes da renderização e da interface.

## Verificar

```sh
node treehouse/engine.test.mjs
node treehouse/finale.test.mjs
node --check treehouse/app.mjs
```

Oito testes verificam as rotas dos cinco andares, escadas, salto e aterrissagem, bloqueios e reinício. [Relatório de validação visual e limitações](docs/validation.md).

Três testes adicionais verificam o encerramento na copa, a subida ao céu e a preferência por redução de movimento. Depois da vitória o jogo permanece concluído, sem retornar ao primeiro andar; `treehouse/?finale=1` permite ver a cena sem alterar o progresso.

## Publicação

O workflow `.github/workflows/pages.yml` publica um diretório contendo apenas o menu e os dois jogos. A branch `feat/casa-na-arvore` está habilitada para a publicação deste protótipo; o PR registra a mudança sem precisar de merge. O endereço antigo da raiz passa a ser o menu; o jogo anterior fica em `/game/`.
