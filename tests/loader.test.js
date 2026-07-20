const assert = require('node:assert/strict');
const loader = require('../js/markdown-callback-loader.js');

const testing = loader.testing;
assert.equal(testing.classifyCallout('**Tip:** useful'), 'tip');
assert.equal(testing.classifyCallout('**Question:** why?'), 'question');
assert.equal(testing.classifyCallout('**Warning:** stop'), 'warning');
assert.equal(testing.classifyCallout('ordinary quote'), null);

const allocate = testing.createHeadingIdAllocator();
assert.equal(allocate('A repeated heading'), 'a-repeated-heading');
assert.equal(allocate('A repeated heading'), 'a-repeated-heading-2');
assert.equal(allocate('!!!'), 'section');

console.log('PASS template loader helper tests');
