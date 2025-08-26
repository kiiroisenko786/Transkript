import './index.css';

console.log('👋 This message is being logged by "renderer.ts", included via Vite');

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.querySelector('.add-btn') as HTMLButtonElement;
  const helpBtn = document.querySelector('.help-btn') as HTMLButtonElement;
  const exportBtn = document.querySelector('.export-btn') as HTMLButtonElement;
  const textArea = document.querySelector('.text-area') as HTMLTextAreaElement;
  const resultsContent = document.querySelector('.results-content') as HTMLDivElement;
  
  // Modal elements
  const modal = document.getElementById('editModal') as HTMLDivElement;
  const closeBtn = document.querySelector('.close') as HTMLSpanElement;
  const saveBtn = document.querySelector('.save-btn') as HTMLButtonElement;
  const deleteBtn = document.querySelector('.delete-btn') as HTMLButtonElement;
  const cancelBtn = document.querySelector('.cancel-btn') as HTMLButtonElement;
  
  // Error modal elements
  const errorModal = document.getElementById('errorModal') as HTMLDivElement;
  const errorCloseBtn = document.querySelector('.error-close') as HTMLSpanElement;
  const errorOkBtn = document.querySelector('.error-ok-btn') as HTMLButtonElement;
  const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
  
  // Help modal elements
  const helpModal = document.getElementById('helpModal') as HTMLDivElement;
  const helpCloseBtn = document.querySelector('.help-close') as HTMLSpanElement;
  const helpOkBtn = document.querySelector('.help-ok-btn') as HTMLButtonElement;
  
  const results: Array<{id: string, start: string, end: string, text: string}> = [];
  let currentEditIndex = -1;

  // Input validation function
  function validateAndFormatInput(input: HTMLInputElement) {
    const value = parseInt(input.value);
    const min = parseInt(input.getAttribute('min') || '0');
    const max = parseInt(input.getAttribute('max') || '99');
    
    if (isNaN(value)) {
      input.value = '';
      return;
    }
    
    if (value < min) {
      input.value = min.toString().padStart(2, '0');
    } else if (value > max) {
      input.value = max.toString().padStart(2, '0');
    } else {
      input.value = value.toString().padStart(2, '0');
    }
  }

  // Time comparison function
  function timeToSeconds(timeString: string): number {
    const parts = timeString.split(':').map(part => parseInt(part) || 0);
    return parts[0] * 3600 + parts[1] * 60 + parts[2] + parts[3] * 0.01;
  }

  function isStartTimeBeforeEndTime(startTime: string, endTime: string): boolean {
    return timeToSeconds(startTime) < timeToSeconds(endTime);
  }

  // Duplicate check function
  function isDuplicateRecord(startTime: string, endTime: string, text: string, excludeIndex = -1): boolean {
    return results.some((result, index) => {
      if (index === excludeIndex) return false;
      return result.start === startTime && result.end === endTime && result.text === text;
    });
  }

  // Sort results by start time
  function sortResultsByStartTime() {
    results.sort((a, b) => timeToSeconds(a.start) - timeToSeconds(b.start));
  }

  // Custom error dialog functions
  function showError(message: string) {
    errorMessage.textContent = message;
    errorModal.style.display = 'block';
    
    // Focus the OK button for keyboard accessibility
    setTimeout(() => {
      errorOkBtn.focus();
    }, 100);
  }

  function closeError() {
    errorModal.style.display = 'none';
  }

  function showHelp() {
    helpModal.style.display = 'block';
    
    // Focus the OK button for keyboard accessibility
    setTimeout(() => {
      helpOkBtn.focus();
    }, 100);
  }

  function closeHelp() {
    helpModal.style.display = 'none';
  }

  function showConfirmation(message: string, callback: () => void) {
    // For now, we'll use a custom confirm. We can enhance this later if needed.
    if (confirm(message)) {
      callback();
    }
  }

  // Add input validation to all time inputs
  function addInputValidation() {
    const timeInputs = document.querySelectorAll('.time-input, .edit-time-input') as NodeListOf<HTMLInputElement>;
    timeInputs.forEach(input => {
      input.addEventListener('input', () => validateAndFormatInput(input));
      input.addEventListener('blur', () => validateAndFormatInput(input));
    });
  }

  addInputValidation();

  // Error modal event listeners
  errorCloseBtn?.addEventListener('click', closeError);
  errorOkBtn?.addEventListener('click', closeError);
  
  // Help modal event listeners
  helpCloseBtn?.addEventListener('click', closeHelp);
  helpOkBtn?.addEventListener('click', closeHelp);
  
  window.addEventListener('click', (event) => {
    if (event.target === errorModal) {
      closeError();
    }
    if (event.target === helpModal) {
      closeHelp();
    }
    if (event.target === modal) {
      closeEditModal();
    }
  });

  // ESC key to close modals
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (errorModal.style.display === 'block') {
        closeError();
      } else if (helpModal.style.display === 'block') {
        closeHelp();
      } else if (modal.style.display === 'block') {
        closeEditModal();
      }
    }
  });

  // Add to Results functionality
  addBtn?.addEventListener('click', () => {
    const startInputs = document.querySelectorAll('.time-row:first-child .time-input') as NodeListOf<HTMLInputElement>;
    const endInputs = document.querySelectorAll('.time-row:last-child .time-input') as NodeListOf<HTMLInputElement>;
    const text = textArea?.value.trim();

    if (!text) {
      showError('Please enter some text before adding to results.');
      return;
    }

    const startTime = Array.from(startInputs).map(input => input.value || '00').join(':');
    const endTime = Array.from(endInputs).map(input => input.value || '00').join(':');

    // Validate start time is before end time
    if (!isStartTimeBeforeEndTime(startTime, endTime)) {
      showError('Start time must be before end time.');
      return;
    }

    // Check for duplicate records
    if (isDuplicateRecord(startTime, endTime, text)) {
      showError('This record already exists. Duplicate records are not allowed.');
      return;
    }

    const result = {
      id: Date.now().toString(),
      start: startTime,
      end: endTime,
      text: text
    };

    results.push(result);
    sortResultsByStartTime();
    updateResultsDisplay();
    
    // Clear the form
    textArea.value = '';
    startInputs.forEach(input => input.value = '');
    endInputs.forEach(input => input.value = '');
  });

  // Help functionality
  helpBtn?.addEventListener('click', () => {
    showHelp();
  });

  // Export functionality
  exportBtn?.addEventListener('click', () => {
    if (results.length === 0) {
      showError('No results to export. Please add some entries first.');
      return;
    }

    const exportText = '<begin subtitles>\n\n' + 
      results.map(result => {
        // Remove all line breaks and replace with spaces to ensure single line text
        const singleLineText = result.text.replace(/[\r\n]+/g, ' ').trim();
        return `${result.start} ${result.end}\n${singleLineText}`;
      }).join('\n \n') + 
      '\n\n<end subtitles>';

    // Create and download file
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Modal functionality
  function openEditModal(index: number) {
    const result = results[index];
    if (!result) return;

    currentEditIndex = index;
    
    // Parse time values
    const startParts = result.start.split(':');
    const endParts = result.end.split(':');
    
    // Populate edit form
    (document.getElementById('editStartH') as HTMLInputElement).value = startParts[0] || '00';
    (document.getElementById('editStartM') as HTMLInputElement).value = startParts[1] || '00';
    (document.getElementById('editStartS') as HTMLInputElement).value = startParts[2] || '00';
    (document.getElementById('editStartMs') as HTMLInputElement).value = startParts[3] || '00';
    
    (document.getElementById('editEndH') as HTMLInputElement).value = endParts[0] || '00';
    (document.getElementById('editEndM') as HTMLInputElement).value = endParts[1] || '00';
    (document.getElementById('editEndS') as HTMLInputElement).value = endParts[2] || '00';
    (document.getElementById('editEndMs') as HTMLInputElement).value = endParts[3] || '00';
    
    (document.getElementById('editText') as HTMLTextAreaElement).value = result.text;
    
    modal.style.display = 'block';
  }

  function closeEditModal() {
    modal.style.display = 'none';
    currentEditIndex = -1;
  }

  // Modal event listeners
  closeBtn?.addEventListener('click', closeEditModal);
  cancelBtn?.addEventListener('click', closeEditModal);

  saveBtn?.addEventListener('click', () => {
    if (currentEditIndex === -1) return;

    const editText = (document.getElementById('editText') as HTMLTextAreaElement).value.trim();
    if (!editText) {
      showError('Please enter some text.');
      return;
    }

    const startTime = [
      (document.getElementById('editStartH') as HTMLInputElement).value || '00',
      (document.getElementById('editStartM') as HTMLInputElement).value || '00',
      (document.getElementById('editStartS') as HTMLInputElement).value || '00',
      (document.getElementById('editStartMs') as HTMLInputElement).value || '00'
    ].join(':');

    const endTime = [
      (document.getElementById('editEndH') as HTMLInputElement).value || '00',
      (document.getElementById('editEndM') as HTMLInputElement).value || '00',
      (document.getElementById('editEndS') as HTMLInputElement).value || '00',
      (document.getElementById('editEndMs') as HTMLInputElement).value || '00'
    ].join(':');

    // Validate start time is before end time
    if (!isStartTimeBeforeEndTime(startTime, endTime)) {
      showError('Start time must be before end time.');
      return;
    }

    // Check for duplicate records (excluding current record being edited)
    if (isDuplicateRecord(startTime, endTime, editText, currentEditIndex)) {
      showError('This record already exists. Duplicate records are not allowed.');
      return;
    }

    results[currentEditIndex] = {
      ...results[currentEditIndex],
      start: startTime,
      end: endTime,
      text: editText
    };

    sortResultsByStartTime();
    updateResultsDisplay();
    closeEditModal();
  });

  deleteBtn?.addEventListener('click', () => {
    if (currentEditIndex === -1) return;
    
    showConfirmation('Are you sure you want to delete this entry?', () => {
      results.splice(currentEditIndex, 1);
      updateResultsDisplay();
      closeEditModal();
    });
  });

  function updateResultsDisplay() {
    if (!resultsContent) return;
    
    resultsContent.innerHTML = results.map((result, index) => 
      `<div class="result-item" data-index="${index}" data-id="${result.id}">
        <div class="result-time">${result.start} --> ${result.end}</div>
        <div class="result-text">${result.text}</div>
      </div>`
    ).join('');

    // Add click listeners to result items
    const resultItems = resultsContent.querySelectorAll('.result-item');
    resultItems.forEach((item) => {
      item.addEventListener('click', () => {
        const index = parseInt((item as HTMLElement).dataset.index || '-1');
        if (index >= 0) {
          openEditModal(index);
        }
      });
    });
  }
});
