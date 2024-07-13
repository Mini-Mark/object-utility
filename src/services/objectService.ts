import { globalObjectsPanelProvider, currentFile } from "./../extension";
import { Node, deserializeNode, serializeNode } from "./../providers/node";
import * as vscode from "vscode";

export class ObjectService {
	private static readonly OBJECTS_KEY = "objects";
	private static readonly ID_COUNTER_KEY = "object_idCounter";

	constructor(private workspaceState: vscode.Memento) {}

	private getNextId(): number {
		const currentId = this.workspaceState.get<number>(
			ObjectService.ID_COUNTER_KEY,
			0
		);
		const nextId = currentId + 1;
		this.workspaceState.update(ObjectService.ID_COUNTER_KEY, nextId);
		return nextId;
	}

	addObject(name: string, jsonObject: any): void {
		const currentObjects = this.workspaceState.get<any[]>(
			currentFile + ":" + ObjectService.OBJECTS_KEY,
			[]
		);
		const id = this.getNextId();

		const node = new Node(id, name, jsonObject, name, true);

		currentObjects.push(node);

		this.saveObjects(currentObjects);
	}

	deleteObject(path?: string): void {
		if (!path) {
			return;
		}

		let objectService = new ObjectService(this.workspaceState);
		let objects = objectService.getObjects();

		const deleteNodeInList = (nodes: Node[], path: string): Node[] => {
			return nodes.reduce((result: Node[], node) => {
				if (node.path === path) {
					// Do not add the node to the result, effectively deleting it
					return result;
				} else if (node.children && node.children.length > 0) {
					// Recursively handle children
					node.children = deleteNodeInList(node.children, path);
				}
				result.push(node);
				return result;
			}, []);
		};

		objects = deleteNodeInList(objects, path);
		objectService.saveObjects(objects);
	}

	getObjects(): Node[] {
		const currentObjects = this.workspaceState.get<any[]>(
			currentFile + ":" + ObjectService.OBJECTS_KEY,
			[]
		);

		if (currentObjects.length > 0 && !(currentObjects[0] instanceof Node)) {
			return currentObjects.map((obj) => deserializeNode(obj) as Node);
		}

		return currentObjects as Node[];
	}

	saveObjects(objects: Node[]): Thenable<void> {
		const serializedObjects = objects.map((obj) => serializeNode(obj));
		return this.workspaceState.update(
			currentFile + ":" + ObjectService.OBJECTS_KEY,
			serializedObjects
		);
	}

	async renameObjectKey(path?: string, newName: string = ""): Promise<void> {
		let node = await globalObjectsPanelProvider.getNodeByPath(path);
		if (node) {
			node.label = newName;

			let objectService = new ObjectService(this.workspaceState);
			let objects = objectService.getObjects();

			// Define a function to update node and its children paths
			const updateNodePaths = (node: Node, newPathPrefix: string) => {
				if (newPathPrefix.startsWith(".")) {
					newPathPrefix = newPathPrefix.substring(1);
				}
				node.path = newPathPrefix + "." + node.label;
				node.path = node.path.replace(/\.\./gi, "");
				node.path = node.path.replace(/\.\[/gi, "[");
				if (node.children && node.children.length > 0) {
					node.children.forEach((child) => {
						updateNodePaths(child, node.path);
					});
				}
			};

			// Find the node in the objects list and update it
			const updateNodeInList = (
				nodes: Node[],
				updatedNode: Node
			): Node[] => {
				return nodes.map((node) => {
					if (node.path === updatedNode.path) {
						node.label = updatedNode.label; // Update label
						updateNodePaths(
							node,
							updatedNode.path.split(".").slice(0, -1).join(".")
						);
						return node;
					} else if (node.children && node.children.length > 0) {
						node.children = updateNodeInList(
							node.children,
							updatedNode
						);
					}
					return node;
				});
			};

			objects = updateNodeInList(objects, node);
			this.saveObjects(objects);
		}
	}

	clear(): void {
		this.saveObjects([]);
		this.workspaceState.update(ObjectService.ID_COUNTER_KEY, 0);
	}
}
