const NAME_COLORS = [
    new Color3(253/255, 41/255, 67/255),
    new Color3(1/255, 162/255, 255/255),
    new Color3(2/255, 184/255, 87/255),
    new BrickColor("Bright violet").Color,
    new BrickColor("Bright orange").Color,
    new BrickColor("Bright yellow").Color,
    new BrickColor("Light reddish violet").Color,
    new BrickColor("Brick yellow").Color,
]

function getNameValue(pName: string) {
	let value = 0;
	for (let i = 1; i < pName.size(); i++){
		let cValue = string.byte(string.sub(pName, i, i))[0];
		let reverseIndex = pName.size() - i + 1;
		if (pName.size()%2 === 1) {
			reverseIndex -= 1;
        }
		if (reverseIndex%4 >= 2) {
			cValue = -cValue;
        }
		value = value + cValue;
    }
	return value;
}

const color_offset = 0;
function computeNameColor(pName: string) {
	return NAME_COLORS[((getNameValue(pName) + color_offset) % NAME_COLORS.size()) + 1];
}

export = computeNameColor;