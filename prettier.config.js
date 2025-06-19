const base = require("@mendix/pluggable-widgets-tools/configs/prettier.base.json");

module.exports = {
    ...base,
    plugins: [require.resolve("@prettier/plugin-xml")],
};

// to allow us to modify the prettier rules for our code