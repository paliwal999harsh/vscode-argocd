import { OutputChannelService } from '../../services';
import * as vscode from 'vscode';

/**
 * Show the ArgoCD output channel
 */
export function showOutput(outputChannel: OutputChannelService) {
    return () => {
        outputChannel.show();
    };
}

/**
 * Set the log level for the output channel
 */
export function setLogLevel(outputChannel: OutputChannelService) {
    return async () => {
        const currentLevel = outputChannel.getCurrentLogLevel();
        
        const logLevels = [
            { label: 'Debug', description: 'Show all messages including debug information', value: 'debug' },
            { label: 'Info', description: 'Show informational messages and above', value: 'info' },
            { label: 'Warn', description: 'Show warnings and errors only', value: 'warn' },
            { label: 'Error', description: 'Show errors only', value: 'error' }
        ];

        const selected = await vscode.window.showQuickPick(logLevels, {
            placeHolder: `Current level: ${currentLevel.toUpperCase()} - Select new log level`,
            ignoreFocusOut: true
        });

        if (selected) {
            outputChannel.setLogLevel(selected.value);
            vscode.window.showInformationMessage(`Log level set to: ${selected.label}`);
        }
    };
}
