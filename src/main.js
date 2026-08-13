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

const FLASK_PATH = `
    M42 8
    H78
    V62

    H80
    V70
    H82
    V78
    H84
    V86
    H88
    V94
    H92
    V102
    H96
    V110
    H100
    V118
    H104
    V126
    H108
    V132
    H110
    V136
    H110
    V138
    H108
    V140
    H106
    V142

    H14
    V142
    H12
    V140
    H10
    V138
    H10
    V136
    H12
    V132
    H16
    V126
    H20
    V118
    H24
    V110
    H28
    V102
    H32
    V94
    H36
    V86
    H38
    V78
    H40
    V70
    H42
    V62
    Z
`;

const LIQUID_PATH = `
    M49 18
    H71
    V62

    H75
    V70
    H77
    V78
    H79
    V86
    H83
    V94
    H87
    V102
    H91
    V110
    H95
    V118
    H99
    V126
    H103
    V132
    H105
    V136
    H105
    V138
    H103
    V140
    H101
    V140

    H19
    V140
    H17
    V140
    H15
    V138
    H15
    V136
    H17
    V132
    H21
    V126
    H25
    V118
    H29
    V110
    H33
    V102
    H37
    V94
    H39
    V86
    H41
    V78
    H43
    V70
    H45
    V62
    Z
`;

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
            const layerHeight = 30;
            const bottomY = 138;
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

            <path
                d="${FLASK_PATH}"
                class="flask-inside"
            />

            ${liquidLayers}

            <path
                d="${FLASK_PATH}"
                class="flask-outline"
            />

            <rect
                x="38"
                y="6"
                width="44"
                height="5"
                class="flask-rim"
            />
            
            <rect
                x="44"
                y="9"
                width="32"
                height="3"
                class="flask-rim-dark"
            />

            <!--
            <rect
                x="42"
                y="14"
                width="4"
                height="34"
                class="flask-highlight-top"
            /> 

            <rect
                x="18"
                y="108"
                width="4"
                height="22"
                class="flask-highlight-side"
            /> 
            -->
        `;

        flask.appendChild(svg);
        tubeContainer.appendChild(flask);
    });
}

renderTubes();