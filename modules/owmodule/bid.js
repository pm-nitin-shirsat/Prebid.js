import * as CONFIG from'./config.js';
import * as CONSTANTS from'./constants.js';
import * as UTIL from'./util.js';

class Bid {
  constructor(adapterID, kgpv) {
    this.adapterID = adapterID;
    this.kgpv = kgpv;
    this.bidID = UTIL.getUniqueIdentifierStr();
    this.grossEcpm = 0;
    this.netEcpm = 0;
    this.defaultBid = 0;
    this.adHtml = '';
    this.adUrl = '';
    this.height = 0;
    this.width = 0;
    this.creativeID = '';
    this.keyValuePairs = {};
    this.isPostTimeout = false;
    this.receivedTime = 0;
    this.isServerSide = CONFIG.isServerSideAdapter(this.adapterID) ? 1 : 0;
    this.dealID = '';
    this.dealChannel = '';
    this.isWinningBid = false;
    this.status = 0;
    this.serverSideResponseTime = 0;
    this.mi = undefined;
    this.originalCpm = 0;
    this.originalCurrency = '';
    this.analyticsGrossCpm = 0;
    this.analyticsNetCpm = 0;
    this.native = undefined;
    this.adFormat = undefined;
    this.regexPattern = undefined;
    this.cacheUUID = undefined;
    this.sspID = '';
    this.vastUrl = undefined;
    this.vastCache = undefined;
    this.renderer = undefined;
    this.pbBid = undefined;
  }

  setServerSideResponseTime(ssResponseTime) {
    this.serverSideResponseTime = ssResponseTime;
  }

  getServerSideResponseTime() {
    return this.serverSideResponseTime;
  }

  getServerSideStatus() {
    return this.isServerSide;
  }

  setServerSideStatus(isServerSide) {
    this.isServerSide = isServerSide;
  }

  getAdapterID() {
    return this.adapterID;
  }

  getBidID() {
    return this.bidID;
  }

  setGrossEcpm(ecpm, origCurrency, displayCurrency, bidStatus) {
    if (ecpm === null) {
      UTIL.log(CONSTANTS.MESSAGES.M10);
      UTIL.log(this);
      return this;
    }

    if (UTIL.isString(ecpm)) {
      ecpm = ecpm.replace(/\s/g, '');
      if (ecpm.length === 0) {
        UTIL.log(CONSTANTS.MESSAGES.M20);
        UTIL.log(this);
        return this;
      }
      ecpm = window.parseFloat(ecpm);
    }

    if (window.isNaN(ecpm)) {
      UTIL.log(CONSTANTS.MESSAGES.M11 + ecpm);
      UTIL.log(this);
      return this;
    }

    if (CONFIG.getAdServerCurrency() && origCurrency && displayCurrency && (UTIL.isFunction(window[CONSTANTS.COMMON.PREBID_NAMESPACE].convertCurrency) || typeof window[CONSTANTS.COMMON.PREBID_NAMESPACE].convertCurrency == 'function')) {
      ecpm = window[CONSTANTS.COMMON.PREBID_NAMESPACE].convertCurrency(ecpm, origCurrency, displayCurrency)
    }

    ecpm = window.parseFloat(ecpm.toFixed(CONSTANTS.COMMON.BID_PRECISION));

    this.grossEcpm = ecpm;
    this.netEcpm = bidStatus == CONSTANTS.BID_STATUS.BID_REJECTED ? 0 : this.getNetECPM(this.grossEcpm, this.getAdapterID());

    return this;
  }

  getGrossEcpm(forAnalytics) {
    if (CONFIG.getAdServerCurrency() && this.analyticsGrossCpm && forAnalytics) {
      return this.analyticsGrossCpm;
    }
    return this.grossEcpm;
  }

  getNetEcpm(forAnalytics) {
    if (CONFIG.getAdServerCurrency() && this.analyticsNetCpm && forAnalytics) {
      return this.analyticsNetCpm;
    }
    return this.netEcpm;
  }

  setDefaultBidStatus(status) {
    this.defaultBid = status;
    return this;
  }

  getDefaultBidStatus() {
    return this.defaultBid;
  }

