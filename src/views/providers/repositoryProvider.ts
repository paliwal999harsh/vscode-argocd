import * as vscode from 'vscode';
import { BaseProvider } from './baseProvider';
import { createRepositoryItem, RepositoryItem } from '../nodes';
import { RepoService, ConfigurationService } from '../../services';
import { ContextKeys } from '../../utils';

/**
 * Tree data provider for ArgoCD repositories.
 * Displays Git, Helm, and OCI repositories configured in ArgoCD.
 * Supports adding and deleting repositories.
 */
export class RepositoryProvider extends BaseProvider<RepositoryItem> {
  constructor(
    private repoService: RepoService,
    private configService: ConfigurationService
  ) {
    super();
  }

  protected getProviderName(): string {
    return 'RepositoryProvider';
  }

  async getChildren(element?: RepositoryItem): Promise<RepositoryItem[]> {
    this.logDebug('Getting children (repositories)');

    if (!element) {
      // Root level - show repositories
      if (!this.configService.isAuthenticated()) {
        this.logWarn('ArgoCD not configured, returning empty list');
        return [];
      }

      await ContextKeys.isLoadingRepositories(true);

      try {
        this.logInfo('Fetching repositories from ArgoCD');
        const repos = await this.repoService.getRepositories();
        await ContextKeys.isLoadingRepositories(false);
        await ContextKeys.hasRepositories(repos.length !== 0);

        this.logInfo(`Retrieved ${repos.length} repository(ies)`);

        // Use factory function to create appropriate item type based on repository type
        const items = repos.map((repo) => createRepositoryItem(repo));
        return this.sortByLabel(items);
      } catch (error) {
        await ContextKeys.isLoadingRepositories(false);
        this.logError('Failed to fetch repositories', error as Error);
        return [];
      }
    }
    return [];
  }
}
