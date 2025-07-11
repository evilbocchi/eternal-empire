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

export const formatRichText = (text: string | undefined, color: Color3 | undefined, size: number | undefined, weight: string | number) => {
    return `<font ${color === undefined ? undefined : `color="#${color.ToHex()}"`} size="${size}" weight="${weight}">${text}</font>`;
}