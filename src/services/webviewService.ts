import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AppService } from './argocd/appService';
import { ClusterService } from './argocd/clusterService';
import { RepoService } from './argocd/repoService';
import { ArgocdCliService } from './cli/argocdCliService';
import { OutputChannelService } from './outputChannel';

export class WebviewService {
    private outputChannel = OutputChannelService.getInstance();
    private context: vscode.ExtensionContext;
    private appService: AppService;
    private clusterService: ClusterService;
    private repoService: RepoService;
    private cliService: ArgocdCliService;

    constructor(
        context: vscode.ExtensionContext, 
        appService: AppService,
        clusterService: ClusterService,
        repoService: RepoService,
        cliService: ArgocdCliService
    ) {
        this.outputChannel.debug('WebviewService: Initializing');
        this.context = context;
        this.appService = appService;
        this.clusterService = clusterService;
        this.repoService = repoService;
        this.cliService = cliService;
    }

    /**
     * Creates a webview panel with common configuration
     */
    private createWebviewPanel(
        viewType: string,
        title: string,
        options?: vscode.WebviewPanelOptions & vscode.WebviewOptions
    ): vscode.WebviewPanel {
        return vscode.window.createWebviewPanel(
            viewType,
            title,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(this.context.extensionPath, 'resources', 'webview'))
                ],
                ...options
            }
        );
    }

    /**
     * Loads HTML content and replaces placeholders
     */
    private getHtmlContent(
        webview: vscode.Webview,
        htmlFile: string,
        cssFile: string,
        jsFile: string
    ): string {
        const htmlPath = path.join(this.context.extensionPath, 'resources', 'webview', 'html', htmlFile);
        const cssPath = path.join(this.context.extensionPath, 'resources', 'webview', 'css', cssFile);
        const jsPath = path.join(this.context.extensionPath, 'resources', 'webview', 'js', jsFile);

        const cssUri = webview.asWebviewUri(vscode.Uri.file(cssPath));
        const jsUri = webview.asWebviewUri(vscode.Uri.file(jsPath));

        let html = fs.readFileSync(htmlPath, 'utf8');
        
        // Replace placeholders
        html = html.replace(/\{\{cssUri\}\}/g, cssUri.toString());
        html = html.replace(/\{\{jsUri\}\}/g, jsUri.toString());
        html = html.replace(/\{\{cspSource\}\}/g, webview.cspSource);

        return html;
    }

    async showAddRepositoryForm(): Promise<void> {
        this.outputChannel.info('WebviewService: Showing add repository form');
        
        const panel = this.createWebviewPanel('addRepository', 'Add Repository');
        panel.webview.html = this.getHtmlContent(
            panel.webview,
            'add-repository.html',
            'forms.css',
            'add-repository.js'
        );

        panel.webview.onDidReceiveMessage(
            async (message) => {
                this.outputChannel.debug(`WebviewService: Received message from add repository form: ${message.command}`);
                switch (message.command) {
                    case 'addRepository':
                        try {
                            this.outputChannel.info(`WebviewService: Adding repository ${message.data.name || message.data.url}`);
                            await this.handleAddRepository(message.data);
                            this.outputChannel.info('WebviewService: Repository added successfully');
                            vscode.window.showInformationMessage(`Repository '${message.data.name || message.data.url}' added successfully`);
                            panel.dispose();
                        } catch (error) {
                            this.outputChannel.error('WebviewService: Failed to add repository', error as Error);
                            vscode.window.showErrorMessage(`Failed to add repository: ${error}`);
                        }
                        break;
                    case 'cancel':
                        this.outputChannel.debug('WebviewService: Add repository form cancelled');
                        panel.dispose();
                        break;
                    case 'getProjects':
                        const projects = await this.appService.getProjects();
                        panel.webview.postMessage({ command: 'projectsLoaded', data: projects });
                        break;
                    case 'selectFile':
                        const fileUri = await vscode.window.showOpenDialog({
                            canSelectFiles: true,
                            canSelectFolders: false,
                            canSelectMany: false,
                            openLabel: message.data.label
                        });
                        if (fileUri && fileUri[0]) {
                            panel.webview.postMessage({ 
                                command: 'fileSelected', 
                                data: { 
                                    field: message.data.field,
                                    path: fileUri[0].fsPath 
                                }
                            });
                        }
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    async showCreateApplicationForm(prefilledRepoUrl?: string, templateData?: any): Promise<void> {
        this.outputChannel.info('WebviewService: Showing create application form');
        
        const panel = this.createWebviewPanel('createApplication', 'Create Application');

        // Get data for dropdowns
        this.outputChannel.debug('WebviewService: Fetching initial data for create application form');
        const [repositories, clusters, projects] = await Promise.all([
            this.repoService.getRepositories(),
            this.clusterService.getClusters(),
            this.appService.getProjects()
        ]);

        panel.webview.html = this.getHtmlContent(
            panel.webview,
            'create-application.html',
            'forms.css',
            'create-application.js'
        );

        // Send initial data
        panel.webview.onDidReceiveMessage(
            async (message) => {
                this.outputChannel.debug(`WebviewService: Received message from create application form: ${message.command}`);
                switch (message.command) {
                    case 'loadInitialData':
                        this.outputChannel.debug('WebviewService: Sending initial data to create application form');
                        panel.webview.postMessage({
                            command: 'initialDataLoaded',
                            data: {
                                repositories: repositories.map((r: any) => ({ url: r.repo, type: r.type, name: r.name })),
                                clusters: clusters.map((c: any) => ({ name: c.name, server: c.server })),
                                projects,
                                prefilledRepoUrl,
                                templateData
                            }
                        });
                        break;
                    case 'createApplication':
                        try {
                            this.outputChannel.info(`WebviewService: Creating application ${message.data.name}`);
                            await this.handleCreateApplication(message.data);
                            this.outputChannel.info('WebviewService: Application created successfully');
                            vscode.window.showInformationMessage(`Application '${message.data.name}' created successfully`);
                            panel.dispose();
                        } catch (error) {
                            this.outputChannel.error('WebviewService: Failed to create application', error as Error);
                            vscode.window.showErrorMessage(`Failed to create application: ${error}`);
                        }
                        break;
                    case 'cancel':
                        this.outputChannel.debug('WebviewService: Create application form cancelled');
                        panel.dispose();
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    async showApplicationHistory(appName: string): Promise<void> {
        this.outputChannel.info(`WebviewService: Showing history for application ${appName}`);
        
        const panel = this.createWebviewPanel('appHistory', `History: ${appName}`);
        panel.webview.html = this.getHtmlContent(
            panel.webview,
            'app-history.html',
            'app-history.css',
            'app-history.js'
        );

        panel.webview.onDidReceiveMessage(
            async (message) => {
                this.outputChannel.debug(`WebviewService: Received message from history panel: ${message.command}`);
                switch (message.command) {
                    case 'loadHistory':
                        try {
                            const historyData = await this.appService.getApplicationHistory(appName);
                            panel.webview.postMessage({ 
                                command: 'historyLoaded', 
                                data: {
                                    appName: appName,
                                    history: historyData
                                }
                            });
                        } catch (error) {
                            this.outputChannel.error('WebviewService: Failed to load history', error as Error);
                            panel.webview.postMessage({ 
                                command: 'error', 
                                message: `Failed to load history: ${error}`
                            });
                        }
                        break;
                    case 'viewManifest':
                        try {
                            const manifest = await this.appService.getApplicationManifestAtRevision(appName, message.id);
                            const doc = await vscode.workspace.openTextDocument({ 
                                content: manifest, 
                                language: 'yaml' 
                            });
                            await vscode.window.showTextDocument(doc);
                        } catch (error) {
                            this.outputChannel.error('WebviewService: Failed to view manifest', error as Error);
                            vscode.window.showErrorMessage(`Failed to view manifest: ${error}`);
                        }
                        break;
                    case 'rollback':
                        try {
                            const confirm = await vscode.window.showWarningMessage(
                                `Are you sure you want to rollback application '${appName}' to history ID ${message.id}?`,
                                { modal: true },
                                'Rollback'
                            );
                            if (confirm === 'Rollback') {
                                await this.appService.rollbackApplication(appName, message.id);
                                vscode.window.showInformationMessage(`Application '${appName}' rolled back to history ID ${message.id}`);
                                // Reload history
                                panel.webview.postMessage({ command: 'reload' });
                            }
                        } catch (error) {
                            this.outputChannel.error('WebviewService: Failed to rollback', error as Error);
                            vscode.window.showErrorMessage(`Failed to rollback: ${error}`);
                        }
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private async handleAddRepository(data: any): Promise<void> {
        this.outputChannel.debug(`WebviewService: Building add repository command for ${data.url}`);
        let command = `repo add "${data.url}" --type ${data.type}`;

        if (data.name) {
            command += ` --name "${data.name}"`;
        }

        // Authentication
        if (data.auth.type === 'username' && data.auth.username && data.auth.password) {
            command += ` --username "${data.auth.username}" --password "${data.auth.password}"`;
        } else if (data.auth.type === 'sshKey' && data.auth.sshKeyPath) {
            command += ` --ssh-private-key-path "${data.auth.sshKeyPath}"`;
        } else if (data.auth.type === 'bearerToken' && data.auth.bearerToken) {
            command += ` --bearer-token "${data.auth.bearerToken}"`;
        } else if (data.auth.type === 'githubApp' && data.auth.githubApp) {
            const app = data.auth.githubApp;
            command += ` --github-app-id ${app.appId} --github-app-installation-id ${app.installationId} --github-app-private-key-path "${app.privateKeyPath}"`;
            if (app.enterpriseUrl) {
                command += ` --github-app-enterprise-base-url "${app.enterpriseUrl}"`;
            }
        } else if (data.auth.type === 'gcpServiceAccount' && data.auth.gcpKeyPath) {
            command += ` --gcp-service-account-key-path "${data.auth.gcpKeyPath}"`;
        }

        // Security options
        if (data.security.skipTlsVerification) {
            command += ' --insecure-skip-server-verification';
        }
        if (data.security.enableLfs) {
            command += ' --enable-lfs';
        }
        if (data.security.forceBasicAuth) {
            command += ' --force-http-basic-auth';
        }
        if (data.security.enableOci) {
            command += ' --enable-oci';
        }
        if (data.security.forceHttp) {
            command += ' --insecure-oci-force-http';
        }

        // TLS client certificates
        if (data.security.tlsClientCertPath && data.security.tlsClientKeyPath) {
            command += ` --tls-client-cert-path "${data.security.tlsClientCertPath}" --tls-client-cert-key-path "${data.security.tlsClientKeyPath}"`;
        }

        // Project
        if (data.project) {
            command += ` --project "${data.project}"`;
        }

        this.outputChannel.debug('WebviewService: Executing add repository command');
        await this.cliService.executeCommand(command);
    }

    private async handleCreateApplication(data: any): Promise<void> {
        this.outputChannel.debug(`WebviewService: Building create application command for ${data.name}`);
        let command = `app create "${data.name}" --repo "${data.repository}"`;

        // Handle different repository types
        if (data.repoType === 'helm') {
            command += ` --helm-chart "${data.helmChart}"`;
            if (data.chartVersion) {
                command += ` --revision "${data.chartVersion}"`;
            }
            // Helm values
            if (data.helmValues && data.helmValues.length > 0) {
                data.helmValues.forEach((value: any) => {
                    if (value.key && value.value) {
                        command += ` --helm-set "${value.key}=${value.value}"`;
                    }
                });
            }
        } else if (data.repoType === 'oci') {
            command += ` --helm-chart "${data.helmChart}"`;
        } else {
            // Git repository
            command += ` --path "${data.path}"`;
            
            // Source type specific options
            if (data.sourceType === 'helm' && data.helmValues && data.helmValues.length > 0) {
                data.helmValues.forEach((value: any) => {
                    if (value.key && value.value) {
                        command += ` --helm-set "${value.key}=${value.value}"`;
                    }
                });
            } else if (data.sourceType === 'kustomize' && data.kustomizeImage) {
                command += ` --kustomize-image "${data.kustomizeImage}"`;
            } else if (data.sourceType === 'directory' && data.directoryRecurse) {
                command += ' --directory-recurse';
            }
        }

        command += ` --dest-server "${data.cluster}" --dest-namespace "${data.namespace}" --project "${data.project}"`;
        command += ` --sync-option CreateNamespace=true`;

        this.outputChannel.debug('WebviewService: Executing create application command');
        await this.cliService.executeCommand(command);
    }

}
