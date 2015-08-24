# cymon-interceptor
Cymon Interceptor is a Google Chrome extension which uses information from [cymon.oi](https://cymon.io) to intercept malicious web requests.

## Usage
Simply install the extension from the Chrome web store, or load it from the source code (requires Developer Mode to be enabled in Chrome).

## Whitelisting Domains
If a domain is blocked by Cymon Interceptor and you want to allow it, you can add it to your whitelist. You can whitelist a blocked domain either from the redirect page or the popup menu (which appears when you click the icon in your browser).
To remove a domain from your whitelist, go to the Options page (right-click the icon and click Options), and simply remove the domain from the whitelist that appears there.

## Settings
By default, Cymon Interceptor loads only a small number of domains from Cymon. You can configure some settings to fetch more on the Options page (right-click the icon and click Options).
Here you will find the following settings:

### Tags
There are 7 tag options for Cymon:
- blacklist
- botnet
- dnsbl
- malicious activity
- malware
- phishing
- spam

Each of these tags correspond to a type of event associated with the domains in Cymon's database. For instance, a domain may have an associated event 'malware', meaning a source has reported an instance of malware at that domain. You can select any or all (or none) of these tags.

### Fetch Lookback
**1-3 Days**

Cymon maintains a timeline of events associated with each domain. This field determines how many days you want Cymon to 'look back' for domains with events. If you set this value to 2, then a domain with an event 3 days ago, but no events within the last 2 days, will not appear.

### Fetch Interval
**1-24 Hours**

Cymon Interceptor will periodically check Cymon for updated information. This value determines how often these checks happen.

## Building background.min.js
background.min.js is compiled from four seperate files: background.js, fetcher.js, whitelist.js and blacklist.js. I build the minified file using browserify, watchify, minifyify, and babelify, using the following command:
```
watchify -t babelify src/background.js -d -p [minifyify --map bundle.map.json --output bundle.map.json]  -o js/background.min.js
```
This will generate background.min.js and place it in the js/ directory, as well as placing a source map named bundle.map.json in the root directory.