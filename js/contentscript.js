var blocklist = [];
var notified = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.action) {
        case "addToBlocklist":
            if (blocklist.indexOf(request.domain) == -1) {
                blocklist.push(request.domain);
                sendResponse({success: true});
            } else {
                sendResponse({success: false});
            }
            break;
        case "removeFromBlocklist":
            var index = blocklist.indexOf(request.domain);
            if (index != -1) {
                blocklist.splice(index);
                sendResponse({success: true});
            } else {
                sendResponse({success: false});
            }
            break;
        case "getBlocklist":
            sendResponse({success: true, blocklist: blocklist});
            break;
        case "clearBlocklist":
            blocklist = [];
            sendResponse({success: true});
            break;
        case "getNotified":
            sendResponse({success: true, notified: notified});
            notified = true;
            break;
    }
});
