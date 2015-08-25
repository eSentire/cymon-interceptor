/**
 * @module Blacklist
 * Maintains the list of domains requested from Cymon that have been deemed malicious.
 */
export default (function() {
    var _blacklist = [];

    chrome.storage.local.get(function (storage) {
        _blacklist = storage.blacklist || _blacklist;
        chrome.runtime.sendMessage({action: "updateEvent"});
    });

    /**
     * @function get
     * Returns a copy of the blacklist.
     *
     * @returns {[]}: An array of strings representing the blacklist.
     */
    function get() {
        return JSON.parse(JSON.stringify(_blacklist));
    }

    /**
     * @function clear
     * Sets the blacklist to an empty array.
     */
    function clear() {
        _blacklist = [];
        chrome.storage.local.set({blacklist: _blacklist});
        chrome.runtime.sendMessage({action: "updateEvent"});
    }

    /**
     * @function add
     * Adds an array of strings to the current blacklist.
     *
     * @param domains: A list of strings to be added to the blacklist.
     * @returns {boolean}: true if successful, false if the value for domains is invalid.
     */
    function add(domains) {
        if (domains && domains.constructor === Array) {
            var blacklistHash = {};
            $.each(_blacklist, function (index, domain) {
                blacklistHash[domain] = true;
            });
            $.each(domains, function (index, domain) {
                blacklistHash[domain] = true;
            });

            _blacklist = Object.keys(blacklistHash);
            chrome.storage.local.set({blacklist: _blacklist});
            chrome.runtime.sendMessage({action: "updateEvent"});
            return true;
        } else {
            return false;
        }
    }

    return {
        get: get,
        clear: clear,
        add: add
    };
})();