import { ConfigurationService, ArgocdCliService, ArgocdAuthenticationProvider } from '../../services';
import { refreshAllViews } from '../../views/views';
import * as vscode from 'vscode';

/**
 * Switch active connection
 */
export function switchConnection(
  configService: ConfigurationService,
  cliService: ArgocdCliService,
  authProvider: ArgocdAuthenticationProvider
) {
  return async (preSelectedConnection?: any) => {
    const connectionManager = configService.getConnectionManager();
    const connections = connectionManager.getAllConnections();

    if (connections.length === 0) {
      vscode.window.showInformationMessage('No connections available. Please add a connection first.');
      return;
    }

    const activeConnection = connectionManager.getActiveConnection();

    let selectedConnection;

    // If connection was passed directly (from tree view), use it
    if (preSelectedConnection && preSelectedConnection.id) {
      selectedConnection = preSelectedConnection;
    } else {
      // Show quick pick to select connection
      const items = connections.map((conn) => ({
        label: conn.name,
        description: conn.serverAddress,
        detail: conn.id === activeConnection?.id ? '$(check) Active' : '',
        connection: conn
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select connection to activate',
        ignoreFocusOut: true
      });

      if (!selected) {
        return;
      }

      selectedConnection = selected.connection;
    }

    // Logout from current connection before switching
    try {
      if (activeConnection) {
        await cliService.logout(activeConnection.serverAddress);
      }
    } catch (error) {
      // Ignore logout errors
      console.log('Logout error (ignored):', error);
    }

    // Switch the active connection
    connectionManager.setActiveConnection(selectedConnection.id);

    // Authenticate with new connection
    const newConfig = selectedConnection;
    let loginSuccess = false;

    if (newConfig.authMethod === 'username' && newConfig.username) {
      const password = await vscode.window.showInputBox({
        prompt: `Enter password for ${newConfig.username}@${newConfig.serverAddress}`,
        password: true,
        ignoreFocusOut: true
      });

      if (password) {
        loginSuccess = await cliService.login(newConfig.serverAddress, newConfig.username, password, newConfig.skipTls);
      }
    } else if (newConfig.authMethod === 'token' && newConfig.apiToken) {
      try {
        await cliService.executeWithAuth(
          'cluster list',
          newConfig.serverAddress,
          newConfig.apiToken,
          newConfig.skipTls
        );
        loginSuccess = true;
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to connect: ${error}`);
      }
    } else if (newConfig.authMethod === 'sso') {
      loginSuccess = await cliService.loginSSO(newConfig.serverAddress, newConfig.skipTls);
    }

    if (loginSuccess) {
      vscode.window.showInformationMessage(`Switched to connection: ${selectedConnection.name}`);

      // Force refresh authentication provider sessions to update account info
      await authProvider.refreshSessions();

      // Small delay to ensure session is updated
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Trigger refresh of all views
      refreshAllViews();
    } else {
      vscode.window.showErrorMessage('Failed to authenticate with selected connection');
    }
  };
}
