'use strict';

// CommonJS entry (Claude Hub requires this file); ESM consumers (Gaffer) get
// the same objects through index.mjs.

const contract = require('./cli-contract.cjs');

module.exports = {
  LAST_VERIFIED: contract.LAST_VERIFIED,
  NEWER_PATCH_TOLERANCE: contract.NEWER_PATCH_TOLERANCE,
  UNRECOGNIZED_MODEL_TAG: contract.UNRECOGNIZED_MODEL_TAG,
  versionDetail: contract.versionDetail,
  versionStatus: contract.versionStatus,
  versionNotice: contract.versionNotice,
  newTurnState: contract.newTurnState,
  observe: contract.observe,
  classify: contract.classify,
  classifyJsonResult: contract.classifyJsonResult,
  defaultCopy: contract.defaultCopy,
  userMessage: contract.userMessage
};
