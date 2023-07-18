import * as  CONFIG from './config.js';
import * as  CONSTANTS from './constants.js';
import * as  util from './util.js';
import * as  bidManager from './bidManager.js';
// todo: how we can do it optionally (include only iff required) ?
// var prebid = require("./adapters/prebid.js");

var registeredAdapters = {};

/* start-test-block */
exports.registeredAdapters = registeredAdapters;
/* end-test-block */

var refThis = this;

// when this function executes, it is only called for prebid adapter; we can remove this flow totally
// todo: this function can be removed
exports.callAdapters = function(activeSlots) {
  var impressionID = util.generateUUID();
  this.resetSlots(activeSlots, impressionID);
  this.callAdapter(registeredAdapters, activeSlots, impressionID);
};

// when this function executes, it is only called for prebid adapter; we can remove this flow totally
// todo: this function can be removed
function callAdapter(adapters, slots, impressionID) {
  util.forEachOnObject(adapters, function(adapterID, theAdapter) {
    // Note: if you have any other parent-adapter like prebid, and
    //		want to add throttling on the parent-adapters then
    //		you will need to add throttling logic here as well
    this.setInitTimeForSlotsForAdapter(slots, adapterID);
    theAdapter.fB(slots, impressionID);
  });
}

/* start-test-block */
exports.callAdapter = callAdapter;
/* end-test-block */

// todo: this function can be removed
function resetSlots(slots, impressionID) {
  util.forEachOnArray(slots, function(key, slot) {
    var divID = slot.getDivID();
    bidManager.resetBid(divID, impressionID);
    bidManager.setSizes(divID, util.generateSlotNamesFromPattern(slot, '_W_x_H_'));
  });
}

/* start-test-block */
exports.resetSlots = resetSlots;
/* end-test-block */

// this function is also called by adapters/Prebid to log the init time
// todo: this function can be removed
function setInitTimeForSlotsForAdapter(slots, adapterID) {
  util.forEachOnObject(slots, function(j, slot) {
    bidManager.setCallInitTime(slot.getDivID(), adapterID);
  });
}

exports.setInitTimeForSlotsForAdapter = setInitTimeForSlotsForAdapter;

// todo: this function can be removed
function registerAdapter(bidAdaptor) {
  if (bidAdaptor) {
    var adapterID = bidAdaptor.ID();
    if (util.isFunction(bidAdaptor.fB)) {
      this.registeredAdapters[adapterID] = bidAdaptor;
    } else {
      util.log(adapterID + CONSTANTS.MESSAGES.M3);
    }
  } else {
    util.log(CONSTANTS.MESSAGES.M3);
    util.log(bidAdaptor);
  }
}

/* start-test-block */
exports.registerAdapter = registerAdapter;
/* end-test-block */

// todo: this function can be removed
function registerAdapters() {
  this.registerAdapter(
    // prebid.register()
  );
};

exports.registerAdapters = registerAdapters;
