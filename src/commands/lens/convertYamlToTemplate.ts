import * as vscode from 'vscode';
import * as fs from 'fs';
import { OutputChannelService } from '../../services';
import { YamlHelper, ErrorHelper } from '../../utils/helpers';

const outputChannel = OutputChannelService.getInstance();
/**
 * Converts a YAML file to an ArgoCD application template
 * @param uri File URI
 * @param templatesProvider Templates provider for refresh
 */
export async function convertYamlToTemplate(
    uri: vscode.Uri,
    templatesProvider?: any
): Promise<void> {
    try {
        outputChannel.info(`Converting YAML file to template: ${uri.fsPath}`);

        // Read the file content
        const content = fs.readFileSync(uri.fsPath, 'utf-8');

        // Validate YAML first
        const validation = YamlHelper.validateYaml(content);
        if (!validation.valid) {
            vscode.window.showErrorMessage(`Invalid YAML: ${validation.error}`);
            return;
        }

        // Detect ArgoCD resources
        const resources = YamlHelper.detectArgoCDResources(content);
        
        if (resources.length === 0) {
            vscode.window.showWarningMessage(
                'No ArgoCD Application or ApplicationSet resources found in this file.'
            );
            return;
        }

        // If multiple resources, let user choose
        let selectedResource = resources[0];
        let selectedContent = content;

        if (resources.length > 1) {
            const items = resources.map((r, index) => ({
                label: r.name || `${r.kind} (unnamed)`,
                description: `${r.kind} - ${r.apiVersion}`,
                resource: r,
                index
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Multiple ArgoCD resources found. Select one to convert to template:'
            });

            if (!selected) {
                return; // User cancelled
            }

            selectedResource = selected.resource;

            // Extract just the selected document from multi-document YAML
            const documents = content.split(/^---$/m);
            if (documents.length > selected.index) {
                selectedContent = documents[selected.index].trim();
            }
        }

        // Prompt for template name
        const defaultName = selectedResource.name 
            ? `${selectedResource.name}-template`
            : 'my-template';

        const templateName = await vscode.window.showInputBox({
            prompt: 'Enter a name for the template',
            value: defaultName,
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Template name cannot be empty';
                }
                if (!/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(value)) {
                    return 'Template name must be lowercase alphanumeric with hyphens';
                }
                return undefined;
            }
        });

        if (!templateName) {
            return; // User cancelled
        }

        // Prompt for optional description
        const description = await vscode.window.showInputBox({
            prompt: 'Enter an optional description for the template',
            placeHolder: 'e.g., Production web application with auto-sync',
        });

        // Check if templates provider is available
        if (!templatesProvider) {
            vscode.window.showErrorMessage('Templates provider not available');
            outputChannel.error('Templates provider is not available');
            return;
        }

        outputChannel.info(`Templates provider is available. Current template count: ${templatesProvider.getAllTemplates().length}`);

        // Check if template already exists
        const existingTemplate = templatesProvider.getAllTemplates().find((t: any) => t.name === templateName);
        
        if (existingTemplate) {
            const overwrite = await vscode.window.showWarningMessage(
                `Template "${templateName}" already exists. Overwrite?`,
                { modal: true },
                'Overwrite',
                'Cancel'
            );
            
            if (overwrite !== 'Overwrite') {
                return;
            }
            
            // Delete existing template
            await templatesProvider.deleteTemplate(existingTemplate.id);
        }

        // Create template object in the format expected by TemplatesProvider
        const template = {
            id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: templateName,
            type: selectedResource.kind === 'ApplicationSet' ? 'applicationset' : 'application',
            description: description || `Template from ${selectedResource.name || 'YAML file'}`,
            template: selectedContent, // Store as string, will be parsed when used
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Add template using the provider's method
        await templatesProvider.addTemplate(template);

        outputChannel.info(`Template "${templateName}" saved successfully`);
        outputChannel.info(`Total templates after save: ${templatesProvider.getAllTemplates().length}`);

        // Check if Templates view is enabled
        const config = vscode.workspace.getConfiguration('argocd');
        const showTemplates = config.get<boolean>('showTemplates', false);
        
        if (!showTemplates) {
            const enableView = await vscode.window.showInformationMessage(
                `✅ Template "${templateName}" created successfully!\n\nThe Templates view is currently hidden. Would you like to enable it?`,
                'Enable Templates View',
                'Not Now'
            );
            
            if (enableView === 'Enable Templates View') {
                await config.update('showTemplates', true, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('Templates view enabled! Check the ArgoCD sidebar.');
            }
        } else {
            vscode.window.showInformationMessage(
                `✅ Template "${templateName}" created successfully!`
            );
        }

    } catch (error) {
        ErrorHelper.showErrorMessage(error, 'convertYamlToTemplate');
    }
}
