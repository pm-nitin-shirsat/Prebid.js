import controller from './controllers/idhub.js';
import util from './util.idhub.js';
const metaInfo = util.getMetaInfo(window);
window.IHPWT = window.IHPWT || {};
window.IHPWT.bidMap = window.IHPWT.bidMap || {};
window.IHPWT.bidIdMap = window.IHPWT.bidIdMap || {};
window.IHPWT.isIframe = window.IHPWT.isIframe || metaInfo.isInIframe;
window.IHPWT.protocol = window.IHPWT.protocol || metaInfo.protocol;
window.IHPWT.secure = window.IHPWT.secure || metaInfo.secure;
window.IHPWT.pageURL = window.IHPWT.pageURL || metaInfo.pageURL;
window.IHPWT.refURL = window.IHPWT.refURL || metaInfo.refURL;
window.IHPWT.isSafeFrame = window.IHPWT.isSafeFrame || false;
window.IHPWT.safeFrameMessageListenerAdded = window.IHPWT.safeFrameMessageListenerAdded || false;
// usingDifferentProfileVersion
window.IHPWT.udpv = window.IHPWT.udpv || util.findQueryParamInURL(metaInfo.isIframe ? metaInfo.refURL : metaInfo.pageURL, 'pwtv');

util.findQueryParamInURL(metaInfo.isIframe ? metaInfo.refURL : metaInfo.pageURL, 'pwtc') && util.enableDebugLog();
util.findQueryParamInURL(metaInfo.isIframe ? metaInfo.refURL : metaInfo.pageURL, 'pwtvc') && util.enableVisualDebugLog();

window.IHPWT.getUserIds = () => {
  return util.getUserIds();
};

window.IHPWT.deepMerge = (target, source, key) => {
  return util.deepMerge(target, source, key);
};

window.IHPWT.versionDetails = util.getOWConfig();

controller.init(window);
