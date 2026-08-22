const CHEMICALS = {
    PINK: "pink",
    BLUE: "blue",
    YELLOW: "yellow",
    GREEN: "green",
    ORANGE: "orange",
};

const TUBE_CAPACITY = 4;

const INITIAL_TUBES = [
    [CHEMICALS.PINK, CHEMICALS.BLUE, CHEMICALS.YELLOW, CHEMICALS.PINK],
    [CHEMICALS.BLUE, CHEMICALS.YELLOW, CHEMICALS.PINK, CHEMICALS.YELLOW],
    [CHEMICALS.BLUE, CHEMICALS.YELLOW, CHEMICALS.PINK, CHEMICALS.BLUE],
    [],
    []
];

const LEVEL_CHEMICALS = [
    CHEMICALS.PINK,
    CHEMICALS.BLUE,
    CHEMICALS.YELLOW,
    CHEMICALS.GREEN,
    CHEMICALS.ORANGE
];

const LEVEL_2_TEMPLATE = [
    ["blue", "pink", "orange", "green"],
    ["blue", "green", "yellow", "orange"],
    ["pink", "blue", "yellow", "green"],
    ["yellow", "orange", "green", "pink"],
    ["yellow", "blue", "pink", "orange"],
    [],
    [],
    []
];

function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

export function createLevelTwo() {
    const shuffledColors = shuffleArray(LEVEL_CHEMICALS);

    const colorMap = {};

    LEVEL_CHEMICALS.forEach((color, index) => {
        colorMap[color] = shuffledColors[index];
    });

    const recoloredLevel = LEVEL_2_TEMPLATE.map(tube =>
        tube.map(color => colorMap[color])
    );

    return shuffleArray(recoloredLevel);
}

export function loadLevel(newLevel) {
    tubes.length = 0;

    newLevel.forEach(tube => {
        tubes.push([...tube]);
    });
}

const tubes = INITIAL_TUBES.map(tube => [...tube]);

function createSolvedLevel(chemicals, emptyTubes = 2) {
    const tubes = [];

    chemicals.forEach(chemical => {
        tubes.push(
            Array(TUBE_CAPACITY).fill(chemical)
        );
    });

    for (let i = 0; i < emptyTubes; i++) {
        tubes.push([]);
    }

    return tubes;
}

function getReverseMoves(level) {
    const moves = [];

    level.forEach((sourceTube, sourceIndex) => {

        if (sourceTube.length === 0) {
            return;
        }

        const chemical = getTopChemical(sourceTube);

        const sourceAfterMove = sourceTube.slice(0, -1);
        const newSourceTop = getTopChemical(sourceAfterMove);

        const canRemoveOne =
            sourceAfterMove.length === 0 ||
            newSourceTop === chemical;

        if (!canRemoveOne) {
            return;
        }

        level.forEach((targetTube, targetIndex) => {

            if (sourceIndex === targetIndex) {
                return;
            }

            if (targetTube.length === TUBE_CAPACITY) {
                return;
            }

            const targetChemical = getTopChemical(targetTube);

            if (targetChemical === chemical) {
                return;
            }

            moves.push({
                sourceIndex,
                targetIndex,
                chemical
            });
        });
    });

    return moves;
}

function getRandomMove(moves, level) {
    if (moves.length === 0) return null;

    const mixingMoves = moves.filter(move => {
        return level[move.targetIndex].length > 0;
    });

    const availableMoves =
        mixingMoves.length > 0 ? mixingMoves : moves;

    const randomIndex =
        Math.floor(Math.random() * availableMoves.length);

    return availableMoves[randomIndex];
}

function executeReverseMove(level, move) {          //testlevel, randommove
    const sourceTube = level[move.sourceIndex];
    const targetTube = level[move.targetIndex];

    const chemical = sourceTube.pop();

    targetTube.push(chemical);
}

function shuffleLevel(level, numberOfMoves) {
    const moveHistory = []
    console.log(`Gewünscht: ${numberOfMoves} Mischzüge`);

    for (let i = 0; i < numberOfMoves; i++) {
        const possibleMoves = getReverseMoves(level);
        const randomMove = getRandomMove(possibleMoves, level);

        if (randomMove === null) {
            console.log(`Keine Mischzüge mehr möglich nach ${i} Zügen.`);
            break;
        }
        // console.log(`Mischzug ${i + 1}:`, randomMove);
        moveHistory.push(randomMove);
        executeReverseMove(level, randomMove);
    }

    return moveHistory;
}

function generateLevel(chemicals, emptyTubes, numberOfMoves) {
    const level = createSolvedLevel(chemicals, emptyTubes);

    shuffleLevel(level, numberOfMoves);

    return level;
}

