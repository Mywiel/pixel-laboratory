const CHEMICALS = {
    PINK: "pink",
    BLUE: "blue",
    YELLOW: "yellow"
};

const INITIAL_TUBES = [
    [CHEMICALS.PINK, CHEMICALS.BLUE, CHEMICALS.YELLOW, CHEMICALS.PINK],
    [CHEMICALS.BLUE, CHEMICALS.YELLOW, CHEMICALS.PINK, CHEMICALS.YELLOW],
    [CHEMICALS.BLUE, CHEMICALS.YELLOW, CHEMICALS.PINK, CHEMICALS.BLUE],
    [],
    []
];

const tubes = INITIAL_TUBES.map(tube => [...tube]);

const TUBE_CAPACITY = 4;

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
