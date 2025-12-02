import * as vscode from 'vscode';
import * as fs from 'node:fs';
import { ConfigurationService, OutputChannelService } from '../../services';
import { CommandId } from '../../commands';

/**
 * Welcome provider for showing getting started content
 * This view is shown only when ArgoCD is not configured
 * Uses WebviewView to be embedded in the sidebar like VS Code's welcome views
 */
export class WelcomeProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private readonly outputChannel = OutputChannelService.getInstance();
  private _disposables: vscode.Disposable[] = [];

  constructor(
    private readonly configService: ConfigurationService,
    private readonly context: vscode.ExtensionContext
  ) {
    // Listen to authentication session changes to refresh the view
    this._disposables.push(
      vscode.authentication.onDidChangeSessions((e) => {
        if (e.provider.id === 'argocd') {
          this.outputChannel.debug('WelcomeProvider: Authentication session changed, refreshing view');
          this.updateContent();
        }
      })
    );
  }

  /**
   * Resolves the webview view
   */
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri, vscode.Uri.joinPath(this.context.extensionUri, 'node_modules')]
    };

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'addConnection':
          vscode.commands.executeCommand(CommandId.AddConnection);
          break;
        case 'switchConnection':
          vscode.commands.executeCommand(CommandId.SwitchConnection, message.connection);
          break;
        case 'editConnection':
          vscode.commands.executeCommand(CommandId.EditConnection, message.connection);
          break;
        case 'deleteConnection':
          vscode.commands.executeCommand(CommandId.DeleteConnection, message.connection);
          break;
      }
    });

    this.updateContent();
  }

  /**
   * Update the webview content
   */
  public async updateContent(): Promise<void> {
    if (!this._view) {
      return;
    }

    const connectionManager = this.configService.getConnectionManager();
    const connections = connectionManager.getAllConnections();

    this._view.webview.html = this.getHtmlContent(connections);
  }

  /**
   * Refresh the welcome view
   */
  public refresh(): void {
    this.outputChannel.debug('WelcomeProvider: Refreshing welcome view');
    this.updateContent();
  }

  /**
   * Generate HTML content for the welcome view
   */
  private getHtmlContent(connections: any[]): string {
    // Get URIs for resources
    const cssUri = this._view!.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'resources', 'webview', 'css', 'welcome-view.css')
    );
    const jsUri = this._view!.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'resources', 'webview', 'js', 'welcome-view.js')
    );

    // Get VS Code Codicons CSS URI
    const codiconsUri = this._view!.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css')
    );

    // Read HTML template
    const htmlUri = vscode.Uri.joinPath(this.context.extensionUri, 'resources', 'webview', 'html', 'welcome-view.html');
    let html = fs.readFileSync(htmlUri.fsPath, 'utf8');

    // Generate connections list HTML
    const connectionsListHtml =
      connections.length > 0
        ? `
            <div class="divider"></div>
            <div class="section">
                <div class="section-title">Available Connections (${connections.length})</div>
                ${connections
                  .map(
                    (conn) => `
                    <div class="connection-item">
                        <div class="connection-header">
                            <div class="connection-name">
                                ${this.escapeHtml(conn.name)}
                            </div>
                            <div class="connection-buttons">
                                <button class="action-button secondary" data-action="editConnection" data-connection='${JSON.stringify(conn).replaceAll("'", '&apos;')}' title="Edit Connection">
                                    <i class="codicon codicon-edit"></i>
                                </button>
                                <button class="action-button secondary" data-action="deleteConnection" data-connection='${JSON.stringify(conn).replaceAll("'", '&apos;')}' title="Delete Connection">
                                    <i class="codicon codicon-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="connection-details">
                            <div class="detail-item">
                                <span class="detail-label">Server:</span>
                                <span class="detail-value">${this.escapeHtml(conn.serverAddress)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Auth:</span>
                                <span class="detail-value">${this.escapeHtml(conn.authMethod)}</span>
                            </div>
                        </div>
                        <button class="action-button primary" data-action="switchConnection" data-connection='${JSON.stringify(conn).replaceAll("'", '&apos;')}'>
                            <i class="codicon codicon-plug"></i> Connect
                        </button>
                    </div>
                `
                  )
                  .join('')}
            </div>
        `
        : `
            <div class="divider"></div>
            <div class="empty-state">
                <h3>No Connections</h3>
                <p>Add your first ArgoCD server connection to get started</p>
            </div>
        `;

    // Replace placeholders
    html = html.replaceAll('{{cspSource}}', this._view!.webview.cspSource);
    html = html.replaceAll('{{cssUri}}', cssUri.toString());
    html = html.replaceAll('{{codiconsUri}}', codiconsUri.toString());
    html = html.replaceAll('{{jsUri}}', jsUri.toString());
    html = html.replaceAll('{{connectionsList}}', connectionsListHtml);

    return html;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replaceAll(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Dispose and clean up resources
   */
  public dispose(): void {
    for (const disposable of this._disposables) {
      disposable.dispose();
    }
    this._disposables = [];
  }
}
