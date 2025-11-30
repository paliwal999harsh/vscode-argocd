# Contributing to GitOps Tools for ArgoCD

First off, thank you for considering contributing to GitOps Tools for ArgoCD! It's people like you that make this extension better for everyone.

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
- **Description**: Clear and concise description of the buga
- **Steps to Reproduce**: Detailed steps to reproduce the behavior
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable, add screenshots
- **Environment**:
  - VS Code version
  - Extension version
  - Operating System
  - ArgoCD CLI version (`argocd version`)
  - ArgoCD Server version
- **Logs**: Include relevant logs from Output panel (select "ArgoCD" channel)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:

- **Use Case**: Describe the problem you're trying to solve
- **Proposed Solution**: How you envision the feature working
- **Alternatives**: Other solutions you've considered
- **Additional Context**: Screenshots, mockups, or examples

### Pull Requests

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/AmazingFeature`)
3. **Make** your changes
4. **Test** thoroughly
5. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
6. **Push** to the branch (`git push origin feat/AmazingFeature`)
7. **Open** a Pull Request

## 🛠️ Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [VS Code](https://code.visualstudio.com/) (v1.105.0 or higher)
- [ArgoCD CLI](https://argo-cd.readthedocs.io/en/stable/cli_installation/)
- [Git](https://git-scm.com/)

### Development Workflow

1. **Start Watch Mode** (automatic compilation on file changes):
   ```bash
   npm run watch
   ```

2. **Launch Extension Development Host**:
   - Press `F5` in VS Code
   - This opens a new VS Code window with your extension loaded

3. **Make Changes**:
   - Edit source files in `src/`
   - Changes are automatically compiled (if watch mode is running)
   - Reload Extension Development Host: `Ctrl+R` (Windows/Linux) or `Cmd+R` (macOS)

4. **View Logs**:
   - In Extension Development Host: View → Output
   - Select "ArgoCD" from dropdown
   - Use `outputChannel.info()`, `outputChannel.debug()`, etc. in code

### Building

```bash
# Development build
npm run compile

# Production build
npm run package

# Create VSIX package
npx vsce package
```

### Testing

```bash
# Run tests
npm test

# Run specific test file
npm test -- --grep "pattern"
```

## 📚 Documentation

### User Documentation

- Update **README.md** for new features
- Add **troubleshooting** info for common issues
- Include **screenshots** or **GIFs** for visual features
- Update **CHANGELOG.md** with your changes

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] All tests pass locally
- [ ] Added tests for new features
- [ ] Updated documentation
- [ ] No lint errors (`npm run lint`)
- [ ] Compiled successfully (`npm run compile`)

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2

## Testing
How you tested the changes

## Screenshots
If applicable

## Related Issues
Fixes #123
```

### Review Process

1. Maintainer reviews code
2. Automated tests run
3. Feedback provided (if needed)
4. Approved and merged

**Thank you for contributing to GitOps Tools for ArgoCD!** 