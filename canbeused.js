const sass = require('sass');
const postcss = require('postcss');
const fs = require('fs');

const mixinFile = 'src/styles/mixins.scss';
const otherFiles = ['src/styles/Home.module.scss', './src/styles/globals.css'];

// Step 1: Parse the mixin file and extract mixin definitions
const mixinSource = fs.readFileSync(mixinFile, 'utf8');
const mixinAST = sass.compile(mixinSource);
const mixins = {};
mixinAST.forEach(node => {
  if (node.type === 'atrule' && node.name === 'mixin') {
    const mixinName = node.identifier.value;
    const mixinProps = node.block.children
      .filter(child => child.type === 'declaration')
      .map(child => child.property)
      .sort();
    mixins[mixinName] = mixinProps;
  }
});

// Step 2: Parse the other stylesheets and extract selectors and rules
const allRules = [];
otherFiles.forEach(file => {
  const cssSource = fs.readFileSync(file, 'utf8');
  const cssAST = postcss.parse(cssSource);
  cssAST.walkRules(rule => {
    allRules.push({
      file: file,
      selector: rule.selector,
      properties: rule.nodes
        .filter(node => node.type === 'decl')
        .map(node => node.prop)
        .sort(),
    });
  });
});

// Step 3: Compare mixin properties against rules
const errors = [];
Object.entries(mixins).forEach(([mixinName, mixinProps]) => {
  allRules.forEach(rule => {
    const missingProps = mixinProps.filter(prop => !rule.properties.includes(prop));
    if (missingProps.length > 0) {
      const message = `Mixin ${mixinName} is missing properties ${missingProps.join(', ')} in ${rule.selector} (${rule.file})`;
      errors.push(message);
    }
  });
});

// Step 4: Report errors
if (errors.length > 0) {
  console.error('Linter found the following errors:');
  errors.forEach(error => console.error(error));
} else {
  console.log('Linter found no errors.');
}
