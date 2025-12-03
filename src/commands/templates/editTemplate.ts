import path from 'node:path';
import { ExtensionContext, Uri, workspace, window } from 'vscode';
import * as fs from 'node:fs';
import { CommandProviders, CommandServices } from '../../commands';

/**
 * Edit a template
 */
export function editTemplate(context: ExtensionContext, services: CommandServices, providers: CommandProviders) {
  return async (item: any) => {
    const { outputChannel } = services;
    const { templatesProvider } = providers;
    if (!item?.template) {
      return;
    }

    const template = item.template;
    // Create a temporary file that can be saved
    const tempDir = path.join(context.globalStorageUri.fsPath, 'templates');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFile = path.join(tempDir, `${template.id}.yaml`);

    if (!fs.existsSync(tempFile)) {
      const yamlContent = templatesProvider.getTemplateAsYaml(template);
      fs.writeFileSync(tempFile, yamlContent, 'utf-8');
    }

    // Open the file
    const uri = Uri.file(tempFile);
    const doc = await workspace.openTextDocument(uri);
    await window.showTextDocument(doc);

    // Track this document for saving
    const docKey = doc.uri.toString();

    // Save the template when user saves the document
    const saveDisposable = workspace.onDidSaveTextDocument(async (savedDoc) => {
      if (savedDoc.uri.toString() === docKey) {
        try {
          const updatedYaml = savedDoc.getText();
          await templatesProvider.updateTemplate(template.id, {
            template: updatedYaml
          });
          window.showInformationMessage(`Template "${template.name}" updated successfully`);
        } catch (error) {
          window.showErrorMessage(`Failed to update template: ${error}`);
        }
      }
    });

    // Clean up when document is closed
    const closeDisposable = workspace.onDidCloseTextDocument((closedDoc) => {
      if (closedDoc.uri.toString() === docKey) {
        saveDisposable.dispose();
        closeDisposable.dispose();
        // Optionally delete the temp file
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (e) {
          outputChannel.error(`Failed to delete temp file: ${e}`);
        }
      }
    });

    context.subscriptions.push(saveDisposable, closeDisposable);
  };
}
