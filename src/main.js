import '@fontsource/press-start-2p';
import './style.css';
import {
    tubes,
    checkPour,
    executePour,
    resetTubes,
    POUR_RESULT,
    isLevelComplete
} from './game.js';

const app = document.querySelector('#app');

app.innerHTML = `
    <main class="game">

        <section id="character-screen" class="character-screen">
            <img
                id="professor-image"
                class="professor-image"
                src="${import.meta.env.BASE_URL}images/professor-start.png"
                alt="Professorin mit ihrem Hund im Labor"
            >

            <p id="character-text" class="character-text">
                READY FOR AN EXPERIMENT?
            </p>

            <button id="start-button" class="restart-button">
                START EXPERIMENT
            </button>
        </section>


        <section id="game-board" class="game-board" hidden>
            <h1>PIXEL LABORATORY</h1>

            <div id="move-counter" class="move-counter">
                MOVES: 0
            </div>

            <div id="result-message" class="result-message"></div>

            <div id="tube-container" class="tube-container"></div>
        </section>

    </main>
`;

const characterScreen = document.querySelector('#character-screen');
const professorImage = document.querySelector('#professor-image');
const characterText = document.querySelector('#character-text');
const startButton = document.querySelector('#start-button');

const gameBoard = document.querySelector('#game-board');

const tubeContainer = document.querySelector('#tube-container');
const moveCounter = document.querySelector('#move-counter');
const resultMessage = document.querySelector('#result-message');

const BASE_URL = import.meta.env.BASE_URL;

const characterImages = [
    `${BASE_URL}images/professor-start.png`,
    `${BASE_URL}images/professor-success.png`,
    `${BASE_URL}images/professor-fail.png`
];

characterImages.forEach(src => {
    const image = new Image();
    image.src = src;
});

let selectedTubeIndex = null;
let moveCount = 0;
let gameOver = false;


/*
 * ÄUSSERE FORM DES KOLBENS
 * Nur die rechte Seite wird definiert.
 * Die linke Seite wird automatisch gespiegelt.
 */
const rightSide = [
    [78, 8],
    [78, 62],

    [80, 70],
    [82, 78],
    [84, 86],
    [88, 94],
    [92, 102],
    [96, 110],
    [100, 118],
    [104, 126],

    [108, 132],
    [110, 136],
    [110, 138],

    // unten wieder etwas nach innen
    [108, 140],
    [106, 142]
];


/*
 * SCHWARZER INNENRAUM
 * Etwas kleiner als die Außenform.
 */
const cavityRightSide = [
    [74, 14],
    [74, 62],

    [76, 70],
    [78, 78],
    [80, 86],
    [84, 94],
    [88, 102],
    [92, 110],
    [96, 118],
    [100, 126],

    [104, 132],
    [106, 136],
    [106, 138],

    [104, 139],
    [102, 140]
];


/*
 * BEREICH FÜR DIE FLÜSSIGKEIT
 * Noch etwas kleiner als der schwarze Innenraum.
 *
 * Wichtig:
 * Der Flüssigkeitsbereich beginnt erst bei y = 30.
 * Dadurch bleibt oben im Hals mehr Schwarz sichtbar.
 */
const liquidRightSide = [
    [71, 30],
    [71, 66],

    [73, 74],
    [75, 82],
    [77, 90],
    [81, 98],
    [85, 106],
    [89, 114],
    [93, 122],
    [97, 130],

    [100, 135],
    [101, 137],
    [101, 138],

    [99, 139],
    [97, 140]
];


/*
 * Baut aus einer rechten Seite automatisch
 * eine exakt gespiegelte linke Seite.
 */
function createSymmetricalPath(topLeftX, topRightX, rightPoints) {
    const centerX = 60;

    const leftPoints = rightPoints
        .slice()
        .reverse()
        .map(([x, y]) => [centerX * 2 - x, y]);

    let path = `M${topLeftX} ${rightPoints[0][1]} H${topRightX} `;

    // rechte Seite: kleine Pixelstufen nach unten
    for (const [x, y] of rightPoints.slice(1)) {
        path += `H${x} V${y} `;
    }

    // Boden
    path += `H${leftPoints[0][0]} `;

    // linke Seite: exakt gespiegelte Pixelstufen nach oben
    for (const [x, y] of leftPoints.slice(1)) {
        path += `V${y} H${x} `;
    }

    path += `H${topLeftX} Z`;

    return path;
}


