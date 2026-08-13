import './style.css';
import { tubes } from './game.js';

const app = document.querySelector('#app');

app.innerHTML = `
    <main class="game">
        <h1>PIXEL LABORATORY</h1>
        <div id="tube-container" class="tube-container"></div>
    </main>
`;

const tubeContainer = document.querySelector('#tube-container');


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


function renderTubes() {
    tubeContainer.innerHTML = '';

    tubes.forEach((tube, index) => {
        const flask = document.createElement('div');
        flask.classList.add('flask');
        flask.dataset.index = index;

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
        tubeContainer.appendChild(flask);
    });
}


renderTubes();