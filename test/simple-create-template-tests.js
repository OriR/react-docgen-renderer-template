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
    const warn = console.warn;
    let warnArgs;
    console.warn = (...args) => (warnArgs = args);
    
    template()`${emptyTemplate}`.instantiate({ name: 'string' });

    expect(warnArgs[0]).to.equal('Unknown prop type found in docs -> \'string\' falling back to \'Unknown\'.')
  
    console.warn = warn;
  });

  lab.test('when overriding unknown with no type', () => {
    expect(() => template({ unknown: null })`${emptyTemplate}`.instantiate({ name: 'string' }))
    .to.throw(Error, `Can't construct type of 'string' because got 'undefined' please check with your plugins to make sure they're using the 'type' template literal and that you're not overriding the 'unknown' type by mistake.`);
  })

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

  lab.test('with custom types using getType', () => {
    const result = template({ number: 'Number', string: type`${({ context, getType }) => getType(context.entire.type)}` })`${emptyTemplate}`.instantiate({ name: 'string', raw: 'String', type: { name: 'number' } });
    expect(result).to.equal('Number');
  });

  lab.test('with simple type', () => {
    const result = template()`${emptyTemplate}`.instantiate({ value: 'String' });
    expect(result).to.equal('String');
  });

  lab.test('with custom type reference to entire context', () => {
    const context = { props: [{ name: 'string' }], additionalContext: 'context' };
    const result = template({ string: type`${({ context }) => context.entire.additionalContext}` })`${({ context, getType }) => getType(context.props[0])}`.instantiate(context);
    expect(result).to.equal(context.additionalContext);
  });
});