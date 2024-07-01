import { ObjectService } from "./../services/objectService";
import * as vscode from "vscode";

export class Node extends vscode.TreeItem {
	constructor(
		public objectId: number,
		public label: string,
		public jsonObject: any,
		public path: string,
		public isRoot: boolean = false,
		public rootNode?: Node,
		public _children?: Node[]
	) {
		super(
			label,
			(typeof jsonObject === "object" || Array.isArray(jsonObject)) &&
				jsonObject !== null
				? vscode.TreeItemCollapsibleState.Expanded
				: vscode.TreeItemCollapsibleState.None
		);

		this.path = this.isRoot ? label : path;
		this.tooltip = this.getTooltip(jsonObject);
		this.description = this.isRoot
			? ""
			: this.getTypeDescription(jsonObject);
		this.id = `${objectId}:${path}`;

		//set context
		this.contextValue = this.label.match(/\[(\d+)\]/)
			? "ArrayChild"
			: this.description;

		this.iconPath = this.isRoot
			? vscode.Uri.file(
					`${__dirname}\\..\\..\\media\\treeview-icon\\root.svg`
			  )
			: this.description.includes("Array")
			? vscode.Uri.file(
					`${__dirname}\\..\\..\\media\\treeview-icon\\array.svg`
			  )
			: vscode.Uri.file(
					`${__dirname}\\..\\..\\media\\treeview-icon\\${this.description.toLowerCase()}.svg`
			  );

		this.getChildren();
	}

	get children(): Node[] | undefined {
		return this._children;
	}
	set children(value: Node[] | undefined) {
		this._children = value;

		if (Array.isArray(this.jsonObject)) {
			if(this._children){
				this.jsonObject = this._children.map((child) => child.jsonObject);
			}
		} else if (
			typeof this.jsonObject === "object" &&
			this.jsonObject !== null
		) {
			this.jsonObject = {};
			if(this._children){
				this._children.forEach((child) => {
					this.jsonObject[child.label] = child.jsonObject;
				});
			}
		}
	}

	private getTooltip(jsonObject: any): string {
		try {
			const jsonString = JSON.stringify(jsonObject, null, 2);
			const lines = jsonString.split("\n");
			const limitLine = 19;
			if (lines.length > limitLine) {
				return (
					lines.slice(0, limitLine).join("\n") +
					`\n\n. . . ${lines.length - limitLine} more lines . . .`
				);
			} else {
				return jsonString;
			}
		} catch (e) {
			return "";
		}
	}

	private getTypeDescription(jsonObject: any): string {
		if (Array.isArray(jsonObject)) {
			return `Array[${jsonObject.length}]`;
		} else if (jsonObject !== null && typeof jsonObject === "object") {
			return "Object";
		} else {
			return typeof jsonObject;
		}
	}

	getChildren(): Node[] {
		if (this.children) {
			return this.children;
		}
		if (Array.isArray(this.jsonObject)) {
			let childrenList = this.jsonObject.map(
				(value, index) =>
					new Node(
						this.objectId,
						`[${index.toString()}]`,
						value,
						`${this.path}[${index}]`,
						false,
						this.rootNode ? this.rootNode : this
					)
			);
			this.children = childrenList;
			return childrenList;
		} else if (
			typeof this.jsonObject === "object" &&
			this.jsonObject !== null &&
			!Array.isArray(this.jsonObject)
		) {
			let childrenList = Object.entries(this.jsonObject).map(
				([key, value]) =>
					new Node(
						this.objectId,
						key,
						value,
						`${this.path}.${key}`,
						false,
						this.rootNode ? this.rootNode : this
					)
			);
			this.children = childrenList;
			return childrenList;
		}
		return [];
	}

	focus(treeView: vscode.TreeView<any>): void {
		try {
			treeView.reveal(this, {
				select: true,
				focus: false,
				expand: true,
			});
		} catch (error) {
			console.error("Failed to focus on node:", this.label, error);
		}
	}
}
export function deserializeNode(node: any): Node | Node[] {
	if (Array.isArray(node)) {
		return node.map((item) => deserializeNode(item) as Node);
	} else {
		const deserializedNode = new Node(
			node.objectId,
			node.label,
			node.jsonObject,
			node.path,
			node.isRoot,
			node.rootNode ? (deserializeNode(node.rootNode) as Node) : undefined
		);

		if (node.children && Array.isArray(node.children)) {
			deserializedNode.children = node.children.map(
				(child: any) => deserializeNode(child) as Node
			);
		}

		deserializedNode.collapsibleState = node.collapsibleState;

		return deserializedNode;
	}
}

export function serializeNode(node: Node): any {
	const serializedNode: { [key: string]: any } = {
		objectId: node.objectId,
		label: node.label,
		jsonObject: node.jsonObject,
		path: node.path,
		isRoot: node.isRoot,
		rootNode: undefined,
		collapsibleState: node.collapsibleState,
		children: undefined
	};

	if (node.children) {
		serializedNode["children"] = node.children.map((child) => {
			return serializeNode(child);
		});
	}

	return serializedNode;
}
