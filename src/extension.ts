import { Node } from "./providers/node";
import * as vscode from "vscode";
import * as path from "path";

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
export let currentFile: string = "";

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
	//on file change
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument((event) => {
			const filePath = event.document.uri.fsPath;
			currentFile = filePath;
			globalObjectsPanelProvider.refresh();
		})
	);
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				const filePath = editor.document.uri.fsPath;
				currentFile = filePath;
				globalObjectsPanelProvider.refresh();
			}
		})
	);

	//on focus tree view
	context.subscriptions.push(
		globalObjectsPanelTreeView.onDidChangeSelection((event: any) => {
			globalToolProvier.refresh();
		})
	);
	//on hover text editor
	vscode.languages.registerHoverProvider("*", {
		async provideHover(document, position, token) {
			const customWordPattern = /[\w\.\?\[\]]+/g;

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
						//make focus
						node.focus(globalObjectsPanelTreeView);

						//show hover
						const hoverContent = new vscode.MarkdownString();
						const nodeIcon = vscode.Uri.file(
							path.join(
								context.extensionPath,
								"media",
								"treeview-icon",
								node.iconPath.path.split("/").reverse()[0]
							)
						).toString();

						hoverContent.appendMarkdown(
							`<span>
                                <img src="${nodeIcon}" alt="node-icon" width="16" height="16" />&nbsp;
                                <b>${node.label} &nbsp;<code>${
								node.isRoot ? "root" : node.description
							}</code></b>
							</span>\n`
						);

						hoverContent.appendCodeblock(
							JSON.stringify(node.jsonObject, null, 2),
							"json"
						);

						hoverContent.isTrusted = true;
						hoverContent.supportHtml = true;

						return new vscode.Hover(
							hoverContent,
							new vscode.Range(position, position)
						);
					}
				}
			}
		},
	});

	// context.subscriptions.push(
	// 	vscode.window.onDidChangeTextEditorSelection(async (event) => {
	// 		const editor = event.textEditor;
	// 		const position = event.selections[0].active;
	// 		const document = editor.document;

	// 		const customWordPattern = /[\w\.\?\[\]]+/g;

	// 		const wordRange = document.getWordRangeAtPosition(
	// 			position,
	// 			customWordPattern
	// 		);

	// 		if (wordRange) {
	// 			let findPath = document.getText(wordRange).split(".");
	// 			if (findPath?.length > 0) {
	// 				if (findPath[0] === "this") {
	// 					findPath.shift();
	// 				}

	// 				const node = await globalObjectsPanelProvider.getNodeByPath(
	// 					findPath.join(".")
	// 				);

	// 				if (node) {
	// 					node.focus(globalObjectsPanelTreeView);
	// 				}
	// 			}
	// 		}
	// 	})
	// );
	//#endregion register event

	//#region register command
	context.subscriptions.push(
		vscode.commands.registerCommand("objectUtility.openSearch", () => {
			vscode.commands.executeCommand("list.find");
		})
	);

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
