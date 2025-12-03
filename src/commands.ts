import { commands, Disposable, ExtensionContext, Uri, window } from 'vscode';
import {
  ConfigurationService,
  ArgocdCliService,
  AppService,
  ClusterService,
  RepoService,
  ArgocdAuthenticationProvider,
  WebviewService,
  OutputChannelService
} from './services';
import {
  WelcomeProvider,
  ClustersProvider,
  RepositoryProvider,
  ApplicationsProvider,
  TemplatesProvider
} from './views/providers';
import { logout } from './commands/accounts/logout';
import { showAccountInfo } from './commands/accounts/showInfo';
import { addApplication } from './commands/applications/addApplication';
import { addApplicationSet } from './commands/applications/addApplicationSet';
import { createTemplateFromApplication } from './commands/applications/createTemplate';
import { deleteApplication } from './commands/applications/deleteApplication';
import { editApplication } from './commands/applications/editApplication';
import { refreshAllApplications } from './commands/applications/refreshAllApplications';
import { refreshApplication } from './commands/applications/refreshApplication';
import { syncApplication } from './commands/applications/syncApplication';
import { viewApplicationHistory } from './commands/applications/viewApplicationHistory';
import { addCluster } from './commands/clusters/addCluster';
import { refreshClusters } from './commands/clusters/refreshClusters';
import { removeCluster } from './commands/clusters/removeCluster';
import { addConnection } from './commands/connections/addConnection';
import { deleteConnection } from './commands/connections/deleteConnection';
import { editConnection } from './commands/connections/editConnection';
import { listConnections } from './commands/connections/listConnections';
import { switchConnection } from './commands/connections/switchConnection';
import { convertYamlToTemplate } from './commands/lens/convertYamlToTemplate';
import { createApplicationFromYaml } from './commands/lens/createApplicationFromYaml';
import { createApplicationFromYamlContextMenu } from './commands/lens/createApplicationFromYamlContextMenu';
import { scanWorkspaceForArgoCDFiles } from './commands/lens/scanWorkspaceForArgocdFiles';
import { addRepository } from './commands/repositories/addRepository';
import { copyRepositoryUrl } from './commands/repositories/copyRepositoryUrl';
import { createApplicationFromRepository } from './commands/repositories/createApplicationFromRepository';
import { deleteRepository } from './commands/repositories/deleteRepository';
import { refreshRepositories } from './commands/repositories/refreshRepositories';
import { showOutput, setLogLevel } from './commands/settings/showOutput';
import { addTemplate } from './commands/templates/addTemplate';
import { copyTemplate } from './commands/templates/copyTemplate';
import { copyTemplateYaml } from './commands/templates/copyTemplateToClipboard';
import { createApplicationFromTemplate } from './commands/templates/createApplicationFromTemplate';
import { deleteTemplate } from './commands/templates/deleteTemplate';
import { editTemplate } from './commands/templates/editTemplate';
import { refreshTemplates } from './commands/templates/refreshTemplates';
import { createApplicationFromFolder } from './commands/applications/createApplicationsFromFolder';
import { viewResourceManifest } from './commands/applications/viewResourceManifests';

/**
 * Command ids registered by this extension
 */
