
export const SUFFIXES = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "UDc", "DDc", "TDc", "QaDc", "QiDc", "SxDc", "SpDc", "ODc", "NDc", "V"];

export function abbreviate(value: number, isRoundTo2f?: boolean): string {
	if (value < 1000) {
		return tostring(isRoundTo2f ? math.floor(value*100)/100 : value);
    }
	else {
		const exp = math.floor(math.log(math.max(1, math.abs(value)), 1000));
		const suffix = SUFFIXES[exp - 1] ?? ("e+" + exp);
		const norm = math.floor(value * (100 / (math.pow(1000, exp)))) * 0.01;
		return ("%." + 2 + "f%s").format(norm, suffix);
	}
}

export function parseAbbreviated(abbreviated: string): number | undefined {
	for (let i = 0; i < SUFFIXES.size(); i++) {
        const suffix = SUFFIXES[i];
		if (string.sub(abbreviated, abbreviated.size() - suffix.size()) === suffix) {
			const parsedValue = tonumber(string.sub(abbreviated, 1, abbreviated.size() - suffix.size()));
			if (parsedValue) {
				return parsedValue * math.pow(1000, i + 1);
			}
		}
	}
	return tonumber(abbreviated);
}

export function convertToHHMMSS(seconds: number) {
	const minutes = (seconds - seconds%60)/60;
	const hours = (minutes - minutes%60)/60;
	return string.format("%02i", hours)+":"+string.format("%02i", minutes - hours*60)+":"+string.format("%02i", seconds - minutes*60);
}

export function convertToMMSS(seconds: number): string {
	const remainder = seconds - math.floor(seconds / 60) * 60;
	return tostring(math.floor(seconds / 60)) + ":" + (remainder < 10 ? "0" + tostring(remainder) : tostring(remainder));
}