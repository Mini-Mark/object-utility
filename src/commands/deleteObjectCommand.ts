import { Node } from "./../providers/node";
import { globalObjectsPanelProvider } from "./../extension";
import * as vscode from "vscode";
import { ObjectService } from "./../services/objectService";
export async function deleteObjectCommand(
	context: vscode.ExtensionContext,
	focusItem?: Node
) {
	const objectService = new ObjectService(context.workspaceState);

	if (focusItem) {
		objectService.deleteObject(focusItem.path);

		globalObjectsPanelProvider.refresh();
	}
}
