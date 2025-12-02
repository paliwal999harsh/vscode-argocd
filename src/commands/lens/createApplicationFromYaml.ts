import { CommandId } from '../../commands';
import { ArgocdCliService, OutputChannelService } from '../../services';
import { YamlHelper, ErrorHelper } from '../../utils';
import * as vscode from 'vscode';
import * as fs from 'node:fs';

const outputChannel = OutputChannelService.getInstance();

/**
 * Creates an ArgoCD application from a YAML file
 * @param argocdCli ArgoCD CLI service
 * @param uri File URI
 * @param resource Optional detected resource info
 */
export async function createApplicationFromYaml(
  argocdCli: ArgocdCliService,
  uri: vscode.Uri,
  resource?: any
): Promise<void> {
  try {
    outputChannel.info(`Creating application from YAML file: ${uri.fsPath}`);

    // Read the file content
    const content = fs.readFileSync(uri.fsPath, 'utf-8');

    // Validate YAML first
    const validation = YamlHelper.validateYaml(content);
    if (!validation.valid) {
      vscode.window.showErrorMessage(`Invalid YAML: ${validation.error}`);
      return;
    }

    // Detect ArgoCD resources if not provided
    const resources = resource ? [resource] : YamlHelper.detectArgoCDResources(content);

    if (resources.length === 0) {
      vscode.window.showWarningMessage('No ArgoCD Application or ApplicationSet resources found in this file.');
      return;
    }

    // If multiple resources, let user choose
    let selectedResource = resources[0];
    if (resources.length > 1) {
      const items = resources.map((r) => ({
        label: r.name || `${r.kind} (unnamed)`,
        description: `${r.kind} - ${r.apiVersion}`,
        resource: r
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Multiple ArgoCD resources found. Select one to create:'
      });

      if (!selected) {
        return; // User cancelled
      }

      selectedResource = selected.resource;
    }

    // Show confirmation
    const resourceName = selectedResource.name || 'unnamed resource';
    const confirmation = await vscode.window.showInformationMessage(
      `Create ${selectedResource.kind} "${resourceName}" in ArgoCD?`,
      { modal: true },
      'Create',
      'Cancel'
    );

    if (confirmation !== 'Create') {
      return;
    }

    // Show progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Creating ${selectedResource.kind}...`,
        cancellable: false
      },
      async (progress) => {
        try {
          // Use argocd app create with --file flag
          const result = await argocdCli.executeCommand(`app create --file "${uri.fsPath}"`);

          outputChannel.info(`Application created successfully: ${result}`);

          vscode.window.showInformationMessage(`✅ ${selectedResource.kind} "${resourceName}" created successfully!`);

          // Refresh Applications view
          vscode.commands.executeCommand(CommandId.RefreshAllApplications);
        } catch (error) {
          const errorMsg = ErrorHelper.handleError(error, 'createApplicationFromYaml');
          outputChannel.error(`Failed to create application: ${errorMsg}`);

          // Show detailed error with option to view output
          const action = await vscode.window.showErrorMessage(
            `Failed to create ${selectedResource.kind}: ${errorMsg}`,
            'View Output',
            'Dismiss'
          );

          if (action === 'View Output') {
            outputChannel.show();
          }
        }
      }
    );
  } catch (error) {
    ErrorHelper.showErrorMessage(error, 'createApplicationFromYaml');
  }
}
