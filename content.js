chrome.runtime.sendMessage({url: window.location.href});

// Function to log all H1 elements
function logAllH1Elements() {
    const h1Elements = document.querySelectorAll('h1');
    h1Elements.forEach(h1 => console.log('H1 Element:', h1.textContent));
}

// Run the function when the script is loaded
logAllH1Elements();
