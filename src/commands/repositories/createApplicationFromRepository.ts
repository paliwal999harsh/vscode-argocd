import { CommandServices, CommandProviders } from "../../commands";
import { RepositoryItem } from "../../views/nodes";

/**
 * Create an application from a repository
 */
export function createApplicationFromRepository(
  services: CommandServices,
  providers: CommandProviders
) {
  return async (item: RepositoryItem) => {
    const { webviewService } = services;
    const { applicationsProvider } = providers;

    if (item && item instanceof RepositoryItem) {
      await webviewService.showCreateApplicationForm(item.repository.repo);
      applicationsProvider.refresh();
    }
  };
}
