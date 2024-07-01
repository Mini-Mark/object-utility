import { Node } from "./../providers/node";
import {
	globalObjectsPanelProvider,
	globalObjectsPanelTreeView,
} from "./../extension";
import * as vscode from "vscode";
import { ObjectService } from "./../services/objectService";
export async function renameObjectCommand(
	context: vscode.ExtensionContext,
	focusItem?: Node
) {
	const objectService = new ObjectService(context.workspaceState);

	globalObjectsPanelTreeView.reveal(focusItem, {
		select: true,
		focus: false,
		expand: true,
	});

	const newName = await vscode.window.showInputBox({
		prompt: "Enter key name",
		valueSelection: [0, 0],
		validateInput: (text) => {
			if (!text.trim()) {
				return "Key name is required";
			}

			const validKeyFormat = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

			if (!validKeyFormat.test(text)) {
				return "Invalid key name format. Key names can't have spaces or special characters.";
			}
		},
	});

	if (!newName) {
		return;
	}

	if (focusItem) {
		objectService.renameObjectKey(focusItem.path, newName);

		globalObjectsPanelProvider?.refresh();
	}
}
