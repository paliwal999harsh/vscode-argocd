import path from 'node:path';
import { ExtensionContext, window, commands } from 'vscode';
import { CommandServices, CommandProviders, CommandId } from '../../commands';
import * as fs from 'node:fs';

/**
 * Add a new template
 */
export function addTemplate(services: CommandServices, providers: CommandProviders) {
  return async () => {
    const { outputChannel } = services;
    const { templatesProvider } = providers;
    const context = (globalThis as any).extensionContext as ExtensionContext;

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
      commands.executeCommand(CommandId.EditTemplate, { template });
    } catch (error) {
      window.showErrorMessage('Failed to create template');
      outputChannel.error('Failed to create template', error as Error);
    }
  };
}
