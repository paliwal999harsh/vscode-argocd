# GitOps Tools for ArgoCD

A powerful Visual Studio Code extension that brings ArgoCD GitOps workflows directly into your editor. Manage applications, clusters, repositories, and templates without leaving VS Code.

[![VS Code](https://img.shields.io/badge/VS%20Code-1.105.0+-blue.svg)](https://code.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/Docs-Online-blue.svg)](https://paliwal999harsh.github.io/vscode-argocd)

## Quick Start

### Prerequisites

- **ArgoCD CLI** installed and in your PATH ([Install Guide](https://argo-cd.readthedocs.io/en/stable/cli_installation/))
- **VS Code** 1.105.0 or later
- **ArgoCD server** instance

### Install the Extension

Search for "GitOps Tools for ArgoCD" in the VS Code Extensions Marketplace or install from `.vsix` file:

```bash
code --install-extension argocd-gitops-0.0.x.vsix
```

### Configure Connection

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type "ArgoCD: Add Connection"
3. Enter your ArgoCD server URL and credentials
4. Start managing your applications!

## Key Features

- **Smart YAML Detection** — CodeLens actions for ArgoCD resources with one-click deployment
- **Application Management** — Create, sync, refresh, and delete applications
- **Template Library** — Build and reuse application configurations
- **Multi-Connection Support** — Work with multiple ArgoCD servers
- **Real-Time Updates** — Auto-refresh with configurable intervals
- **Cluster & Repository Management** — Monitor infrastructure and add resources

## Commands

Quick access to common commands via Command Palette (`Ctrl+Shift+P`):

- `ArgoCD: Add Connection` — Configure ArgoCD server
- `ArgoCD: Add Repository` — Add a repository in ArgoCD
- `ArgoCD: Create ArgoCD Application from template` — Deploy from Template
- `ArgoCD: Refresh Applications` — Sync application list
- `ArgoCD: Show Output` — View extension logs

[Full command reference →](https://paliwal999harsh.github.io/vscode-argocd/commands/)

## Documentation

For comprehensive guides and detailed information:

- **[Getting Started](https://paliwal999harsh.github.io/vscode-argocd/getting-started/)** — Installation, setup, and configuration
- **[Features](https://paliwal999harsh.github.io/vscode-argocd/features/)** — Detailed feature guides
- **[Full command reference](https://paliwal999harsh.github.io/vscode-argocd/commands/)** - See Command Details and Usage Examples
- **[Settings](https://paliwal999harsh.github.io/vscode-argocd/getting-started/#settings/)** — Configuration options
- **[Troubleshooting](https://paliwal999harsh.github.io/vscode-argocd/commands/#troubleshoot/)** — Common issues and fixes

## Support & Feedback

- [Report Issues](https://github.com/paliwal999harsh/vscode-argocd/issues)
- [Request Features](https://github.com/paliwal999harsh/vscode-argocd/issues/new?labels=enhancement)
- [Read the Docs](https://paliwal999harsh.github.io/vscode-argocd/)

## License

MIT License - see [LICENSE](LICENSE.txt) for details.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

**Made with ❤️ for the GitOps community** | [GitHub](https://github.com/paliwal999harsh/vscode-argocd) | [Docs](https://paliwal999harsh.github.io/vscode-argocd/)
