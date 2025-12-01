import { env, window } from 'vscode';
import { TemplatesProvider } from '../../views/providers';

/**
 * Copy template YAML to clipboard
 */
export function copyTemplateYaml(templatesProvider: TemplatesProvider) {
  return async (item: any) => {
    if (!item || !item.template) {
      return;
    }

    const yamlContent = templatesProvider.getTemplateAsYaml(item.template);
    await env.clipboard.writeText(yamlContent);
    window.showInformationMessage('Template YAML copied to clipboard');
  };
}
