import * as vscode from 'vscode';
import { ConfigurationService } from '../../services';
import { refreshAllViews } from '../../views/views';

/**
 * Delete a connection
 */
export function deleteConnection(configService: ConfigurationService) {
  return async (preSelectedConnection?: any) => {
    const connectionManager = configService.getConnectionManager();
    const connections = connectionManager.getAllConnections();

    if (connections.length === 0) {
      vscode.window.showInformationMessage('No connections available.');
      return;
    }

    let selectedConnection;

    if (preSelectedConnection) {
      // Connection was passed from webview
      selectedConnection = preSelectedConnection;
    } else {
      // Show picker for command palette usage
      const activeConnection = connectionManager.getActiveConnection();
      const items = connections.map((conn) => ({
        label: conn.name,
        description: conn.serverAddress,
        detail: conn.id === activeConnection?.id ? '$(warning) Active connection' : '',
        connection: conn
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select connection to delete',
        ignoreFocusOut: true
      });

      if (!selected) {
        return;
      }
      selectedConnection = selected.connection;
    }

    const confirm = await vscode.window.showWarningMessage(
      `Are you sure you want to delete connection "${selectedConnection.name}"?`,
      { modal: true },
      'Delete'
    );

    if (confirm === 'Delete') {
      await connectionManager.deleteConnection(selectedConnection.id);
      vscode.window.showInformationMessage(`Connection deleted: ${selectedConnection.name}`);

      // Refresh all views after deletion
      refreshAllViews();
    }
  };
}
