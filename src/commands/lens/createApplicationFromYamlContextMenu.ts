import { ArgocdCliService } from "../../services";
import { YamlHelper } from "../../utils";
import { createApplicationFromYaml } from "./createApplicationFromYaml";
import * as fs from 'fs';
import * as vscode from "vscode";

/**
 * Creates an ArgoCD application from a YAML file via context menu
 * @param argocdCli ArgoCD CLI service
 * @param uri File URI from context menu
 */
export async function createApplicationFromYamlContextMenu(
    argocdCli: ArgocdCliService,
    uri: vscode.Uri
): Promise<void> {
    // Verify it's a YAML file
    if (!YamlHelper.isYamlFile(uri)) {
        vscode.window.showWarningMessage('Selected file is not a YAML file.');
        return;
    }

    await createApplicationFromYaml(argocdCli, uri);
}