# GitOps Tools for ArgoCD

A powerful Visual Studio Code extension that brings ArgoCD GitOps workflows directly into your editor. Manage applications, clusters, repositories, and templates without leaving VS Code.

[![VS Code](https://img.shields.io/badge/VS%20Code-1.105.0+-blue.svg)](https://code.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Overview

This extension provides comprehensive ArgoCD management capabilities within VS Code, allowing you to:

- Deploy and manage Kubernetes applications using GitOps principles
- Monitor application health and sync status in real-time
- Create and manage reusable application templates
- Automatically detect and deploy ArgoCD applications from YAML files
- Manage clusters and Git repositories
- Streamline your GitOps workflow without context switching

## Key Features

### Smart YAML Detection

The extension automatically detects ArgoCD Application and ApplicationSet resources in your YAML files:

- **CodeLens Integration**: Inline action buttons appear automatically above ArgoCD resources
  - **Create Application** - Deploy directly to your ArgoCD server
  - **Convert to Template** - Save as reusable template
  - **Validate YAML** - Check syntax and resource structure

- **Context Menu Actions**: Right-click on any `.yaml` or `.yml` file
  - Create ArgoCD Application
  - Convert to ArgoCD Template
  - Validate ArgoCD YAML

- **Workspace Scanning**: Find all ArgoCD resources across your entire workspace with one command

### Template Management

Build a library of reusable application configurations:

- **Create Templates** from existing applications or YAML files
- **Organize Templates** with names and descriptions
- **Deploy Quickly** by creating new applications from templates
- **Share Templates** by exporting to YAML
- **Built-in Templates** for common patterns (Helm, Kustomize, Directory apps)

### Application Management

Complete lifecycle management for your ArgoCD applications:

- **View Applications** with health and sync status indicators
- **Sync Applications** manually or configure auto-sync
- **Refresh Applications** to check for new changes
- **View Details** including manifests and deployment history
- **Delete Applications** with confirmation prompts
- **Expand Resources** to see deployed Kubernetes objects

### Repository & Cluster Management

Manage your GitOps infrastructure:

- **Add Repositories** (Git, Helm, OCI) with various authentication methods
- **View Repositories** with connection status
- **Add Clusters** from kubeconfig files
- **Monitor Clusters** with health and connectivity status
- **Create Applications** directly from repositories

### Real-Time Updates

Stay informed with live status updates:

- **Auto-Refresh** views at configurable intervals (default: 30 seconds)
- **Visual Indicators** for health status:
  - Healthy
  - Progressing
  - Degraded
  - Suspended
  - Missing
- **Sync Status Icons**:
  - Synced
  - OutOfSync
  - Unknown

## Prerequisites

### ArgoCD CLI

This extension requires the ArgoCD CLI to be installed on your system.

## Getting Started

### Install the Extension

- Search for "GitOps Tools for ArgoCD" in the VS Code Extensions Marketplace
- Or install from `.vsix` file: `code --install-extension argocd-gitops-0.0.1.vsix`

### Configure ArgoCD Connection

#### Multi-Connection Support

The extension supports managing multiple ArgoCD server connections. You can add, switch, edit, and delete connections easily.

#### Adding Your First Connection

**Option A: Using Command Palette**

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type "ArgoCD: Add Connection"
3. Enter connection details:
   - **Connection Name**: A friendly name (e.g., "Production", "Staging", "Local")
   - **Server URL**: Your ArgoCD server (e.g., `https://argocd.example.com`)
   - **Authentication Method**: Choose Username/Password, API Token, or SSO
   - **Credentials**: Provide username/password or API token based on auth method
   - **TLS Settings**: Skip TLS verification for self-signed certificates (development only)

**Option B: Using Activity Bar**

1. Click the ArgoCD icon (☁️) in the Activity Bar
2. Click "Add Connection" button
3. Follow the prompts to configure your connection

#### Managing Connections

Once you have multiple connections configured, you can:

- **Switch Connection**: `Ctrl+Shift+P` → "ArgoCD: Switch Connection" - Choose which server to work with
- **List Connections**: View all configured connections with their status
- **Edit Connection**: Rename a connection
- **Delete Connection**: Remove a connection permanently

#### Connection Storage

- Connections are stored in: `~/.vscode/extensions/argocd-gitops-*/globalStorage/connections.json`
- Credentials are stored securely in VS Code's secret storage
- Only one connection is active at a time
- The active connection is automatically selected when the extension loads

### Authentication Methods

The extension supports three authentication methods:

#### Username & Password

- Simple authentication using ArgoCD credentials
- Credentials are stored securely in VS Code's secret storage
- Automatic login via ArgoCD CLI

#### API Token

- More secure for CI/CD and automation
- Generate token from ArgoCD UI: Settings → Accounts → Generate Token
- Token is encrypted and stored securely

#### SSO (Single Sign-On)

- Enterprise SSO authentication
- Opens browser for authentication
- Supports various SSO providers (OIDC, SAML, etc.)

## Usage

### Working with YAML Files

1. **Open any YAML file** containing ArgoCD Application or ApplicationSet
2. **CodeLens appears** automatically with action buttons
3. **Click actions** to create applications or save as templates

**Example:**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/example/repo.git
    path: apps/my-app
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: production
```

When you open this file, you'll see three CodeLens buttons above it.

### Creating Applications

#### Method 1: From YAML File

- Open YAML file → Click "Create Application" CodeLens
- Or right-click YAML file → "Create ArgoCD Application"

#### Method 2: From Template

- Open Templates view → Right-click template → "Create Application from Template"

#### Method 3: From Repository

- Open Repositories view → Right-click repository → "Create Application from Repository"

#### Method 4: From Scratch

- Open Applications view → Click "+" button → Fill in the form

### Managing Templates

**Enable Templates View:**

- Settings → Search "argocd.showTemplates" → Enable
- Or the extension will prompt you when creating first template

**Create Template:**

- From YAML: Right-click YAML file → "Convert to ArgoCD Template"
- From Application: Right-click application → "Create Template from Application"
- From Scratch: Templates view → Click "+" button

**Use Template:**

- Templates view → Right-click template → "Create Application from Template"
- Customize name, namespace, and other parameters

### Scanning Workspace

Find all ArgoCD YAML files in your workspace:

1. Press `Ctrl+Shift+P`
2. Type "ArgoCD: Scan Workspace for ArgoCD YAML Files"
3. Select from discovered resources

## Commands

All commands are available in the Command Palette (`Ctrl+Shift+P`):

### Configuration

- `ArgoCD: Configure Connection` - Set up ArgoCD server connection
- `ArgoCD: Show Output` - View extension logs

### Clusters

- `ArgoCD: Refresh Clusters` - Reload clusters list
- `ArgoCD: Add Cluster` - Register new Kubernetes cluster

### Repositories

- `ArgoCD: Refresh Repositories` - Reload repositories list
- `ArgoCD: Add Repository` - Connect new Git/Helm/OCI repository

### Applications

- `ArgoCD: Refresh Applications` - Reload applications list
- `ArgoCD: Add Application` - Create new application
- `ArgoCD: Add ApplicationSet` - Create new ApplicationSet
- `ArgoCD: Sync Application` - Synchronize application with Git
- `ArgoCD: Refresh Application` - Check for changes
- `ArgoCD: View Application Details` - Open manifest YAML
- `ArgoCD: View Application History` - Browse deployment history
- `ArgoCD: Delete Application` - Remove application

### Templates

- `ArgoCD: Refresh Templates` - Reload templates list
- `ArgoCD: Add Template` - Create new template
- `ArgoCD: Create Application from Template` - Deploy from template

### YAML Files

- `ArgoCD: Create ArgoCD Application from YAML` - Deploy YAML file
- `ArgoCD: Convert to ArgoCD Template` - Save YAML as template
- `ArgoCD: Validate ArgoCD YAML` - Check YAML syntax
- `ArgoCD: Scan Workspace for ArgoCD YAML Files` - Find all ArgoCD files

## Context Menu Actions

### File Explorer (Right-click on files/folders)

**On Folders:**

- Create ArgoCD Application from Folder

**On YAML Files (.yaml, .yml):**

- Create ArgoCD Application
- Convert to ArgoCD Template
- Validate ArgoCD YAML

### ArgoCD Tree Views (Right-click on items)

**Applications:**

- Sync Application
- Refresh Application
- View Application Details
- View Application History
- Edit Application
- Delete Application
- Create Template from Application

**Repositories:**

- Copy Repository URL
- Create Application from Repository
- Delete Repository

**Templates:**

- Edit Template
- Copy Template
- Copy Template YAML
- Create Application from Template
- Delete Template

## Settings

Configure the extension in VS Code Settings (`Ctrl+,`):

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `argocd.showClusters` | boolean | `true` | Show Clusters view in sidebar |
| `argocd.showRepositories` | boolean | `true` | Show Repositories view |
| `argocd.showApplications` | boolean | `true` | Show Applications view |
| `argocd.showTemplates` | boolean | `false` | Show Templates view |
| `argocd.refreshInterval` | number | `30` | Auto-refresh interval (seconds, 0 to disable) |
| `argocd.timeoutSeconds` | number | `60` | CLI command timeout (seconds) |
| `argocd.logLevel` | string | `info` | Output log level (debug, info, warn, error) |

## Troubleshooting

### ArgoCD CLI Not Found

**Problem:** Extension shows "ArgoCD CLI not found"

**Solution:**

1. Install ArgoCD CLI (see Prerequisites)
2. Verify installation: `argocd version`
3. Ensure CLI is in your PATH
4. Restart VS Code

### Connection Failed

**Problem:** "Failed to connect to ArgoCD server"

**Solutions:**

- Verify server URL is correct and accessible
- Check your credentials (username/password or token)
- For self-signed certificates, enable "Skip TLS Verification"
- Check firewall settings
- Verify ArgoCD server is running: `curl -k https://your-argocd-server`

### Templates Not Showing

**Problem:** Created template doesn't appear in Templates view

**Solution:**

- Enable Templates view: Settings → `argocd.showTemplates` → `true`
- Or click "Enable Templates View" when prompted after creating template
- Refresh templates view (click refresh icon)

### No Resources Found

**Problem:** "No clusters/repositories/applications found"

**Solutions:**

- Verify you have necessary ArgoCD permissions
- Check ArgoCD RBAC policies
- Ensure you're logged into the correct ArgoCD instance
- View logs: `ArgoCD: Show Output` in Command Palette

### Debug Logging

Enable detailed logging:

```json
{
  "argocd.logLevel": "debug"
}
```

View logs:

1. View → Output (`Ctrl+Shift+U`)
2. Select "ArgoCD" from dropdown

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Acknowledgments

- [ArgoCD](https://argo-cd.readthedocs.io/) - The GitOps continuous delivery tool for Kubernetes
- [GitOps Tools for Flux](https://marketplace.visualstudio.com/items?itemName=Weaveworks.vscode-gitops-tools) - Inspiration for this extension
- [VS Code Extension API](https://code.visualstudio.com/api) - Powerful extension framework

## Resources

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [ArgoCD Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)
- [GitOps Principles](https://opengitops.dev/)
- [VS Code Extension Development](https://code.visualstudio.com/api)

## Issues & Feedback

Found a bug or have a feature request?

- [Report an issue](https://github.com/yourusername/argocd-vscode-extension/issues)
- [Request a feature](https://github.com/yourusername/argocd-vscode-extension/issues/new?labels=enhancement)

### Clusters Management

- **View Clusters**: List all clusters connected to your ArgoCD server
- **Add Clusters**: Add new clusters using kubeconfig files
- **Cluster Details**: View cluster server information, version, and connection status
- **Health Monitoring**: Real-time cluster health and connectivity status

### Repositories Management  

- **Repository Listing**: View all repositories connected to ArgoCD
- **Multi-Type Support**: Support for Git, Helm, and OCI repositories
- **Add Repositories**: Add new repositories with various authentication methods
- **Authentication Options**: Support for public repos, username/password, and SSH keys

### Applications Management

- **Applications**: List, create, and manage ArgoCD applications
- **ApplicationSets**: View and manage ApplicationSets (where supported)
- **Application Details**: View health status, sync status, project info, and more
- **Resource Tree**: Expand applications to view deployed Kubernetes resources
- **Context Actions**: Right-click context menu for application operations

### Templates Management (Optional)

- **Template Storage**: Store and reuse application configurations
- **Create from Application**: Convert existing applications into reusable templates
- **Create from Scratch**: Build new templates with a basic application structure
- **Template Operations**: Edit, copy, and delete templates
- **Quick Deployment**: Create new applications from templates with customization
- **YAML Export**: Copy template YAML to clipboard for external use
- **Disabled by Default**: Enable via settings (`argocd.showTemplates`)

### Application Operations

- **Sync Applications**: Manual sync with progress indication
- **Refresh Applications**: Refresh application state from Git
- **View Details**: Open application manifests in YAML format
- **View History**: Browse application deployment history
- **Edit Applications**: View manifests (with links to ArgoCD UI for editing)
- **Delete Applications**: Remove applications with confirmation

### YAML File Detection & Creation

- **Automatic Detection**: CodeLens automatically appears in YAML files containing ArgoCD Applications or ApplicationSets
- **One-Click Creation**: Click the CodeLens to create applications directly from YAML files
- **Convert to Template**: Save any YAML file as a reusable template with one click
- **Context Menu Integration**: Right-click on YAML files in Explorer to create applications or templates
- **Workspace Scanning**: Scan entire workspace for ArgoCD YAML files
- **YAML Validation**: Validate YAML syntax and detect ArgoCD resources
- **Multi-Document Support**: Handle YAML files with multiple ArgoCD resources
- **Smart Filtering**: Only shows options for files with valid ArgoCD apiVersion and kind

### Auto-Refresh

- **Configurable Interval**: Set auto-refresh interval (default: 30 seconds)
- **Real-time Updates**: Automatic refresh of tree views when configured
- **Smart Refresh**: Only refresh when connected to ArgoCD server

**Made with ❤️ for the GitOps community** | [Report Issues](https://github.com/yourusername/argocd-vscode-extension/issues) | [Contribute](CONTRIBUTING.md)
