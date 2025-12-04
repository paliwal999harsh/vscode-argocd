---
description: 'Trigger a synchronization operation for a selected ArgoCD application from VS Code, applying the desired state from the source repository to the target cluster and surfacing progress and results in the extension UI.'
---

# Sync Application

**Description:** Trigger a synchronization operation for a selected ArgoCD application from VS Code, applying the desired state from the source repository to the target cluster and surfacing progress and results in the extension UI.

**Type:** Context Menu (Applications view/item)

**Keyboard Shortcut:** None

## Usage Flow

1. Open Command Palette → "ArgoCD: Sync Application" or right-click on an application
   ![](../../assets/commands/application/sync-application-step1.jpg)
2. Select the application to sync
   ![](../../assets/commands/application/sync-application-step2.jpg)
3. Choose sync strategy (manual, automatic, or dry-run)
   ![](../../assets/commands/application/sync-application-step3.jpg)
4. Confirm and wait for sync to complete
   ![](../../assets/commands/application/sync-application-step4.jpg)
