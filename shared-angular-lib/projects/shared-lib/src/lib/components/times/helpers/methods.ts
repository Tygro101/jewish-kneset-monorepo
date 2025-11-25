

export const getSplicedTimes = (keys: Array<string>): { firstSet: Array<string>, secondSet: Array<string> } => {
    const times2 = keys.slice(0, Math.floor(keys.length / 2));
    const times1 = keys.slice(Math.floor(keys.length / 2), keys.length);
    return { firstSet: times1, secondSet: times2 };
}