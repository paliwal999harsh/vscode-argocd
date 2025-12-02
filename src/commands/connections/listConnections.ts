import * as vscode from 'vscode';
import { ConfigurationService } from '../../services';
/**
 * List all connections
 */
export function listConnections(configService: ConfigurationService) {
  return async () => {
    const connectionManager = configService.getConnectionManager();
    const connections = connectionManager.getAllConnections();

    if (connections.length === 0) {
      vscode.window.showInformationMessage('No connections configured. Use "Add Connection" to create one.');
      return;
    }

    const activeConnection = connectionManager.getActiveConnection();
    const items = connections.map((conn) => ({
      label: conn.name,
      description: conn.serverAddress,
      detail: `${conn.authMethod.toUpperCase()} ${conn.id === activeConnection?.id ? '• Active' : ''}`,
      connection: conn
    }));

    await vscode.window.showQuickPick(items, {
      placeHolder: `${connections.length} connection(s) configured`,
      ignoreFocusOut: false
    });
  };
}
