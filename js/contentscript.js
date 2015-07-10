var blocklist = [];
var notified = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.action) {
        case "addToBlocklist":
            if (blocklist.indexOf(request.domain) == -1) {
                blocklist.push(request.domain);
                sendResponse({ success: true, blocklist: blocklist, notified: notified });
                notified = true;
            } else {
                sendResponse({ success: false, blocklist: blocklist, notified: notified });
            }
            break;
        case "removeFromBlocklist":
            var index = blocklist.indexOf(request.domain);
            if (index != -1) {
                blocklist.splice(index,1);
                sendResponse({ success: true, blocklist: blocklist });
            } else {
                sendResponse({ success: false, blocklist: blocklist });
            }
            break;
        case "getBlocklist":
            sendResponse({ success: true, blocklist: blocklist });
            break;
    }
});
