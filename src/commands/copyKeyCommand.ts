import { Node } from './../providers/node';
import * as vscode from "vscode";

export async function copyKeyCommand(context: vscode.ExtensionContext, focusItem: Node) {
	await vscode.env.clipboard.writeText(focusItem.label);

	vscode.window.showInformationMessage(
		"Object key copied to clipboard as JSON."
	);
}
