import * as vscode from 'vscode';
import { ArgocdItem } from './argocdItem';
import { Application, ApplicationResource, Cluster, Repository } from '../../model';
import { TooltipHelper, IconThemeUtils } from '../../utils';

/**
 * Base application item - represents an ArgoCD Application
 */
export class ApplicationItem extends ArgocdItem {
  // Cache for manifests - loaded lazily on first resource click
  public manifestsCache?: Map<string, any>;

  constructor(
    public readonly application: Application,
    private readonly clusters: Cluster[] = [],
    private readonly repositories: Repository[] = []
  ) {
    super(application.metadata.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.initialize();
  }

  protected getTooltip(): vscode.MarkdownString {
    const app = this.application;

    // Find cluster name from cluster list
    let serverDisplay = app.spec?.destination?.server || 'Unknown';
    const cluster = this.clusters.find((c) => c.server === app.spec?.destination?.server);
    if (cluster) {
      serverDisplay = cluster.name;
    } else if (app.spec?.destination?.server === 'https://kubernetes.default.svc') {
      serverDisplay = 'in-cluster';
    }

    // Find repository name from repository list
    let repoDisplay = app.spec?.source?.repoURL;
    const repo = this.repositories.find((r) => r.repo === app.spec?.source?.repoURL);
    if (repo?.name) {
      repoDisplay = repo.name;
    }

    const properties = new Map<string, string | undefined>([
      ['Name', app.metadata.name],
      ['Health', app.status?.health?.status || 'Unknown'],
      ['Sync Status', app.status?.sync?.status || 'Unknown'],
      ['Project', app.spec?.project || 'Unknown'],
      ['Namespace', app.spec?.destination?.namespace || 'Unknown'],
      ['Server', serverDisplay],
      ['Repository', repoDisplay],
      ['Path', app.spec?.source?.path],
      ['Revision', app.spec?.source?.targetRevision]
    ]);
    return TooltipHelper.createTableTooltip(properties);
  }

  protected getIconColor(): vscode.ThemeColor | undefined {
    const health = this.application.status?.health?.status;
    const sync = this.application.status?.sync?.status;
    return IconThemeUtils.getThemeColor(this.getTypeIdentifier(), health || sync);
  }
  protected getContextValue(): string {
    // All repository types should have the same context value for menus
    return 'application';
  }
  protected getTypeIdentifier(): string {
    return 'application';
  }
}

/**
 * ApplicationSet item - represents an ArgoCD ApplicationSet
 */
export class ApplicationSetItem extends ArgocdItem {
  constructor(
    public readonly name: string,
    public readonly applicationSetData: any
  ) {
    super(name, vscode.TreeItemCollapsibleState.Collapsed);
    this.initialize();
  }

  protected getTooltip(): vscode.MarkdownString {
    const properties = new Map<string, string | undefined>([
      ['Name', this.name],
      ['Type', 'ApplicationSet']
    ]);
    return TooltipHelper.createTableTooltip(properties);
  }

  protected getTypeIdentifier(): string {
    return 'applicationset';
  }
}

/**
 * Application health status item
 */
export class ApplicationHealthItem extends ArgocdItem {
  constructor(
    public readonly status: string,
    public readonly application: Application
  ) {
    super(`Health: ${status}`, vscode.TreeItemCollapsibleState.None);
    this.initialize();
  }

  protected getTooltip(): string {
    return `Health Status: ${this.status}`;
  }

  protected getTypeIdentifier(): string {
    return 'health-status';
  }

  protected getIconColor(): vscode.ThemeColor | undefined {
    return IconThemeUtils.getThemeColor(this.getTypeIdentifier(), this.status);
  }
}

/**
 * Application sync status item
 */
export class ApplicationSyncItem extends ArgocdItem {
  constructor(
    public readonly status: string,
    public readonly revision: string | undefined,
    public readonly application: Application
  ) {
    const label = `Sync: ${status}`;
    super(label, vscode.TreeItemCollapsibleState.None);
    this.initialize();
  }

  protected getTooltip(): string {
    return this.revision ? `Revision: ${this.revision}` : '';
  }

  protected getTypeIdentifier(): string {
    return 'sync-status';
  }

  protected getIconColor(): vscode.ThemeColor | undefined {
    return IconThemeUtils.getThemeColor(this.getTypeIdentifier(), this.status);
  }
}

/**
 * Namespace group item - groups resources by namespace
 */
export class NamespaceGroupItem extends ArgocdItem {
  constructor(
    public readonly namespace: string,
    public readonly resources: ApplicationResource[]
  ) {
    const label = `Namespace: ${namespace} (${resources.length})`;
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.initialize();
  }

  protected getTooltip(): vscode.MarkdownString {
    const properties = new Map<string, string | undefined>([
      ['Namespace', this.namespace],
      ['Resource Count', this.resources.length.toString()]
    ]);
    return TooltipHelper.createTableTooltip(properties);
  }

  protected getTypeIdentifier(): string {
    return 'namespace-group';
  }
}

/**
 * Kind group item - groups resources by kind
 */
export class KindGroupItem extends ArgocdItem {
  constructor(
    public readonly kind: string,
    public readonly resources: ApplicationResource[]
  ) {
    const label = `${kind} (${resources.length})`;
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.initialize();
  }

  protected getTooltip(): vscode.MarkdownString {
    const properties = new Map<string, string | undefined>([
      ['Kind', this.kind],
      ['Count', this.resources.length.toString()]
    ]);
    return TooltipHelper.createTableTooltip(properties);
  }

  protected getTypeIdentifier(): string {
    return 'kind-group';
  }
}

/**
 * Resource item - represents a Kubernetes resource managed by an application
 */
export class ResourceItem extends ArgocdItem {
  constructor(public readonly resource: ApplicationResource & { _parentApp?: ApplicationItem }) {
    const name = resource.name;
    super(name, vscode.TreeItemCollapsibleState.None);
    this.initialize();

    // Set the command to view manifest when clicked
    this.command = {
      command: 'argocd.resource.viewManifest',
      title: 'View Resource Manifest',
      arguments: [this]
    };
  }

  protected getTooltip(): vscode.MarkdownString {
    const properties = new Map<string, string | undefined>([
      ['Name', this.resource.name],
      ['Kind', this.resource.kind],
      ['Namespace', this.resource.namespace],
      ['Health', this.resource.health?.status],
      ['Sync Status', this.resource.status],
      ['Sync Wave', this.resource.syncWave?.toString()]
    ]);
    return TooltipHelper.createTableTooltip(properties);
  }

  protected getIconColor(): vscode.ThemeColor | undefined {
    const health = this.resource.health?.status;
    return IconThemeUtils.getThemeColor(this.getTypeIdentifier(), health);
  }
  protected getTypeIdentifier(): string {
    return 'resource';
  }
}

/**
 * Error item for Application view
 */
export class ApplicationErrorItem extends ArgocdItem {
  constructor(message: string) {
    super(message, vscode.TreeItemCollapsibleState.None);
    this.initialize();
  }

  protected getTooltip(): string {
    return 'Please configure ArgoCD connection';
  }

  protected getTypeIdentifier(): string {
    return 'error';
  }
}
