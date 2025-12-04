# Change Log

All notable changes to the "GitOps Tools for ArgoCD" extension will be documented in this file.

## [0.0.4] - 2025-12-03

### Fixes

- Fix Welcome View if cli si not available

## [0.0.3] - 2025-12-03

### Fixes

- Fix Welcome View icons
- Edit Template issue

## [0.0.2] - 2025-12-02

### Fixes

- Add Connection double prompt for password fixed
- Authentication call in refresh providers fixed
- Cluster and Application Tree Item context menu not visible
- Add Template Functionality
- Simplified cluster view
- Application Sync View
- TreeItem Icons
- Fixed Error Message shown on first install
- Fixed Some Sonar issues

### Added

- Prettier Configuration

## [0.0.1] - 2025-12-01

### Added

- Initial release of GitOps Tools for ArgoCD
- ArgoCD server connection configuration with secure credential storage
- Support for username/password and API token authentication
- Clusters view with cluster management capabilities
- Repositories view for managing Git, Helm, and OCI repositories
- Applications view for managing ArgoCD Applications and ApplicationSets
- Templates view for creating and managing reusable application templates
- Smart YAML file detection with CodeLens integration
- Automatic detection of ArgoCD Application and ApplicationSet resources in YAML files
- One-click deployment from YAML files to ArgoCD
- Convert YAML files to reusable templates
- Workspace scanning to find all ArgoCD YAML files
- YAML validation for ArgoCD resources
- Context menu actions for files and tree items
- Real-time health and sync status indicators
- Auto-refresh capability with configurable intervals
- Comprehensive command palette integration
- Built-in templates for common application patterns (Helm, Kustomize, Directory)
- Application operations: sync, refresh, view details, delete
- Repository operations: add, delete, create application from repository
- Cluster operations: add, view details
- Template operations: create, edit, copy, delete, deploy
- Output channel for debugging and monitoring
- Extensive error handling and user feedback

### Features

- **Smart YAML Detection**: Automatically detect ArgoCD resources in YAML files
- **CodeLens Actions**: Inline buttons for creating applications and templates
- **Template Management**: Build a library of reusable application configurations
- **Context Menus**: Right-click actions in file explorer and tree views
- **Visual Indicators**: Color-coded health and sync status icons
- **Auto-Refresh**: Configurable automatic refresh of all views
- **Multi-Document YAML**: Support for YAML files with multiple resources
- **Workspace Scanning**: Find all ArgoCD resources across workspace

### Requirements

- VS Code 1.105.0 or higher
- ArgoCD CLI installed and available in PATH
- Access to an ArgoCD server
