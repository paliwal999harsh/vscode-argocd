import * as vscode from 'vscode';
import { YamlHelper } from '../../utils';

/**
 * CodeLens provider that detects ArgoCD Application and ApplicationSet resources
 * in YAML files and provides inline actions to create them
 */
export class ArgocdYamlCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

  /**
   * Refresh code lenses
   */
  public refresh(): void {
    this._onDidChangeCodeLenses.fire();
  }

  /**
   * Provide code lenses for the given document
   * @param document The text document
   * @param token Cancellation token
   * @returns Array of code lenses
   */
  async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
    const codeLenses: vscode.CodeLens[] = [];

    // Only process YAML/YML files
    if (!YamlHelper.isYamlFile(document.uri)) {
      return codeLenses;
    }

    try {
      const content = document.getText();
      const resources = YamlHelper.detectArgoCDResources(content);

      for (const resource of resources) {
        // Create a range for the code lens (at the beginning of the resource)
        const line = document.lineAt(Math.max(0, resource.lineNumber));
        const range = new vscode.Range(line.range.start, line.range.end);

        // Add code lens to create/apply the application
        const createCommand: vscode.Command = {
          title: `$(cloud-upload) Create ${resource.kind} in ArgoCD`,
          command: 'argocd.createApplication.fromYaml',
          tooltip: `Create ${resource.name || 'this'} ${resource.kind} in your ArgoCD server`,
          arguments: [document.uri, resource]
        };

        codeLenses.push(new vscode.CodeLens(range, createCommand));

        // Add code lens to convert to template
        const templateCommand: vscode.Command = {
          title: '$(file-code) Convert to Template',
          command: 'argocd.convertYamlToTemplate',
          tooltip: `Save ${resource.name || 'this'} ${resource.kind} as a reusable template`,
          arguments: [document.uri]
        };

        codeLenses.push(new vscode.CodeLens(range, templateCommand));

        // Disabled for now - validate YAML feature
        // const validateCommand: vscode.Command = {
        //     title: '$(check) Validate YAML',
        //     command: 'argocd.validateYaml',
        //     tooltip: 'Validate YAML syntax',
        //     arguments: [document.uri]
        // };
        // codeLenses.push(new vscode.CodeLens(range, validateCommand));
      }
    } catch (error) {
      console.error('Error providing code lenses:', error);
    }

    return codeLenses;
  }
}
