import { globalObjectsPanelTreeView } from "./../extension";
import * as vscode from "vscode";
import { apiObjectLiteral_Command } from "../commands/toolProviderCommand/api-objectLiteral";
import { apiGet_Command } from "../commands/toolProviderCommand/api-get";
import { apiUpdate_Command } from "../commands/toolProviderCommand/api-update";
import { apiDelete_Command } from "../commands/toolProviderCommand/api-delete";
import { apiInsert_Command } from "../commands/toolProviderCommand/api-insert";
import { apiGetFromID_Command } from "../commands/toolProviderCommand/api-getFromID";
import { functionMap_Command } from "../commands/toolProviderCommand/function-map";
import { functionFilter_Command } from "../commands/toolProviderCommand/function-filter";
import { functionFind_Command } from "../commands/toolProviderCommand/function-find";
import { functionIndexOf_Command } from "../commands/toolProviderCommand/function-indexOf";
import { functionReduce_Command } from "../commands/toolProviderCommand/function-reduce";

export class ToolPanelProvider implements vscode.WebviewViewProvider {
	private webviewView?: vscode.WebviewView;

	constructor(private context: vscode.ExtensionContext) {}

	public resolveWebviewView(webviewView: vscode.WebviewView): void {
		this.webviewView = webviewView;

		this.webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this.context.extensionUri, "media"),
				vscode.Uri.joinPath(this.context.extensionUri, "resource"),
				vscode.Uri.joinPath(
					this.context.extensionUri,
					"node_modules",
					"@vscode",
					"webview-ui-toolkit",
					"dist"
				),
			],
		};

		this.webviewView.webview.html = this.getHtmlForWebview(
			this.webviewView.webview
		);

		this.webviewView.webview.onDidReceiveMessage((message) => {
			switch (message.command) {
				case "api.objectLiteral":
					apiObjectLiteral_Command();
					break;

				case "api.get":
					apiGet_Command();
					break;
				case "api.update":
					apiUpdate_Command();
					break;
				case "api.delete":
					apiDelete_Command();
					break;
				case "api.insert":
					apiInsert_Command();
					break;
				case "api.getFromID":
					apiGetFromID_Command();
					break;

				case "function.map":
					functionMap_Command();
					break;
				case "function.filter":
					functionFilter_Command();
					break;
				case "function.find":
					functionFind_Command();
					break;
				case "function.indexOf":
					functionIndexOf_Command();
					break;
				case "function.reduce":
					functionReduce_Command();
					break;
			}
		});
	}

	private getHtmlForWebview(webview: vscode.Webview): string {
		//Setup ui toolkit
		const toolkitUri = webview.asWebviewUri(
			vscode.Uri.joinPath(
				this.context.extensionUri,
				"node_modules",
				"@vscode",
				"webview-ui-toolkit",
				"dist",
				"toolkit.js"
			)
		);
		const mainStyle = webview.asWebviewUri(
			vscode.Uri.joinPath(
				this.context.extensionUri,
				"resource",
				"style",
				"styles.css"
			)
		);

		//page content
		let contentHTML = "";
		contentHTML += `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css">`;
		contentHTML += `<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>`;

		contentHTML += `<link rel="stylesheet" href="${mainStyle}">`;
		contentHTML += `<script type="module" src="${toolkitUri}"></script>`;
		contentHTML += `<div id="toolProvider">`;

		if (globalObjectsPanelTreeView?.selection?.length <= 0) {
			contentHTML += `<div class="center-alert">Please choose some object key</div>`;

			contentHTML += `</div>`;

			return contentHTML;
		}

		let selectionNode = globalObjectsPanelTreeView.selection[0];

		const selectionIcon = webview.asWebviewUri(
			vscode.Uri.joinPath(
				this.context.extensionUri,
				"media",
				"treeview-icon",
				selectionNode.iconPath.path.split("/").reverse()[0]
			)
		);

		//header
		contentHTML += `
			<div class="select-node">
				<div class="image" style="background-image: url(${selectionIcon})"></div>
				<div class="name">${selectionNode.label}</div>
				<div class="type">${selectionNode.description}</div>
			</div>
			<hr class="divider" />
		`;

		contentHTML += `<vscode-panels>`;

		//content
		//panel
		contentHTML += `
			<vscode-panel-tab id="tab-1">
				DETAIL
			</vscode-panel-tab>
		`;

		// ------- Coming Soon Feature -------
		// <vscode-panel-tab id="tab-2">
		// 	API (CRUD)
		// </vscode-panel-tab>

		// <vscode-panel-tab id="tab-3">
		// 	FUNCTION
		// </vscode-panel-tab>

		//detail
		let jsonPreview = "";
		if (selectionNode.isRoot || selectionNode.description === "Object") {
			jsonPreview = JSON.stringify(selectionNode.jsonObject, null, 2);
		} else {
			let copyJson: { [key: string]: any } = {};
			copyJson[selectionNode.label] = selectionNode.jsonObject;
			jsonPreview = JSON.stringify(copyJson).trim();
		}
		contentHTML += `
			<vscode-panel-view id="view-1">
    			<section>
					<pre><code class="language-json">${jsonPreview}</code><pre>
				</section>
			</vscode-panel-view>
		`;

		// ------- Coming Soon Feature -------
		//api (crud)
		// contentHTML += `
		// 	<vscode-panel-view id="view-2">
    	// 		<section>
		// 			<div class="title">Access a list of utility functions for object operations.</div>
		// 			<div class="item">
		// 				<vscode-button id="api.objectLiteral" class="full">Object Literal</vscode-button>
		// 			</div>
		// 			<hr class="divider" />
		// 			<div class="title">Select Functions for Object Literal</div>
		// 			<div class="item">
		// 				<vscode-checkbox id="api.checkbox.get" checked></vscode-checkbox>
		// 				<vscode-button id="api.get">GET</vscode-button>
		// 				<div class="description">Retrieve all objects.</div>
		// 			</div>
		// 			<div class="item">
		// 				<vscode-checkbox id="api.checkbox.update" checked></vscode-checkbox>
		// 				<vscode-button id="api.update">UPDATE</vscode-button>
		// 				<div class="description">Update an existing object.</div>
		// 			</div>
		// 			<div class="item">
		// 				<vscode-checkbox id="api.checkbox.delete" checked></vscode-checkbox>
		// 				<vscode-button id="api.delete">DELETE</vscode-button>
		// 				<div class="description">Delete an object.</div>
		// 			</div>
		// 			<div class="item">
		// 				<vscode-checkbox id="api.checkbox.insert" checked></vscode-checkbox>
		// 				<vscode-button id="api.insert">INSERT</vscode-button>
		// 				<div class="description">Insert a new object.</div>
		// 			</div>
		// 			<div class="item disabled">
		// 				<vscode-checkbox id="api.checkbox.getFromId" disabled></vscode-checkbox>
		// 				<vscode-button id="api.getFromID" disabled>GET FROM ID</vscode-button>
		// 				<div class="description">Retrieve an object by its ID.</div>
		// 			</div>
		// 		</section>
		// 	</vscode-panel-view>
		// `;

		//function
		// contentHTML += `
		// 	<vscode-panel-view id="view-3">
    	// 		<section>
		// 			<div class="title">Useful JavaScript Functions</div>
		// 			<div class="item">
		// 				<vscode-button id="function.map">map()</vscode-button>
		// 				<div class="description">Transform elements in an array.</div>
		// 			</div>
		// 			<div class="item">
		// 				<vscode-button id="function.filter">filter()</vscode-button>
		// 				<div class="description">Filter elements in an array.</div>
		// 			</div>
		// 			<div class="item">
		// 				<vscode-button id="function.find">find()</vscode-button>
		// 				<div class="description">Find an element in an array.</div>
		// 			</div>
		// 			<div class="item">
		// 				<vscode-button id="function.indexOf">indexOf()</vscode-button>
		// 				<div class="description">Get index of an element.</div>
		// 			</div>
		// 			<div class="item">
		// 				<vscode-button id="function.reduce">reduce()</vscode-button>
		// 				<div class="description">Reduce array to a single value.</div>
		// 			</div>
		// 		</section>
		// 	</vscode-panel-view>
		// `;

		//footer
		contentHTML += `</vscode-panels>`;
		contentHTML += `</div>`;
		contentHTML += `
			<script>
				hljs.configure({
					languages: "json"
				});
				hljs.highlightAll();
			</script>
			<script>
				const vscode = acquireVsCodeApi();
				document.querySelectorAll('vscode-button').forEach(button => {
					button.addEventListener('click', () => {
						const getCheckbox = document.getElementById("api.checkbox.get");
						const updateCheckbox = document.getElementById('api.checkbox.update');
						const deleteCheckbox = document.getElementById('api.checkbox.delete');
						const insertCheckbox = document.getElementById('api.checkbox.insert');
						const getFromIdCheckbox = document.getElementById('api.checkbox.getFromId');
						
						vscode.postMessage({
							command: button.id,
							checked: {
								get: getCheckbox ? getCheckbox.checked : null,
								update: updateCheckbox ? updateCheckbox.checked : null,
								delete: deleteCheckbox ? deleteCheckbox.checked : null,
								insert: insertCheckbox ? insertCheckbox.checked : null,
								getFromId: getFromIdCheckbox ? getFromIdCheckbox.checked : null
							}
						});
					});
				});
			</script>
		`;

		return contentHTML;
	}

	public refresh() {
		if (this.webviewView) {
			this.webviewView.webview.html = this.getHtmlForWebview(
				this.webviewView.webview
			);
		}
	}
}
