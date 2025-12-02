import * as vscode from 'vscode';
import {
  ClustersProvider,
  RepositoryProvider,
  ApplicationsProvider,
  TemplatesProvider,
  WelcomeProvider,
  ArgocdYamlCodeLensProvider
} from './views/providers';
import {
  ConfigurationService,
  WebviewService,
  ArgocdCliService,
  AppService,
  ClusterService,
  RepoService,
  ArgocdAuthenticationProvider,
  OutputChannelService
} from './services';
import { ContextKeys } from './utils/contextKeys';
import { registerCommands } from './commands';

export async function activate(context: vscode.ExtensionContext) {
  // Initialize output channel
  const outputChannel = OutputChannelService.getInstance();
  const config = vscode.workspace.getConfiguration('argocd');
  outputChannel.setLogLevel(config.get('logLevel', 'info'));

  outputChannel.info('ArgoCD GitOps extension is now active');

  // Initialize context keys
  await ContextKeys.isAuthenticated(false);
  await ContextKeys.isCliAvailable(false);

  // Check for ArgoCD CLI
  const cliService = new ArgocdCliService();
  const hasArgocdCli = await cliService.checkCli();
  await ContextKeys.isCliAvailable(hasArgocdCli);

  if (hasArgocdCli) {
    outputChannel.info('ArgoCD CLI found');
  } else {
    outputChannel.warn('ArgoCD CLI not found');
    const install = await vscode.window.showWarningMessage(
      'ArgoCD CLI is required for this extension to work properly.',
      'Install ArgoCD CLI',
      'Continue without CLI'
    );

    if (install === 'Install ArgoCD CLI') {
      vscode.env.openExternal(vscode.Uri.parse('https://argo-cd.readthedocs.io/en/stable/cli_installation/'));
      return;
    }
  }

  // Initialize services - Following Single Responsibility Principle
  const configService = new ConfigurationService(context);
  const clusterService = new ClusterService(configService, cliService);
  const repoService = new RepoService(configService, cliService);
  const appService = new AppService(configService, cliService, clusterService, repoService);
  const webviewService = new WebviewService(context, appService, clusterService, repoService, cliService);

  // Initialize Authentication Provider FIRST
  const authProvider = new ArgocdAuthenticationProvider(configService, cliService);

  // Register the authentication provider with VS Code
  const authProviderDisposable = vscode.authentication.registerAuthenticationProvider(
    ArgocdAuthenticationProvider.id,
    ArgocdAuthenticationProvider.label,
    authProvider
  );
  context.subscriptions.push(authProviderDisposable);
  outputChannel.info('ArgoCD Authentication Provider registered');

  // Initialize Welcome Provider EARLY (before other views)
  const welcomeProvider = new WelcomeProvider(configService, context);

  // Register webview view provider for welcome BEFORE setting context keys
  context.subscriptions.push(vscode.window.registerWebviewViewProvider('argocdWelcome', welcomeProvider));
  outputChannel.info('Welcome view provider registered');

  // Check if ArgoCD is configured AND authenticated
  const isConfigured = configService.isAuthenticated();
  let isAuthenticated = false;

  if (isConfigured && hasArgocdCli) {
    isAuthenticated = await cliService.isAuthenticated();
    if (!isAuthenticated) {
      outputChannel.warn('ArgoCD configuration exists but user is not authenticated');
    }
  }

  // Set context key - this will show/hide views
  await ContextKeys.isAuthenticated(isAuthenticated);

  if (isConfigured && isAuthenticated) {
    outputChannel.info('ArgoCD is configured and authenticated');
  } else if (isConfigured && !isAuthenticated) {
    outputChannel.info('ArgoCD is configured but not authenticated - please login');
  } else {
    outputChannel.info('ArgoCD is not configured yet');
  }

  // Initialize other providers AFTER context keys are set
  const clustersProvider = new ClustersProvider(clusterService, configService);
  const repositoryProvider = new RepositoryProvider(repoService, configService);
  const applicationsProvider = new ApplicationsProvider(appService, configService, clusterService, repoService);
  const templatesProvider = new TemplatesProvider(context);

  // Register tree views AFTER context keys are set
  const clustersTreeView = vscode.window.createTreeView('argocdClusters', {
    treeDataProvider: clustersProvider,
    showCollapseAll: true
  });

  const repositoryTreeView = vscode.window.createTreeView('argocdRepositories', {
    treeDataProvider: repositoryProvider,
    showCollapseAll: true
  });

  const applicationsTreeView = vscode.window.createTreeView('argocdApplications', {
    treeDataProvider: applicationsProvider,
    showCollapseAll: true
  });

  const templatesTreeView = vscode.window.createTreeView('argocdTemplates', {
    treeDataProvider: templatesProvider,
    showCollapseAll: true
  });

  // Register CodeLens provider for YAML files
  const yamlCodeLensProvider = new ArgocdYamlCodeLensProvider();
  const codeLensDisposable = vscode.languages.registerCodeLensProvider(
    [
      { language: 'yaml', scheme: 'file' },
      { language: 'yaml', scheme: 'untitled' }
    ],
    yamlCodeLensProvider
  );

  // Register commands
  registerCommands(
    context,
    {
      appService,
      clusterService,
      repoService,
      webviewService,
      configService,
      cliService,
      outputChannel,
      authProvider
    },
    {
      welcomeProvider,
      clustersProvider,
      repositoryProvider,
      applicationsProvider,
      templatesProvider
    }
  );

  // Auto-refresh functionality
  let refreshInterval: NodeJS.Timeout | undefined;

  const startAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    const intervalSeconds = configService.getRefreshInterval();
    if (intervalSeconds > 0) {
      refreshInterval = setInterval(() => {
        if (configService.isAuthenticated()) {
          clustersProvider.refresh();
          repositoryProvider.refresh();
          applicationsProvider.refresh();
          templatesProvider.refresh();
        }
      }, intervalSeconds * 1000);
    }
  };

  // Start auto-refresh
  startAutoRefresh();

  // Listen for configuration changes
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('argocd.refreshInterval')) {
      startAutoRefresh();
    }
  });

  // Clean up on deactivation
  context.subscriptions.push(
    clustersTreeView,
    repositoryTreeView,
    applicationsTreeView,
    templatesTreeView,
    codeLensDisposable,
    {
      dispose: () => {
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      }
    }
  );
}

export function deactivate() {
  // Extension cleanup is handled in activate() subscriptions
}
