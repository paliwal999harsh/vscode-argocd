import { CommandServices } from '../../commands';
import { ApplicationItem } from '../../views/nodes';

/**
 * View application history
 */
export function viewApplicationHistory(services: CommandServices) {
  return async (item: ApplicationItem) => {
    if (item && item instanceof ApplicationItem) {
      await services.webviewService.showApplicationHistory(item.application.metadata.name);
    }
  };
}
