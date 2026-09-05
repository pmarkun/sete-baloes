# Sete Balões

MVP de um jogo vertical para celular: Padre Bento sobe aos céus sustentado por sete balões e perde um balão a cada colisão.

## Rodar localmente

Na pasta `game`:

```sh
python3 -m http.server 4173
```

Abra `http://localhost:4173`.

Para inspecionar diretamente a cena final durante o desenvolvimento, abra `http://localhost:4173/#finale`.

Para testar uma fase específica, use `http://localhost:4173/?stage=N`, de `0` a `4`. Por exemplo, `?stage=2` abre diretamente a fase dos aviões.

Para combinar fase e dificuldade durante o desenvolvimento, use `?stage=2&difficulty=hell`. O final alternativo pode ser visto em `?difficulty=hell#finale`.

Para inspecionar um intertítulo com a transição viva do céu, use `?transition=N`, de `1` a `4`.

Para testar a pomba da paz sem esperar, use `?stage=0&dove=1`. Para abrir qualquer fase já com uma pomba no inventário, use `?stage=2&inventory=1`.

## Controles

- Celular: toque em qualquer lugar da área do jogo e arraste. Esquerda/direita move o padre; para cima solta as cordas e para baixo recolhe os balões.
- Teclado: setas ou `WASD`.
- Pausa: botão `Ⅱ`, tecla `P` ou `Esc`.
- Visual: o botão `P&B` alterna o jogo inteiro entre a paleta original e preto e branco.
- Pomba da paz: encoste na pomba com o padre ou com um dos balões para guardá-la. Toque no ícone do inventário, no canto inferior esquerdo, para fazê-la voar em espiral e remover todos os inimigos visíveis.

## Estrutura da partida

1. Pássaros baixos
2. Aves altas
3. Aviões
4. Satélites
5. Visitantes
6. Portão do céu

Cada zona dura entre 32 e 45 segundos e tem um intertítulo narrativo. A cena final mostra na fila as versões do padre correspondentes aos balões perdidos durante a subida.

Na V2, os aviões atravessam a altura do jogador e obrigam deslocamento lateral; os alienígenas aparecem apenas pilotando os discos voadores; os balões têm silhueta simples e ficam presos à cintura do padre.

Na V3, o jogo ganha três dificuldades (`FÁCIL`, `NORMAL` e `HELL`), aviões que descem em trajetórias desviáveis, controle flutuante por arrasto, modo preto e branco, trilha procedural 8-bit, intertítulos sobre o céu em movimento e um final exclusivo no Hell.

Na V4, os sete balões formam um buquê irregular inspirado no desenho da Maria. O eixo vertical do direcional ajusta o comprimento das cordas e a composição `Céu Lavanda`, feita no FamiStudio, substitui a trilha procedural em uma versão desacelerada.

Na V5, uma pomba da paz com um pequeno balão pode aparecer uma vez em cada uma das duas fases de aves. Ela fica guardada entre fases e, ao ser usada pelo inventário, cruza a tela em espiral e limpa os inimigos que estiverem visíveis.
