document.addEventListener('DOMContentLoaded', (event) => {
    const checkbox = document.getElementById('toggleCheckbox');
  
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        chrome.runtime.sendMessage({ action: 'start' });
      } else {
        chrome.runtime.sendMessage({ action: 'stop' });
      }
    });
  });
  
  