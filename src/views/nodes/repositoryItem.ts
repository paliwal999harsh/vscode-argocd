import * as vscode from 'vscode';
import { ArgocdItem } from './argocdItem';
import { Repository } from '../../model';
import { TooltipHelper, IconUtils, IconThemeUtils } from '../../utils';

/**
 * Base repository item - represents a repository in ArgoCD
 */
export class RepositoryItem extends ArgocdItem {
    constructor(
        public readonly repository: Repository
    ) {
        const displayName = repository.name || repository.repo;
        super(displayName, vscode.TreeItemCollapsibleState.None);
        this.initialize();
    }

    protected getTooltip(): vscode.MarkdownString {
        const properties = new Map<string, string | undefined>([
            ['Name', this.repository.name || 'N/A'],
            ['URL', this.repository.repo],
            ['Type', this.repository.type],
            ['Connection Status', this.repository.connectionState?.status || 'Unknown'],
            ['Username', this.repository.username],
            ['Project', this.repository.project]
        ]);
        return TooltipHelper.createTableTooltip(properties);
    }

    protected getTypeIdentifier(): string {
        // Use repository type to determine icon
        switch (this.repository.type) {
            case 'git': return 'repository-git';
            case 'helm': return 'repository-helm';
            case 'oci': return 'repository-oci';
            default: return 'repository';
        }
    }

    protected getContextValue(): string {
        // All repository types should have the same context value for menus
        return 'repository';
    }

    protected getIconColor(): vscode.ThemeColor | undefined {
        const status = this.getConnectionStatus();
        return IconThemeUtils.getThemeColor('repository', status);
    }

    private getConnectionStatus(): string {
        return this.repository.connectionState?.status || 'Unknown';
    }
}

/**
 * Git repository item
 */
export class GitRepositoryItem extends RepositoryItem {
    constructor(repository: Repository) {
        super(repository);
    }

    protected getTypeIdentifier(): string {
        return 'repository-git';
    }
}

/**
 * Helm repository item
 */
export class HelmRepositoryItem extends RepositoryItem {
    constructor(repository: Repository) {
        super(repository);
    }

    protected getTypeIdentifier(): string {
        return 'repository-helm';
    }
}

/**
 * OCI repository item
 */
export class OCIRepositoryItem extends RepositoryItem {
    constructor(repository: Repository) {
        super(repository);
    }

    protected getTypeIdentifier(): string {
        return 'repository-oci';
    }
}

/**
 * Error item for sources view
 */
export class RepositoryErrorItem extends ArgocdItem {
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

/**
 * Factory function to create the appropriate repository item based on type
 */
export function createRepositoryItem(repository: Repository): RepositoryItem {
    switch (repository.type) {
        case 'git':
            return new GitRepositoryItem(repository);
        case 'helm':
            return new HelmRepositoryItem(repository);
        case 'oci':
            return new OCIRepositoryItem(repository);
        default:
            return new RepositoryItem(repository);
    }
}
