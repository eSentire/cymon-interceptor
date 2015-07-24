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
        chrome.storage.local.set({blacklist: _blacklist})
        chrome.runtime.sendMessage({ action: "blacklistUpdated" });
    };

    this.addToBlacklist = function (domain) {
        if (domain.constructor === Array) {
            _blacklist = _blacklist.concat(domain);
            chrome.storage.local.set({blacklist: _blacklist});
            chrome.runtime.sendMessage({action: "blacklistUpdated"});
            return true;
        } else if (typeof domain === "string") {
            if (_blacklist.indexOf(domain) === -1) {
                _blacklist.push(domain);
                chrome.storage.local.set({blacklist: _blacklist});
                chrome.runtime.sendMessage({action: "blacklistUpdated"});
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    this.clearBlacklist = function() {
        _blacklist = [];
        chrome.storage.local.set({ blacklist: _blacklist });
        chrome.runtime.sendMessage({ action: "blacklistUpdated" });
    };

    this.setLastFetch = function(time) {
        if (typeof time === 'number') {
            _lastFetch = time;
            chrome.storage.local.set({ lastFetch: _lastFetch });
            return true;
        } else {
            return false;
        }
    };

    this.getLastFetch = function() {
        return _lastFetch;
    }
}

//var Blacklist = (function() {
//    var _blacklist = [];
//    var _lastFetch = 0;
//
//    function blacklistObject() {
//    }
//
//    this.init = function (storage) {
//        if (storage) {
//            if (storage.blacklist) {
//                _blacklist = storage.blacklist;
//                chrome.runtime.sendMessage({action: "blacklistUpdated"});
//            }
//            if (storage.lastFetch) {
//                _lastFetch = storage.lastFetch;
//            }
//        }
//    };
//
//    this.getBlacklist = function () {
//        return _blacklist;
//    };
//
//    this.setBlacklist = function (blacklist) {
//        if (blacklist.constructor === Array) {
//            _blacklist = blacklist;
//        }
//        chrome.storage.local.set({blacklist: _blacklist})
//        chrome.runtime.sendMessage({ action: "blacklistUpdated" });
//    };
//
//    this.addToBlacklist = function (domain) {
//        if (_blacklist.indexOf(domain) === -1) {
//            _blacklist.push(domain);
//            chrome.storage.local.set({ blacklist: _blacklist });
//            chrome.runtime.sendMessage({ action: "blacklistUpdated" });
//            return true;
//        } else {
//            return false;
//        }
//    };
//
//    this.setLastFetch = function(time) {
//        if (typeof time === 'number') {
//            _lastFetch = time;
//            chrome.storage.local.set({ lastFetch: _lastFetch });
//            return true;
//        } else {
//            return false;
//        }
//    };
//
//    this.getLastFetch = function() {
//        return _lastFetch;
//    }
//
//    return blacklistObject;
//})();