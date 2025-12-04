# Getting-Started

## Prerequisites

- Install ArgoCD CLI. The extension requires the ArgoCD CLI to be installed and available in your `PATH`.
- Verify: `argocd version`
- For self-signed certificates you may need to skip TLS verification for development.

## Install the Extension

- Search for "GitOps Tools for ArgoCD" in the VS Code Extensions Marketplace
- Or install from `.vsix` file:

```bash
code --install-extension argocd-gitops-0.0.x.vsix
```

Follow the extension activation prompts after installation.

## Configure ArgoCD Connection

The extension supports multiple ArgoCD server connections. You can add, switch, edit, and delete connections.

Options:

- Username & Password (stored in VS Code secret storage)
- API Token (recommended for automation)
- SSO (opens browser for auth)

Add connections from the Command Palette: `ArgoCD: Add Connection`.

## Settings

Configure the extension in VS Code Settings (Ctrl+,)

| Key                       | Description                                   | Default value |
| ------------------------- | --------------------------------------------- | ------------- |
| `argocd.showClusters`     | Show Clusters view in sidebar                 | `true`        |
| `argocd.showRepositories` | Show Repositories view                        | `true`        |
| `argocd.showApplications` | Show Applications view                        | `true`        |
| `argocd.showTemplates`    | Show Templates view                           | `true`        |
| `argocd.refreshInterval`  | Auto-refresh interval (seconds, 0 to disable) | `30`          |
| `argocd.timeoutSeconds`   | CLI command timeout (seconds)                 | `60`          |
| `argocd.logLevel`         | Output log level (debug, info, warn, error)   | `info`        |
