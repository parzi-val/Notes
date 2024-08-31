const editor = document.getElementById('editor');
const captureBtn = document.getElementById('capture-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');
const applySettingsBtn = document.getElementById('apply-settings');
const behaviorSelect = document.getElementById('behavior');
const titleInput = document.getElementById('title');
const spellcheckCheckbox = document.getElementById('spellcheck');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('close');
let timer;
let captureBehavior = 'copy'; // Default behavior

editor.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        save();
    }, 2000); // 2-second delay
});

function save() {
    localStorage.setItem('markdownNotes', editor.innerHTML);
}

// Load last notes from local storage
window.addEventListener('load', () => {
    const savedNotes = localStorage.getItem('markdownNotes');
    if (savedNotes) {
        editor.innerHTML = savedNotes;
    }
});

// Keep caret at the end
function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

// Toggle settings menu
settingsBtn.addEventListener('click', () => {
    const isVisible = settingsMenu.style.display === 'block';
    settingsMenu.style.display = isVisible ? 'none' : 'block';
    overlay.style.display = isVisible ? 'none' : 'block';
});
// Apply settings
applySettingsBtn.addEventListener('click', () => {
    captureBehavior = behaviorSelect.value;
    const title = titleInput.value.trim();
    const spellcheck = spellcheckCheckbox.checked;

    if (title) {
        // Insert title as H2 at the top of the editor
        const existingTitle = editor.querySelector('h2');
        if (existingTitle) {
            existingTitle.textContent = title+"\n";
        } else {
            const h2 = document.createElement('h2');
            h2.textContent = title;
            editor.insertBefore(h2, editor.firstChild);
        }
    } else {
        // Remove title if not provided
        const existingTitle = editor.querySelector('h2');
        if (existingTitle) {
            existingTitle.remove();
        }
    }

    editor.setAttribute('spellcheck', spellcheck ? 'true' : 'false');

    settingsMenu.style.display = 'none';
    overlay.style.display = 'none';
});

closeBtn.addEventListener('click', () => {
    settingsMenu.style.display = 'none';
    overlay.style.display = 'none';
});

// Capture screenshot based on settings
captureBtn.addEventListener('click', () => {
    html2canvas(editor).then(canvas => {
        canvas.toBlob(blob => {
            switch (captureBehavior) {
                case 'copy':
                    const clipboardItem = new ClipboardItem({
                        'image/png': blob
                    });
                    navigator.clipboard.write([clipboardItem]).then(() => {
                        alert('Screenshot copied to clipboard!');
                    }).catch(err => {
                        console.error('Failed to copy to clipboard:', err);
                    });
                    break;
                case 'savePNG':
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = titleInput.value ? titleInput.value + '.png' : 'screenshot.png';
                    link.click();
                    break;
                case 'saveText':
                    const text = editor.innerText;
                    const textBlob = new Blob([text], { type: 'text/plain' });
                    const textLink = document.createElement('a');
                    textLink.href = URL.createObjectURL(textBlob);
                    textLink.download = titleInput.value ? titleInput.value + '.txt' : 'notes.txt';
                    textLink.click();
                    break;
            }
        });
    });
});
