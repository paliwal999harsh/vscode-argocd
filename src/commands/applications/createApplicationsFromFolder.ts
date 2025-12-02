import { Uri, window } from 'vscode';
import { CommandServices } from '../../commands';

/**
 * Create an application from a folder (File Explorer context menu)
 */
export function createApplicationFromFolder(services: CommandServices) {
  return async (uri: Uri) => {
    const { webviewService, outputChannel } = services;

    if (!uri) {
      window.showErrorMessage('No folder selected');
      return;
    }

    const folderPath = uri.fsPath;
    const folderName = folderPath.split(/[/\\]/).pop() || 'app';

    outputChannel.info(`Creating ArgoCD application from folder: ${folderPath}`);

    const appName = await window.showInputBox({
      prompt: 'Enter application name',
      value: folderName,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Application name is required';
        }
        return null;
      }
    });

    if (!appName) {
      return;
    }

    // Open the create application webview with the folder path pre-filled
    await webviewService.showCreateApplicationForm(undefined, folderPath);
  };
}
