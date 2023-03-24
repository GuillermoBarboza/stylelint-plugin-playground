const stylelint = require("stylelint");
const _ = require("lodash");

const ruleName = "scss/mixin-can-be-used";

const plugin = stylelint.createPlugin(ruleName, (isEnabled) => {
  return (root, result) => {
    const mixins = [];

    // Traverse the AST and extract all declared mixin names
    root.walkAtRules((atRule) => {
      const atRuleValue = atRule.params.trim();

      // Check if the at-rule is a mixin declaration
      if (atRule.name === "mixin") {
        const mixinName = atRuleValue.split("(")[0].trim();
        mixins.push(mixinName);
        // console log the properties and values of the rule
        atRule.nodes.forEach(element => {
            console.log("mixin", mixinName, element.prop);
        });

      }
    });

    // Report the result to Stylelint
    const reportResult = (isEnabled) ? stylelint.utils.report : _.noop;
    reportResult({
      ruleName,
      result,
      message: "All mixin names have been logged.",
      node: root,
    });
  };
});

module.exports = plugin;
