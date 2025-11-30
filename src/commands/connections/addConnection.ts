import { ArgocdAuthenticationProvider, ArgocdCliService, ConfigurationService } from "../../services";
import * as vscode from "vscode";
import { refreshAllViews } from "../../views/views";

/**
 * Add a new connection
 */
export function addConnection(
    configService: ConfigurationService,
    cliService: ArgocdCliService,
    authProvider: ArgocdAuthenticationProvider
) {
    return async () => {
        const config = await configService.promptForConfiguration();
        if (!config) {
            return;
        }

        // Check if already authenticated for this connection
        const isAlreadyAuthenticated = await cliService.isAuthenticated();
        
        let loginSuccess = false;
        
        if (isAlreadyAuthenticated) {
            // User is already logged in
            vscode.window.showInformationMessage(`Connection "${config.serverAddress}" added. Already authenticated.`);
            loginSuccess = true;
        } else {
            // Need to authenticate
            if (config.authMethod === 'username' && config.username) {
                // Prompt for password
                const password = await vscode.window.showInputBox({
                    prompt: 'Enter ArgoCD Password',
                    password: true,
                    ignoreFocusOut: true
                });

                if (password) {
                    loginSuccess = await cliService.login(
                        config.serverAddress,
                        config.username,
                        password,
                        config.skipTls
                    );
                    
                    if (loginSuccess) {
                        vscode.window.showInformationMessage('Successfully connected to ArgoCD server');
                    } else {
                        vscode.window.showErrorMessage('Failed to authenticate. Please check your credentials.');
                    }
                }
            } else if (config.authMethod === 'token' && config.apiToken) {
                // For token auth, test the connection
                try {
                    await cliService.executeWithAuth(
                        'cluster list',
                        config.serverAddress,
                        config.apiToken,
                        config.skipTls
                    );
                    loginSuccess = true;
                    vscode.window.showInformationMessage('Successfully connected to ArgoCD server with API token');
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to connect with API token: ${error}`);
                }
            } else if (config.authMethod === 'sso') {
                loginSuccess = await cliService.loginSSO(
                    config.serverAddress,
                    config.skipTls
                );
                
                if (loginSuccess) {
                    vscode.window.showInformationMessage('Successfully connected to ArgoCD server with SSO');
                } else {
                    vscode.window.showErrorMessage('SSO authentication failed');
                }
            }
        }

        if (loginSuccess) {
            // Force refresh authentication provider sessions to update account info
            await authProvider.refreshSessions();
            
            // Small delay to ensure session is updated
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Trigger refresh of all views
            refreshAllViews();
        }
    };
}