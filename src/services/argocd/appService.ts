import * as vscode from 'vscode';
import { ArgocdCliService } from '../cli/argocdCliService';
import { ConfigurationService } from '../configurationService';
import { OutputChannelService } from '../outputChannel';
import { Application, Cluster, Repository } from '../../model';
import { ClusterService } from './clusterService';
import { RepoService } from './repoService';

/**
 * Application Service
 * Handles all application-related operations in ArgoCD
 */
export class AppService {
  private readonly outputChannel = OutputChannelService.getInstance();

  constructor(
    private readonly configService: ConfigurationService,
    private readonly cliService: ArgocdCliService,
    private readonly clusterService: ClusterService,
    private readonly repoService: RepoService
  ) {
    this.outputChannel.debug('AppService: Initialized');
  }

  /**
   * Executes an ArgoCD command with proper authentication
   * @param command The command to execute
   * @returns Promise<string> The command output
   */
  private async executeCommand(command: string): Promise<string> {
    this.outputChannel.debug(`AppService: Executing command`);
    const config = this.configService.getConfiguration();
    if (!config) {
      this.outputChannel.error('AppService: ArgoCD not configured');
      throw new Error('ArgoCD not configured');
    }

    if (config.authMethod === 'token' && config.apiToken) {
      return await this.cliService.executeWithAuth(command, config.serverAddress, config.apiToken, config.skipTls);
    } else {
      return await this.cliService.executeCommand(command);
    }
  }

  /**
   * Gets all applications from ArgoCD
   * @returns Promise<Application[]> Array of applications
   */
  async getApplications(): Promise<Application[]> {
    this.outputChannel.info('AppService: Fetching applications');
    try {
      const output = await this.executeCommand('app list -o json');
      const apps = JSON.parse(output);
      const appsList = Array.isArray(apps) ? apps : [apps];
      this.outputChannel.info(`AppService: Retrieved ${appsList.length} application(s)`);
      return appsList;
    } catch (error) {
      this.outputChannel.error('AppService: Failed to get applications', error as Error);
      vscode.window.showErrorMessage(`Failed to get applications: ${error}`);
      return [];
    }
  }

  /**
   * Gets all application sets from ArgoCD
   * @returns Promise<any[]> Array of application sets
   */
  async getApplicationSets(): Promise<any[]> {
    this.outputChannel.info('AppService: Fetching application sets');
    try {
      const output = await this.executeCommand('appset list -o json');
      const appsets = JSON.parse(output);
      const appsetsList = Array.isArray(appsets) ? appsets : [appsets];
      this.outputChannel.info(`AppService: Retrieved ${appsetsList.length} application set(s)`);
      return appsetsList;
    } catch (error) {
      // ApplicationSets might not be supported in older ArgoCD versions
      this.outputChannel.warn(
        'AppService: Failed to get ApplicationSets - may not be supported in this ArgoCD version'
      );
      return [];
    }
  }

  /**
   * Gets application YAML manifest
   * @param appName The application name
   * @returns Promise<string | null> The application YAML or null if failed
   */
  async getApplicationYaml(appName: string): Promise<string | null> {
    try {
      const yaml = await this.cliService.executeCommand(`app get "${appName}" -o yaml`);
      return yaml;
    } catch (error) {
      console.error(`Failed to get application YAML: ${error}`);
      return null;
    }
  }

  /**
   * Gets application resources
   * @param appName The application name
   * @returns Promise<any[]> Array of resources
   */
  async getApplicationResources(appName: string): Promise<any[]> {
    try {
      const output = await this.executeCommand(`app get "${appName}" -o json`);
      const appData = JSON.parse(output);

      // Extract resources from status.resources array
      if (appData.status && Array.isArray(appData.status.resources)) {
        return appData.status.resources;
      }

      return [];
    } catch (error) {
      console.warn(`Failed to get application resources: ${error}`);
      return [];
    }
  }