export const enum CommandId {
  // Configurationss
  ShowOutput = 'argocd.output.show',
  SetLogLevel = 'argocd.output.setLogLevel',
  ShowWelcome = 'argocd.welcome.show',
  RefreshWelcome = 'argocd.welcome.refresh',

  // Connections
  AddConnection = 'argocd.connection.add',
  SwitchConnection = 'argocd.connection.switch',
  EditConnection = 'argocd.connection.edit',
  DeleteConnection = 'argocd.connection.delete',
  ListConnections = 'argocd.connection.list',

  // Account
  ShowAccountInfo = 'argocd.account.showInfo',
  Logout = 'argocd.account.logout',

  // Clusters
  RefreshClusters = 'argocd.cluster.refresh',
  AddCluster = 'argocd.cluster.add',
  RemoveCluster = 'argocd.cluster.remove',

  // Repositories
  RefreshRepositories = 'argocd.repository.refresh',
  AddRepository = 'argocd.repository.add',
  DeleteRepository = 'argocd.repository.delete',
  CopyRepositoryUrl = 'argocd.repository.copyUrl',
  CreateApplicationFromRepository = 'argocd.repository.createApplication',

  // Applications
  RefreshAllApplications = 'argocd.application.refreshAll',
  AddApplication = 'argocd.application.addApplication',
  AddApplicationSet = 'argocd.application.addApplicationSet',
  SyncApplication = 'argocd.application.sync',
  RefreshApplication = 'argocd.application.refresh',
  ViewApplicationDetails = 'argocd.application.viewDetails',
  ViewApplicationHistory = 'argocd.application.viewHistory',
  EditApplication = 'argocd.application.edit',
  DeleteApplication = 'argocd.application.delete',
  CreateTemplateFromApplication = 'argocd.application.createTemplate',
  CreateApplicationFromFolder = 'argocd.createApplication.fromFolder',
  ViewResourceManifest = 'argocd.resource.viewManifest',

  // Templates
  RefreshTemplates = 'argocd.template.refresh',
  AddTemplate = 'argocd.template.add',
  EditTemplate = 'argocd.template.edit',
  CopyTemplate = 'argocd.template.copy',
  CopyTemplateYaml = 'argocd.template.copyYaml',
  CreateApplicationFromTemplate = 'argocd.template.createApplication',
  DeleteTemplate = 'argocd.template.delete',

  // YAML file detection and creation
  CreateApplicationFromYaml = 'argocd.createApplication.fromYaml',
  CreateApplicationFromYamlContextMenu = 'argocd.createApplication.fromYamlContextMenu',
  ValidateYaml = 'argocd.validateYaml',
  ScanWorkspaceForArgoCDFiles = 'argocd.scanWorkspace',
  ConvertYamlToTemplate = 'argocd.convertYamlToTemplate'
}

/**
 * Extension context for commands
 */
let _context: ExtensionContext;

/**
 * Service instances for commands
 */
export interface CommandServices {
  appService: AppService;
  clusterService: ClusterService;
  repoService: RepoService;
  webviewService: WebviewService;
  configService: ConfigurationService;
  cliService: ArgocdCliService;
  outputChannel: OutputChannelService;
  authProvider: ArgocdAuthenticationProvider;
}

/**
 * Provider instances for commands
 */
export interface CommandProviders {
  welcomeProvider: WelcomeProvider;
  clustersProvider: ClustersProvider;
  repositoryProvider: RepositoryProvider;
  applicationsProvider: ApplicationsProvider;
  templatesProvider: TemplatesProvider;
}

/**
 * Registers ArgoCD extension commands.
 * @param context VSCode extension context.
 * @param services Service instances.
 * @param providers Provider instances.
 */