  setAdHtml(adHtml) {
    this.adHtml = adHtml;
    this.setAdFormat(adHtml);
    return this;
  }

  getAdHtml() {
    return this.adHtml;
  }

  setAdUrl(adUrl) {
    this.adUrl = adUrl;
    return this;
  }

  getAdUrl() {
    return this.adUrl;
  }

  setHeight(height) {
    this.height = height;
    return this;
  }

  getHeight() {
    return this.height;
  }

  setWidth(width) {
    this.width = width;
    return this;
  }

  getWidth() {
    return this.width;
  }

  getKGPV(isActualValueRequired, mediaType) {
    if (!isActualValueRequired && this.regexPattern) {
      return this.regexPattern;
    }
    if (this.adFormat == CONSTANTS.FORMAT_VALUES.VIDEO || mediaType == CONSTANTS.FORMAT_VALUES.VIDEO) {
      return UTIL.getUpdatedKGPVForVideo(this.kgpv, CONSTANTS.FORMAT_VALUES.VIDEO);
    }
    return this.kgpv;
  }

  setKeyValuePair(key, value) {
    this.keyValuePairs[key.substr(0, 20)] = value;
    return this;
  }

  getKeyValuePairs() {
    return this.keyValuePairs;
  }

  setPostTimeoutStatus() {
    this.isPostTimeout = true;
    return this;
  }

  getPostTimeoutStatus() {
    return this.isPostTimeout;
  }

  setReceivedTime(receivedTime) {
    this.receivedTime = receivedTime;
    return this;
  }

  getReceivedTime() {
    return this.receivedTime;
  }

  setDealID(dealID) {
    if (dealID) {
      this.dealID = dealID;
      this.dealChannel = this.dealChannel || 'PMP';
      this.setKeyValuePair(
        CONSTANTS.COMMON.DEAL_KEY_FIRST_PART + this.adapterID,
        this.dealChannel + CONSTANTS.COMMON.DEAL_KEY_VALUE_SEPARATOR + this.dealID + CONSTANTS.COMMON.DEAL_KEY_VALUE_SEPARATOR + this.bidID
      );
    }
    return this;
  }

  getDealID() {
    return this.dealID;
  }

  setDealChannel(dealChannel) {
    if (this.dealID && dealChannel) {
      this.dealChannel = dealChannel;
      this.setKeyValuePair(
        CONSTANTS.COMMON.DEAL_KEY_FIRST_PART + this.adapterID,
        this.dealChannel + CONSTANTS.COMMON.DEAL_KEY_VALUE_SEPARATOR + this.dealID + CONSTANTS.COMMON.DEAL_KEY_VALUE_SEPARATOR + this.bidID
      );
    }
    return this;
  }

  getDealChannel() {
    return this.dealChannel;
  }

  setWinningBidStatus() {
    this.isWinningBid = true;
    return this;
  }

  getWinningBidStatus() {
    return this.isWinningBid;
  }

  setStatus(status) {
    this.status = status;
    return this;
  }

  getStatus() {
    return this.status;
  }

  setSendAllBidsKeys() {
    this.setKeyValuePair(`${CONSTANTS.WRAPPER_TARGETING_KEYS.BID_ID}_${this.adapterID}`, this.bidID);
    this.setKeyValuePair(`${CONSTANTS.WRAPPER_TARGETING_KEYS.BID_STATUS}_${this.adapterID}`, this.getNetEcpm() > 0 ? 1 : 0);
    this.setKeyValuePair(`${CONSTANTS.WRAPPER_TARGETING_KEYS.BID_ECPM}_${this.adapterID}`, this.getNetEcpm().toFixed(CONSTANTS.COMMON.BID_PRECISION));
    this.setKeyValuePair(`${CONSTANTS.WRAPPER_TARGETING_KEYS.BID_SIZE}_${this.adapterID}`, `${this.width}x${this.height}`);
    if (this.native) {
      const keyValues = this.keyValuePairs;
      const self = this;
      UTIL.forEachOnObject(keyValues, (key, value) => {
        if (key.includes('native')) {
          self.setKeyValuePair(`${key}_${self.adapterID}`, value);
        }
      });
    }
  }

  setMi(mi) {
    this.mi = mi;
    return this;
  }

