# HeroMind · Héroes vs Villanos (edición Marvel)

Juego de memoria del **reto final** del curso de Frontend (HTML, CSS y JS). En cada tirada destapas dos cartas y tienes que emparejar a cada **héroe** con su **archienemigo**: Thor con Loki, Spider-Man con Green Goblin, Rogue con Mystique…

Incluye la modificación **"Conviértete en un superhéroe"**: artefactos que ayudan al jugador y cartas trampa (bombas) en el tablero.

Basado en la estructura de MasterDots / Dotmind (curso Frontend de mastermind.ac).

**Jugar en línea:** https://alejo25051.github.io/heromind/

## Cómo se juega

1. En `index.html` rellenas la ficha del jugador: nick, dificultad, número de tarjetas, avatar y 1 o 2 artefactos.
2. En `juego.html` todas las cartas empiezan boca abajo. Haces clic en dos y se dan la vuelta.
3. Si son un héroe y su archienemigo, se quedan destapadas y sumas puntos (con bonus por racha).
4. Si no, se ven un rato (menos cuanto más alta es la dificultad) y se vuelven a tapar.
5. La partida termina al emparejar todas las cartas (victoria) o al acabarse las tiradas (derrota).

| Dificultad | Tiempo visible | Tiradas por pareja | Puntos |
|---|---|---|---|
| Baja | 1,5 s | 3 | x1 |
| Media | 1 s | 2,5 | x1,5 |
| Alta | 0,6 s | 2 | x2 |

A las tiradas se les suma una por cada carta trampa. Al ganar, cada tirada sobrante da puntos extra.

### Artefactos (se eligen 1 o 2 en la página de entrada)

| Artefacto | Efecto |
|---|---|
| Eye of Agamotto | Destapa todas las cartas un instante |
| Cerebro | Encuentra y destapa una pareja |
| Time Stone | Suma 5 tiradas |
| Vibranium Shield | Pasivo: te salva una vez de Lady Death |

En el juego se usan **arrastrándolos al tablero** (o tocándolos, para que funcione en el celular).

### Cartas trampa

| Carta | Efecto |
|---|---|
| Lady Death | Hay dos. Si las destapas en la misma tirada, pierdes |
| Tesseract | Teletransporta: baraja todas las cartas que siguen boca abajo |
| Infinity Gauntlet | El chasquido de Thanos te quita 3 tiradas |

Como 9 y 25 son números impares, las cartas trampa completan el tablero:

| Tarjetas | Parejas | Lady Death | Tesseract | Infinity Gauntlet |
|---|---|---|---|---|
| 9 (3x3) | 3 | 2 | 1 | 0 |
| 16 (4x4) | 6 | 2 | 1 | 1 |
| 25 (5x5) | 10 | 2 | 2 | 1 |

## Requisitos del reto y dónde están

| Requisito | Dónde |
|---|---|
| Estructura de directorios ordenada | `css/`, `js/`, `img/` |
| Logo | `img/logo-heromind.svg` (diseño propio) |
| Formulario: nick, dificultad, tarjetas, avatar | `index.html` + `js/app.js` (`comprobarForm`) |
| DOM + eventos | Todo el proyecto: `addEventListener`, `innerHTML`, `classList`, delegación de eventos en el tablero |
| API Drag&Drop | Avatar y artefactos en `index.html`; artefactos sobre el tablero en `juego.html` |
| API LocalStorage | `js/datosUsuario.js`: datos del jugador, histórico de partidas y salón de la fama |
| Tiempo visible y tiradas según dificultad | `DIFICULTADES` en `js/datosJuego.js` |
| Artefactos y bombas | `ARTEFACTOS` y `BOMBAS` en `js/datosJuego.js`, lógica en `js/juego.js` |
| Validación | `index.html`, `juego.html` y los dos CSS pasan el validador del W3C sin errores ni avisos |

## Estructura

```
heromind/
├── index.html            Página de entrada del jugador
├── juego.html            Página del juego
├── css/
│   ├── styles.css        Estilos generales y de la página de entrada
│   └── stylesjuego.css   Estilos del juego
├── js/
│   ├── datosJuego.js     Personajes, avatares, dificultades, artefactos, bombas y funciones comunes
│   ├── datosUsuario.js   Gestión del localStorage
│   ├── app.js            Formulario y Drag&Drop de index.html
│   └── juego.js          Lógica del juego
└── img/
    ├── logo-heromind.svg Logo
    ├── avatares/         Avatares del jugador
    ├── personajes/       Cartas de héroes y villanos
    ├── artefactos/       Artefactos
    └── trampas/          Cartas trampa
```

## Personajes

En cada partida se eligen al azar las parejas que hacen falta entre estas 16:

| Héroe | Archienemigo |
|---|---|
| Spider-Man | Green Goblin |
| Iron Man | Ultron |
| Captain America | Red Skull |
| Thor | Loki |
| Hulk | Abomination |
| Doctor Strange | Dormammu |
| Black Panther | Killmonger |
| Professor X | Magneto |
| Mister Fantastic | Doctor Doom |
| Daredevil | Kingpin |
| Wolverine | Sabretooth |
| Rogue | Mystique |
| Gambit | Mister Sinister |
| Gamora | Thanos |
| Venom | Carnage |
| Silver Surfer | Galactus |

**Avatares del jugador:** Spider-Man, Iron Man, Captain America, Thor, Black Widow, Wolverine, Deadpool y Thanos.

---

Proyecto académico sin ánimo de lucro. Los personajes y nombres pertenecen a Marvel.
