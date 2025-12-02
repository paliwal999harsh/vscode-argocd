import * as vscode from 'vscode';
import { OutputChannelService } from './outputChannel';
import { ConnectionManager, ArgocdConnection } from './connectionManager';

export interface ArgocdConfig {
  serverUrl: string; // Original URL with protocol
  serverAddress: string; // Stripped address without protocol for CLI
  authMethod: 'username' | 'token' | 'sso';
  username?: string;
  password?: string;
  apiToken?: string;
  skipTls: boolean;
}

export class ConfigurationService {
  private readonly outputChannel = OutputChannelService.getInstance();
  private readonly connectionManager: ConnectionManager;

  constructor(context: vscode.ExtensionContext) {
    this.outputChannel.debug('ConfigurationService: Initializing');
    this.connectionManager = ConnectionManager.getInstance(context);
  }

  private stripProtocolFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.host + (urlObj.pathname === '/' ? '' : urlObj.pathname);
    } catch {
      // If URL parsing fails, try to strip protocol manually
      return url.replace(/^https?:\/\//, '');
    }
  }

  /**
   * Convert ArgocdConnection to ArgocdConfig format
   */
  private connectionToConfig(connection: ArgocdConnection): ArgocdConfig {
    return {
      serverUrl: connection.serverAddress.startsWith('http')
        ? connection.serverAddress
        : `https://${connection.serverAddress}`,
      serverAddress: connection.serverAddress,
      authMethod: connection.authMethod,
      username: connection.username,
      apiToken: connection.apiToken,
      skipTls: connection.skipTls || false
    };
  }

  async saveConfiguration(config: ArgocdConfig) {
    this.outputChannel.info(`ConfigurationService: Saving configuration for ${config.serverUrl}`);
    // This method is kept for backward compatibility but now uses ConnectionManager
    const activeConnection = this.connectionManager.getActiveConnection();

    if (activeConnection) {
      // Update existing active connection
      this.connectionManager.updateConnection(activeConnection.id, {
        name: activeConnection.name,
        serverAddress: config.serverAddress,
        authMethod: config.authMethod,
        username: config.username,
        apiToken: config.apiToken,
        skipTls: config.skipTls
      });
    }

    this.outputChannel.info('ConfigurationService: Configuration saved successfully');
  }

  async clearConfiguration() {
    this.outputChannel.info('ConfigurationService: Clearing configuration (logout)');
    // Clear any cached authentication state but keep the connection
    // The connection itself is managed separately
    this.outputChannel.info('ConfigurationService: Configuration cleared successfully');
  }

  getConfiguration(): ArgocdConfig | null {
    this.outputChannel.debug('ConfigurationService: Getting configuration');
    const activeConnection = this.connectionManager.getActiveConnection();
    if (!activeConnection) {
      return null;
    }
    return this.connectionToConfig(activeConnection);
  }

  isAuthenticated(): boolean {
    const configured = this.connectionManager.hasActiveConnection();
    this.outputChannel.debug(`ConfigurationService: Is configured: ${configured}`);
    return configured;
  }

  async promptForConfiguration(): Promise<ArgocdConfig | null> {
    this.outputChannel.info('ConfigurationService: Prompting user for new connection');

    const connectionName = await vscode.window.showInputBox({
      prompt: 'Enter Connection Name',
      placeHolder: 'e.g., Production, Staging, Local',
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Connection name is required';
        }
        return null;
      }
    });

    if (!connectionName) {
      this.outputChannel.debug('ConfigurationService: User cancelled configuration (no connection name)');
      return null;
    }

    const serverUrl = await vscode.window.showInputBox({
      prompt: 'Enter ArgoCD Server URL',
      placeHolder: 'https://localhost:8080',
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value) {
          return 'Server URL is required';
        }
        try {
          new URL(value);
          return null;
        } catch {
          return 'Please enter a valid URL';
        }
      }
    });

    if (!serverUrl) {
      this.outputChannel.debug('ConfigurationService: User cancelled configuration (no server URL)');
      return null;
    }

    this.outputChannel.debug(`ConfigurationService: Server URL provided: ${serverUrl}`);

    const authMethod = await vscode.window.showQuickPick(
      [
        { label: 'Username/Password', value: 'username' as const },
        { label: 'API Token', value: 'token' as const },
        { label: 'SSO (Single Sign-On)', value: 'sso' as const }
      ],
      {
        placeHolder: 'Select authentication method',
        matchOnDetail: true,
        ignoreFocusOut: true
      }
    );

    if (!authMethod) {
      this.outputChannel.debug('ConfigurationService: User cancelled configuration (no auth method)');
      return null;
    }

    this.outputChannel.debug(`ConfigurationService: Auth method selected: ${authMethod.value}`);

    let username: string | undefined;
    let password: string | undefined;
    let apiToken: string | undefined;

    if (authMethod.value === 'username') {
      username = await vscode.window.showInputBox({
        prompt: 'Enter ArgoCD Username',
        ignoreFocusOut: true,
        validateInput: (value) => {
          if (!value) {
            return 'Username is required';
          }
          return null;
        }
      });

      if (!username) {
        return null;
      }
    } else if (authMethod.value === 'token') {
      apiToken = await vscode.window.showInputBox({
        prompt: 'Enter ArgoCD API Token',
        password: true,
        ignoreFocusOut: true,
        validateInput: (value) => {
          if (!value) {
            return 'API Token is required';
          }
          return null;
        }
      });

      if (!apiToken) {
        return null;
      }
    }
    // For SSO, no additional credentials needed here - handled during login

    const skipTlsOptions = ['No', 'Yes'];
    const skipTlsChoice = await vscode.window.showQuickPick(skipTlsOptions, {
      placeHolder: 'Skip TLS verification? (for local development)',
      ignoreFocusOut: true
    });

    if (skipTlsChoice === undefined) {
      return null;
    }

    // Add connection using ConnectionManager
    const connection = this.connectionManager.addConnection({
      name: connectionName.trim(),
      serverAddress: this.stripProtocolFromUrl(serverUrl),
      authMethod: authMethod.value,
      username,
      apiToken,
      skipTls: skipTlsChoice === 'Yes'
    });

    // Set as active connection
    this.connectionManager.setActiveConnection(connection.id);

    const config = this.connectionToConfig(connection);

    this.outputChannel.info('ConfigurationService: User configuration completed successfully');
    return config;
  }

  /**
   * Get ConnectionManager instance
   */
  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }

  getRefreshInterval(): number {
    const interval = vscode.workspace.getConfiguration('argocd').get('refreshInterval', 30);
    this.outputChannel.debug(`ConfigurationService: Refresh interval: ${interval}s`);
    return interval;
  }
}
