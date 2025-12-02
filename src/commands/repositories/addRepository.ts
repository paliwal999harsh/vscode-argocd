import { CommandServices, CommandProviders } from '../../commands';

/**
 * Add a new repository
 */
export function addRepository(services: CommandServices, providers: CommandProviders) {
  return async () => {
    const { webviewService } = services;
    const { repositoryProvider } = providers;

    await webviewService.showAddRepositoryForm();
    repositoryProvider.refresh();
  };
}
