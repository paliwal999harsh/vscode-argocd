import path from "path";
import { ExtensionContext, window, Uri, workspace } from "vscode";
import { CommandServices, CommandProviders } from "../../commands";
import * as fs from "fs";

/**
 * Create an application from a template
 */
export function createApplicationFromTemplate(
  context: ExtensionContext,
  services: CommandServices,
  providers: CommandProviders
) {
  return async (item: any) => {
    if (!item || !item.template) {
      return;
    }

    const { appService } = services;
    const { templatesProvider, applicationsProvider } = providers;
    const template = item.template;

    // Get application name from user
    const appName = await window.showInputBox({
      prompt: "Enter application name",
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return "Application name is required";
        }
        return null;
      },
    });

    if (!appName) {
      return;
    }

    try {
      // Get template YAML
      let templateYaml = templatesProvider.getTemplateAsYaml(template);

      // Replace the application name in the YAML
      templateYaml = templateYaml.replace(
        /name:\s+[^\n]+/m,
        `name: ${appName.trim()}`
      );

      // Create a temporary file
      const tempFile = Uri.file(
        `${context.globalStoragePath}/temp-app-${Date.now()}.yaml`
      );

      // Ensure directory exists
      const dirPath = path.dirname(tempFile.fsPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Write template to file
      fs.writeFileSync(tempFile.fsPath, templateYaml, "utf-8");

      // Show the file for review
      const doc = await workspace.openTextDocument(tempFile);
      await window.showTextDocument(doc);

      const confirm = await window.showInformationMessage(
        `Review the application manifest and click "Create" to deploy it.`,
        "Create",
        "Cancel"
      );

      if (confirm === "Create") {
        // Use ArgoCD CLI to create the application
        const result = await appService.createApplicationFromFile(
          tempFile.fsPath
        );

        if (result) {
          window.showInformationMessage(
            `Application "${appName}" created successfully`
          );
          applicationsProvider.refresh();
        }
      }

      // Clean up temp file
      try {
        fs.unlinkSync(tempFile.fsPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    } catch (error) {
      window.showErrorMessage(`Failed to create application: ${error}`);
    }
  };
}
