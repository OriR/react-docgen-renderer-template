## react-docgen-renderer-template
A helper library for creating templates based on `react-docgen` objects.

### Install
```
npm install --save-dev react-docgen-renderer-template
```

### Usage
```javascript
const { template, type } = require('react-docgen-renderer-template');

// The template function gets an object of key/value pairs that represent type mappings for the template.
// The key is the type name and the value is a string to be displayed for that type.
// The string can also be a template string with functions inside that get the context (current prop definition) and a getType function that returns the type of a specific prop.  
const templateCreator = template({
  unknown: 'Unknown',
  func: 'Function',
  array: 'Array',
  object: 'Object',
  string: 'String',
  number: 'Number',
  bool: 'Boolean',
  node: 'ReactNode',
  element: 'ReactElement',
  symbol: 'Symbol',
  any: '*',
  custom: '(custom validator)',
  shape: 'Shape',
  arrayOf: type`Array[]<${({ context, getType }) => getType(context.type.value) }>`,
  objectOf: type`Object[#]<${({ context, getType }) => getType(context.type.value) }>`,
  instanceOf: type`${({ context }) => context.type.value}`,
  enum: type`Enum(${({ context, getType }) => context.type.value.map(value => getType(value)).join(', ')})`,
  union: type`Union<${({ context, getType }) => context.type.value.map(value => getType(value)).join('|')}>`
});

const template = templateCreator`This is my custom template to render a component docs.
I can use custom functions that will interpolate according to the metadata about the component, like so:
${({ context, getType}) => {
  //context contains all the metadata about the component docs.
  // context.componentName - the name of the component
  // context.srcLinkUrl - the URL to link the source of the of the file to
  // context.srcLink - the name to show for the link of the source of the file
  // context.description - the description of the component
  // context.props - the props the component has
  // context.composes - an array of component objects that this component composes in its prop types (each object in the array is of the same type as this context object)
  // context.isMissingComposes - whether or not there are some compositions that couldn't be resolved
  // 
  // getType - a function that takes a type of a prop and returns its value according to the type mappings
}}`

```

### License
MIT
