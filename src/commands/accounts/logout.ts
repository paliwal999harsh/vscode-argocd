import * as vscode from "vscode";
import {
  ArgocdAuthenticationProvider,
  OutputChannelService,
} from "../../services";
import { refreshAllViews } from "../../views/views";

/**
 * Logout from ArgoCD
 * Removes the current authentication session
 */
export function logout(
  authProvider: ArgocdAuthenticationProvider,
  outputChannel: OutputChannelService
) {
  return async (sessionId?: string) => {
    outputChannel.info("Logging out from ArgoCD");

    // Get the session to logout from
    let targetSessionId = sessionId;
    if (!targetSessionId) {
      const session = await authProvider.getActiveSession();
      if (!session) {
        vscode.window.showWarningMessage(
          "No active ArgoCD session to logout from"
        );
        return;
      }
      targetSessionId = session.id;
    }

    // Confirm logout
    const confirm = await vscode.window.showWarningMessage(
      "Are you sure you want to logout from ArgoCD?",
      { modal: true },
      "Logout",
      "Cancel"
    );

    if (confirm === "Logout") {
      try {
        await authProvider.removeSession(targetSessionId);
        vscode.window.showInformationMessage(
          "Successfully logged out from ArgoCD"
        );
        outputChannel.info("Logout successful");

        // Refresh all views after logout
        refreshAllViews();
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to logout: ${error}`);
        outputChannel.error("Logout failed", error as Error);
      }
    }
  };
}
