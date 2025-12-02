import * as vscode from 'vscode';
import { ConfigurationService } from '../../services';
import { refreshAllViews } from '../../views/views';
/**
 * Edit a connection
 */
export function editConnection(configService: ConfigurationService) {
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
      const items = connections.map((conn) => ({
        label: conn.name,
        description: conn.serverAddress,
        connection: conn
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select connection to edit',
        ignoreFocusOut: true
      });

      if (!selected) {
        return;
      }
      selectedConnection = selected.connection;
    }

    const newName = await vscode.window.showInputBox({
      prompt: 'Enter new connection name',
      value: selectedConnection.name,
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Connection name is required';
        }
        return null;
      }
    });

    if (newName && newName !== selectedConnection.name) {
      connectionManager.updateConnection(selectedConnection.id, {
        name: newName.trim()
      });
      vscode.window.showInformationMessage(`Connection renamed to: ${newName}`);
    }
    refreshAllViews();
  };
}
