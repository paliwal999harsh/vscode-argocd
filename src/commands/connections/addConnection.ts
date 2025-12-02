import { ArgocdAuthenticationProvider, ArgocdCliService, ConfigurationService } from '../../services';
import * as vscode from 'vscode';
import { refreshAllViews } from '../../views/views';

/**
 * Add a new connection
 */
export function addConnection(
  configService: ConfigurationService,
  cliService: ArgocdCliService,
  authProvider: ArgocdAuthenticationProvider
) {
  return async () => {
    let loginSuccess = false;
    const config = await configService.promptForConfiguration();
    if (!config) {
      return;
    }
    if (config.authMethod === 'username' && config.username) {
      const password = await vscode.window.showInputBox({
        prompt: 'Enter ArgoCD Password',
        password: true,
        ignoreFocusOut: true,
        validateInput: (value) => {
          if (!value) {
            return 'Password is required';
          }
          return null;
        }
      });

      if (!password) {
        return null;
      }
      loginSuccess = await cliService.login(config.serverAddress, config.username, password, config.skipTls);
    } else if (config.authMethod === 'token' && config.apiToken) {
      try {
        await cliService.executeWithAuth('cluster list', config.serverAddress, config.apiToken, config.skipTls);
        loginSuccess = true;
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to connect with API token: ${error}`);
      }
    } else if (config.authMethod === 'sso') {
      loginSuccess = await cliService.loginSSO(config.serverAddress, config.skipTls);
    }

    if (loginSuccess) {
      vscode.window.showInformationMessage('Successfully connected to ArgoCD server');
      await authProvider.refreshSessions();
      await new Promise((resolve) => setTimeout(resolve, 500));
      refreshAllViews();
    } else {
      vscode.window.showErrorMessage(
        'Failed to connect to ArgoCD server. Please check your credentials and try again.'
      );
    }
  };
}
