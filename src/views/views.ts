import * as vscode from 'vscode';
import { CommandId } from '../commands';

export function refreshAllViews() {
  vscode.commands.executeCommand(CommandId.RefreshClusters);
  vscode.commands.executeCommand(CommandId.RefreshRepositories);
  vscode.commands.executeCommand(CommandId.RefreshAllApplications);
  vscode.commands.executeCommand(CommandId.RefreshTemplates);
}

export function refreshTreeViews() {
  vscode.commands.executeCommand(CommandId.RefreshClusters);
  vscode.commands.executeCommand(CommandId.RefreshRepositories);
  vscode.commands.executeCommand(CommandId.RefreshAllApplications);
  vscode.commands.executeCommand(CommandId.RefreshTemplates);
}
