import { Node } from './../providers/node';
import * as vscode from "vscode";
import { ObjectService } from "./../services/objectService";

export async function copyObjectCommand(context: vscode.ExtensionContext, focusItem: Node) {
	const objectService = new ObjectService(context.workspaceState);

	if (focusItem.isRoot || focusItem.description === "Object") {
		const jsonString = JSON.stringify(focusItem.jsonObject, null, 2);
		await vscode.env.clipboard.writeText(jsonString);
	} else {
		let copyJson: { [key: string]: any } = {};
		copyJson[focusItem.label] = focusItem.jsonObject;

		const jsonString = JSON.stringify(copyJson);
		await vscode.env.clipboard.writeText(jsonString);
	}

	vscode.window.showInformationMessage("Object copied to clipboard as JSON.");
}
