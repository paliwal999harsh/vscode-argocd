import * as vscode from 'vscode';
import { ConfigurationService, ArgocdConfig } from '../configurationService';
import { ArgocdConnection } from '../connectionManager';
import { ArgocdCliService, UserInfo } from '../cli/argocdCliService';
import { OutputChannelService } from '../outputChannel';
import { ContextKeys } from '../../utils/contextKeys';

/**
 * ArgoCD Authentication Provider
 * Integrates ArgoCD authentication with VS Code's built-in authentication system
 * Appears in the Accounts section of VS Code
 */
export class ArgocdAuthenticationProvider implements vscode.AuthenticationProvider {
  private readonly _onDidChangeSessions =
    new vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>();
  readonly onDidChangeSessions: vscode.Event<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent> =
    this._onDidChangeSessions.event;

  private readonly outputChannel = OutputChannelService.getInstance();
  private sessions: vscode.AuthenticationSession[] = [];

  // Provider ID must match package.json contribution
  static readonly id = 'argocd';
  static readonly label = 'ArgoCD';

  constructor(
    private readonly configService: ConfigurationService,
    private readonly cliService: ArgocdCliService
  ) {
    this.outputChannel.debug('ArgocdAuthenticationProvider: Initializing');
    this.loadSessions();
  }

  /**
   * Load existing sessions from storage
   */
  private async loadSessions(): Promise<void> {
    this.outputChannel.debug('ArgocdAuthenticationProvider: Loading sessions');

    const connectionManager = this.configService.getConnectionManager();
    const activeConnection = connectionManager.getActiveConnection();

    if (!activeConnection) {
      this.sessions = [];
      this.outputChannel.debug('ArgocdAuthenticationProvider: No active connection found');
      return;
    }

    // Check if authenticated
    const isAuthenticated = await this.cliService.isAuthenticated();

    if (isAuthenticated) {
      try {
        const session = await this.createSessionFromConnection(activeConnection);
        this.sessions = [session];
        this.outputChannel.info(`ArgocdAuthenticationProvider: Loaded session for ${activeConnection.name}`);
      } catch (error) {
        this.sessions = [];
        this.outputChannel.warn(`ArgocdAuthenticationProvider: Failed to create session: ${error}`);
      }
    } else {
      this.sessions = [];
      this.outputChannel.debug('ArgocdAuthenticationProvider: No authenticated session found');
    }
  }

  /**
   * Create an authentication session from a connection config
   */
  private async createSessionFromConnection(connection: ArgocdConnection): Promise<vscode.AuthenticationSession> {
    // Create a unique session ID based on connection ID
    const sessionId = `argocd-${connection.id}`;

    // Fetch detailed user information from ArgoCD
    let userInfo: UserInfo | null = null;
    try {
      if (connection.authMethod === 'token' && connection.apiToken) {
        userInfo = await this.cliService.getUserInfoWithAuth(
          connection.serverAddress,
          connection.apiToken,
          connection.skipTls
        );
      } else if (connection.authMethod === 'username' || connection.authMethod === 'sso') {
        userInfo = await this.cliService.getUserInfo();
      }
    } catch (error) {
      this.outputChannel.warn('ArgocdAuthenticationProvider: Failed to fetch user info, using fallback');
    }

    // Determine the account label based on user info or auth method
    let accountLabel: string;
    let accountId: string;

    if (userInfo?.username) {
      accountLabel = userInfo.username;
      accountId = `${connection.id}-${userInfo.username}`;
    } else {
      // Fallback to auth method based labels
      switch (connection.authMethod) {
        case 'username':
          accountLabel = connection.username || 'Unknown User';
          accountId = `${connection.id}-${accountLabel}`;
          break;
        case 'token':
          accountLabel = 'API Token';
          accountId = `${connection.id}-token`;
          break;
        case 'sso':
          accountLabel = 'SSO User';
          accountId = `${connection.id}-sso`;
          break;
        default:
          accountLabel = 'Unknown';
          accountId = `${connection.id}-unknown`;
      }
    }

    // Create the session with detailed information
    const session: vscode.AuthenticationSession = {
      id: sessionId,
      accessToken: connection.apiToken || '',
      account: {
        id: accountId,
        label: accountLabel
      },
      scopes: this.buildScopes(connection.authMethod, userInfo)
    };

    this.outputChannel.debug(`ArgocdAuthenticationProvider: Created session for ${session.account.label}`);
    return session;
  }

