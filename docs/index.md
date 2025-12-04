# Welcome to GitOps Tools for ArgoCD

GitOps Tools for ArgoCD brings ArgoCD GitOps workflows into Visual Studio Code so you can manage applications, clusters, repositories and templates without leaving the editor.

## Quick Start

1. **Install the extension** from the VS Code Marketplace or from a `.vsix` file
2. **Install ArgoCD CLI** — Required prerequisite
3. **Add ArgoCD connection** — Configure your server URL and credentials
4. **Start managing** — Deploy applications, manage clusters, and sync resources

## Key Capabilities

- **Smart YAML Detection** — Inline CodeLens actions for ArgoCD resources in your editor
- **Application Lifecycle** — Create, sync, refresh, and delete applications
- **Templates** — Build and manage reusable application configurations
- **Multi-Connection** — Work with multiple ArgoCD servers
- **Real-Time Updates** — Auto-refresh views with configurable intervals
- **Cluster & Repository Management** — Add and monitor infrastructure

## What's Inside

- [Getting Started](./getting-started.md) — Installation and setup
- [Features](./features.md) — Detailed feature guides
- [Commands](./commands/index.md) — Full command reference
- [Troubleshooting](./troubleshoot.md) — Common issues and fixes

## Prerequisites

- **ArgoCD CLI** installed and in your PATH
- **VS Code** 1.105.0 or later
- **ArgoCD server** instance (self-hosted or SaaS)

## Features at a Glance

### Create Applications from YAML

Open any YAML file with an ArgoCD `Application` or `ApplicationSet` and use inline CodeLens buttons to deploy directly.

### Manage Templates

Save application configurations as reusable templates. Built-in templates for Helm, Kustomize, and Directory-based apps.

### Monitor Status

Real-time health and sync status indicators for applications and clusters. Auto-refresh at your configured interval.

### Multi-Connection Support

Add multiple ArgoCD server connections and switch between them seamlessly.

## Support & Feedback

- [Report Issues](https://github.com/paliwal999harsh/vscode-argocd/issues)
- [Request Features](https://github.com/paliwal999harsh/vscode-argocd/issues/new?labels=enhancement)
- [Read the Docs](https://paliwal999harsh.github.io/vscode-argocd)
