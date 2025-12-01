import { CommandId } from '../../commands';
import { ArgocdAuthenticationProvider, ConfigurationService, OutputChannelService } from '../../services';
import * as vscode from 'vscode';

/**
 * Show ArgoCD account information with detailed user info
 * Displays current authentication method and account details including groups
 */
export function showAccountInfo(
  authProvider: ArgocdAuthenticationProvider,
  configService: ConfigurationService,
  outputChannel: OutputChannelService
) {
  return async () => {
    outputChannel.info('Showing ArgoCD account information');

    const accountInfo = await authProvider.getAccountInfo();

    if (!accountInfo) {
      vscode.window
        .showInformationMessage(
          'No ArgoCD account is currently configured. Please configure ArgoCD connection first.',
          'Configure Now'
        )
        .then((choice) => {
          if (choice === 'Configure Now') {
            vscode.commands.executeCommand(CommandId.ConfigureExtension);
          }
        });
      return;
    }

    // Get active session for additional details
    const session = await authProvider.getActiveSession();

    // Build info message
    const infoLines: string[] = [
      '**ArgoCD Account Information**',
      '',
      `**Server:** ${accountInfo.serverUrl}`,
      `**Authentication Method:** ${accountInfo.authMethod}`,
      `**Account:** ${accountInfo.accountLabel}`
    ];

    if (session) {
      infoLines.push(`**Session ID:** ${session.id}`);
    }

    const config = configService.getConfiguration();
    if (config) {
      infoLines.push(`**Skip TLS:** ${config.skipTls ? 'Yes' : 'No'}`);
    }

    // Add detailed user information if available
    if (accountInfo.userInfo) {
      const userInfo = accountInfo.userInfo;
      infoLines.push('', '**User Details:**');

      if (userInfo.username) {
        infoLines.push(`- Username: ${userInfo.username}`);
      }
      if (userInfo.email) {
        infoLines.push(`- Email: ${userInfo.email}`);
      }
      if (userInfo.name) {
        infoLines.push(`- Name: ${userInfo.name}`);
      }
      if (userInfo.iss) {
        infoLines.push(`- Identity Provider: ${userInfo.iss}`);
      }
      if (userInfo.groups && userInfo.groups.length > 0) {
        infoLines.push('', `**Groups** (${userInfo.groups.length}):`);
        userInfo.groups.forEach((group) => {
          infoLines.push(`- ${group}`);
        });
      }
    }

    infoLines.push('', '---', '');

    // Add authentication method specific info
    switch (accountInfo.authMethod) {
      case 'TOKEN':
        infoLines.push('You are authenticated using an **API Token**.');
        infoLines.push('');
        infoLines.push('API tokens provide direct access to ArgoCD without needing to login.');
        break;
      case 'USERNAME':
        infoLines.push('You are authenticated using **Username/Password**.');
        infoLines.push('');
        infoLines.push('Your session will remain active until you logout or the token expires.');
        break;
      case 'SSO':
        infoLines.push('You are authenticated using **Single Sign-On (SSO)**.');
        infoLines.push('');
        infoLines.push('SSO authentication is managed through your identity provider.');
        if (accountInfo.userInfo?.iss) {
          infoLines.push(`Provider: ${accountInfo.userInfo.iss}`);
        }
        break;
    }

    // Create markdown content
    const markdown = new vscode.MarkdownString(infoLines.join('\n'));
    markdown.isTrusted = true;
    markdown.supportHtml = true;

    // Show as information message with actions
    const actions = ['Open ArgoCD UI', 'Switch Account', 'Logout'];
    const choice = await vscode.window.showInformationMessage(
      `ArgoCD: Connected to ${accountInfo.serverUrl} as ${accountInfo.accountLabel}`,
      ...actions
    );

    if (choice === 'Open ArgoCD UI') {
      if (config) {
        vscode.env.openExternal(vscode.Uri.parse(config.serverUrl));
      }
    } else if (choice === 'Switch Account') {
      // Re-configure connection
      vscode.commands.executeCommand(CommandId.ConfigureExtension);
    } else if (choice === 'Logout') {
      // Remove the session (logout)
      if (session) {
        await authProvider.removeSession(session.id);
      }
    }

    outputChannel.debug('Account information displayed successfully');
  };
}