  /**
   * Create an authentication session from ArgoCD configuration (legacy)
   */
  private async createSessionFromConfig(config: ArgocdConfig): Promise<vscode.AuthenticationSession> {
    // Create a unique session ID
    const sessionId = `argocd-${config.serverAddress}-${config.authMethod}`;

    // Fetch detailed user information from ArgoCD
    let userInfo: UserInfo | null = null;
    try {
      if (config.authMethod === 'token' && config.apiToken) {
        userInfo = await this.cliService.getUserInfoWithAuth(config.serverAddress, config.apiToken, config.skipTls);
      } else {
        userInfo = await this.cliService.getUserInfo();
      }
    } catch (error) {
      this.outputChannel.warn('ArgocdAuthenticationProvider: Failed to fetch user info, using fallback');
    }

    // Determine the account label based on user info or auth method
    let accountLabel: string;
    let accountId: string;

    if (userInfo?.username) {
      accountLabel = userInfo.username;
      accountId = `${config.serverAddress}-${userInfo.username}`;
    } else {
      // Fallback to auth method based labels
      switch (config.authMethod) {
        case 'username':
          accountLabel = config.username || 'Unknown User';
          accountId = `${config.serverAddress}-${accountLabel}`;
          break;
        case 'token':
          accountLabel = 'API Token';
          accountId = `${config.serverAddress}-token`;
          break;
        case 'sso':
          accountLabel = 'SSO User';
          accountId = `${config.serverAddress}-sso`;
          break;
        default:
          accountLabel = 'Unknown';
          accountId = `${config.serverAddress}-unknown`;
      }
    }

    // Create the session with detailed information
    const session: vscode.AuthenticationSession = {
      id: sessionId,
      accessToken: config.apiToken || config.password || '',
      account: {
        id: accountId,
        label: accountLabel
      },
      scopes: this.buildScopes(config.authMethod, userInfo)
    };

    this.outputChannel.debug(`ArgocdAuthenticationProvider: Created session for ${session.account.label}`);
    return session;
  }

  /**
   * Build scopes array with auth method and user groups
   */
  private buildScopes(authMethod: string, userInfo: UserInfo | null): string[] {
    const scopes = [authMethod];

    if (userInfo) {
      if (userInfo.groups && userInfo.groups.length > 0) {
        // Add groups as scopes for detailed permission info
        scopes.push(...userInfo.groups);
      }
      if (userInfo.iss) {
        scopes.push(`iss:${userInfo.iss}`);
      }
    }

    return scopes;
  }

  /**
   * Get all authentication sessions
   * @param scopes Optional scopes to filter sessions
   * @param options Optional account to filter by
   */
  async getSessions(
    scopes?: readonly string[],
    options?: vscode.AuthenticationProviderSessionOptions
  ): Promise<vscode.AuthenticationSession[]> {
    this.outputChannel.debug(
      `ArgocdAuthenticationProvider: Getting sessions (scopes: ${scopes?.join(', ') || 'none'})`
    );

    // Reload sessions to ensure we have the latest state
    await this.loadSessions();

    // Filter by account if specified
    if (options?.account) {
      const filtered = this.sessions.filter((s) => s.account.id === options.account!.id);
      this.outputChannel.debug(`ArgocdAuthenticationProvider: Filtered to ${filtered.length} session(s) by account`);
      return filtered;
    }

    // Filter by scopes if specified
    if (scopes && scopes.length > 0) {
      const filtered = this.sessions.filter((s) => scopes.some((scope) => s.scopes.includes(scope)));
      this.outputChannel.debug(`ArgocdAuthenticationProvider: Filtered to ${filtered.length} session(s) by scopes`);
      return filtered;
    }

    this.outputChannel.debug(`ArgocdAuthenticationProvider: Returning ${this.sessions.length} session(s)`);
    return this.sessions;
  }

  /**
   * Create a new authentication session
   * This prompts the user to configure ArgoCD connection
   */
  async createSession(
    scopes: readonly string[],
    options: vscode.AuthenticationProviderSessionOptions
  ): Promise<vscode.AuthenticationSession> {
    this.outputChannel.info('ArgocdAuthenticationProvider: Creating new session');

    // Prompt user for ArgoCD configuration
    const config = await this.configService.promptForConfiguration();

    if (!config) {
      this.outputChannel.warn('ArgocdAuthenticationProvider: Session creation cancelled by user');
      throw new Error('ArgoCD configuration was cancelled');
    }

    // Attempt to login with the provided configuration
    try {
      this.outputChannel.info('ArgocdAuthenticationProvider: Attempting to authenticate with ArgoCD');

      let loginSuccess = false;

      if (config.authMethod === 'username' && config.username && config.password) {
        loginSuccess = await this.cliService.login(
          config.serverAddress,
          config.username,
          config.password,
          config.skipTls
        );
      } else if (config.authMethod === 'token' && config.apiToken) {
        // For token auth, verify the token works
        loginSuccess = await this.cliService.isAuthenticated();
      } else if (config.authMethod === 'sso') {
        loginSuccess = await this.cliService.loginSSO(config.serverAddress, config.skipTls);
      }

      if (!loginSuccess) {
        this.outputChannel.error('ArgocdAuthenticationProvider: Authentication failed');
        throw new Error('Failed to authenticate with ArgoCD');
      }

      this.outputChannel.info('ArgocdAuthenticationProvider: Authentication successful');

      // Create and store the session
      const session = await this.createSessionFromConfig(config);
      this.sessions.push(session);

      // Notify listeners of the new session
      this._onDidChangeSessions.fire({
        added: [session],
        removed: [],
        changed: []
      });

      vscode.window.showInformationMessage(`Successfully authenticated to ArgoCD: ${config.serverUrl}`);

      return session;
    } catch (error) {
      this.outputChannel.error('ArgocdAuthenticationProvider: Failed to create session', error as Error);
      throw new Error(`Failed to authenticate with ArgoCD: ${error}`);
    }
  }

