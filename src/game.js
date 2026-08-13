const CHEMICALS = {
    PINK: "pink",
    BLUE: "blue",
    YELLOW: "yellow"
};

const tubes = [
    [CHEMICALS.PINK, CHEMICALS.BLUE, CHEMICALS.YELLOW, CHEMICALS.PINK],
    [CHEMICALS.BLUE, CHEMICALS.YELLOW, CHEMICALS.PINK, CHEMICALS.YELLOW],
    [CHEMICALS.BLUE, CHEMICALS.YELLOW, CHEMICALS.PINK, CHEMICALS.BLUE],
    [],
    []
];

const TUBE_CAPACITY = 4;

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

function checkPour (sourceTube, targetTube) {
    const sourceChemical = getTopChemical(sourceTube);
    const targetChemical = getTopChemical(targetTube);

    const topBlockSize = getTopBlockSize(sourceTube);
    const freeSpace = TUBE_CAPACITY - targetTube.length;

    if (sourceTube.length === 0) {
        return POUR_RESULT.SOURCE_EMPTY
    }
    if (sourceTube === targetTube) {
        return POUR_RESULT.SAME_TUBE
    }
    if (targetTube.length === TUBE_CAPACITY) {
        return POUR_RESULT.TARGET_FULL
    }
    if (targetTube.length === 0 || sourceChemical === targetChemical) {
        const amountToPour = Math.min(topBlockSize, freeSpace);

        for (let i =0; i < amountToPour; i++) {
        targetTube.push(sourceChemical);
        sourceTube.pop();
    }
    return POUR_RESULT.POURED;}

    if (sourceChemical !== targetChemical) {
        return POUR_RESULT.EXPLODED
    }
    return null;
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
    isLevelComplete,
    POUR_RESULT
};
