import * as vscode from 'vscode';
import { ArgocdItem } from './argocdItem';
import { Cluster } from '../../model';
import { TooltipHelper, IconThemeUtils } from '../../utils';

/**
 * Base cluster item - represents a Kubernetes cluster in ArgoCD
 */
export class ClusterItem extends ArgocdItem {
    constructor(
        public readonly cluster: Cluster
    ) {
        super(cluster.name, vscode.TreeItemCollapsibleState.Collapsed);
        this.initialize();
    }

    protected getTooltip(): vscode.MarkdownString {
        const connectionState = this.cluster.connectionState || this.cluster.info?.connectionState;
        const properties = new Map<string, string | undefined>([
            ['Name', this.cluster.name],
            ['Server', this.cluster.server],
            ['Status', connectionState?.status || 'Unknown'],
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
}

/**
 * Cluster server information item
 */
export class ClusterServerItem extends ArgocdItem {
    constructor(
        public readonly server: string,
        public readonly cluster: Cluster
    ) {
        super(`Server: ${server}`, vscode.TreeItemCollapsibleState.None);
        this.initialize();
    }

    protected getTooltip(): string {
        return `Server URL: ${this.server}`;
    }

    protected getTypeIdentifier(): string {
        return 'server-info';
    }
}

/**
 * Cluster version information item
 */
export class ClusterVersionItem extends ArgocdItem {
    constructor(
        public readonly version: string,
        public readonly cluster: Cluster
    ) {
        super(`Version: ${version}`, vscode.TreeItemCollapsibleState.None);
        this.initialize();
    }

    protected getTooltip(): string {
        return `Kubernetes Version: ${this.version}`;
    }

    protected getTypeIdentifier(): string {
        return 'version-info';
    }
}

/**
 * Cluster status information item
 */
export class ClusterStatusItem extends ArgocdItem {
    constructor(
        public readonly status: string,
        public readonly message: string | undefined,
        public readonly cluster: Cluster
    ) {
        const label = `Status: ${status}${message ? ` - ${message}` : ''}`;
        super(label, vscode.TreeItemCollapsibleState.None);
        this.initialize();
    }

    protected getTooltip(): string {
        return this.message 
            ? `Connection Status: ${this.status}\nMessage: ${this.message}`
            : `Connection Status: ${this.status}`;
    }

    protected getTypeIdentifier(): string {
        return 'status-info';
    }

    protected getIconColor(): vscode.ThemeColor | undefined {
        return IconThemeUtils.getThemeColor('cluster', this.status);
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
        super(`Applications: ${count}`, vscode.TreeItemCollapsibleState.None);
        this.initialize();
    }

    protected getTooltip(): string {
        return `Number of Applications: ${this.count}`;
    }

    protected getTypeIdentifier(): string {
        return 'applications-info';
    }
}

/**
 * Cluster TLS configuration item
 */
export class ClusterTLSItem extends ArgocdItem {
    constructor(
        public readonly insecure: boolean | undefined,
        public readonly cluster: Cluster
    ) {
        const status = insecure ? 'Insecure (Skip Verify)' : 'Secure (Verify)';
        super(`TLS: ${status}`, vscode.TreeItemCollapsibleState.None);
        this.initialize();
    }

    protected getTooltip(): string {
        return this.insecure 
            ? 'TLS verification is disabled (insecure)'
            : 'TLS verification is enabled';
    }

    protected getTypeIdentifier(): string {
        return 'tls-info';
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
        const label = namespace ? `${appName} (${namespace})` : appName;
        super(label, vscode.TreeItemCollapsibleState.None);
        this.initialize();
        this.command = {
            command: 'argocd.viewApplicationDetails',
            title: 'View Application',
            arguments: [{ name: appName, namespace }]
        };
    }

    protected getTooltip(): string {
        return this.namespace 
            ? `Application: ${this.appName}\nNamespace: ${this.namespace}`
            : `Application: ${this.appName}`;
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
    constructor(
        message: string
    ) {
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
