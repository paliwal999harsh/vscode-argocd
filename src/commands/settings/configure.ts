import { window } from 'vscode';
import { CommandServices, CommandProviders } from '../../commands';
import { ContextKeys } from '../../utils/contextKeys';

/**
 * Configure ArgoCD connection
 */
export function configure(services: CommandServices, providers: CommandProviders) {
  return async () => {
    const { configService, cliService, authProvider } = services;
    const { clustersProvider } = providers;

    const config = await configService.promptForConfiguration();
    if (config) {
      let loginSuccess = false;

      if (config.authMethod === 'username' && config.username && config.password) {
        loginSuccess = await cliService.login(config.serverAddress, config.username, config.password, config.skipTls);

        if (loginSuccess) {
          window.showInformationMessage('Successfully connected to ArgoCD server');
        } else {
          window.showErrorMessage('Failed to authenticate. Please check your credentials.');
        }
      } else if (config.authMethod === 'token' && config.apiToken) {
        // For token auth, we don't need to login, just test the connection
        try {
          await cliService.executeWithAuth('cluster list', config.serverAddress, config.apiToken, config.skipTls);
          loginSuccess = true;
          window.showInformationMessage('Successfully connected to ArgoCD server with API token');
        } catch (error) {
          window.showErrorMessage(`Failed to connect with API token: ${error}`);
        }
      } else if (config.authMethod === 'sso') {
        loginSuccess = await cliService.loginSSO(config.serverAddress, config.skipTls);

        if (loginSuccess) {
          window.showInformationMessage('Successfully connected to ArgoCD server with SSO');
        } else {
          window.showErrorMessage('SSO authentication failed');
        }
      }

      // Update context key based on both configuration AND authentication
      const isAuthenticated = loginSuccess || (await cliService.isAuthenticated());
      await ContextKeys.isAuthenticated(isAuthenticated);

      // Refresh authentication provider sessions
      if (isAuthenticated && authProvider) {
        await authProvider.refreshSessions();
      }

      // Refresh all providers
      clustersProvider.refresh();
      providers.repositoryProvider.refresh();
      providers.applicationsProvider.refresh();
    }
  };
}
