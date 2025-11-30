const vscode = acquireVsCodeApi();
let repositoryData = [];

// Load initial data on page load
window.addEventListener('load', () => {
    vscode.postMessage({ command: 'loadInitialData' });
});

// Handle messages from extension
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'initialDataLoaded':
            loadInitialData(message.data);
            break;
    }
});

function loadInitialData(data) {
    repositoryData = data.repositories;
    
    // Populate repositories
    const repoSelect = document.getElementById('repository');
    data.repositories.forEach(repo => {
        const option = document.createElement('option');
        option.value = repo.url;
        option.textContent = `${repo.name || repo.url} (${repo.type})`;
        option.dataset.type = repo.type;
        repoSelect.appendChild(option);
    });

    // Populate clusters
    const clusterSelect = document.getElementById('cluster');
    data.clusters.forEach(cluster => {
        const option = document.createElement('option');
        option.value = cluster.server;
        option.textContent = `${cluster.name} (${cluster.server})`;
        clusterSelect.appendChild(option);
    });

    // Populate projects
    const projectSelect = document.getElementById('project');
    data.projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project;
        option.textContent = project;
        projectSelect.appendChild(option);
    });

    // Set prefilled repository if provided
    if (data.prefilledRepoUrl) {
        repoSelect.value = data.prefilledRepoUrl;
        handleRepositoryChange();
    }
}

// Handle repository selection change
document.getElementById('repository').addEventListener('change', handleRepositoryChange);

function handleRepositoryChange() {
    const repoSelect = document.getElementById('repository');
    const selectedOption = repoSelect.selectedOptions[0];
    const repoType = selectedOption ? selectedOption.dataset.type : '';

    const helmSection = document.getElementById('helmSection');
    const gitSection = document.getElementById('gitSection');

    if (repoType === 'helm' || repoType === 'oci') {
        helmSection.classList.remove('hidden');
        gitSection.classList.add('hidden');
    } else {
        helmSection.classList.add('hidden');
        gitSection.classList.remove('hidden');
    }
}

// Handle source type change for Git repositories
document.getElementById('sourceType').addEventListener('change', function() {
    const sourceType = this.value;
    
    document.getElementById('gitHelmSection').classList.toggle('hidden', sourceType !== 'helm');
    document.getElementById('kustomizeSection').classList.toggle('hidden', sourceType !== 'kustomize');
    document.getElementById('directorySection').classList.toggle('hidden', sourceType !== 'directory');
});

// Handle button clicks using event delegation
document.body.addEventListener('click', function(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }
    
    const action = button.getAttribute('data-action');
    
    if (action === 'add-helm-value') {
        const container = document.getElementById('helmValues');
        const newRow = document.createElement('div');
        newRow.className = 'helm-value-row';
        newRow.innerHTML = `
            <input type="text" placeholder="Key" class="helm-key">
            <input type="text" placeholder="Value" class="helm-value">
            <button type="button" data-action="remove-helm-value">Remove</button>
        `;
        container.appendChild(newRow);
    } else if (action === 'add-git-helm-value') {
        const container = document.getElementById('gitHelmValues');
        const newRow = document.createElement('div');
        newRow.className = 'helm-value-row';
        newRow.innerHTML = `
            <input type="text" placeholder="Key" class="git-helm-key">
            <input type="text" placeholder="Value" class="git-helm-value">
            <button type="button" data-action="remove-helm-value">Remove</button>
        `;
        container.appendChild(newRow);
    } else if (action === 'remove-helm-value') {
        button.parentElement.remove();
    } else if (action === 'cancel') {
        vscode.postMessage({ command: 'cancel' });
    }
});

function getHelmValues(containerClass) {
    const values = [];
    const rows = document.querySelectorAll(`.${containerClass}`);
    for (let i = 0; i < rows.length; i += 2) {
        const key = rows[i].value.trim();
        const value = rows[i + 1].value.trim();
        if (key && value) {
            values.push({ key, value });
        }
    }
    return values;
}

// Handle form submission
document.getElementById('createAppForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const repoSelect = document.getElementById('repository');
    const selectedOption = repoSelect.selectedOptions[0];
    const repoType = selectedOption ? selectedOption.dataset.type : '';

    const formData = {
        name: document.getElementById('name').value,
        repository: document.getElementById('repository').value,
        repoType: repoType,
        cluster: document.getElementById('cluster').value,
        namespace: document.getElementById('namespace').value,
        project: document.getElementById('project').value
    };

    if (repoType === 'helm' || repoType === 'oci') {
        formData.helmChart = document.getElementById('helmChart').value;
        formData.chartVersion = document.getElementById('chartVersion').value;
        formData.helmValues = getHelmValues('helm-key');
    } else {
        formData.path = document.getElementById('path').value;
        formData.sourceType = document.getElementById('sourceType').value;
        
        if (formData.sourceType === 'helm') {
            formData.helmValues = getHelmValues('git-helm-key');
        } else if (formData.sourceType === 'kustomize') {
            formData.kustomizeImage = document.getElementById('kustomizeImage').value;
        } else if (formData.sourceType === 'directory') {
            formData.directoryRecurse = document.getElementById('directoryRecurse').checked;
        }
    }

    vscode.postMessage({
        command: 'createApplication',
        data: formData
    });
});
