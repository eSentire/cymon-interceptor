"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Fetcher = (function () {
    function Fetcher(time) {
        _classCallCheck(this, Fetcher);

        this._lastFetch = time || 0;
        this._timeout = 0;
    }

    _createClass(Fetcher, [{
        key: "setLastFetch",
        value: function setLastFetch(time) {
            if (typeof time === 'number') {
                this._lastFetch = time;
                chrome.storage.local.set({ lastFetch: this._lastFetch });
                chrome.runtime.sendMessage({ action: "lastFetchUpdated" });
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: "getLastFetch",
        value: function getLastFetch() {
            return this._lastFetch;
        }
    }, {
        key: "setFetchTimer",
        value: function setFetchTimer(fetchInterval) {
            if (this._timeout) {
                clearTimeout(this._timeout);
            }

            this._timeout = setTimeout(function () {
                chrome.runtime.sendMessage({ action: "timerTrigger" });
            }, this._lastFetch > 0 ? this._lastFetch + fetchInterval - new Date().getTime() : 0);
        }
    }, {
        key: "fetchBlacklistForTag",
        value: function fetchBlacklistForTag(tag, lookback) {

            return new Promise(function (resolve, reject) {

                if (typeof tag != 'string' || ['blacklist', 'botnet', 'dnsbl', 'malicious activity', 'malware', 'phishing', 'spam'].indexOf(tag) < 0) {
                    reject(Error("Invalid value for 'tag'; expected one of the following strings: 'blacklist', 'botnet', 'dnsbl', 'malicious activity', 'malware', 'phishing' or 'spam'."));
                } else if (lookback > 3 || lookback < 1) {
                    reject(Error("Invalid value for 'lookback'; expected an integer from 1 to 3."));
                }

                var request = new XMLHttpRequest();
                request.open('GET', 'http://cymoncommunity-dev-wartenuq33.elasticbeanstalk.com/api/nexus/v1/blacklist/domain/' + encodeURIComponent(tag) + '/?days=' + encodeURIComponent(lookback) + '&limit=25000');

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
                    reject(Error("Network Error"));
                };

                request.send();
            });
        }
    }]);

    return Fetcher;
})();