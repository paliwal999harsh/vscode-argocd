import { CommandServices, CommandProviders } from '../../commands';
import { RepositoryItem } from '../../views/nodes';

/**
 * Delete a repository
 */
export function deleteRepository(services: CommandServices, providers: CommandProviders) {
  return async (item: RepositoryItem) => {
    const { repoService } = services;
    const { repositoryProvider } = providers;

    if (item && item instanceof RepositoryItem) {
      await repoService.deleteRepository(item.repository.repo);
      repositoryProvider.refresh();
    }
  };
}
