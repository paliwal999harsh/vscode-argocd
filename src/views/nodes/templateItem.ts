import * as vscode from 'vscode';
import { ArgocdItem } from './argocdItem';
import { TooltipHelper, IconUtils } from '../../utils';

export interface ApplicationTemplate {
  id: string;
  name: string;
  type: 'application' | 'applicationset';
  description?: string;
  template: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Base template item
 */
export class TemplateItem extends ArgocdItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly templateType: string,
    public readonly template?: ApplicationTemplate
  ) {
    super(label, collapsibleState);
    this.initialize();
  }

  protected getTooltip(): vscode.MarkdownString {
    switch (this.templateType) {
      case 'template': {
        if (!this.template) {
          const markdown = new vscode.MarkdownString();
          markdown.appendText(this.label);
          return markdown;
        }

        const properties = new Map<string, string | undefined>([
          ['Name', this.template.name],
          ['Type', this.template.type],
          ['Description', this.template.description],
          ['Created', new Date(this.template.createdAt).toLocaleString()],
          ['Updated', new Date(this.template.updatedAt).toLocaleString()]
        ]);
        return TooltipHelper.createTableTooltip(properties);
      }
      case 'empty': {
        const emptyMarkdown = new vscode.MarkdownString();
        emptyMarkdown.appendText('Create templates from existing applications or from scratch');
        return emptyMarkdown;
      }
      default: {
        const defaultMarkdown = new vscode.MarkdownString();
        defaultMarkdown.appendText(this.label);
        return defaultMarkdown;
      }
    }
  }

  protected getTypeIdentifier(): string {
    return this.templateType;
  }

  protected getIcon(): vscode.ThemeIcon {
    const iconName = IconUtils.getIcon(this.getTypeIdentifier());
    const color = this.getIconColor();
    return new vscode.ThemeIcon(iconName, color);
  }
}
