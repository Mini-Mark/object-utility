import { globalObjectsPanelProvider } from "./../extension";
import * as vscode from "vscode";
import { ObjectService } from "./../services/objectService";
import { jsonDeepParse } from "../utils/function";

export async function addObjectCommand(context: vscode.ExtensionContext) {
	const objectService = new ObjectService(context.workspaceState);

	//Step 1: Enter the name
	const name = await vscode.window.showInputBox({
		prompt: "Enter the name for the new object",
	});
	if (!name) {
		return;
	}

	//Step 2: Enter the JSON
	const jsonInput = await vscode.window.showInputBox({
		prompt: "Enter the JSON for the new object (multi-line supported)",
		valueSelection: [0, 0],
		validateInput: (text) => {
			if (!text.trim()) {
				return "JSON input is required";
			}
			try {
				jsonDeepParse(text);
				return null;
			} catch (error) {
				console.log(error);
				return "Invalid JSON format";
			}
		},
	});

	if (!jsonInput) {
		return;
	}
	try {
		jsonDeepParse(jsonInput);
	} catch (error) {
		return;
	}

	//save to storage
	objectService.addObject(name, jsonDeepParse(jsonInput));
	vscode.window.showInformationMessage(`'${name}' object added !`);
	globalObjectsPanelProvider.refresh();
}