const FLASK_PATH = createSymmetricalPath(
    42,
    78,
    rightSide
);

const CAVITY_PATH = createSymmetricalPath(
    46,
    74,
    cavityRightSide
);

const LIQUID_PATH = createSymmetricalPath(
    49,
    71,
    liquidRightSide
);

async function showCharacterScreen(image, text, buttonText) {
    const newImage = new Image();
    newImage.src = image;

    try {
        await newImage.decode();
    } catch {
        // Falls decode() im Browser nicht klappt,
        // verwenden wir das Bild trotzdem.
    }

    professorImage.src = image;
    characterText.textContent = text;
    startButton.textContent = buttonText;

    gameBoard.hidden = true;
    characterScreen.hidden = false;
}

function showGameBoard() {
    characterScreen.hidden = true;
    gameBoard.hidden = false;
}

startButton.addEventListener('click', () => {
    resetTubes();

    moveCount = 0;
    selectedTubeIndex = null;
    gameOver = false;

    moveCounter.textContent = 'MOVES: 0';
    resultMessage.textContent = '';

    showGameBoard();
    renderTubes();
});

function renderTubes() {
    tubeContainer.innerHTML = '';

    tubes.forEach((tube, index) => {
        const flask = document.createElement('div');
        flask.classList.add('flask');
        flask.dataset.index = index;
        if (selectedTubeIndex === index) {
            flask.classList.add('selected');
        }

        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );

        svg.setAttribute('viewBox', '0 0 120 152');
        svg.setAttribute('class', 'flask-svg');
        svg.setAttribute('shape-rendering', 'crispEdges');

        const clipId = `liquid-clip-${index}`;

        let liquidLayers = '';

        tube.forEach((chemical, layerIndex) => {

            // Vier gleich große Flüssigkeitsschichten.
            // Durch die geringere Höhe bleibt oben im Hals mehr Schwarz.
            const layerHeight = 26;
            const bottomY = 140;

            const y = bottomY - ((layerIndex + 1) * layerHeight);

            liquidLayers += `
                <rect
                    x="0"
                    y="${y}"
                    width="120"
                    height="${layerHeight}"
                    class="liquid ${chemical}"
                    clip-path="url(#${clipId})"
                />
            `;
        });


        svg.innerHTML = `
            <defs>
                <clipPath id="${clipId}">
                    <path d="${LIQUID_PATH}" />
                </clipPath>
            </defs>


            <!-- Weiße äußere Glasform -->
            <path
                d="${FLASK_PATH}"
                class="flask-shell"
            />


            <!-- Schwarzer Innenraum -->
            <path
                d="${CAVITY_PATH}"
                class="flask-cavity"
            />


            <!-- Flüssigkeiten -->
            ${liquidLayers}


            <!-- Oberer heller Glasrand -->
            <rect
                x="38"
                y="6"
                width="44"
                height="5"
                class="flask-rim"
            />


            <!-- Dunkle Innenseite der Öffnung -->
            <rect
                x="44"
                y="9"
                width="32"
                height="3"
                class="flask-rim-dark"
            />


            <!-- Kleiner Glanz im schwarzen Hals -->
            <rect
                x="48"
                y="17"
                width="3"
                height="15"
                class="flask-highlight-top"
            />
        `;

        flask.appendChild(svg);
        flask.addEventListener('click', async () => {
            if (gameOver) {
                return;
            }
            if (selectedTubeIndex === null) {
                selectedTubeIndex = index;
                renderTubes();
                return;
            }

            const sourceIndex = selectedTubeIndex;
            const targetIndex = index;

            const sourceTube = tubes[sourceIndex];
            const targetTube = tubes[targetIndex];

            const pour = checkPour(sourceTube, targetTube);

            console.log(pour);

            selectedTubeIndex = null;


            if (pour.result === POUR_RESULT.POURED) {
                await animatePour(
                    sourceIndex,
                    targetIndex,
                    pour.chemical
                );
                executePour(
                    sourceTube,
                    targetTube,
                    pour.chemical,
                    pour.amount
                );

                moveCount++;
                moveCounter.textContent = `MOVES: ${moveCount}`;

                console.log(
                    `Umgefüllt: ${pour.amount} × ${pour.chemical}`
                );

                if (isLevelComplete(tubes)) {
                    gameOver = true;

                    await showCharacterScreen(
                        `${BASE_URL}/images/professor-success.png`,
                        `EXPERIMENT SUCCESSFUL! ${moveCount} MOVES`,
                        'TRY AGAIN'
                    );
                }

                }

            if (pour.result === POUR_RESULT.EXPLODED) {
                gameOver = true;
                await showPixelExplosion();

                resultMessage.textContent = 'EXPERIMENT FAILED!';


                console.log('💥 BOOM!');

                await showCharacterScreen(
                    `${BASE_URL}/images/professor-fail.png`,
                    'EXPERIMENT FAILED!',
                    'TRY AGAIN'
                );
            }

            renderTubes();
        });

        tubeContainer.appendChild(flask);
    });
}

