// Função para mostrar mensagens de alerta
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container');
    
    if (!alertContainer) {
        // Criar container de alertas se não existir
        const container = document.createElement('div');
        container.id = 'alert-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    // Criar alerta
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.setAttribute('role', 'alert');
    
    // Conteúdo do alerta
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    // Adicionar ao container
    document.getElementById('alert-container').appendChild(alert);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            alert.remove();
        }, 300);
    }, 5000);
}

// Inicialização geral
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltips.length > 0) {
        Array.from(tooltips).forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
    }
    
    // Verificar formulários de configuração
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSettings();
        });
    }
    
    // Alternar visibilidade de elementos
    const toggleButtons = document.querySelectorAll('.toggle-visibility');
    if (toggleButtons.length > 0) {
        Array.from(toggleButtons).forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    if (targetElement.classList.contains('d-none')) {
                        targetElement.classList.remove('d-none');
                        this.innerHTML = this.getAttribute('data-hide-text') || 'Esconder';
                    } else {
                        targetElement.classList.add('d-none');
                        this.innerHTML = this.getAttribute('data-show-text') || 'Mostrar';
                    }
                }
            });
        });
    }
});

// Salvar configurações
function saveSettings() {
    const settingsForm = document.getElementById('settings-form');
    
    if (!settingsForm) return;
    
    // Obter dados das atividades
    const activities = {};
    const activityElements = document.querySelectorAll('.activity-item');
    
    Array.from(activityElements).forEach(activity => {
        const id = activity.getAttribute('data-id');
        const enabled = activity.querySelector('.activity-toggle').checked;
        const color = activity.querySelector('.activity-color').value;
        const icon = activity.querySelector('.activity-icon').value;
        const sound = activity.querySelector('.activity-sound').value;
        
        activities[id] = {
            enabled,
            color,
            icon,
            sound
        };
    });
    
    // Enviar para o servidor
    fetch('/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activities }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Configurações salvas com sucesso!', 'success');
        } else {
            showAlert('Erro ao salvar configurações: ' + (data.error || 'Erro desconhecido'), 'danger');
        }
    })
    .catch(error => {
        console.error('Erro ao salvar configurações:', error);
        showAlert('Erro ao salvar configurações. Tente novamente.', 'danger');
    });
}

// Copiar texto para a área de transferência
function copyToClipboard(text, successMessage = 'Copiado!') {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showAlert(successMessage, 'success');
        } else {
            showAlert('Não foi possível copiar o texto', 'warning');
        }
    } catch (err) {
        console.error('Erro ao copiar texto:', err);
        showAlert('Erro ao copiar texto', 'danger');
    }
    
    document.body.removeChild(textArea);
} 