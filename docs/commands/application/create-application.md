---
description: 'Create a new ArgoCD application from VS Code with customizable settings, guiding the user through selecting repository, deployment path, destination cluster, and sync policies before applying to the ArgoCD server.'
---

# Create Application

**Description:** Create a new ArgoCD application from VS Code with customizable settings, guiding the user through selecting repository, deployment path, destination cluster, and sync policies before applying to the ArgoCD server.

**Type:** Command Palette, Context Menu (Applications view)

**Keyboard Shortcut:** None

## Usage Flow

1. Open Command Palette → "ArgoCD: Create Application"
   ![](../../assets/commands/application/create-application-step1.jpg)
2. Enter application details (name, namespace, destination cluster)
   ![](../../assets/commands/application/create-application-step2.jpg)
3. Select the Git repository or template to deploy from
   ![](../../assets/commands/application/create-application-step3.jpg)
4. Configure deployment path and sync settings
   ![](../../assets/commands/application/create-application-step4.jpg)
5. Confirm and wait for application creation
   ![](../../assets/commands/application/create-application-step5.jpg)
