// plugins/floorProvider/index.js
import { continueAuction } from '../../../modules/priceFloors.js';
import { logInfo, logError } from '../../../src/utils.js';
import { getDeviceType as fetchDeviceType, getOS } from '../../../libraries/userAgentUtils/index.js';
import { getBrowserType, getCurrentTimeOfDay } from '../../../libraries/pubmaticUtils/pubmaticUtils.js';
import { config as conf } from '../../../src/config.js';
import { ConfigJsonManager } from '../configJsonManager.js';

let CONSTANTS = null;
let floorConfig = null;

/**
 * Initialize the floor provider
 * @param {Object} floorConfig - Floor configuration
 * @param {Object} constants - Constants object
 * @returns {Promise<boolean>} - Promise resolving to initialization status
 */
export async function init(floorProviderConfig, constants) {
  CONSTANTS = constants;
  
  // Process floor-specific configuration
  floorConfig =floorProviderConfig;
  try {
    conf.setConfig(setFloorsConfig());
    logMessage(`${CONSTANTS.LOG_PRE_FIX} dynamicFloors config set successfully`);
  } catch (error) {
    logError(`${CONSTANTS.LOG_PRE_FIX} Error setting dynamicFloors config: ${error}`);
  }

  logInfo(`${CONSTANTS.LOG_PRE_FIX} Floor configuration loaded`);
  
  return true;
}

/**
 * Process bid request
 * @param {Object} reqBidsConfigObj - Bid request config object
 * @returns {Object} - Updated bid request config object
 */
export async function processBidRequest(reqBidsConfigObj) {
  if (!floorConfig || !floorConfig.enabled) {
    return reqBidsConfigObj;
  }
  
  try {
    const hookConfig = {
      reqBidsConfigObj,
      context: null, // Removed 'this' as it's not applicable in function-based implementation
      nextFn: () => true,
      haveExited: false,
      timer: null
    };
    
    // Apply floor configuration
    continueAuction(hookConfig);
    logInfo(`${CONSTANTS.LOG_PRE_FIX} Applied floor configuration to auction`);
    
    return reqBidsConfigObj;
  } catch (error) {
    logError(`${CONSTANTS.LOG_PRE_FIX} Error applying floor configuration: ${error}`);
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

// Export the floor provider functions
export const FloorProvider = {
  init,
  processBidRequest,
  getTargeting
};

// Getter Functions
export const getTimeOfDay = () => getCurrentTimeOfDay();
export const getBrowser = () => getBrowserType();
export const getOs = () => getOS().toString();
export const getDeviceType = () => fetchDeviceType().toString();
export const getCountry = () => ConfigJsonManager.country;
export const getBidder = (request) => request?.bidder;

export const setFloorsConfig = () => {
    // Extract multipliers from floors.json if available
    if (floorConfig?.data?.multiplier) {
      // Map of source keys to destination keys
      const multiplierKeys = {
        'win': 'WIN',
        'floored': 'FLOORED',
        'nobid': 'NOBID'
      };

      // Initialize _multipliers and only add keys that exist in data.multiplier
      _multipliers = Object.entries(multiplierKeys)
        .reduce((acc, [srcKey, destKey]) => {
          if (srcKey in floorConfig.data.multiplier) {
            acc[destKey] = floorConfig.data.multiplier[srcKey];
          }
          return acc;
        }, {});

      logInfo(CONSTANTS.LOG_PRE_FIX, `Using multipliers from floors.json: ${JSON.stringify(_multipliers)}`);
    }

    if (!floorConfig?.enabled || !floorConfig?.config) {
      return undefined;
    }

    // Floor configs from adunit / setconfig
    const defaultFloorConfig = conf.getConfig('floors') ?? {};
    if (defaultFloorConfig?.endpoint) {
      delete defaultFloorConfig.endpoint;
    }

    let ymUiConfig = { ...floorConfig.config };

    // default values provided by publisher on YM UI
    const defaultValues = ymUiConfig.defaultValues ?? {};
    // If floorsData is not present, use default values
    const ymFloorsData = floorConfig.data ?? { ...defaultValueTemplate, values: { ...defaultValues } };

    delete ymUiConfig.defaultValues;
    // If skiprate is provided in configs, overwrite the value in ymFloorsData
    (ymUiConfig.skipRate !== undefined) && (ymFloorsData.skipRate = ymUiConfig.skipRate);

    // merge default configs from page, configs
    return {
        floors: {
            ...defaultFloorConfig,
            ...ymUiConfig,
            data: ymFloorsData,
            additionalSchemaFields: {
                deviceType: getDeviceType,
                timeOfDay: getTimeOfDay,
                browser: getBrowser,
                os: getOs,
                utm: getUtm,
                country: getCountry,
                bidder: getBidder,
            },
        },
    };
};