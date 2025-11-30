import * as vscode from 'vscode';
import { IconThemeUtils, IconUtils } from '../../utils';

/**
 * Base abstract class for all ArgoCD tree items
 * Uses class name for identification instead of type field
 */
export abstract class ArgocdItem extends vscode.TreeItem {
    constructor(
        public readonly label: string | vscode.TreeItemLabel,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }

    /**
     * Initialize tooltip, context value, and icon
     * This must be called by child classes after their properties are set
     */
    protected initialize(): void {
        this.tooltip = this.getTooltip();
        this.contextValue = this.getContextValue();
        this.iconPath = this.getIcon();
    }

    /**
     * Get the type identifier based on class name
     * Override this in subclasses if you need custom type identification
     */
    protected getTypeIdentifier(): string {
        return this.constructor.name.replace('Item', '').toLowerCase();
    }

    protected abstract getTooltip(): string | vscode.MarkdownString;

    protected getContextValue(): string {
        return this.getTypeIdentifier();
    }

    protected getIcon(): vscode.ThemeIcon {
        const iconName = IconUtils.getIcon(this.getTypeIdentifier());
        const color = this.getIconColor();
        return new vscode.ThemeIcon(iconName, color);
    }

    protected getIconColor(): vscode.ThemeColor | undefined {
        return IconThemeUtils.getThemeColor(this.getTypeIdentifier());
    }
}
