"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Fetcher = (function () {
    function Fetcher(tags) {
        var fetchLookback = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
        var fetchInterval = arguments.length <= 2 || arguments[2] === undefined ? 24 : arguments[2];
        var lastFetch = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

        _classCallCheck(this, Fetcher);

        this._tags = tags || {
            "blacklist": false,
            "botnet": false,
            "dnsbl": true,
            "malicious activity": false,
            "malware": false,
            "phishing": false,
            "spam": false
        };
        this._fetchLookback = fetchLookback;
        this._fetchInterval = fetchInterval;
        this._lastFetch = lastFetch;

        this._timeout = 0;
    }

    _createClass(Fetcher, [{
        key: "fetchBlacklistForTag",
        value: function fetchBlacklistForTag(tag) {
            var fetcher = this;
            return new Promise(function (resolve, reject) {
                var request = new XMLHttpRequest();
                request.open("GET", "http://cymoncommunity-dev-wartenuq33.elasticbeanstalk.com/api/nexus/v1/blacklist/domain/" + encodeURIComponent(tag) + "/?days=" + encodeURIComponent(fetcher.getFetchLookback()) + "&limit=25000");

                request.onload = function () {
                    if (request.status == 200) {
                        var domains = [];
                        var re = /[^.]+\.[^.]+$/;
                        var match;

                        $.each(JSON.parse(request.response).results, function (index, domain) {
                            match = re.exec(domain.name);
                            domains.push(match ? match[0] : domain.name);
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
    }, {
        key: "fetchBlacklist",
        value: function fetchBlacklist(blacklist) {
            var tags = [];

            blacklist.set([]);
            $.each(this.getTags(), function (tag, enabled) {
                if (enabled) {
                    tags.push(tag);
                }
            });

            if (tags.length) {
                fetcher = this;
                $.each(tags, function (index, tag) {
                    fetcher.fetchBlacklistForTag(tag).then(function (response) {
                        blacklist.add(response);
                        chrome.runtime.sendMessage({ action: "blacklistUpdated" });
                    });
                });
                this.setLastFetch(new Date().getTime());
            }
        }
    }, {
        key: "updateFetchTimer",
        value: function updateFetchTimer() {
            if (this._timeout) {
                clearTimeout(this._timeout);
            }

            this._timeout = setTimeout(function () {
                chrome.runtime.sendMessage({ action: "fetchEvent" });
            }, this._lastFetch > 0 ? this._lastFetch + this._fetchInterval * 3600000 - new Date().getTime() : 0);
        }
    }, {
        key: "setTags",
        value: function setTags(tags) {
            if (tags && typeof tags === "object") {
                this._tags = tags;
                chrome.storage.sync.set({ tags: this._tags });
                chrome.runtime.sendMessage({ action: "fetchEvent" });
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: "setFetchLookback",
        value: function setFetchLookback(fetchLookback) {
            if (fetchLookback && typeof fetchLookback === "number" && fetchLookback % 1 === 0 && fetchLookback > 0 && fetchLookback <= 3) {
                this._fetchLookback = fetchLookback;
                chrome.storage.sync.set({ fetchLookback: this._fetchLookback });
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: "setFetchInterval",
        value: function setFetchInterval(fetchInterval) {
            if (fetchInterval && typeof fetchInterval === "number" && fetchInterval % 1 === 0 && fetchInterval > 0 && fetchInterval <= 24) {
                this._fetchInterval = fetchInterval;
                chrome.storage.sync.set({ fetchInterval: this._fetchInterval });
                this.updateFetchTimer();
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: "setLastFetch",
        value: function setLastFetch(time) {
            if (time && typeof time === "number" && time % 1 == 0) {
                this._lastFetch = time;
                chrome.storage.sync.set({ lastFetch: this._lastFetch });
                this.updateFetchTimer();
                return true;
            } else {
                //throw new Error("Invalid value for 'time'; expected an integer representing time since epoch in milliseconds.");
                return false;
            }
        }
    }, {
        key: "getTags",
        value: function getTags() {
            return this._tags;
        }
    }, {
        key: "getFetchLookback",
        value: function getFetchLookback() {
            return this._fetchLookback;
        }
    }, {
        key: "getFetchInterval",
        value: function getFetchInterval() {
            return this._fetchInterval;
        }
    }, {
        key: "getLastFetch",
        value: function getLastFetch() {
            return this._lastFetch;
        }
    }]);

    return Fetcher;
})();

