/**
 * @module Fetcher
 * Coordinates fetching of information from Cymon.
 */
export default (function() {
    var _tags = {
        "blacklist": false,
        "botnet": false,
        "dnsbl": true,
        "malicious activity": false,
        "malware": false,
        "phishing": false,
        "spam": false
    };
    var _fetchLookback = 1;
    var _fetchInterval = 24;
    var _lastFetch = 0;

    var _timeout = 0; //Used for setting up fetch timing using the setTimeout function
    var _timestamp = 0; //Timestamps each fetch request so that when they return they can be validated

    chrome.storage.sync.get(function (storage) {
        _tags = storage.tags || _tags;
        _fetchLookback = storage.fetchLookback || _fetchLookback;
        _fetchInterval = storage.fetchInterval || _fetchInterval;
        _lastFetch = storage.lastFetch || _lastFetch;
        updateFetchTimer();
    });

    /**
     * @function fetchBlacklistForTag
     * Private helper function, fetches blacklist for a given tag
     *
     * @param tag: Tag for webrequest; one of '_tags' above
     * @param timestamp: Timestamp of request, for validation upon return (requests that return with outdated timestamps are discarded)
     * @returns {Promise}: Resolves if request returns successfully, rejects if an error occurs
     */
    function fetchBlacklistForTag(tag, timestamp) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();

            request.open(
                "GET",
                `http://cymoncommunity-dev-wartenuq33.elasticbeanstalk.com/api/nexus/v1/blacklist/domain/${encodeURIComponent(tag)}/?days=${encodeURIComponent(_fetchLookback)}&limit=25000`
            );

            request.onload = function () {
                if (request.status == 200) {
                    var domains = [];

                    $.each(JSON.parse(request.response).results, function (index, domain) {
                        domains.push(domain.name);
                    });
                    resolve({
                        domains: domains,
                        timestamp: timestamp
                    });
                } else {
                    reject(Error(request.statusText));
                }
            };

            request.onerror = function () {
                reject(Error("There was an error fetching domains from Cymon."));
            };

            request.send();
        });
    }

    /**
     * @function fetchBlacklist
     * Fetches the new blacklist from Cymon and stores it in memory
     *
     * @param blacklist: The blacklist object to store information to
     */
    function fetchBlacklist(blacklist) {
        var tags = [];

        blacklist.clear();
        $.each(_tags, function (tag, enabled) {
            if (enabled) {
                tags.push(tag);
            }
        });

        if (tags.length) {
            _timestamp = new Date().getTime();
            $.each(tags, function (index, tag) {
                fetchBlacklistForTag(tag, _timestamp).then(function (response) {
                    if (response.timestamp == _timestamp) {
                        blacklist.add(response.domains);
                        chrome.runtime.sendMessage({action: "updateEvent"});
                    }
                });
            });
            this.setLastFetch(new Date().getTime());
        }
    }

    /**
     * @function updateFetchTimer
     * Called to update the timer for the next fetch event. This can occur whenever a setting is changed, whenever a fetch occurs, or when the extension is first installed.
     */
    function updateFetchTimer() {
        if (_timeout) {
            clearTimeout(_timeout);
        }

        _timeout = setTimeout(
            function () {
                chrome.runtime.sendMessage({action: "fetchEvent"});
            },
            _lastFetch > 0 ? _lastFetch + _fetchInterval * 3600000 - new Date().getTime() : 0
        );
    }

    function _setTags(tags) {
        if (tags && typeof tags === "object" && Object.keys(_tags).sort().toString() === Object.keys(tags).sort().toString() && JSON.stringify(_tags) != JSON.stringify(tags)) {
            _tags = JSON.parse(JSON.stringify(tags));
            chrome.storage.sync.set({tags: _tags});
            return true;
        } else {
            return false;
        }
    }

    function _setFetchLookback(fetchLookback) {
        if (fetchLookback && typeof fetchLookback === "number" && fetchLookback != _fetchLookback && fetchLookback % 1 === 0 && fetchLookback > 0 && fetchLookback <= 3) {
            _fetchLookback = fetchLookback;
            chrome.storage.sync.set({fetchLookback: _fetchLookback});
            return true;
        } else {
            return false;
        }
    }

    /**
     * @function save
     * Used by angular controllers for bulk saving of settings from Options page without repeated triggering of events
     *
     * @param tags: An object containing the keys corresponding to Cymon's event tags, and values representing whether they should be searched or not.
     * @param fetchLookback: An integer from 1 to 3. Represents the number of days to look back.
     * @param fetchInterval: An integer from 1 to 24. Represents the frequency in hours to perform a new fetch.
     */
    function save(tags, fetchLookback, fetchInterval) {
        var tagsModified = _setTags(tags);
        var lookbackModified = _setFetchLookback(fetchLookback);
        this.setFetchInterval(fetchInterval);

        if (tagsModified || lookbackModified) {
            chrome.runtime.sendMessage({action: "fetchEvent"});
        }
    }

    /**
     * @function setTags
     * Updates the tags to fetch from Cymon.
     *
     * @param tags
     * @returns {boolean}: true if successful, false if an invalid value is passed in for tags.
     */
    function setTags(tags) {
        var tagsModified = _setTags(tags);
        if (tagsModified) {
            chrome.runtime.sendMessage({action: "fetchEvent"});
        }
        return tagsModified;
    }

    /**
     * @function setFetchLookback
     * Sets how far back to look for events when fetching from Cymon.
     *
     * @param fetchLookback: An integer from 1 to 3. Represents the number of days to look back.
     * @returns {boolean}: true if successful, false if an invalid value is passed in for fetchLookback.
     */
    function setFetchLookback(fetchLookback) {
        var lookbackModified = _setFetchLookback(fetchLookback);
        if (lookbackModified) {
            chrome.runtime.sendMessage({action: "fetchEvent"});
        }
        return lookbackModified;
    }

    /**
     * @function setFetchInterval
     * Sets how often Cymon Interceptor will fetch a new list from Cymon.
     *
     * @param fetchInterval: An integer from 1 to 24. Represents the frequency in hours to perform a new fetch.
     * @returns {boolean}: true if successful, false if an invalid value is passed in for fetchInterval.
     */
    function setFetchInterval(fetchInterval) {
        if (fetchInterval && typeof fetchInterval === "number" && fetchInterval % 1 === 0 && fetchInterval > 0 && fetchInterval <= 24) {
            _fetchInterval = fetchInterval;
            chrome.storage.sync.set({fetchInterval: _fetchInterval});
            this.updateFetchTimer();
            return true;
        } else {
            return false;
        }
    }

    /**
     * @function setLastFetch
     * Sets the time of the last fetch.
     *
     * @param time: An integer, time since epoch in milliseconds. Represents the most recent time a fetch event occurred.
     * @returns {boolean}: true if successful, false if an invalid value is passed in for time.
     */
    function setLastFetch(time) {
        if (time && typeof time === "number" && time % 1 == 0) {
            _lastFetch = time;
            chrome.storage.sync.set({lastFetch: _lastFetch});
            this.updateFetchTimer();
            return true;
        } else {
            return false;
        }
    }

    /**
     * @function getTags
     * Returns copy of the tags object.
     *
     * @returns {{blacklist: boolean, botnet: boolean, dnsbl: boolean, malicious activity: boolean, malware: boolean, phishing: boolean, spam: boolean}}
     */
    function getTags() {
        return JSON.parse(JSON.stringify(_tags)); //Copy object such that original is not passed by reference
    }

    /**
     * @function getFetchLookback
     * Returns value of fetchLookback
     *
     * @returns {number}
     */
    function getFetchLookback() {
        return _fetchLookback;
    }

    /**
     * @function getFetchInterval
     * Returns value of fetchInterval
     *
     * @returns {number}
     */
    function getFetchInterval() {
        return _fetchInterval;
    }

    /**
     * @function getLastFetch
     * Returns value of lastFetch
     *
     * @returns {number}
     */
    function getLastFetch() {
        return _lastFetch;
    }

    return {
        fetchBlacklist: fetchBlacklist,
        updateFetchTimer: updateFetchTimer,
        save: save,
        setTags: setTags,
        setFetchLookback: setFetchLookback,
        setFetchInterval: setFetchInterval,
        setLastFetch: setLastFetch,
        getTags: getTags,
        getFetchLookback: getFetchLookback,
        getFetchInterval: getFetchInterval,
        getLastFetch: getLastFetch
    };
})();