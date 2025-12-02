import { window } from 'vscode';
import { TemplatesProvider } from '../../views/providers';

/**
 * Copy a template
 */
export function copyTemplate(templatesProvider: TemplatesProvider) {
  return async (item: any) => {
    if (!item?.template) {
      return;
    }

    const originalTemplate = item.template;
    const newName = await window.showInputBox({
      prompt: 'Enter new template name',
      value: `${originalTemplate.name}-copy`,
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

    if (!newName) {
      return;
    }

    const newTemplate = {
      ...originalTemplate,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newName.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await templatesProvider.addTemplate(newTemplate);
    window.showInformationMessage(`Template "${newName}" created successfully`);
  };
}
