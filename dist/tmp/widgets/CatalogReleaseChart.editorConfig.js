'use strict';

function getProperties(_values, defaultProperties /* , target: Platform*/) {
  // Do the values manipulation here to control the visibility of properties in Studio and Studio Pro conditionally.
  /* Example
  if (values.myProperty === "custom") {
      delete defaultProperties.properties.myOtherProperty;
  }
  */
  return defaultProperties;
}
exports.getProperties = getProperties;