  getMi(partnerName) {
    if (UTIL.isUndefined(this.mi)) {
      this.mi = window.matchedimpressions && window.matchedimpressions[partnerName];
    }
    return this.mi;
  }

  setOriginalCpm(originalCpm) {
    this.originalCpm = window.parseFloat(originalCpm.toFixed(CONSTANTS.COMMON.BID_PRECISION));
    return this;
  }

  getOriginalCpm() {
    return this.originalCpm;
  }

  setOriginalCurrency(originalCurrency) {
    this.originalCurrency = originalCurrency;
    return this;
  }

  getOriginalCurrency() {
    return this.originalCurrency;
  }

  setAnalyticsCpm(analyticsCpm, bidStatus) {
    this.analyticsGrossCpm = window.parseFloat(analyticsCpm.toFixed(CONSTANTS.COMMON.BID_PRECISION));
    this.analyticsNetCpm = bidStatus == CONSTANTS.BID_STATUS.BID_REJECTED ? 0 : this.getNetECPM(this.analyticsGrossCpm, this.getAdapterID());
    return this;
  }

  getAnalyticsCpm() {
    return this.analyticsGrossCpm;
  }

  getNative() {
    return this.native;
  }

  setNative(native) {
    this.native = native;
    return this;
  }

  getAdFormat() {
    return this.adFormat;
  }

  setAdFormat(ad, format) {
    this.adFormat = format || UTIL.getAdFormatFromBidAd(ad);
    return this;
  }

  getRegexPattern() {
    return this.regexPattern;
  }

  setRegexPattern(pattern) {
    this.regexPattern = pattern;
    return this;
  }

  getCacheUUID() {
    return this.cacheUUID;
  }

  setCacheUUID(cacheUUID) {
    this.cacheUUID = cacheUUID;
    if (!this.adFormat) {
      this.adFormat = CONSTANTS.FORMAT_VALUES.VIDEO;
    }
    return this;
  }

  getSspID() {
    return this.sspID;
  }

  setSspID(sspID) {
    this.sspID = sspID;
    return this;
  }

  setRenderer(renderer) {
    if (!UTIL.isEmptyObject(renderer)) {
      this.renderer = renderer;
    }
    return this;
  }

  getRenderer() {
    return this.renderer;
  }

  setVastCache(vastCache) {
    if (UTIL.isString(vastCache)) {
      this.vastCache = vastCache;
    }
    return this;
  }

  getVastCache() {
    return this.vastCache;
  }

  setVastUrl(vastUrl) {
    if (UTIL.isString(vastUrl)) {
      this.vastUrl = vastUrl;
    }
    return this;
  }

  getVastUrl() {
    return this.vastUrl;
  }

  setVastXml(xml) {
    if (UTIL.isString(xml)) {
      this.vastXml = xml;
    }
    return this;
  }

  getVastXml() {
    return this.vastXml;
  }

  setPbBid(pbbid) {
    this.pbBid = pbbid;
    return this;
  }

  getPbBid() {
    return this.pbBid;
  }

  updateBidId(slotID) {
    if (window.PWT.bidMap[slotID] && window.PWT.bidMap[slotID].adapters && Object.keys(window.PWT.bidMap[slotID].adapters).length > 0) {
      const bidId = window.PWT.bidMap[slotID].adapters[this.adapterID].bids[Object.keys(window.PWT.bidMap[slotID].adapters[this.adapterID].bids)[0]].bidID;
      if (bidId && this.adFormat == CONSTANTS.FORMAT_VALUES.VIDEO) {
        this.bidID = bidId;
      }
    } else {
      UTIL.logWarning('Error in Updating BidId. It might be possible singleImpressionEnabled is false');
      console.warn('Setup for video might not be correct. Try setting up Optimize MultiSize AdSlot to true.');
    }
    return this;
  }
}

var getNetECPM = (grossEcpm, adapterID) => {
  return window.parseFloat((grossEcpm * CONFIG.getAdapterRevShare(adapterID)).toFixed(CONSTANTS.COMMON.BID_PRECISION));
};

var createBid = (adapterID, kgpv) => {
  return new Bid(adapterID, kgpv);
}

export { Bid, createBid };



// todo:
// add validations
