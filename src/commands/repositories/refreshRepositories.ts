import { RepositoryProvider } from '../../views/providers';

/**
 * Refresh the repository tree view
 */
export function refreshRepositories(repositoryProvider: RepositoryProvider) {
  return () => {
    repositoryProvider.refresh();
  };
}
