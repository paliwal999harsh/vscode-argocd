import path from 'path';
import { ExtensionContext, Uri, window, workspace } from 'vscode';
import { CommandServices, CommandProviders } from '../../commands';
import * as fs from 'fs';

/**
 * Add a new template
 */
export function addTemplate(services: CommandServices, providers: CommandProviders) {
  return async () => {
    const { templatesProvider } = providers;
    const context = (global as any).extensionContext as ExtensionContext;

    const templateName = await window.showInputBox({
      prompt: 'Enter template name',
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Template name is required';
        }
        const existing = templatesProvider.getAllTemplates().find((t) => t.name === value.trim());
        if (existing) {
          return 'A template with this name already exists';
        }
        return null;
      }
    });

    if (!templateName) {
      return;
    }

    const description = await window.showInputBox({
      prompt: 'Enter template description (optional)',
      placeHolder: 'Description of this template'
    });

    try {
      // Load basic template from resources
      const templatePath = path.join(context.extensionPath, 'resources', 'templates', 'basic-app.yaml');
      const yamlTemplate = fs.readFileSync(templatePath, 'utf-8');

      const template = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: templateName.trim(),
        type: 'application' as const,
        description: description?.trim(),
        template: yamlTemplate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await templatesProvider.addTemplate(template);
      window.showInformationMessage(`Template "${templateName}" created successfully`);

      const tempDir = path.join(context.globalStorageUri.fsPath, 'templates');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const tempFile = path.join(tempDir, `${template.id}.yaml`);
      const uri = Uri.file(tempFile);
      fs.writeFileSync(tempFile, template.template, 'utf-8');
      const doc = await workspace.openTextDocument(uri);
      await window.showTextDocument(doc);
    } catch (error) {
      window.showErrorMessage(`Failed to create template: ${error}`);
    }
  };
}
