import { CommandServices, CommandProviders } from '../../commands';
import { ApplicationItem } from '../../views/nodes';

/**
 * Edit an application
 */
export function editApplication(services: CommandServices, providers: CommandProviders) {
  return async (item: ApplicationItem) => {
    const { appService } = services;
    const { applicationsProvider } = providers;

    if (item && item instanceof ApplicationItem) {
      await appService.editApplication(item.application.metadata.name);
      // Clear manifest cache so it's refreshed on next resource click
      item.manifestsCache = undefined;
      // Refresh to reload manifests after edit
      applicationsProvider.refresh();
    }
  };
}
