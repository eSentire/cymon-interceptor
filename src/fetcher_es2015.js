export var Fetcher = (function() {
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

    var _timeout = 0;

    chrome.storage.sync.get(function (storage) {
        _tags = storage.tags || _tags;
        _fetchLookback = storage.fetchLookback || _fetchLookback;
        _fetchInterval = storage.fetchInterval || _fetchInterval;
        _lastFetch = storage.lastFetch || _lastFetch;
    });

    function fetchBlacklistForTag(tag) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open(
                "GET",
                `http://cymoncommunity-dev-wartenuq33.elasticbeanstalk.com/api/nexus/v1/blacklist/domain/${encodeURIComponent(tag)}/?days=${encodeURIComponent(_fetchLookback)}&limit=25000`
                )
            ;

            request.onload = function () {
                if (request.status == 200) {
                    var domains = [];

                    $.each(JSON.parse(request.response).results, function (index, domain) {
                        domains.push(domain.name);
                    });
                    resolve(domains);
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

    function fetchBlacklist(blacklist) {
        var tags = [];

        blacklist.set([]);
        $.each(_tags, function (tag, enabled) {
            if (enabled) {
                tags.push(tag);
            }
        });

        if (tags.length) {
            $.each(tags, function (index, tag) {
                fetchBlacklistForTag(tag).then(function (response) {
                    blacklist.add(response);
                    chrome.runtime.sendMessage({action: "updateEvent"});
                });
            });
            this.setLastFetch(new Date().getTime());
        }
    }

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
        return true;
    }

    function setTags(tags) {
        if (tags && typeof tags === "object") {
            _tags = tags;
            chrome.storage.sync.set({tags: _tags});
            chrome.runtime.sendMessage({action: "fetchEvent"});
            return true;
        } else {
            return false;
        }
    }

    function setFetchLookback(fetchLookback) {
        if (fetchLookback && typeof fetchLookback === "number" && fetchLookback % 1 === 0 && fetchLookback > 0 && fetchLookback <= 3) {
            _fetchLookback = fetchLookback;
            chrome.storage.sync.set({fetchLookback: _fetchLookback});
            return true;
        } else {
            return false;
        }
    }

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

    function setLastFetch(time) {
        if (time && typeof time === "number" && time % 1 == 0) {
            _lastFetch = time;
            chrome.storage.sync.set({lastFetch: _lastFetch});
            this.updateFetchTimer();
            return true;
        } else {
            //throw new Error("Invalid value for 'time'; expected an integer representing time since epoch in milliseconds.");
            return false;
        }
    }

    function getTags() {
        return _tags;
    }

    function getFetchLookback() {
        return _fetchLookback;
    }

    function getFetchInterval() {
        return _fetchInterval;
    }

    function getLastFetch() {
        return _lastFetch;
    }

    return {
        fetchBlacklist: fetchBlacklist,
        updateFetchTimer: updateFetchTimer,
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