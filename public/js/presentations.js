// Presentations functionality for homepage
class PresentationsManager {
    constructor() {
        this.startDateInput = document.getElementById('start-date');
        this.endDateInput = document.getElementById('end-date');
        this.filterBtn = document.getElementById('filter-btn');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.presentationsTable = document.getElementById('presentations-table');
        this.presentationsTbody = document.getElementById('presentations-tbody');
        this.downloadJsonBtn = document.getElementById('download-json');
        this.downloadXmlBtn = document.getElementById('download-xml');
        
        this.currentData = null;
        this.currentParams = null;
        
        this.initializeEventListeners();
        this.setDefaultDates();
    }
    
    initializeEventListeners() {
        // Filter button click
        this.filterBtn.addEventListener('click', () => this.loadPresentations());
        
        // Enter key on date inputs
        this.startDateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadPresentations();
        });
        
        this.endDateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadPresentations();
        });
        
        // Download buttons
        this.downloadJsonBtn.addEventListener('click', () => this.downloadData('json'));
        this.downloadXmlBtn.addEventListener('click', () => this.downloadData('xml'));
    }
    
    setDefaultDates() {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        
        this.startDateInput.value = today.toISOString().split('T')[0];
        this.endDateInput.value = nextMonth.toISOString().split('T')[0];
    }
    
    async loadPresentations() {
        const startDate = this.startDateInput.value;
        const endDate = this.endDateInput.value;
        
        // Validate dates
        if (startDate && endDate && startDate > endDate) {
            this.showError('Η ημερομηνία έναρξης δεν μπορεί να είναι μεταγενέστερη της ημερομηνίας λήξης.');
            return;
        }
        
        this.showLoading(true);
        this.disableDownloadButtons();
        
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            
            const response = await fetch(`/api/presentations?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.currentData = data;
            this.currentParams = params;
            
            this.displayPresentations(data.presentations);
            this.enableDownloadButtons();
            
        } catch (error) {
            console.error('Error loading presentations:', error);
            this.showError('Σφάλμα κατά τη φόρτωση των παρουσιάσεων. Παρακαλώ δοκιμάστε ξανά.');
        } finally {
            this.showLoading(false);
        }
    }
    
    displayPresentations(presentations) {
        if (!presentations || presentations.length === 0) {
            this.presentationsTbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-calendar-times me-2"></i>
                        Δεν βρέθηκαν παρουσιάσεις για το επιλεγμένο χρονικό διάστημα
                    </td>
                </tr>
            `;
            return;
        }
        
        this.presentationsTbody.innerHTML = presentations.map(presentation => {
            const examDate = new Date(presentation.exam_datetime);
            const formattedDate = examDate.toLocaleDateString('el-GR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const formattedTime = examDate.toLocaleTimeString('el-GR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const examMode = presentation.exam_mode === 'online' ? 
                '<span class="badge bg-info"><i class="fas fa-video me-1"></i>Διαδικτυακά</span>' :
                '<span class="badge bg-success"><i class="fas fa-users me-1"></i>Δια ζώσης</span>';
            
            return `
                <tr>
                    <td>
                        <strong>${this.escapeHtml(presentation.title)}</strong>
                        ${presentation.description ? `<br><small class="text-muted">${this.escapeHtml(presentation.description.substring(0, 100))}${presentation.description.length > 100 ? '...' : ''}</small>` : ''}
                    </td>
                    <td>${this.escapeHtml(presentation.student_name)}</td>
                    <td>
                        ${this.escapeHtml(presentation.supervisor_name)}
                        ${presentation.supervisor_department ? `<br><small class="text-muted">${this.escapeHtml(presentation.supervisor_department)}</small>` : ''}
                    </td>
                    <td>
                        <strong>${formattedDate}</strong><br>
                        <small class="text-muted">${formattedTime}</small>
                    </td>
                    <td>${presentation.exam_location ? this.escapeHtml(presentation.exam_location) : '<span class="text-muted">-</span>'}</td>
                    <td>${examMode}</td>
                </tr>
            `;
        }).join('');
    }
    
    async downloadData(format) {
        if (!this.currentParams) {
            this.showError('Παρακαλώ κάντε πρώτα αναζήτηση για να κατεβάσετε δεδομένα.');
            return;
        }
        
        try {
            const params = new URLSearchParams(this.currentParams);
            params.set('format', format);
            
            const response = await fetch(`/api/presentations?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            const startDate = this.startDateInput.value || 'all';
            const endDate = this.endDateInput.value || 'all';
            a.download = `presentations_${startDate}_to_${endDate}.${format}`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error downloading data:', error);
            this.showError('Σφάλμα κατά τη λήψη των δεδομένων. Παρακαλώ δοκιμάστε ξανά.');
        }
    }
    
    showLoading(show) {
        if (show) {
            this.loadingIndicator.classList.remove('d-none');
            this.presentationsTable.style.opacity = '0.5';
            this.filterBtn.disabled = true;
        } else {
            this.loadingIndicator.classList.add('d-none');
            this.presentationsTable.style.opacity = '1';
            this.filterBtn.disabled = false;
        }
    }
    
    enableDownloadButtons() {
        this.downloadJsonBtn.disabled = false;
        this.downloadXmlBtn.disabled = false;
    }
    
    disableDownloadButtons() {
        this.downloadJsonBtn.disabled = true;
        this.downloadXmlBtn.disabled = true;
    }
    
    showError(message) {
        // Create or update error alert
        let errorAlert = document.getElementById('error-alert');
        if (!errorAlert) {
            errorAlert = document.createElement('div');
            errorAlert.id = 'error-alert';
            errorAlert.className = 'alert alert-danger alert-dismissible fade show mt-3';
            this.presentationsTable.parentNode.insertBefore(errorAlert, this.presentationsTable);
        }
        
        errorAlert.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorAlert && errorAlert.parentNode) {
                errorAlert.remove();
            }
        }, 5000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PresentationsManager();
});
