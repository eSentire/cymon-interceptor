/***************************************************************************
*****************************Class WrapperTab*******************************
***************************************************************************/

//This whole class should (hopefully) be removed in favour of putting everything in a content-script, which should maintain individual contexts for each page

function WrapperTab(tabId) {
    this._tabId = tabId;
    this._notified = false;
    this._blocklist = new Blocklist();
}

WrapperTab.prototype.getId = function() {
    return this._tabId;
};

WrapperTab.prototype.isNotified = function() {
    return this._notified;
};

WrapperTab.prototype.setNotified = function(notified) {
    this._notified = notified;
};

WrapperTab.prototype.getBlocklist = function () {
    return this._blocklist.get();
};

WrapperTab.prototype.addToBlocklist = function (domain) {
    this._blocklist.add(domain);
    this.updateBadge();
};

WrapperTab.prototype.removeFromBlocklist = function (domain) {
    this._blocklist.remove(domain);
    this.updateBadge();
};

WrapperTab.prototype.clearBlocklist = function () {
    this._blocklist.clear();
    this.updateBadge();
};

WrapperTab.prototype.updateBadge = function() {
    var count = this._blocklist.get().length;
    if (count) {
        chrome.browserAction.setBadgeText({"text": count.toString()});
    } else {
        chrome.browserAction.setBadgeText({"text": ""});
    }
};