export function registerCommands(context: ExtensionContext, services: CommandServices, providers: CommandProviders) {
  _context = context;

  // Store context globally for commands that need it
  (globalThis as any).extensionContext = context;

  // Configuration commands
  registerCommand(CommandId.ShowOutput, showOutput(services.outputChannel));
  registerCommand(CommandId.SetLogLevel, setLogLevel(services.outputChannel));
  registerCommand(CommandId.RefreshWelcome, () => providers.welcomeProvider.refresh());

  // Connection commands
  registerCommand(
    CommandId.AddConnection,
    addConnection(services.configService, services.cliService, services.authProvider)
  );
  registerCommand(
    CommandId.SwitchConnection,
    switchConnection(services.configService, services.cliService, services.authProvider)
  );
  registerCommand(CommandId.EditConnection, editConnection(services.configService));
  registerCommand(CommandId.DeleteConnection, deleteConnection(services.configService));
  registerCommand(CommandId.ListConnections, listConnections(services.configService));

  // Account commands
  registerCommand(
    CommandId.ShowAccountInfo,
    showAccountInfo(services.authProvider, services.configService, services.outputChannel)
  );
  registerCommand(CommandId.Logout, logout(services.authProvider, services.outputChannel));

  // Cluster commands
  registerCommand(CommandId.RefreshClusters, refreshClusters(providers.clustersProvider));
  registerCommand(CommandId.AddCluster, addCluster(services, providers));
  registerCommand(CommandId.RemoveCluster, removeCluster(services, providers));

  // Repository commands
  registerCommand(CommandId.RefreshRepositories, refreshRepositories(providers.repositoryProvider));
  registerCommand(CommandId.AddRepository, addRepository(services, providers));
  registerCommand(CommandId.DeleteRepository, deleteRepository(services, providers));
  registerCommand(CommandId.CopyRepositoryUrl, copyRepositoryUrl(services.repoService));
  registerCommand(CommandId.CreateApplicationFromRepository, createApplicationFromRepository(services, providers));

  // Applications commands
  registerCommand(CommandId.RefreshAllApplications, refreshAllApplications(providers.applicationsProvider));
  registerCommand(CommandId.AddApplication, addApplication(services, providers));
  registerCommand(CommandId.AddApplicationSet, addApplicationSet(services, providers));
  registerCommand(CommandId.SyncApplication, syncApplication(services, providers));
  registerCommand(CommandId.RefreshApplication, refreshApplication(services, providers));
  // Disabled for now - keeping code for future use
  // registerCommand(CommandId.ViewApplicationDetails, viewApplicationDetails(services.appService));
  registerCommand(CommandId.ViewApplicationHistory, viewApplicationHistory(services));
  registerCommand(CommandId.EditApplication, editApplication(services, providers));
  registerCommand(CommandId.DeleteApplication, deleteApplication(services, providers));
  registerCommand(CommandId.CreateTemplateFromApplication, createTemplateFromApplication(services, providers));
  registerCommand(CommandId.ViewResourceManifest, viewResourceManifest(services));
  registerCommand(CommandId.CreateApplicationFromFolder, createApplicationFromFolder(services));

  // Template commands
  registerCommand(CommandId.RefreshTemplates, refreshTemplates(providers.templatesProvider));
  registerCommand(CommandId.AddTemplate, addTemplate(services, providers));
  registerCommand(CommandId.EditTemplate, editTemplate(_context, services, providers));
  registerCommand(CommandId.CopyTemplate, copyTemplate(providers.templatesProvider));
  registerCommand(CommandId.CopyTemplateYaml, copyTemplateYaml(providers.templatesProvider));
  registerCommand(
    CommandId.CreateApplicationFromTemplate,
    createApplicationFromTemplate(_context, services, providers)
  );
  registerCommand(CommandId.DeleteTemplate, deleteTemplate(providers.templatesProvider));

  // YAML file commands
  registerCommand(CommandId.CreateApplicationFromYaml, (uri: Uri, resource?: any) =>
    createApplicationFromYaml(services.cliService, uri, resource)
  );
  registerCommand(CommandId.CreateApplicationFromYamlContextMenu, (uri: Uri) =>
    createApplicationFromYamlContextMenu(services.cliService, uri)
  );
  // Disabled for now - validate YAML feature
  // registerCommand(CommandId.ValidateYaml, (uri: Uri) => validateYaml(uri));
  registerCommand(CommandId.ScanWorkspaceForArgoCDFiles, () => scanWorkspaceForArgoCDFiles(services.cliService));
  registerCommand(CommandId.ConvertYamlToTemplate, (uri: Uri) =>
    convertYamlToTemplate(uri, providers.templatesProvider)
  );
}

/**
 * Registers vscode extension command.
 * @param commandId Command identifier.
 * @param callback Command handler.
 * @param thisArg The `this` context used when invoking the handler function.
 */
function registerCommand(commandId: string, callback: (...args: any[]) => any, thisArg?: any): void {
  const command: Disposable = commands.registerCommand(
    commandId,
    async (...args) => {
      // Show error in console when it happens in any of the commands registered by this extension.
      // By default VSCode only shows that "Error running command <command>" but not its text.
      try {
        await callback(...args);
      } catch (e: unknown) {
        window.showErrorMessage(String(e));
        console.error(e);
      }
    },
    thisArg
  );

  // When this extension is deactivated the disposables will be disposed.
  _context.subscriptions.push(command);
}