function getMixScore(level) {
    let mixedTubes = 0;
    let colorChanges = 0;

    level.forEach(tube => {
        const differentColors = new Set(tube).size;

        if (differentColors > 1) {
            mixedTubes++;
        }

        for (let i = 1; i < tube.length; i++) {
            if (tube[i] !== tube[i - 1]) {
                colorChanges++;
            }
        }
    });

    return mixedTubes * 10 + colorChanges;
}

function hasCorrectStartShape(level, emptyTubes) {
    const emptyCount = level.filter(tube => tube.length === 0).length;

    const allFilledTubesAreFull = level
        .filter(tube => tube.length > 0)
        .every(tube => tube.length === TUBE_CAPACITY);

    return (
        emptyCount === emptyTubes &&
        allFilledTubesAreFull
    );
}

function generateBestLevel(
    chemicals,
    emptyTubes,
    numberOfMoves,
    attempts = 30
) {
    let bestLevel = null;
    let bestScore = -1;

    for (let i = 0; i < attempts; i++) {
        const level = generateLevel(
            chemicals,
            emptyTubes,
            numberOfMoves
        );
        if (!hasCorrectStartShape(level, emptyTubes)) {
            continue;
        }

        const score = getMixScore(level);

        if (score > bestScore) {
            bestScore = score;
            bestLevel = level;
        }
    }

    console.log("Bester Mix-Score:", bestScore);

    return bestLevel;
}

function createSolution(moveHistory) {
    const reversedHistory = [...moveHistory].reverse();

    return reversedHistory.map(move => {
        return {
            sourceIndex: move.targetIndex,
            targetIndex: move.sourceIndex,
            chemical: move.chemical
        };
    });
}

function resetTubes() {
    tubes.length = 0;

    INITIAL_TUBES.forEach(tube => {
        tubes.push([...tube]);
    });
}

function getTopChemical(tube) {
    if (tube.length === 0) return null;
    return tube[tube.length - 1];
}

function getTopBlockSize(tube) {
    let topBlockSize = 0;
    const topChemical = getTopChemical(tube);

    for (let i = tube.length-1; i >= 0; i--) {
        if (tube[i] === topChemical) {
            topBlockSize++;
        } else {
            break;
        }
    }
    return topBlockSize;
}

const POUR_RESULT = {
    POURED: "poured",
    SOURCE_EMPTY: "source_empty",
    TARGET_FULL: "target_full",
    SAME_TUBE: "same_tube",
    EXPLODED: "exploded"
};

function checkPour(sourceTube, targetTube) {
    const sourceChemical = getTopChemical(sourceTube);
    const targetChemical = getTopChemical(targetTube);

    if (sourceTube.length === 0) {
        return {
            result: POUR_RESULT.SOURCE_EMPTY
        };
    }

    if (sourceTube === targetTube) {
        return {
            result: POUR_RESULT.SAME_TUBE
        };
    }

    if (targetTube.length === TUBE_CAPACITY) {
        return {
            result: POUR_RESULT.TARGET_FULL
        };
    }

    if (targetTube.length === 0 || sourceChemical === targetChemical) {
        const topBlockSize = getTopBlockSize(sourceTube);
        const freeSpace = TUBE_CAPACITY - targetTube.length;
        const amountToPour = Math.min(topBlockSize, freeSpace);

        return {
            result: POUR_RESULT.POURED,
            chemical: sourceChemical,
            amount: amountToPour
        };
    }

    if (sourceChemical !== targetChemical) {
        return {
            result: POUR_RESULT.EXPLODED,
            sourceChemical: sourceChemical,
            targetChemical: targetChemical
        };
    }

    return {
        result: null
    };
}

function executePour(sourceTube, targetTube, chemical, amount) {
    for (let i = 0; i < amount; i++) {
        targetTube.push(chemical);
        sourceTube.pop();
    }
}

function isTubeComplete(tube) {
    if (tube.length===0) {
        return true
    }
    if (tube.length !== TUBE_CAPACITY) {
        return false;
    }
    for (let i = 1; i < tube.length; i++) {
        if (tube[i] !== tube[0]) {
            return false;
        }
    }
    return true
}

function isLevelComplete(tubes) {
    return tubes.every(tube => isTubeComplete(tube));
}

export {
    tubes,
    checkPour,
    executePour,
    resetTubes,
    isLevelComplete,
    POUR_RESULT
};


/* const testLevel = createSolvedLevel(LEVEL_CHEMICALS);

console.log("Vorher:", structuredClone(testLevel));

const moveHistory = shuffleLevel(testLevel, 5);

console.log("Nach 5 Mischzügen:", testLevel);
console.log("Mischhistorie:", moveHistory);

const solution = createSolution(moveHistory);

console.log("Lösungsweg:", solution);
*/

/* const generatedLevel = generateBestLevel(
    LEVEL_CHEMICALS,
    3,
    60,
    100
);

console.log("Bestes generiertes Level:", generatedLevel);

console.log(
    "Generiertes Level:",
    generatedLevel
);

console.log(
    "Mix-Score:",
    getMixScore(generatedLevel)
);
*/