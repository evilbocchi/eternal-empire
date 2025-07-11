export const combineHumanReadable = (...strings: string[]) => {
    let label = "";
    let i = 1;
    let size = strings.size();
    for (const c of strings) {
        if (c === "") {
            --size;
            continue;
        }
        label += c;
        if (i < size) {
            label += ", ";
        }
        ++i;
    }
    return label;
}