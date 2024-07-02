// @ts-nocheck

import { Node } from "./node";
import { ObjectService } from "./../services/objectService";
import * as vscode from "vscode";

export class ObjectsPanelProvider implements vscode.TreeDataProvider<Node> {
	private _onDidChangeTreeData: vscode.EventEmitter<Node | undefined> =
		new vscode.EventEmitter<Node | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Node | undefined> =
		this._onDidChangeTreeData.event;

	constructor(private context: vscode.ExtensionContext) {}

	getTreeItem(element: Node): vscode.TreeItem {
		if (element.collapsibleState === 1) {
			element.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
		}

		return element;
	}

	getParent(element: Node) {
		return element.rootNode;
	}

	getChildren(element?: Node): Thenable<Node[] | undefined> {
		if (element === undefined) {
			let objectService = new ObjectService(this.context.workspaceState);
			let nodeList = objectService.getObjects();

			return Promise.resolve(nodeList);
		}

		return Promise.resolve(element.children);
	}

	async getNodeByPath(path?: string) {
		if (path) {
			let splitPath = path.replace(/\?\./gi, ".").split(".");
			let matchingNode;
			if (splitPath.length > 0) {
				let findPath = splitPath[0];
				let children = await this.getChildren();

				const regex = /(.*)\[(\d+)\]$/;
				const matchRoot = findPath.match(regex);
				if (matchRoot) {
					const rootChild = children?.find((child) => child?.path === matchRoot[1]);
					if (rootChild) {
						children = await rootChild.getChildren();
					} else {
						children = [];
					}
				}

				while (splitPath.length > 0 && children.length > 0) {
					let checkMatchingNode = children.find(
						(child) => child.path === findPath
					);

					if (!checkMatchingNode) {
						break;
					}

					matchingNode = checkMatchingNode;

					splitPath.shift();

					if (splitPath.length > 0) {
						children = await matchingNode.getChildren();

						const match = splitPath[0].match(regex);

						if (match) {
							const basePath = match[1];
							let checkHeadNode = children?.find((child) =>
								child?.children?.find(
									(subChild) =>
										subChild?.path ===
										findPath + `.${splitPath[0]}`
								)
							);

							if (checkHeadNode) {
								children = await checkHeadNode.getChildren();
							} else {
								splitPath[0] = basePath;
							}
						}

						findPath += "." + splitPath[0];
					}
				}

				if (matchingNode) {
					return matchingNode;
				} else {
					return null;
				}
			}
		}
	}

	async getAllNodes(): Promise<Node[]> {
		let objectService = new ObjectService(this.context.workspaceState);
		const rootNodes = objectService.getObjects();
		const allNodes: Node[] = [];

		const traverse = async (nodes: Node[]) => {
			for (const node of nodes) {
				allNodes.push(node);

				const children = node.children;
				if (children?.length > 0) {
					await traverse(children);
				}
			}
		};

		await traverse(rootNodes);

		return allNodes;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}
}
