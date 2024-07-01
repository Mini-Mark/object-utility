import { Node } from './providers/node';
import * as vscode from "vscode";

//Sidebar
import { ObjectsPanelProvider } from "./providers/objectsProvider";
import { ToolPanelProvider } from "./providers/toolProvider";

//Command
import { addObjectCommand } from "./commands/addObjectCommand";
import { deleteObjectCommand } from "./commands/deleteObjectCommand";
import { renameObjectCommand } from "./commands/renameObjectCommand";
import { copyKeyCommand } from "./commands/copyKeyCommand";
import { copyPathCommand } from "./commands/copyPathCommand";
import { copyObjectCommand } from "./commands/copyObjectCommand";

//Storage
import { ObjectService } from "./services/objectService";

//objects
export let globalObjectsPanelProvider: ObjectsPanelProvider;
export let globalObjectsPanelTreeView: vscode.TreeView<any>;

//tool
export let globalToolProvier: ToolPanelProvider;

export async function activate(context: vscode.ExtensionContext) {
	//DEBUG: clear data on start
	// const objectService = new ObjectService(context.workspaceState);
	// objectService.clear();

	//#region panel setup
	//objects
	globalObjectsPanelProvider = new ObjectsPanelProvider(context);
	globalObjectsPanelTreeView = vscode.window.createTreeView("objects", {
		treeDataProvider: globalObjectsPanelProvider,
		showCollapseAll: true,
	});
	context.subscriptions.push(globalObjectsPanelTreeView);

	//tool
	globalToolProvier = new ToolPanelProvider(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("tool", globalToolProvier)
	);
	//#endregion panel setup

	//#region register event
	context.subscriptions.push(
		globalObjectsPanelTreeView.onDidChangeSelection((event: any) => {
			globalToolProvier.refresh();
		})
	);

	context.subscriptions.push(
		vscode.window.onDidChangeTextEditorSelection(async (event) => {
			const editor = event.textEditor;
			const position = event.selections[0].active;
			const document = editor.document;

			const customWordPattern = /[\w\.\-\[\]]+/g;

			const wordRange = document.getWordRangeAtPosition(
				position,
				customWordPattern
			);

			if (wordRange) {
				let findPath = document.getText(wordRange).split(".");
				if (findPath?.length > 0) {
					if (findPath[0] === "this") {
						findPath.shift();
					}

					const node = await globalObjectsPanelProvider.getNodeByPath(
						findPath.join(".")
					);

					if (node) {
						node.focus(globalObjectsPanelTreeView);
					}
				}
			}
		})
	);
	//#endregion register event

	//#region register command
	context.subscriptions.push(
		vscode.commands.registerCommand("objectUtility.addObject", () => {
			addObjectCommand(context);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"objectUtility.deleteObject",
			(focusItem?: Node) => {
				deleteObjectCommand(context, focusItem);
			}
		)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand(
			"objectUtility.renameObject",
			(focusItem?: Node) => {
				renameObjectCommand(context, focusItem);
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			"objectUtility.copyPath",
			(focusItem: Node) => {
				copyPathCommand(context, focusItem);
			}
		)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand(
			"objectUtility.copyKey",
			(focusItem: Node) => {
				copyKeyCommand(context, focusItem);
			}
		)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand(
			"objectUtility.copyObject",
			(focusItem: Node) => {
				copyObjectCommand(context, focusItem);
			}
		)
	);
	//#endregion command setup
}

export function deactivate() {}
