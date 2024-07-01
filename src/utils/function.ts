export function jsonDeepParse(input: string) {
	let jsonString = input.trim();
	// Remove trailing commas
	jsonString = jsonString.replace(/,\s*([}\]])/g, "$1");

	// Add quotes around keys if they are missing
	jsonString = jsonString.replace(
		/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g,
		'$1"$2"$3'
	);

	return JSON.parse(jsonString);
}