  /**
   * Remove an authentication session
   * This logs out from ArgoCD CLI and sets notConfigured context key
   */
  async removeSession(sessionId: string): Promise<void> {
    this.outputChannel.info(`ArgocdAuthenticationProvider: Removing session ${sessionId}`);

    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) {
      this.outputChannel.warn(`ArgocdAuthenticationProvider: Session ${sessionId} not found`);
      return;
    }

    try {
      // Get the active connection to retrieve server address
      const connectionManager = this.configService.getConnectionManager();
      const activeConnection = connectionManager.getActiveConnection();

      // Logout from ArgoCD CLI with server address
      if (activeConnection) {
        await this.cliService.logout(activeConnection.serverAddress);
        this.outputChannel.info(`ArgocdAuthenticationProvider: Logged out from ${activeConnection.serverAddress}`);

        // Clear the active connection and set notConfigured
        await connectionManager.clearActiveConnection();
        this.outputChannel.info('ArgocdAuthenticationProvider: Cleared active connection and set notConfigured');
      } else {
        // Set notConfigured context key to true
        await ContextKeys.isAuthenticated(false);
        this.outputChannel.info('ArgocdAuthenticationProvider: Set argocd:notConfigured to true');
      }

      // Remove session from list
      this.sessions = this.sessions.filter((s) => s.id !== sessionId);

      // Notify listeners
      this._onDidChangeSessions.fire({
        added: [],
        removed: [session],
        changed: []
      });

      this.outputChannel.info(`ArgocdAuthenticationProvider: Session ${sessionId} removed successfully`);
      vscode.window.showInformationMessage('Signed out from ArgoCD');
    } catch (error) {
      this.outputChannel.error(`ArgocdAuthenticationProvider: Failed to remove session`, error as Error);
      throw new Error(`Failed to sign out from ArgoCD: ${error}`);
    }
  }

  /**
   * Manually refresh sessions (useful after configuration changes)
   */
  async refreshSessions(): Promise<void> {
    this.outputChannel.info('ArgocdAuthenticationProvider: Refreshing sessions');
    const oldSessions = [...this.sessions];

    // Clear sessions completely before reloading
    this.sessions = [];

    // Load new sessions
    await this.loadSessions();

    // Update notConfigured context key based on session availability
    await ContextKeys.isAuthenticated(this.sessions.length !== 0);

    // Mark all old sessions as removed and all new sessions as added
    // This forces VS Code to update the account info
    if (oldSessions.length > 0 || this.sessions.length > 0) {
      this._onDidChangeSessions.fire({
        added: this.sessions,
        removed: oldSessions,
        changed: []
      });
      this.outputChannel.info(
        `ArgocdAuthenticationProvider: Sessions updated (added: ${this.sessions.length}, removed: ${oldSessions.length})`
      );
    }
  }

  /**
   * Get the current active session
   */
  async getActiveSession(): Promise<vscode.AuthenticationSession | undefined> {
    const sessions = await this.getSessions();
    return sessions.length > 0 ? sessions[0] : undefined;
  }

  /**
   * Get account information for display with detailed user info
   */
  async getAccountInfo(): Promise<{
    serverUrl: string;
    authMethod: string;
    accountLabel: string;
    userInfo?: UserInfo;
  } | null> {
    const config = this.configService.getConfiguration();
    if (!config) {
      return null;
    }

    // Fetch detailed user information
    let userInfo: UserInfo | null = null;
    try {
      if (config.authMethod === 'token' && config.apiToken) {
        userInfo = await this.cliService.getUserInfoWithAuth(config.serverAddress, config.apiToken, config.skipTls);
      } else {
        userInfo = await this.cliService.getUserInfo();
      }
    } catch (error) {
      this.outputChannel.warn('ArgocdAuthenticationProvider: Failed to fetch user info for display');
    }

    let accountLabel: string;
    if (userInfo?.username) {
      accountLabel = userInfo.username;
    } else {
      switch (config.authMethod) {
        case 'username':
          accountLabel = config.username || 'Unknown User';
          break;
        case 'token':
          accountLabel = 'API Token';
          break;
        case 'sso':
          accountLabel = 'SSO User';
          break;
        default:
          accountLabel = 'Unknown';
      }
    }

    return {
      serverUrl: config.serverUrl,
      authMethod: config.authMethod.toUpperCase(),
      accountLabel,
      userInfo: userInfo || undefined
    };
  }
}
