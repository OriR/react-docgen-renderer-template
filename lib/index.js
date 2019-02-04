const build = ({ parts, placeholders, context }) => {
  return parts.reduce((result, part, index) => {
    return result + part + (placeholders.hasOwnProperty(index) ? placeholders[index](context) : '');
  }, '');
};

module.exports = {
  type(parts, ...placeholders) {
    return {
      parts,
      placeholders
    };
  },
  template(customTypeMapping = {}){
    let typeMapping = { unknown: 'unknown' in customTypeMapping ? customTypeMapping.unknown :'Unknown', ...customTypeMapping};
    let plugins = [];
    const getType = (context) => (type) => {
      if (type.name === undefined) return type.value;
      
      let typeValue = typeMapping[type.name];

      if (!typeValue && !typeMapping.unknown) {
        throw new Error(`Can't construct type of '${type.name}' because got '${typeValue}' please check with your plugins to make sure they're using the 'type' template literal and that you're not overriding the 'unknown' type by mistake.`);
      } else if (!typeValue) {
        console.warn(`Unknown prop type found in docs -> '${type.name}' falling back to 'Unknown'.`);
        typeValue = typeMapping.unknown;
      }

      if (typeof typeValue === 'string') {
        return typeValue;
      } else {
        return build({ parts: typeValue.parts, placeholders: typeValue.placeholders, context: { context: { type, entire: context }, getType: getType(context) } });
      }
    };

    return (parts, ...placeholders) => {
      return {
        setPlugins(customPlugins) {
          plugins = customPlugins;
          return this;
        },
        instantiate(context, extension) {
          typeMapping = plugins.reduce((typeMapping, plugin) => ({ ...typeMapping, ...plugin.getTypeMapping({ extension }) }), typeMapping);
          return build({ parts, placeholders, context: { context, getType: getType(context) } });
        }
      };
    };
  } 
};
