import * as vscode from 'vscode';
import { ArgocdCliService } from '../cli/argocdCliService';
import { ConfigurationService } from '../configurationService';
import { OutputChannelService } from '../outputChannel';
import { Cluster } from '../../model';

/**
 * Cluster Service
 * Handles all cluster-related operations in ArgoCD
 */
export class ClusterService {
  private outputChannel = OutputChannelService.getInstance();

  constructor(
    private configService: ConfigurationService,
    private cliService: ArgocdCliService
  ) {
    this.outputChannel.debug('ClusterService: Initializing');
  }

  /**
   * Executes an ArgoCD command with proper authentication
   * @param command The command to execute
   * @returns Promise<string> The command output
   */
  private async executeCommand(command: string): Promise<string> {
    this.outputChannel.debug('ClusterService: Executing command');
    const config = this.configService.getConfiguration();
    if (!config) {
      this.outputChannel.error('ClusterService: ArgoCD not configured');
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
   * Gets all clusters from ArgoCD
   * @returns Promise<Cluster[]> Array of clusters
   */
  async getClusters(): Promise<Cluster[]> {
    this.outputChannel.info('ClusterService: Fetching clusters from ArgoCD');
    try {
      const output = await this.executeCommand('cluster list -o json');
      const clusters: Cluster[] = JSON.parse(output);
      const clusterList = Array.isArray(clusters) ? clusters : [clusters];

      this.outputChannel.info(`ClusterService: Retrieved ${clusterList.length} cluster(s)`);

      return clusterList;
    } catch (error) {
      this.outputChannel.error('ClusterService: Failed to get clusters', error as Error);
      vscode.window.showErrorMessage(`Failed to get clusters: ${error}`);
      return [];
    }
  }

  /**
   * Gets applications for a specific cluster
   * @param clusterServer The cluster server URL
   * @returns Promise<Array> Array of application names
   */
  async getClusterApplications(clusterServer: string): Promise<Array<{ name: string; namespace?: string }>> {
    try {
      const output = await this.executeCommand(`app list --cluster ${clusterServer} -o json`);
      if (!output || output.trim() === '') {
        return [];
      }
      const apps = JSON.parse(output);
      const appList = Array.isArray(apps) ? apps : [apps];
      return appList.map((app) => ({
        name: app.metadata?.name || 'Unknown',
        namespace: app.spec?.destination?.namespace
      }));
    } catch (error) {
      // If no apps found, return empty array instead of error
      return [];
    }
  }

  /**
   * Adds a new cluster to ArgoCD
   * @param kubeconfigPath Path to the kubeconfig file
   * @param contextName The context name from kubeconfig to use
   * @param clusterName Optional cluster name (will use context name if not provided)
   * @returns Promise<void>
   */
  async addCluster(kubeconfigPath: string, contextName: string, clusterName?: string): Promise<void> {
    try {
      let command = `cluster add "${contextName}" --kubeconfig "${kubeconfigPath}"`;
      if (clusterName) {
        command += ` --name "${clusterName}"`;
      }
      command += ` -y`;
      await this.cliService.executeCommand(command);
      vscode.window.showInformationMessage('Cluster added successfully');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to add cluster: ${error}`);
      throw error;
    }
  }

  /**
   * Prompts user to add a cluster via file selection dialog
   * @returns Promise<void>
   */
  async promptAndAddCluster(): Promise<void> {
    const kubeconfigUri = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        Kubeconfig: ['yaml', 'yml', 'json', 'config']
      },
      openLabel: 'Select Kubeconfig File'
    });

    if (kubeconfigUri && kubeconfigUri[0]) {
      const contextName = await vscode.window.showInputBox({
        prompt: 'Enter context name from kubeconfig',
        placeHolder: 'e.g., microk8s, docker-desktop, kind-cluster',
        ignoreFocusOut: true,
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Context name is required';
          }
          return null;
        }
      });

      if (!contextName) {
        return;
      }

      const clusterName = await vscode.window.showInputBox({
        prompt: 'Enter cluster name (optional)',
        placeHolder: 'Will use context name if not provided',
        ignoreFocusOut: true
      });

      await this.addCluster(kubeconfigUri[0].fsPath, contextName, clusterName);
    }
  }

  /**
   * Removes a cluster from ArgoCD
   * @param serverAddress The cluster server address to remove
   * @returns Promise<void>
   */
  async removeCluster(serverAddress: string): Promise<void> {
    this.outputChannel.info(`ClusterService: Removing cluster ${serverAddress}`);
    try {
      await this.cliService.executeCommand(`cluster rm "${serverAddress}" -y`);
      vscode.window.showInformationMessage(`Cluster removed successfully: ${serverAddress}`);
    } catch (error) {
      this.outputChannel.error(`ClusterService: Failed to remove cluster ${serverAddress}`, error as Error);
      vscode.window.showErrorMessage(`Failed to remove cluster: ${error}`);
      throw error;
    }
  }
}
