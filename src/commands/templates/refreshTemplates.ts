import { TemplatesProvider } from '../../views/providers';

/**
 * Refresh the templates tree view
 */
export function refreshTemplates(templatesProvider: TemplatesProvider) {
  return () => {
    templatesProvider.refresh();
  };
}
