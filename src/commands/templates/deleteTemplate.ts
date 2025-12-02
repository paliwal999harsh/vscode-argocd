import { window } from 'vscode';
import { TemplatesProvider } from '../../views/providers';

/**
 * Delete a template
 */
export function deleteTemplate(templatesProvider: TemplatesProvider) {
  return async (item: any) => {
    if (!item?.template) {
      return;
    }

    const template = item.template;
    const confirm = await window.showWarningMessage(
      `Are you sure you want to delete template "${template.name}"?`,
      { modal: true },
      'Delete'
    );

    if (confirm === 'Delete') {
      await templatesProvider.deleteTemplate(template.id);
      window.showInformationMessage(`Template "${template.name}" deleted successfully`);
    }
  };
}
