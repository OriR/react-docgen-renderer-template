const { expect } = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const { template, type } = require('../lib/index');

const emptyTemplate = ({ context, getType }) => getType(context);

lab.experiment('create template', () => {
  lab.test('with type mapping', () => {
    const result = template({ string: 'String' })`${emptyTemplate}`.instantiate({ name: 'string' });
    expect(result).to.equal('String');
  });

  lab.test('without type mapping', () => {
    expect(() => template()`${emptyTemplate}`.instantiate({ name: 'string' }))
    .to.throw(Error, `Can't construct type of 'string' because got 'undefined' please check with your plugins to make sure they're using the 'type' template literal.`);
  });

  lab.test('with plugins', () => {
    const templateObject = template()`${emptyTemplate}`;
    templateObject.setPlugins([{
      getTypeMapping({ extension }) {
        return { string: 'String' };
      }
    }]);
    
    const result = templateObject.instantiate({ name: 'string' });
    expect(result).to.equal('String');
  });

  lab.test('without plugins', () => {
    const result = template({ string: 'String' })`${emptyTemplate}`.instantiate({ name: 'string' });
    expect(result).to.equal('String');
  });

  lab.test('with custom types', () => {
    const result = template({ string: type`${({ context }) => context.type.raw}` })`${emptyTemplate}`.instantiate({ name: 'string', raw: 'String' });
    expect(result).to.equal('String');
  });

  lab.test('with simple type', () => {
    const result = template()`${emptyTemplate}`.instantiate({ value: 'String' });
    expect(result).to.equal('String');
  });
});