# Features

## Repository & Cluster Management

Manage Git repositories and Kubernetes clusters connected to ArgoCD:

- Add Repositories (Git, Helm, OCI) with auth options
- View repository connection status
- Add Clusters from kubeconfig files
- Monitor cluster health and connectivity

## Application Management

Manage ArgoCD application lifecycle from within VS Code:

- View Applications with health and sync status
- Sync, Refresh, Edit and Delete Applications
- View manifests and deployment history
- Expand resources to inspect deployed Kubernetes objects

## Template Management

Create and manage reusable application configurations:

- Create Templates from YAML or existing Applications
- Organize templates with names and descriptions
- Deploy quickly from templates and export YAML
- Built-in templates for Helm, Kustomize, Directory apps

## Smart YAML Detection

The extension detects ArgoCD `Application` and `ApplicationSet` resources in YAML files and surfaces quick actions:

- CodeLens integration: inline action buttons above resources (`Create Application`, `Convert to Template`, `Validate YAML`)
- Context menu actions in Explorer for `.yaml`/`.yml` files
- Workspace scanning to find all ArgoCD resources

## Real-Time Updates

The extension provides live status updates for applications and clusters:

- Auto-refresh views at a configurable interval (default: 30s)
- Visual indicators for health and sync status
- Debug logs available via `ArgoCD: Show Output`
