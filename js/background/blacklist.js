function Blacklist(blacklist, lastFetch) {
    var _blacklist = blacklist || [];

    this.get = function () {
        return _blacklist;
    };

    this.set = function (blacklist) {
        if (blacklist.constructor === Array) {
            _blacklist = blacklist;
        }
        chrome.storage.local.set({blacklist: _blacklist});
        chrome.runtime.sendMessage({ action: "blacklistUpdated" });
    };

    this.add = function (domains) {
        if (domains.constructor === Array) {
            _blacklist = _blacklist.concat(domains);
            chrome.storage.local.set({blacklist: _blacklist});
            chrome.runtime.sendMessage({ action: "blacklistUpdated" });
            return true;
        } else {
            return false;
        }
    };
}