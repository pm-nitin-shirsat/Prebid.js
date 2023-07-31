import * as CONSTANTS from './constants.js';
import * as util from './util.js';
import { AdapterEntry } from './adapterEntry';

class BMEntry {
  constructor(name) {
    this.name = name;
    this.sizes = [];
    this.adapters = {};
    this.creationTime = util.getCurrentTimestampInMs();
    this.impressionID = '';
    this.analyticsEnabled = false;
    this.expired = false;
    this.allPossibleBidsReceived = false;
  }

  setExpired() {
    this.expired = true;
    return this;
  }

  getExpiredStatus() {
    return this.expired;
  }

  setAnalyticEnabled() {
    this.analyticsEnabled = true;
    return this;
  }

  getAnalyticEnabledStatus() {
    return this.analyticsEnabled;
  }

  setNewBid(adapterID, theBid) {
    if (!util.isOwnProperty(this.adapters, adapterID)) {
      this.adapters[adapterID] = new AdapterEntry(adapterID);
    }
    this.adapters[adapterID].setNewBid(theBid);
  }

  getBid(adapterID, bidID) {
    if (util.isOwnProperty(this.adapters, adapterID)) {
      return this.adapters[adapterID].getBid(bidID);
    }
  }

  getName() {
    return this.name;
  }

  getCreationTime() {
    return this.creationTime;
  }

  setImpressionID(value) {
    this.impressionID = value;
    return this;
  }

  getImpressionID() {
    return this.impressionID;
  }

  setSizes(sizes) {
    this.sizes = sizes;
    return this;
  }

  getSizes() {
    return this.sizes;
  }

  setAdapterEntry(adapterID) {
    if (!util.isOwnProperty(this.adapters, adapterID)) {
      this.adapters[adapterID] = new AdapterEntry(adapterID);
      util.log(`${CONSTANTS.MESSAGES.M4 + this.name} ${adapterID} ${this.adapters[adapterID].getCallInitiatedTime()}`);
    }
    return this;
  }

  getLastBidIDForAdapter(adapterID) {
    if (util.isOwnProperty(this.adapters, adapterID)) {
      return this.adapters[adapterID].getLastBidID();
    }
    return '';
  }

  setAllPossibleBidsReceived() {
    this.allPossibleBidsReceived = true;
    return this;
  }

  hasAllPossibleBidsReceived() {
    return this.allPossibleBidsReceived;
  }
}

/* start-test-block */
export { BMEntry };

/* end-test-block */

export function createBMEntry(name) {
  return new BMEntry(name);
}