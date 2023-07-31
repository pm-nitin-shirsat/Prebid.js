
import * as  util from './util.js';

class AdapterEntry {
  constructor(adapterID) {
    this.adapterID = adapterID;
    this.callInitiatedTime = util.getCurrentTimestampInMs();
    this.bids = {};
    this.lastBidID = '';
  }

  getCallInitiatedTime() {
    return this.callInitiatedTime;
  }

  getLastBidID() {
    return this.lastBidID;
  }

  getBid(bidID) {
    /* istanbul ignore else */
    if (util.isOwnProperty(bids, bidID)) {
      return this.bids[ bidID ];
    }
    return null;
  }

  setNewBid(theBid) {
    delete this.bids[lastBidID];
    const bidID = theBid.getBidID();
    this.bids[bidID] = theBid;
    this.lastBidID = bidID;
  }
}

export {AdapterEntry};
