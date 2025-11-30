import * as vscode from 'vscode';
import { OutputChannelService } from '../../services';
import { ArgocdItem } from '../nodes';

/**
 * Abstract base class for tree data providers
 * Provides common functionality for all providers
 */
export abstract class BaseProvider<T extends ArgocdItem> implements vscode.TreeDataProvider<T> {
    protected outputChannel = OutputChannelService.getInstance();
    protected _onDidChangeTreeData: vscode.EventEmitter<T | undefined | null | void> = 
        new vscode.EventEmitter<T | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<T | undefined | null | void> = 
        this._onDidChangeTreeData.event;

    /**
     * Refresh the tree view
     */
    refresh(): void {
        this.outputChannel.debug(`${this.getProviderName()}: Refreshing tree data`);
        this._onDidChangeTreeData.fire();
    }

    /**
     * Get the tree item for display
     * @param element The element to get the tree item for
     */
    getTreeItem(element: T): T | Thenable<T> {
        this.outputChannel.debug(`${this.getProviderName()}: Getting tree item for ${element.label}`);
        return element;
    }

    /**
     * Get the children of an element
     * @param element The parent element, or undefined for root
     */
    abstract getChildren(element?: T): Promise<T[]>;

    /**
     * Get the name of this provider for logging
     */
    protected abstract getProviderName(): string;
    
    /**
     * Log debug message
     */
    protected logDebug(message: string): void {
        this.outputChannel.debug(`${this.getProviderName()}: ${message}`);
    }

    /**
     * Log info message
     */
    protected logInfo(message: string): void {
        this.outputChannel.info(`${this.getProviderName()}: ${message}`);
    }

    /**
     * Log warning message
     */
    protected logWarn(message: string): void {
        this.outputChannel.warn(`${this.getProviderName()}: ${message}`);
    }

    /**
     * Log error message
     */
    protected logError(message: string, error?: Error): void {
        if (error) {
            this.outputChannel.error(`${this.getProviderName()}: ${message}`, error);
        } else {
            this.outputChannel.error(`${this.getProviderName()}: ${message}`);
        }
    }

    /**
     * Sort items alphabetically by label
     */
    protected sortByLabel(items: T[]): T[] {
        return items.sort((a, b) => {
            const labelA = typeof a.label === 'string' ? a.label : a.label?.label || '';
            const labelB = typeof b.label === 'string' ? b.label : b.label?.label || '';
            return labelA.localeCompare(labelB);
        });
    }
}
