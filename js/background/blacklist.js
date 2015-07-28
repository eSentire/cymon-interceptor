function Blacklist(blacklist, lastFetch) {
    var _blacklist = blacklist || [];
    var _lastFetch = lastFetch || 0;

    this.getBlacklist = function () {
        return _blacklist;
    };

    this.setBlacklist = function (blacklist) {
        if (blacklist.constructor === Array) {
            _blacklist = blacklist;
        }
        chrome.storage.local.set({blacklist: _blacklist});
        chrome.runtime.sendMessage({ action: "blacklistUpdated" });
    };

    this.addToBlacklist = function (domains) {
        if (domains.constructor === Array) {
            _blacklist = _blacklist.concat(domains);
            chrome.storage.local.set({blacklist: _blacklist});
            chrome.runtime.sendMessage({ action: "blacklistUpdated" });
            return true;
        } else {
            return false;
        }
    };

    this.getLastFetch = function() {
        return _lastFetch;
    };

    this.setLastFetch = function(time) {
        if (typeof time === 'number') {
            _lastFetch = time;
            chrome.storage.local.set({ lastFetch: _lastFetch });
            chrome.runtime.sendMessage({ action: "lastFetchUpdated" });
            return true;
        } else {
            return false;
        }
    };
}