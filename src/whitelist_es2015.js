/**
 * @module Whitelist
 * Maintains the list of domains Cymon has deemed malicious but which the user wishes to allow anyway.
 */
export default (function() {
    var _whitelist = [];

    chrome.storage.sync.get(function (storage) {
        _whitelist = storage.whitelist || _whitelist;
    });

    /**
     * @function get
     * Returns a copy of the whitelist.
     *
     * @returns {[]}: An array of strings representing the whitelist.
     */
    function get() {
        return JSON.parse(JSON.stringify(_whitelist));
    }

    /**
     * @function add
     * Adds an individual domain to the whitelist.
     *
     * @param domain: A string representing the domain to be added.
     * @returns {boolean}: true if successful, false if the value for domain is invalid or if the domain is already in the whitelist.
     */
    function add(domain) {
        if (typeof domain == "string" && _whitelist.indexOf(domain) == -1) {
            _whitelist.push(domain);
            chrome.storage.sync.set({whitelist: _whitelist});
            chrome.runtime.sendMessage({action: "updateEvent"});
            return true;
        } else {
            return false;
        }
    }

    /**
     * @function remove
     * Removes an individual domain from the whitelist.
     *
     * @param domain: A string representing the domain to be removed.
     * @returns {boolean}: true if successful, false if the value for domain is invalid or if the domain is not in the whitelist.
     */
    function remove(domain) {
        if (typeof domain == "string") {
            var index = _whitelist.indexOf(domain)
            if (index != -1) {
                _whitelist.splice(index, 1);
                chrome.storage.sync.set({whitelist: _whitelist});
                chrome.runtime.sendMessage({action: "updateEvent"});
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * @function clear
     * Sets the whitelist to an empty array.
     */
    function clear() {
        _whitelist = [];
        chrome.storage.sync.set({whitelist: []});
        chrome.runtime.sendMessage({action: "updateEvent"});
    }

    return {
        get: get,
        add: add,
        remove: remove,
        clear: clear
    };
})();