async function showPixelExplosion() {
    const overlay = document.createElement('div');
    overlay.classList.add('explosion-overlay');

    overlay.innerHTML = `
        <div class="big-pixel-explosion">
            <div class="boom-layer boom-outer"></div>
            <div class="boom-layer boom-middle"></div>
            <div class="boom-layer boom-core"></div>

            <div class="boom-debris debris-1"></div>
            <div class="boom-debris debris-2"></div>
            <div class="boom-debris debris-3"></div>
            <div class="boom-debris debris-4"></div>
            <div class="boom-debris debris-5"></div>
            <div class="boom-debris debris-6"></div>

            <div class="boom-text">BOOM!</div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('screen-shake');

    await new Promise(resolve => setTimeout(resolve, 700));

    document.body.classList.remove('screen-shake');
    overlay.remove();
}


async function animatePour(sourceIndex, targetIndex, chemical) {
    const sourceFlask = document.querySelector(
        `.flask[data-index="${sourceIndex}"]`
    );

    const targetFlask = document.querySelector(
        `.flask[data-index="${targetIndex}"]`
    );

    if (!sourceFlask || !targetFlask) {
        return;
    }

    const sourceRect = sourceFlask.getBoundingClientRect();
    const targetRect = targetFlask.getBoundingClientRect();

    const rawMoveX = targetRect.left - sourceRect.left;
    const direction = rawMoveX > 0 ? 1 : -1;

    const moveX = rawMoveX - (direction * 50);
    const moveY = targetRect.top - sourceRect.top - 45;

    sourceFlask.classList.remove('selected');

    sourceFlask.style.setProperty('--move-x', `${moveX}px`);
    sourceFlask.style.setProperty('--move-y', `${moveY}px`);
    sourceFlask.style.setProperty(
        '--pour-rotation',
        `${direction * 45}deg`
    );

    sourceFlask.classList.add('pouring');

    // Flasche fährt zum Ziel und kippt
    await new Promise(resolve => setTimeout(resolve, 400));

    if (chemical) {
        // Erlaubter Zug: Flüssigkeitsstrahl
        const stream = document.createElement('div');
        stream.classList.add('pour-stream', chemical);

        const currentTargetRect = targetFlask.getBoundingClientRect();

        stream.style.left =
            `${currentTargetRect.left + currentTargetRect.width / 2 - 3}px`;

        stream.style.top =
            `${currentTargetRect.top - 28}px`;

        document.body.appendChild(stream);

        await new Promise(resolve => setTimeout(resolve, 250));

        stream.remove();
    } else {
        // Falsche Chemikalien: BOOM
        await showPixelExplosion(targetIndex);
    }

    sourceFlask.classList.remove('pouring');
    sourceFlask.classList.add('returning');

    await new Promise(resolve => setTimeout(resolve, 350));

    sourceFlask.classList.remove('returning');
}
renderTubes();