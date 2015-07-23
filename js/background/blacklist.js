var Blacklist = (function() {
    var _blacklist = [];
    var _lastFetch = 0;

    function blacklistObject(){}

    blacklistObject.prototype.init = function (storage) {
        if (storage) {
            if (storage.blacklist) {
                _blacklist = storage.blacklist;
                chrome.runtime.sendMessage({ action: "blacklistUpdated" });
            }
            if (storage.lastFetch) {
                _lastFetch = storage.lastFetch;
            }
        }
    };

    blacklistObject.prototype.getBlacklist = function () {
        return _blacklist;
    };

    blacklistObject.prototype.setBlacklist = function (blacklist) {
        _blacklist = blacklist;
        chrome.storage.local.set({blacklist: _blacklist})
        chrome.runtime.sendMessage({ action: "blacklistUpdated" });
    };

    blacklistObject.prototype.addToBlacklist = function (domain) {
        if (_blacklist.indexOf(domain) == -1) {
            _blacklist.push(domain);
            chrome.storage.local.set({ blacklist: _blacklist });
            chrome.runtime.sendMessage({ action: "blacklistUpdated" });
            return true;
        } else {
            return false;
        }
    };

    blacklistObject.prototype.setLastFetch = function(time) {
        if (typeof time === 'number') {
            _lastFetch = time;
            chrome.storage.local.set({ lastFetch: _lastFetch });
            return true;
        } else {
            return false;
        }
    };

    blacklistObject.prototype.getLastFetch = function() {
        return _lastFetch;
    }

    return blacklistObject;
})();