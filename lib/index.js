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
  template(defaultTypeMapping = {}){
    let typeMapping = defaultTypeMapping;
    const getType = (type) => {
      if (type.name === undefined) return type.value;
      
      const typeValue = typeMapping[type.name];

      const buildType = (typeValue) => {
        if (typeof typeValue === 'string') {
          return typeValue;
        } else if (!typeValue) {
          throw new Error(`Can't construct type of '${type.name}' because got '${typeValue}' please check with your plugins to make sure they're using the 'type' template literal.`)
        } else {
          return build({ parts: typeValue.parts, placeholders: typeValue.placeholders, context: { context: { type }, getType } });
        }
      };

      if (!typeValue) {
        console.warn(`Unknown prop type found in docs -> '${type.name}' falling back to 'Unknown'.`);
        return buildType(typeMapping.unknown);
      }
      
      return buildType(typeValue);
    };

    return (parts, ...placeholders) => {
      return {
        setPlugins(plugins, extension) {
          typeMapping = plugins.reduce((typeMapping, plugin) => ({ ...typeMapping, ...plugin.getTypeMapping({ extension }) }), typeMapping)
        },
        instantiate(context) {
          return build({ parts, placeholders, context: { context, getType } });
        }
      };
    };
  } 
};
