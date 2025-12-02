import { AppService } from '../../services';
import { ApplicationItem } from '../../views/nodes';

/**
 * View application details
 */
export function viewApplicationDetails(appService: AppService) {
  return async (item: ApplicationItem) => {
    if (item && item instanceof ApplicationItem) {
      await appService.viewApplicationDetails(item.application.metadata.name);
    }
  };
}
