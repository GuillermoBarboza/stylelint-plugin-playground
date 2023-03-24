const stylelint = require('stylelint');
const getMixinsFile = require('./getMixins');

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = 'scss/can-be-used';
const messages = ruleMessages(ruleName, {
    expected: (unfixed, fixed) => `You could be using ${unfixed} mixin at ${fixed}`
});

module.exports = stylelint.createPlugin(ruleName, (primaryOption, secondaryOptionObject, context) => {
    return async (postcssRoot, postcssResult) => {
        const validOptions = validateOptions(
            postcssResult,
            ruleName,
            {
                //No options for now...
            }
        );

        if (!validOptions) {
            return;
        }
       
        var mixins = await getMixinsFile;
        let recommendedMixins = [];

        //get file name 
        var fileName = postcssResult.opts.from.split('\\').pop();

        if (fileName === 'mixins.scss') {
            /*  postcssRoot.walkAtRules(rule => {
                 // get an array of objects with the following properties: ////mixin: string, propsAndValues: array of objects with the //following properties: property: string, value: string
 
                 if (rule.name === 'mixin') {
                     var mixinName = rule.params;
                     var mixinProperties = rule.nodes;
                     var mixinPropertiesArray = [];
                     for (var i = 0; i < mixinProperties.length; i++) {
                         if (mixinProperties[i].type === 'decl') {
                             let propAndValue = {
                                 prop: mixinProperties[i].prop,
                                 value: mixinProperties[i].value
                             };
                             mixinPropertiesArray.push(propAndValue);
                         }
                     }
 
                     mixins.push({
                         mixin: mixinName,
                         propsAndValues: mixinPropertiesArray
                     });
                 }
             }); */

        } else {
            console.log('fileName', fileName);
            // get an array of all selectors in the file
            var selectors = [];
            postcssRoot.walkRules(rule => {
                selectors.push(rule.selector);
            });

            //get an array of objects with the following properties: selector: string, propsAndValues: array of objects with the following properties: property: string, value: string
            var rules = [];

            for (var i = 0; i < selectors.length; i++) {
                var selector = selectors[i];
                var propsAndValues = [];
                postcssRoot.walkRules(selector, rule => {
                    rule.walkDecls(decl => {
                        let propAndValue = {
                            prop: decl.prop,
                            value: decl.value
                        };
                        propsAndValues.push(propAndValue);
                    });
                });
                let newRule = {
                    selector: selector,
                    fileName: fileName,
                    propsAndValues: propsAndValues
                };
                rules.push(newRule);
            }

            //for each mixin, compare it to each rules propsAndValues props, if they match, add the mixin to the recommendedMixins array
            for (var i = 0; i < mixins.length; i++) {
                var mixin = mixins[i];
                var mixinProps = mixin.propsAndValues;

                for (var j = 0; j < rules.length; j++) {
                    var rule = rules[j];
                    var ruleProps = rule.propsAndValues;
                    var matchCount = 0;
                    for (var k = 0; k < mixinProps.length; k++) {
                        var mixinProp = mixinProps[k];
                        for (var l = 0; l < ruleProps.length; l++) {
                            var ruleProp = ruleProps[l];
                            if (mixinProp.prop === ruleProp.prop && (mixinProp.value === ruleProp.value || mixinProp.value.indexOf('$') >= 0)) {
                                matchCount++;
                            }
                        }
                    }
                    if (matchCount === mixinProps.length) {
                        recommendedMixins.push({ name: mixin.mixin, selector: rule.selector, fileName: rule.fileName });
                        console.log('rule', rule)
                        report({
                            message: messages.expected(mixin.mixin, rule.selector),
                            node: postcssRoot,
                            result: postcssResult,
                            ruleName: ruleName
                        });
                    }
                }
            }
            console.log(mixins)
            console.log('recommendedMixins', recommendedMixins);
        }

    };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
