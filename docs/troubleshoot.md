# Troubleshoot

!!! danger "ArgoCD CLI Not Found"

    The extension cannot find the ArgoCD CLI on your PATH and cannot perform CLI-based operations until the CLI is installed and available.

    **Solutions**

    - Install the ArgoCD CLI (see Prerequisites).
    - Verify installation by running:

        ```bash
        argocd version
        ```

    - Ensure the CLI directory is included in your system `PATH` and restart VS Code if necessary.

!!! danger "Connection Failed"

    Failed to connect to the ArgoCD server — check connectivity, credentials, and TLS settings before retrying.

    **Solutions**

    - Verify the server URL is correct and accessible from your machine.
    - Confirm credentials (username/password or token) are valid.
    - For self-signed certificates, enable "Skip TLS Verification" in settings if appropriate.
    - Check firewall and network settings that might block access.
    - Confirm the ArgoCD server is running; for a quick check:

        ```bash
        curl -k https://your-argocd-server

        ````

!!! info "Debug Logging"

    Enable debug-level logging to collect detailed information about extension behavior and connectivity.

    To enable debug logging, add the following to your VS Code settings:

    ```json
    {
      "argocd.logLevel": "debug"
    }
    ```

    View logs via: View → Output (`Ctrl+Shift+U`) and select "ArgoCD" from the dropdown.

!!! warning "No Resources Found"

    If clusters, repositories, or applications are missing from views, verify permissions and connection details before further troubleshooting.

    **Solutions**

    - Verify you have the necessary ArgoCD permissions and check RBAC policies.
    - Ensure you are logged into the correct ArgoCD instance/connection in the extension.
    - Open the output logs for more details: run `ArgoCD: Show Output` from the Command Palette.