  /**
   * Gets available projects from ArgoCD
   * @returns Promise<string[]> Array of project names
   */
  async getProjects(): Promise<string[]> {
    try {
      const output = await this.executeCommand('proj list -o json');
      const projects = JSON.parse(output);
      const projectList = Array.isArray(projects) ? projects : [projects];
      return projectList.map((project: any) => project.metadata?.name || project.name || 'default');
    } catch (error) {
      console.warn('Failed to get projects:', error);
      // Return default project if command fails
      return ['default'];
    }
  }

  /**
   * Syncs an application
   * @param appName The application name
   * @returns Promise<void>
   */
  async syncApplication(appName: string): Promise<void> {
    this.outputChannel.info(`AppService: Syncing application '${appName}'`);
    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Syncing application '${appName}'...`,
          cancellable: false
        },
        async () => {
          await this.executeCommand(`app sync "${appName}"`);
        }
      );
      this.outputChannel.info(`AppService: Application '${appName}' synced successfully`);
      vscode.window.showInformationMessage(`Application '${appName}' synced successfully`);
    } catch (error) {
      this.outputChannel.error(`AppService: Failed to sync application '${appName}'`, error as Error);
      vscode.window.showErrorMessage(`Failed to sync application: ${error}`);
      throw error;
    }
  }

  /**
   * Refreshes an application
   * @param appName The application name
   * @returns Promise<void>
   */
  async refreshApplication(appName: string): Promise<void> {
    this.outputChannel.info(`AppService: Refreshing application '${appName}'`);
    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Refreshing application '${appName}'...`,
          cancellable: false
        },
        async () => {
          // ArgoCD doesn't have a dedicated 'app refresh' command
          // Use 'app get --refresh' to force reconciliation from Git
          await this.executeCommand(`app get "${appName}" --refresh`);
        }
      );
      this.outputChannel.info(`AppService: Application '${appName}' refreshed successfully`);
      vscode.window.showInformationMessage(`Application '${appName}' refreshed successfully`);
    } catch (error) {
      this.outputChannel.error(`AppService: Failed to refresh application '${appName}'`, error as Error);
      vscode.window.showErrorMessage(`Failed to refresh application: ${error}`);
      throw error;
    }
  }

  /**
   * Views application details in YAML format
   * @param appName The application name
   * @returns Promise<void>
   */
  async viewApplicationDetails(appName: string): Promise<void> {
    try {
      const output = await this.executeCommand(`app get "${appName}" -o yaml`);
      const doc = await vscode.workspace.openTextDocument({
        content: output,
        language: 'yaml'
      });
      await vscode.window.showTextDocument(doc);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to get application details: ${error}`);
      throw error;
    }
  }

  /**
   * Views application deployment history
   * @param appName The application name
   * @returns Promise<void>
   */
  async viewApplicationHistory(appName: string): Promise<void> {
    try {
      // argocd app history doesn't support -o json/yaml, it returns formatted text
      const output = await this.executeCommand(`app history "${appName}"`);

      const doc = await vscode.workspace.openTextDocument({
        content: output,
        language: 'plaintext'
      });
      await vscode.window.showTextDocument(doc);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to get application history: ${error}`);
      throw error;
    }
  }

  /**
   * Gets application deployment history as structured data
   * @param appName The application name
   * @returns Promise<Array> Array of history entries
   */
  async getApplicationHistory(
    appName: string
  ): Promise<Array<{ id: string; revision: string; date: string; source: string }>> {
    this.outputChannel.info(`AppService: Getting history for application '${appName}'`);
    try {
      // argocd app history returns formatted text, we need to parse it
      const output = await this.executeCommand(`app history "${appName}"`);

      // Parse the output table
      const lines = output.trim().split('\n');
      const history: Array<{ id: string; revision: string; date: string; source: string }> = [];

      // First line contains SOURCE
      const source = lines[0] ? lines[0].replace('SOURCE', '').trim() : '';

      // Skip first 2 lines (SOURCE and headers: ID DATE REVISION)
      // Data starts from line 2 (index 2)
      for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
          continue;
        }

        // Parse the table columns: ID  DATE (with timezone)  REVISION
        // Example: "0       2025-10-15 17:41:28 +0530 IST  1.16.31-18872-dev (1.16.31)"
        const match = line.match(/^(\d+)\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+[+-]\d{4}\s+\w+)\s+(.+)$/);
        if (match) {
          history.push({
            id: match[1],
            date: match[2],
            revision: match[3],
            source: source
          });
        }
      }

      this.outputChannel.debug(`AppService: Parsed ${history.length} history entries for '${appName}'`);
      return history;
    } catch (error) {
      this.outputChannel.error(`AppService: Failed to get history for application '${appName}'`, error as Error);
      throw error;
    }
  }

  /**
   * Gets application manifests at a specific revision
   * @param appName The application name
   * @param historyId The history ID from app history command
   * @returns Promise<string> The manifest YAML
   */
  async getApplicationManifestAtRevision(appName: string, historyId: string): Promise<string> {
    this.outputChannel.info(`AppService: Getting manifest for application '${appName}' at history ID ${historyId}`);
    try {
      const output = await this.executeCommand(`app manifests "${appName}" --revision "${historyId}"`);
      this.outputChannel.debug(
        `AppService: Retrieved manifest for application '${appName}' at history ID ${historyId}`
      );
      return output;
    } catch (error) {
      this.outputChannel.error(`AppService: Failed to get manifest at history ID ${historyId}`, error as Error);
      throw error;
    }
  }

  /**
   * Rolls back an application to a specific revision
   * @param appName The application name
   * @param historyId The history ID to rollback to
   * @returns Promise<void>
   */
  async rollbackApplication(appName: string, historyId: string): Promise<void> {
    this.outputChannel.info(`AppService: Rolling back application '${appName}' to history ID ${historyId}`);
    try {
      await this.executeCommand(`app rollback "${appName}" ${historyId}`);
      this.outputChannel.info(
        `AppService: Successfully rolled back application '${appName}' to history ID ${historyId}`
      );
    } catch (error) {
      this.outputChannel.error(`AppService: Failed to rollback application '${appName}'`, error as Error);
      throw error;
    }
  }

  /**
   * Gets the manifests for an application and returns parsed YAML documents
   * @param appName The application name
   * @returns Promise<string> The application manifests as YAML string
   */
  async getApplicationManifests(appName: string): Promise<string> {
    this.outputChannel.info(`AppService: Getting manifests for application '${appName}'`);
    try {
      const output = await this.executeCommand(`app manifests "${appName}"`);
      this.outputChannel.debug(`AppService: Retrieved manifests for application '${appName}'`);
      return output;
    } catch (error) {
      this.outputChannel.error(`AppService: Failed to get manifests for application '${appName}'`, error as Error);
      throw error;
    }
  }

  /**
   * Opens application manifest for viewing
   * Provides option to open in ArgoCD UI for editing
   * @param appName The application name
   * @returns Promise<void>
   */
  async editApplication(appName: string): Promise<void> {
    try {
      // Get the application manifest
      const output = await this.executeCommand(`app get "${appName}" -o yaml`);

      // Create an editable document
      const doc = await vscode.workspace.openTextDocument({
        content: output,
        language: 'yaml'
      });

      await vscode.window.showTextDocument(doc);

      // Track this document for potential saving
      const docKey = doc.uri.toString();

      // Prompt user to save as a file or apply changes
      const action = await vscode.window.showInformationMessage(
        `Application manifest opened. Make your changes and choose an action:`,
        'Apply Changes',
        'Save to File',
        'Open in ArgoCD UI'
      );

      if (action === 'Apply Changes') {
        // Get the current document content
        const currentDoc = vscode.window.activeTextEditor?.document;
        if (currentDoc && currentDoc.uri.toString() === docKey) {
          const updatedYaml = currentDoc.getText();

          // Save to a temporary file
          const fs = await import('node:fs');
          const path = await import('node:path');
          const os = await import('node:os');
          const tempFile = path.join(os.tmpdir(), `${appName}-${Date.now()}.yaml`);

          fs.writeFileSync(tempFile, updatedYaml, 'utf-8');

          try {
            // Apply the changes using ArgoCD CLI
            await this.executeCommand(`app set "${appName}" --values "${tempFile}"`);
            vscode.window.showInformationMessage(`Application '${appName}' updated successfully`);

            // Clean up temp file
            fs.unlinkSync(tempFile);
          } catch (error) {
            // If set command fails, try using patch or manual apply
            vscode.window.showWarningMessage(
              `Direct update failed. You can manually apply changes using 'kubectl apply' or the ArgoCD UI.`
            );
            fs.unlinkSync(tempFile);
            throw error;
          }
        }
      } else if (action === 'Save to File') {
        // Prompt user to save the document
        await vscode.window
          .showSaveDialog({
            defaultUri: vscode.Uri.file(`${appName}.yaml`),
            filters: { YAML: ['yaml', 'yml'] }
          })
          .then(async (uri) => {
            if (uri) {
              const currentDoc = vscode.window.activeTextEditor?.document;
              if (currentDoc && currentDoc.uri.toString() === docKey) {
                const fs = await import('node:fs');
                fs.writeFileSync(uri.fsPath, currentDoc.getText(), 'utf-8');
                vscode.window.showInformationMessage(`Saved to ${uri.fsPath}`);
              }
            }
          });
      } else if (action === 'Open in ArgoCD UI') {
        const config = this.configService.getConfiguration();
        if (config) {
          const url = `${config.serverUrl}/applications/${appName}`;
          vscode.env.openExternal(vscode.Uri.parse(url));
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to edit application: ${error}`);
      throw error;
    }
  }

  /**
   * Deletes an application
   * @param appName The application name
   * @returns Promise<void>
   */
  async deleteApplication(appName: string): Promise<void> {
    this.outputChannel.info(`AppService: User requested deletion of application '${appName}'`);
    const confirm = await vscode.window.showWarningMessage(
      `Are you sure you want to delete application '${appName}'?`,
      { modal: true },
      'Yes',
      'No'
    );

    if (confirm === 'Yes') {
      try {
        this.outputChannel.warn(`AppService: Deleting application '${appName}'`);
        await this.executeCommand(`app delete "${appName}" --yes`);
        this.outputChannel.info(`AppService: Application '${appName}' deleted successfully`);
        vscode.window.showInformationMessage(`Application '${appName}' deleted successfully`);
      } catch (error) {
        this.outputChannel.error(`AppService: Failed to delete application '${appName}'`, error as Error);
        vscode.window.showErrorMessage(`Failed to delete application: ${error}`);
        throw error;
      }
    } else {
      this.outputChannel.debug(`AppService: Application deletion cancelled by user`);
    }
  }

  /**
   * Creates an application from a YAML file
   * @param filePath Path to the YAML file
   * @returns Promise<boolean> True if successful
   */
  async createApplicationFromFile(filePath: string): Promise<boolean> {
    try {
      await this.cliService.executeCommand(`app create -f "${filePath}"`);
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to create application: ${error}`);
      return false;
    }
  }

  /**
   * Prompts user to create a new application
   * Interactive workflow for application creation
   * @returns Promise<void>
   */
  async promptAndAddApplication(): Promise<void> {
    const appName = await this.promptForApplicationName();
    if (!appName) {
      return;
    }

    // Get available repositories and clusters
    const [repos, clusters] = await Promise.all([
      this.repoService.getRepositories(),
      this.clusterService.getClusters()
    ]);

    if (repos.length === 0) {
      vscode.window.showWarningMessage('No repositories found. Please add a repository first.');
      return;
    }

    if (clusters.length === 0) {
      vscode.window.showWarningMessage('No clusters found. Please add a cluster first.');
      return;
    }

    const repoUrl = await vscode.window.showQuickPick(
      repos.map((repo) => repo.repo),
      {
        placeHolder: 'Select source repository',
        ignoreFocusOut: true
      }
    );

    if (!repoUrl) {
      return;
    }

    await this.createApplicationWithDetails(appName, repoUrl, clusters, repos);
  }

  /**
   * Creates an application from a repository
   * @param repoUrl The repository URL
   * @returns Promise<void>
   */
  async createApplicationFromRepository(repoUrl: string): Promise<void> {
    const appName = await this.promptForApplicationName();
    if (!appName) {
      return;
    }

    const clusters = await this.clusterService.getClusters();
    if (clusters.length === 0) {
      vscode.window.showWarningMessage('No clusters found. Please add a cluster first.');
      return;
    }

    const repos = await this.repoService.getRepositories();
    await this.createApplicationWithDetails(appName, repoUrl, clusters, repos);
  }

  /**
   * Prompts for a valid application name
   * @returns Promise<string | undefined> The application name or undefined if cancelled
   */
  private async promptForApplicationName(): Promise<string | undefined> {
    return await vscode.window.showInputBox({
      prompt: 'Enter application name',
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value) {
          return 'Application name is required';
        }
        if (!/^[a-z0-9-]+$/.test(value)) {
          return 'Name must contain only lowercase letters, numbers, and hyphens';
        }
        return null;
      }
    });
  }

  /**
   * Creates application with user-provided details
   * Handles different repository types (git, helm, oci)
   * @param appName The application name
   * @param repoUrl The repository URL
   * @param clusters Available clusters
   * @param repos Available repositories
   * @returns Promise<void>
   */
  private async createApplicationWithDetails(
    appName: string,
    repoUrl: string,
    clusters: Cluster[],
    repos: Repository[]
  ): Promise<void> {
    const cluster = await vscode.window.showQuickPick(
      clusters.map((cluster) => ({ label: cluster.name, detail: cluster.server })),
      {
        placeHolder: 'Select destination cluster',
        ignoreFocusOut: true
      }
    );

    if (!cluster) {
      return;
    }

    // Determine repository type
    const repo = repos.find((r) => r.repo === repoUrl);
    const repoType = repo?.type || 'git'; // Default to git if not found

    let command = `app create "${appName}" --repo "${repoUrl}"`;

    // Build command based on repository type
    if (repoType === 'helm') {
      const builtCommand = await this.buildHelmCommand(command);
      if (!builtCommand) {
        return; // User cancelled
      }
      command = builtCommand;
    } else if (repoType === 'oci') {
      const builtCommand = await this.buildOciCommand(command);
      if (!builtCommand) {
        return; // User cancelled
      }
      command = builtCommand;
    } else {
      const builtCommand = await this.buildGitCommand(command);
      if (!builtCommand) {
        return; // User cancelled
      }
      command = builtCommand;
    }

    // Get namespace and project
    const namespace = await vscode.window.showInputBox({
      prompt: 'Enter target namespace',
      value: 'default',
      ignoreFocusOut: true
    });

    if (!namespace) {
      return;
    }

    const projects = await this.getProjects();
    const project = await vscode.window.showQuickPick(projects, {
      placeHolder: 'Select project',
      ignoreFocusOut: true
    });

    if (!project) {
      return;
    }

    // Complete the command
    command += ` --dest-server "${cluster.detail}" --dest-namespace "${namespace}" --project "${project}"`;
    command += ` --sync-option CreateNamespace=true`;

    try {
      await this.cliService.executeCommand(command);
      vscode.window.showInformationMessage(`Application '${appName}' created successfully`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to create application: ${error}`);
      throw error;
    }
  }

  /**
   * Builds command for Helm repository
   * @param baseCommand The base command
   * @returns Promise<string | null> The complete command or null if cancelled
   */
  private async buildHelmCommand(baseCommand: string): Promise<string | null> {
    const helmChart = await vscode.window.showInputBox({
      prompt: 'Enter Helm chart name',
      ignoreFocusOut: true,
      validateInput: (value) => (value ? null : 'Chart name is required for Helm repositories')
    });

    if (!helmChart) {
      return null;
    }

    let command = `${baseCommand} --helm-chart "${helmChart}"`;

    const chartVersion = await vscode.window.showInputBox({
      prompt: 'Enter chart version (optional)',
      placeHolder: 'Latest version will be used if not specified',
      ignoreFocusOut: true
    });

    if (chartVersion) {
      command += ` --revision "${chartVersion}"`;
    }

    // Ask for Helm values
    const useCustomValues = await vscode.window.showQuickPick(['No', 'Yes'], {
      placeHolder: 'Do you want to set custom Helm values?',
      ignoreFocusOut: true
    });

    if (useCustomValues === 'Yes') {
      command = await this.addHelmValues(command);
    }

    return command;
  }

  /**
   * Builds command for OCI repository
   * @param baseCommand The base command
   * @returns Promise<string | null> The complete command or null if cancelled
   */
  private async buildOciCommand(baseCommand: string): Promise<string | null> {
    const chartName = await vscode.window.showInputBox({
      prompt: 'Enter OCI chart name',
      ignoreFocusOut: true,
      validateInput: (value) => (value ? null : 'Chart name is required for OCI repositories')
    });

    if (!chartName) {
      return null;
    }

    return `${baseCommand} --helm-chart "${chartName}"`;
  }

  /**
   * Builds command for Git repository
   * @param baseCommand The base command
   * @returns Promise<string | null> The complete command or null if cancelled
   */
  private async buildGitCommand(baseCommand: string): Promise<string | null> {
    const path = await vscode.window.showInputBox({
      prompt: 'Enter path in repository',
      value: '.',
      ignoreFocusOut: true,
      validateInput: (value) => (value ? null : 'Path is required')
    });

    if (!path) {
      return null;
    }

    let command = `${baseCommand} --path "${path}"`;

    // Ask for source type
    const sourceType = await vscode.window.showQuickPick(['Directory', 'Helm', 'Kustomize', 'Jsonnet'], {
      placeHolder: 'Select source type',
      ignoreFocusOut: true
    });

    if (sourceType === 'Helm') {
      const useCustomValues = await vscode.window.showQuickPick(['No', 'Yes'], {
        placeHolder: 'Do you want to set custom Helm values?',
        ignoreFocusOut: true
      });

      if (useCustomValues === 'Yes') {
        command = await this.addHelmValues(command);
      }
    } else if (sourceType === 'Kustomize') {
      const kustomizeImage = await vscode.window.showInputBox({
        prompt: 'Enter Kustomize image override (optional)',
        placeHolder: 'image=newimage:tag',
        ignoreFocusOut: true
      });

      if (kustomizeImage) {
        command += ` --kustomize-image "${kustomizeImage}"`;
      }
    } else if (sourceType === 'Directory') {
      const recurseDirectory = await vscode.window.showQuickPick(['No', 'Yes'], {
        placeHolder: 'Recurse directory?',
        ignoreFocusOut: true
      });

      if (recurseDirectory === 'Yes') {
        command += ' --directory-recurse';
      }
    }

    return command;
  }

  /**
   * Adds Helm values to command
   * @param command The current command
   * @returns Promise<string> The command with Helm values
   */
  private async addHelmValues(command: string): Promise<string> {
    const helmValues = await vscode.window.showInputBox({
      prompt: 'Enter Helm values (comma-separated, e.g. key1=value1,key2=value2)',
      placeHolder: 'replicaCount=2,image.tag=latest',
      ignoreFocusOut: true
    });

    if (helmValues) {
      const values = helmValues
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v);
      values.forEach((value) => {
        command += ` --helm-set "${value}"`;
      });
    }

    return command;
  }

  /**
   * Placeholder for ApplicationSet creation
   * @returns Promise<void>
   */
  async addApplicationSet(): Promise<void> {
    vscode.window.showInformationMessage(
      'ApplicationSet creation will be implemented in a future version. Please use ArgoCD CLI or UI for now.'
    );
  }
}
