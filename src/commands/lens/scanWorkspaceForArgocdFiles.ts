import { ArgocdCliService, OutputChannelService } from '../../services';
import { YamlHelper, ErrorHelper } from '../../utils';
import { createApplicationFromYaml } from './createApplicationFromYaml';
import * as vscode from 'vscode';
import * as fs from 'node:fs';

const outputChannel = OutputChannelService.getInstance();

/**
 * Scans workspace for ArgoCD YAML files
 * @param argocdCli ArgoCD CLI service
 */
export async function scanWorkspaceForArgoCDFiles(argocdCli: ArgocdCliService): Promise<void> {
  try {
    outputChannel.info('Scanning workspace for ArgoCD YAML files...');

    // Find all YAML files in workspace
    const yamlFiles = await vscode.workspace.findFiles('**/*.{yaml,yml}', '**/node_modules/**', 1000);

    if (yamlFiles.length === 0) {
      vscode.window.showInformationMessage('No YAML files found in workspace.');
      return;
    }

    const argoCDFiles: Array<{
      uri: vscode.Uri;
      resources: Array<any>;
    }> = [];

    // Check each file for ArgoCD resources
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Scanning YAML files...',
        cancellable: false
      },
      async (progress) => {
        for (let i = 0; i < yamlFiles.length; i++) {
          const file = yamlFiles[i];
          progress.report({
            message: `${i + 1}/${yamlFiles.length}: ${file.fsPath}`,
            increment: 100 / yamlFiles.length
          });

          try {
            const content = fs.readFileSync(file.fsPath, 'utf-8');
            const resources = YamlHelper.detectArgoCDResources(content);

            if (resources.length > 0) {
              argoCDFiles.push({ uri: file, resources });
            }
          } catch (error) {
            // Skip files that can't be read
            console.debug(`Failed to read file ${file.fsPath}:`, error);
          }
        }
      }
    );

    if (argoCDFiles.length === 0) {
      vscode.window.showInformationMessage(`Scanned ${yamlFiles.length} YAML files. No ArgoCD resources found.`);
      return;
    }

    // Show results and let user select files to create
    const items = argoCDFiles.flatMap((file) =>
      file.resources.map((resource) => ({
        label: resource.name || `${resource.kind} (unnamed)`,
        description: `${resource.kind}`,
        detail: vscode.workspace.asRelativePath(file.uri),
        uri: file.uri,
        resource
      }))
    );

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: `Found ${items.length} ArgoCD resource(s). Select to create:`,
      canPickMany: false
    });

    if (selected) {
      await createApplicationFromYaml(argocdCli, selected.uri, selected.resource);
    }
  } catch (error) {
    ErrorHelper.showErrorMessage(error, 'scanWorkspaceForArgoCDFiles');
  }
}
