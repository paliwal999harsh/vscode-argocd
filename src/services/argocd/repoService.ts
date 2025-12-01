import * as vscode from 'vscode';
import { ArgocdCliService } from '../cli/argocdCliService';
import { ConfigurationService } from '../configurationService';
import { OutputChannelService } from '../outputChannel';
import { Repository } from '../../model';

/**
 * Repository Service
 * Handles all repository-related operations in ArgoCD
 */
export class RepoService {
  private outputChannel = OutputChannelService.getInstance();

  constructor(
    private configService: ConfigurationService,
    private cliService: ArgocdCliService
  ) {
    this.outputChannel.debug('RepoService: Initialized');
  }

  /**
   * Executes an ArgoCD command with proper authentication
   * @param command The command to execute
   * @returns Promise<string> The command output
   */
  private async executeCommand(command: string): Promise<string> {
    this.outputChannel.debug('RepoService: Executing command');
    const config = this.configService.getConfiguration();
    if (!config) {
      this.outputChannel.error('RepoService: ArgoCD not configured');
      throw new Error('ArgoCD not configured');
    }

    if (config.authMethod === 'token' && config.apiToken) {
      return await this.cliService.executeWithAuth(command, config.serverAddress, config.apiToken, config.skipTls);
    } else {
      // For username/password and SSO, we use the regular command (assumes already logged in)
      return await this.cliService.executeCommand(command);
    }
  }

  /**
   * Gets all repositories from ArgoCD
   * @returns Promise<Repository[]> Array of repositories
   */
  async getRepositories(): Promise<Repository[]> {
    this.outputChannel.info('RepoService: Fetching repositories');
    try {
      const output = await this.executeCommand('repo list -o json');
      const repos = JSON.parse(output);
      const reposList = Array.isArray(repos) ? repos : [repos];
      this.outputChannel.info(`RepoService: Retrieved ${reposList.length} repository(ies)`);
      return reposList;
    } catch (error) {
      this.outputChannel.error('RepoService: Failed to get repositories', error as Error);
      vscode.window.showErrorMessage(`Failed to get repositories: ${error}`);
      return [];
    }
  }

  /**
   * Deletes a repository from ArgoCD
   * @param repoUrl The repository URL to delete
   * @returns Promise<void>
   */
  async deleteRepository(repoUrl: string): Promise<void> {
    this.outputChannel.info(`RepoService: User requested deletion of repository '${repoUrl}'`);
    const confirm = await vscode.window.showWarningMessage(
      `Are you sure you want to delete repository '${repoUrl}'?`,
      { modal: true },
      'Yes',
      'No'
    );

    if (confirm === 'Yes') {
      try {
        this.outputChannel.warn(`RepoService: Deleting repository '${repoUrl}'`);
        await this.executeCommand(`repo rm "${repoUrl}"`);
        this.outputChannel.info(`RepoService: Repository '${repoUrl}' deleted successfully`);
        vscode.window.showInformationMessage(`Repository '${repoUrl}' deleted successfully`);
      } catch (error) {
        this.outputChannel.error(`RepoService: Failed to delete repository '${repoUrl}'`, error as Error);
        vscode.window.showErrorMessage(`Failed to delete repository: ${error}`);
        throw error;
      }
    } else {
      this.outputChannel.debug('RepoService: Repository deletion cancelled by user');
    }
  }

  /**
   * Copies repository URL to clipboard
   * @param repoUrl The repository URL to copy
   * @returns Promise<void>
   */
  async copyRepositoryUrl(repoUrl: string): Promise<void> {
    this.outputChannel.debug(`RepoService: Copying repository URL to clipboard: ${repoUrl}`);
    try {
      await vscode.env.clipboard.writeText(repoUrl);
      this.outputChannel.info(`RepoService: Repository URL copied to clipboard`);
      vscode.window.showInformationMessage(`Repository URL copied to clipboard: ${repoUrl}`);
    } catch (error) {
      this.outputChannel.error('RepoService: Failed to copy URL to clipboard', error as Error);
      vscode.window.showErrorMessage(`Failed to copy URL to clipboard: ${error}`);
      throw error;
    }
  }
}
