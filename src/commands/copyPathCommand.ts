import { Node } from './../providers/node';
import * as vscode from "vscode";

export async function copyPathCommand(context: vscode.ExtensionContext, focusItem: Node) {
	await vscode.env.clipboard.writeText(focusItem.path);

	vscode.window.showInformationMessage(
		"Object path copied to clipboard as JSON."
	);
}
