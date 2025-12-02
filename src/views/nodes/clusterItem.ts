import * as vscode from 'vscode';
import { ArgocdItem } from './argocdItem';
import { Cluster } from '../../model';
import { TooltipHelper, IconThemeUtils } from '../../utils';

/**
 * Base cluster item - represents a Kubernetes cluster in ArgoCD
 */
export class ClusterItem extends ArgocdItem {
  constructor(public readonly cluster: Cluster) {
    super(cluster.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.initialize();
  }

  protected getTooltip(): vscode.MarkdownString {
    const connectionState = this.cluster.connectionState || this.cluster.info?.connectionState;
    const properties = new Map<string, string | undefined>([
      ['Name', this.cluster.name],
      ['Server', this.cluster.server],
      ['Kubernetes Version', this.cluster.serverVersion || 'Unknown'],
      ['Status', connectionState?.status || 'Unknown'],
      ['TLS', this.cluster.config?.tlsClientConfig?.insecure ? 'Insecure' : 'Secure']
    ]);

    if (connectionState?.message) {
      properties.set('Message', connectionState.message);
    }

    const appsCount = this.cluster.info?.applicationsCount;
    if (appsCount !== undefined) {
      properties.set('Applications', appsCount.toString());
    }

    return TooltipHelper.createTableTooltip(properties);
  }

  protected getIconColor(): vscode.ThemeColor | undefined {
    const connectionState = this.cluster.connectionState || this.cluster.info?.connectionState;
    const status = connectionState?.status || 'Unknown';
    return IconThemeUtils.getThemeColor(this.getTypeIdentifier(), status);
  }
  protected getContextValue(): string {
    // All repository types should have the same context value for menus
    return 'cluster';
  }
  protected getTypeIdentifier(): string {
    return 'cluster';
  }
}

/**
 * Cluster applications count item
 */
export class ClusterApplicationsItem extends ArgocdItem {
  constructor(
    public readonly count: number,
    public readonly cluster: Cluster
  ) {
    super(`Applications: ${count}`, vscode.TreeItemCollapsibleState.Collapsed);
    this.initialize();
  }

  protected getTooltip(): vscode.MarkdownString {
    const properties = new Map<string, string | undefined>([['Number of Applications', `${this.count}`]]);
    return TooltipHelper.createTableTooltip(properties);
  }

  protected getTypeIdentifier(): string {
    return 'applications-info';
  }
}

/**
 * Cluster cache information item
 */
export class ClusterCacheItem extends ArgocdItem {
  constructor(
    public readonly resourcesCount: number | undefined,
    public readonly apisCount: number | undefined,
    public readonly lastSyncTime: string | undefined,
    public readonly cluster: Cluster
  ) {
    super('Cache Info', vscode.TreeItemCollapsibleState.Collapsed);
    this.initialize();
  }

  protected getTooltip(): vscode.MarkdownString {
    const properties = new Map<string, string | undefined>([
      ['Resources', this.resourcesCount?.toString() || 'N/A'],
      ['APIs', this.apisCount?.toString() || 'N/A'],
      ['Last Sync', this.lastSyncTime || 'N/A']
    ]);
    return TooltipHelper.createTableTooltip(properties);
  }

  protected getTypeIdentifier(): string {
    return 'cache-info';
  }
}

/**
 * Cluster cache detail item (child of ClusterCacheItem)
 */
export class ClusterCacheDetailItem extends ArgocdItem {
  constructor(
    label: string,
    public readonly value: string | number | undefined
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.initialize();
  }

  protected getTooltip(): string {
    return `${this.label}`;
  }

  protected getTypeIdentifier(): string {
    return 'cache-detail';
  }
}

/**
 * Cluster application reference item
 */
export class ClusterApplicationRefItem extends ArgocdItem {
  constructor(
    public readonly appName: string,
    public readonly namespace: string | undefined,
    public readonly cluster: Cluster
  ) {
    const label = namespace ? `${appName} (namespace: ${namespace})` : appName;
    super(label, vscode.TreeItemCollapsibleState.None);
    this.initialize();
  }

  protected getTooltip(): vscode.MarkdownString {
    const properties = new Map<string, string | undefined>([
      ['Application', this.appName],
      ['Namespace', this.namespace]
    ]);
    return TooltipHelper.createTableTooltip(properties);
  }

  protected getTypeIdentifier(): string {
    return 'application-ref';
  }

  protected getContextValue(): string {
    return 'application';
  }
}

/**
 * Error item for clusters view
 */
export class ClusterErrorItem extends ArgocdItem {
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
