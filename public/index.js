document.addEventListener('DOMContentLoaded', () => {
    const longUrlInput = document.getElementById('long-url');
    const shortenBtn = document.getElementById('shorten-btn');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');

    shortenBtn.addEventListener('click', async () => {
        const longUrl = longUrlInput.value.trim();
        if (!longUrl) {
            errorDiv.textContent = 'Please enter a URL.';
            errorDiv.style.display = 'block';
            resultDiv.style.display = 'none';
            return;
        }

        try {
            const response = await fetch('/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: longUrl })
            });
            const data = await response.json();
            if (response.ok) {
                const shortUrl = `${window.location.origin}/${data.url}`;
                resultDiv.innerHTML = `<a href="javascript:copyToClipboard('${shortUrl}')" title="Click to copy">${shortUrl}</a>`;
                resultDiv.style.display = 'block';
                errorDiv.style.display = 'none';
            } else {
                errorDiv.textContent = data.error || 'An error occurred.';
                errorDiv.style.display = 'block';
                resultDiv.style.display = 'none';
            }
        } catch (error) {
            errorDiv.textContent = 'An error occurred.';
            errorDiv.style.display = 'block';
            resultDiv.style.display = 'none';
        }
    });
});

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy: ', err);
    });
}
