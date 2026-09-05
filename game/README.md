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

## Controles

- Celular: botões de esquerda e direita na parte inferior da tela.
- Teclado: setas, `A` e `D`.
- Pausa: botão `Ⅱ`, tecla `P` ou `Esc`.

## Estrutura da partida

1. Pássaros baixos
2. Aves altas
3. Aviões
4. Satélites
5. Visitantes
6. Portão do céu

Cada zona dura entre 32 e 45 segundos e tem um intertítulo narrativo. A cena final mostra na fila as versões do padre correspondentes aos balões perdidos durante a subida.

Na V2, os aviões atravessam a altura do jogador e obrigam deslocamento lateral; os alienígenas aparecem apenas pilotando os discos voadores; os balões têm silhueta simples e ficam presos à cintura do padre.
