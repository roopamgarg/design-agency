const renderBtn = document.getElementById('render-btn');
const jsonInput = document.getElementById('json-input') as HTMLTextAreaElement;
const errorMsg = document.getElementById('error-msg') as HTMLDivElement;

if (renderBtn && jsonInput && errorMsg) {
  renderBtn.addEventListener('click', () => {
    errorMsg.style.display = 'none';

    try {
      const payload = JSON.parse(jsonInput.value);
      parent.postMessage({ pluginMessage: { type: 'render-nodes', payload } }, '*');
    } catch (err: any) {
      errorMsg.textContent = 'Invalid JSON: ' + err.message;
      errorMsg.style.display = 'block';
    }
  });
}
