// plugins/bidderOptimization/index.js
import { setBidderOptimisationConfig, getBidderDecision } from '../bidderOptimisation.js';
import { getBrowserType } from '../pubmaticUtils.js';                        
import { logInfo, logError } from '../../../src/utils.js';

let config = null;
let CONSTANTS = null;

/**
 * Initialize the bidder optimization plugin
 * @param {Object} bidderOptimisationConfig - Bidder optimization configuration
 * @param {Object} constants - Constants object
 * @returns {Promise<boolean>} - Promise resolving to initialization status
 */
export async function init(bidderOptimisationConfig, constants) {
  CONSTANTS = constants;
  
  // Process bidder optimization configuration
  try {
    setBidderOptimisationConfig(bidderOptimisationConfig);
    logInfo(`${CONSTANTS.LOG_PRE_FIX} Bidder optimization configuration set successfully`);
  } catch (error) {
    logError(`${CONSTANTS.LOG_PRE_FIX} Error setting bidder optimization config: ${error}`);
  }
  
  return true;
}

/**
 * Process bid request
 * @param {Object} reqBidsConfigObj - Bid request config object
 * @returns {Object} - Updated bid request config object
 */
export async function processBidRequest(reqBidsConfigObj) {
  try {
    const decision = getBidderDecision({
      auctionId: reqBidsConfigObj?.auctionId,
      browser: getBrowserType(),
      reqBidsConfigObj
    });
    
    // Apply bidder decisions
    if (decision && decision.excludedBiddersByAdUnit) {
      for (const [adUnitCode, bidderList] of Object.entries(decision.excludedBiddersByAdUnit)) {
        filterBidders(bidderList, reqBidsConfigObj, adUnitCode);
      }
      logInfo(`${CONSTANTS.LOG_PRE_FIX} Applied bidder optimization decisions`);
    }
    
    return reqBidsConfigObj;
  } catch (error) {
    logError(`${CONSTANTS.LOG_PRE_FIX} Error in bidder optimization: ${error}`);
    return reqBidsConfigObj;
  }
}


/**
 * Get targeting data
 * @param {Array} adUnitCodes - Ad unit codes
 * @param {Object} auction - Auction object
 * @returns {Object} - Targeting data
 */
export function getTargeting(adUnitCodes, auction) {
  // Implementation for targeting data, if not applied then do nothing
}

/**
 * Filter bidders from ad units
 * @param {Array} bidderList - List of bidders to filter
 * @param {Object} reqBidsConfigObj - Bid request config object
 * @param {string} adUnitCode - Ad unit code
 */
export function filterBidders(bidderList, reqBidsConfigObj, adUnitCode) {
  if (!reqBidsConfigObj.adUnits || !Array.isArray(reqBidsConfigObj.adUnits)) {
    return;
  }

  const adUnit = reqBidsConfigObj.adUnits.find(unit => unit.code === adUnitCode);
  if (!adUnit || !adUnit.bids || !Array.isArray(adUnit.bids)) {
    return;
  }

  // Filter out specified bidders
  adUnit.bids = adUnit.bids.filter(bid => !bidderList.includes(bid.bidder));
}

// Export the bidder optimization functions
export const BidderOptimization = {
  init,
  processBidRequest,
  filterBidders
};