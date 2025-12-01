import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { BaseProvider } from './baseProvider';
import { TemplateItem, ApplicationTemplate } from '../nodes';
import { AppService } from '../../services';
import { ContextKeys } from '../../utils';

/**
 * Tree data provider for ArgoCD application templates.
 * Manages reusable templates for creating applications from common patterns.
 * Supports built-in templates (Helm, Kustomize, Git, Directory) and custom user templates.
 */
export class TemplatesProvider extends BaseProvider<TemplateItem> {
  private templates: ApplicationTemplate[] = [];

  constructor(
    private appService: AppService,
    private context: vscode.ExtensionContext
  ) {
    super();
    this.logDebug('Initializing');
    this.loadTemplates();
    this.loadDefaultTemplatesIfNeeded();
  }

  protected getProviderName(): string {
    return 'TemplatesProvider';
  }

  private async loadDefaultTemplatesIfNeeded(): Promise<void> {
    this.logDebug('Checking if default templates need to be loaded');
    // Check if default templates already loaded
    const defaultsLoaded = this.context.globalState.get<boolean>('argocd.defaultTemplatesLoaded', false);

    if (!defaultsLoaded) {
      this.logInfo('Loading default templates');
      await this.loadDefaultTemplates();
      await this.context.globalState.update('argocd.defaultTemplatesLoaded', true);
    } else {
      this.logDebug('Default templates already loaded');
    }
  }

  private async loadDefaultTemplates(): Promise<void> {
    try {
      const extensionPath = this.context.extensionPath;
      const templatesPath = path.join(extensionPath, 'resources', 'templates');

      const templateFiles = [
        {
          file: 'directory-app.yaml',
          name: 'Directory Application',
          description: 'Application using plain directory with Kubernetes manifests'
        },
        { file: 'helm-app.yaml', name: 'Helm Application', description: 'Application using Helm chart with values' },
        {
          file: 'kustomize-app.yaml',
          name: 'Kustomize Application',
          description: 'Application using Kustomize with patches and overlays'
        }
      ];

      this.logInfo(`Loading ${templateFiles.length} default template(s) from ${templatesPath}`);

      for (const { file, name, description } of templateFiles) {
        const filePath = path.join(templatesPath, file);
        if (fs.existsSync(filePath)) {
          const yamlContent = fs.readFileSync(filePath, 'utf-8');
          // Simple YAML to JSON conversion (basic parser)
          const template = this.parseYaml(yamlContent);

          const appTemplate: ApplicationTemplate = {
            id: `default-${crypto.randomUUID()}`,
            name: name,
            type: 'application',
            description: description,
            template: template,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          this.templates.push(appTemplate);
          this.logDebug(`Loaded template ${name}`);
        } else {
          this.logWarn(`Template file not found: ${filePath}`);
        }
      }

      await this.saveTemplates();
      this.refresh();
      this.logInfo(`Successfully loaded ${this.templates.length} default template(s)`);
    } catch (error) {
      this.logError('Failed to load default templates', error as Error);
    }
  }

  private parseYaml(yamlContent: string): any {
    try {
      return yaml.load(yamlContent);
    } catch (error) {
      console.error('Failed to parse YAML:', error);
      return {};
    }
  }

  getTemplateAsYaml(template: ApplicationTemplate): string {
    if (typeof template.template === 'string') {
      return template.template;
    }
    return yaml.dump(template.template, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
  }

  refresh(): void {
    super.refresh();
    ContextKeys.hasTemplates(this.templates.length !== 0);
  }

  async getChildren(element?: TemplateItem): Promise<TemplateItem[]> {
    this.logDebug('Getting children (templates)');

    if (!element) {
      // Root level - show application templates (only applications for now)
      const applicationTemplates = this.templates.filter((t) => t.type === 'application');
      await ContextKeys.hasTemplates(applicationTemplates.length !== 0);

      this.logInfo(`Displaying ${applicationTemplates.length} template(s)`);

      if (applicationTemplates.length === 0) {
        return [];
      }

      const items = applicationTemplates.map(
        (template) => new TemplateItem(template.name, vscode.TreeItemCollapsibleState.None, 'template', template)
      );

      // Sort templates alphabetically
      return this.sortByLabel(items);
    }
    return [];
  }

  private loadTemplates(): void {
    this.logDebug('Loading templates from global state');
    const stored = this.context.globalState.get<ApplicationTemplate[]>('argocd.templates', []);
    this.templates = stored;
    this.logInfo(`Loaded ${this.templates.length} template(s) from storage`);
  }

  private async saveTemplates(): Promise<void> {
    this.logDebug(`Saving ${this.templates.length} template(s) to global state`);
    await this.context.globalState.update('argocd.templates', this.templates);
    this.logInfo('Templates saved successfully');
  }

  async addTemplate(template: ApplicationTemplate): Promise<void> {
    this.logInfo(`Adding template ${template.name}`);
    this.templates.push(template);
    await this.saveTemplates();
    this.refresh();
  }

  async updateTemplate(id: string, updates: Partial<ApplicationTemplate>): Promise<void> {
    this.logInfo(`Updating template ${id}`);
    const index = this.templates.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.templates[index] = {
        ...this.templates[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await this.saveTemplates();
      this.refresh();
      this.logInfo(`Template ${id} updated successfully`);
    } else {
      this.logWarn(`Template ${id} not found for update`);
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    this.logInfo(`Deleting template ${id}`);
    this.templates = this.templates.filter((t) => t.id !== id);
    await this.saveTemplates();
    this.refresh();
    this.logInfo(`Template ${id} deleted successfully`);
  }

  getTemplate(id: string): ApplicationTemplate | undefined {
    this.logDebug(`Getting template ${id}`);
    return this.templates.find((t) => t.id === id);
  }

  getAllTemplates(): ApplicationTemplate[] {
    return [...this.templates];
  }
}
