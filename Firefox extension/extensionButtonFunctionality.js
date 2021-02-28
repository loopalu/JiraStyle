
const TITLE_APPLY = "Apply style";
const TITLE_REMOVE = "Remove style";
const APPLICABLE_PROTOCOLS = ["http:", "https:"];
let styleIsOn = false;

/*
Returns true only if the URL's protocol is in APPLICABLE_PROTOCOLS.
Argument url must be a valid URL string.
*/
function protocolIsApplicable(url) {
    const protocol = (new URL(url)).protocol;
    return APPLICABLE_PROTOCOLS.includes(protocol);
}

/*
Initialize the page action: set icon and title, then show.
Only operates on tabs whose URL's protocol is applicable.
*/
function initializebrowserAction(tab) {
    if (protocolIsApplicable(tab.url)) {
        if (styleIsOn) {
            browser.browserAction.setIcon({tabId: tab.id, path: "icons/letter-j-48-blue.png"});
            browser.browserAction.setTitle({tabId: tab.id, title: TITLE_REMOVE});
        } else {
            browser.browserAction.setIcon({tabId: tab.id, path: "icons/letter-j-48-gray.png"});
            browser.browserAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
        }
    }
}

function turnStyleOn(tab) {
    styleIsOn = true;
    browser.browserAction.setIcon({tabId: tab.id, path: "icons/letter-j-48-blue.png"});
    browser.browserAction.setTitle({tabId: tab.id, title: TITLE_REMOVE});
    notifyModeChange("on");
}

function turnStyleOff(tab) {
    styleIsOn = false;
    browser.browserAction.setIcon({tabId: tab.id, path: "icons/letter-j-48-gray.png"});
    browser.browserAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
    notifyModeChange("off");
}

function toggleStyle (tab) {
    function gotTitle(title) {
        if (styleIsOn) {
            turnStyleOff(tab)
        } else {
            turnStyleOn(tab)
        }
    }

    const gettingTitle = browser.browserAction.getTitle({tabId: tab.id});
    gettingTitle.then(gotTitle);
}

function notifyModeChange (newMode) {
    browser.storage.local.set({ "JiraStyle": newMode });
    browser.tabs.query({}, function(tabs) {
        for (let i=0; i<tabs.length; ++i) {
            const tab = tabs[i];
            const url = tab.url;
            if (url.indexOf("jira.com") !== -1) {
                browser.tabs.sendMessage(tab.id, {action: newMode});
            }
        }
    });
}

browser.storage.local.get(["JiraStyle"], function(items){
    if (items["JiraStyle"] === 'off') {
        styleIsOn = false;
    } else {
        styleIsOn = true;
    }
});

/*
Toggle CSS when the page action is clicked.
*/
browser.browserAction.onClicked.addListener(toggleStyle);

/*
When first loaded, initialize the page action for all tabs.
*/
const gettingAllTabs = browser.tabs.query({});
gettingAllTabs.then((tabs) => {
    for (let tab of tabs) {
        initializebrowserAction(tab);
    }
});

/*
Each time a tab is updated, reset the page action for that tab.
*/
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    initializebrowserAction(tab);
});
