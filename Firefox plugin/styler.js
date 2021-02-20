// https://github.com/mdn/webextensions-examples/tree/master/apply-css was used to make this code

const CSS = ".ghx-column.ghx-busted.ghx-busted-max.ghx-narrow-card { background: #3bb910; } ";


const TITLE_APPLY = "Apply style";
const TITLE_REMOVE = "Remove style";
const APPLICABLE_PROTOCOLS = ["http:", "https:"];

/*
Toggle style: based on the current title, insert or remove the CSS.
Update the page action's title and icon to reflect its state.
*/
function toggleStyle(tab) {

    function gotTitle(title) {
        if (title === TITLE_APPLY) {
            browser.browserAction.setIcon({tabId: tab.id, path: "icons/letter-j-48-blue.png"});
            browser.browserAction.setTitle({tabId: tab.id, title: TITLE_REMOVE});
            browser.tabs.insertCSS({code: CSS});
        } else {
            browser.browserAction.setIcon({tabId: tab.id, path: "icons/letter-j-48-gray.png"});
            browser.browserAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
            browser.tabs.removeCSS({code: CSS});
        }
    }

    const gettingTitle = browser.browserAction.getTitle({tabId: tab.id});
    gettingTitle.then(gotTitle);
}

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
        browser.browserAction.setIcon({tabId: tab.id, path: "icons/letter-j-48-gray.png"});
        browser.browserAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
        browser.browserAction.show(tab.id);
    }
}

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

/*
Toggle CSS when the page action is clicked.
*/
browser.browserAction.onClicked.addListener(toggleStyle);
