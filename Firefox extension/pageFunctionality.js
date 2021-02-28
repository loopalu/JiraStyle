// Initial injection - checks if dark mode is enabled.
browser.storage.local.get(["JiraStyle"], injectOnLoad);

function injectOnLoad(items){
    if (items["JiraStyle"] !== 'off') {
        (document.body || document.head || document.documentElement).appendChild(style);
    }
}

// Subscribe to other necessary events.
document.addEventListener('DOMContentLoaded', changeStyleImportance, false);
browser.runtime.onMessage.addListener(toggleStyle);

// Moves style tag to the head once the document has loaded.
function changeStyleImportance(){
    document.removeEventListener('DOMContentLoaded', changeStyleImportance, false);
    document.getElementsByTagName('head')[0].appendChild(document.getElementById('JiraStyle'));
}

// Toggle style on/off when toggle is activated.
function toggleStyle(message, sender, sendResponse) {
    if (message.action === 'on') {
        browser.storage.local.get(["JiraStyle"], injectOnLoad);
        changeStyleImportance()
    }
    else if (message.action === 'off') {
        var element = document.getElementById('JiraStyle');
        element.parentElement.removeChild(element);
    }
}

var style = document.createElement('style');
style.id = "JiraStyle";
style.className = "JiraStyle";
style.type = "text/css";
style.textContent = `.adg3 .ghx-column-headers .ghx-column.ghx-busted-max, .adg3 .ghx-columns .ghx-column.ghx-busted-max { background: #3bb910; }`;