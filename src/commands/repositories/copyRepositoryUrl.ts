import { RepoService } from '../../services';
import { RepositoryItem } from '../../views/nodes';

/**
 * Copy repository URL to clipboard
 */
export function copyRepositoryUrl(repoService: RepoService) {
  return async (item: RepositoryItem) => {
    if (item && item instanceof RepositoryItem) {
      await repoService.copyRepositoryUrl(item.repository.repo);
    }
  };
}
