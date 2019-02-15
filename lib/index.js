const build = ({ parts, placeholders, context }) => {
  return parts.reduce((result, part, index) => {
    const placeholderFunction = placeholders[index] || (() => '');
    const placeholderValue = placeholderFunction(context);

    return (
      result +
      part +
      (placeholderValue !== undefined && placeholderValue !== null ? placeholderValue : '')
    );
  }, '');
};

class TypeConstructor {
  constructor({ pluginsTypeMapping, initialTypeMapping, parts, placeholders, context }) {
    this.pluginsTypeMapping = pluginsTypeMapping;
    this.initialTypeMapping = initialTypeMapping;
    this.parts = parts;
    this.placeholders = placeholders;
    this.context = context;

    this.getType = this.getType.bind(this);
    this.getTypeMappingChain = this.getTypeMappingChain.bind(this);
    this.getContext = this.getContext.bind(this);
    this.getValueFromTypeChain = this.getValueFromTypeChain.bind(this);
  }

  getTypeMappingChain(name) {
    const internalgetTypeMappingChain = name =>
      this.pluginsTypeMapping
        .filter(mapping => name in mapping)
        .concat(this.initialTypeMapping[name] ? [this.initialTypeMapping] : [])
        .filter(Boolean);
    const unknownTypeMappingChain = internalgetTypeMappingChain('unknown');
    let typeMappingChain = internalgetTypeMappingChain(name);

    if (typeMappingChain.length === 0 && unknownTypeMappingChain.length === 0) {
      throw new Error(
        `Can't construct type of '${name}' because got nothing. please check with your plugins to make sure they're using the 'type' template literal and that you're not overriding the 'unknown' type by mistake.`,
      );
    }

    return { typeMappingChain, unknownTypeMappingChain };
  }

  getContext(type) {
    return { context: { type, entire: this.context }, getType: this.getType };
  }

  getValueFromTypeChain(typeMappingChain, type, name = type.name) {
    return typeMappingChain.reduce((result, typeMapping) => {
      const typeValue = typeMapping[name];

      if (result) return result;
      if (typeof typeValue === 'string') return typeValue;

      const builtValue = build({
        parts: typeValue.parts,
        placeholders: typeValue.placeholders,
        context: this.getContext(type),
      });

      return builtValue !== '' ? builtValue : undefined;
    }, undefined);
  }

  getType(type) {
    if (type.name === undefined) return type.value;

    const { typeMappingChain, unknownTypeMappingChain } = this.getTypeMappingChain(type.name);

    const result = this.getValueFromTypeChain(typeMappingChain, type);

    if (result) {
      return result;
    }

    console.warn(`Unknown prop type found in docs -> '${type.name}' falling back to 'unknown'.`);

    return this.getValueFromTypeChain(unknownTypeMappingChain, type, 'unknown');
  }

  construct() {
    return build({
      parts: this.parts,
      placeholders: this.placeholders,
      context: { context: this.context, getType: this.getType },
    });
  }
}

module.exports = {
  type(parts, ...placeholders) {
    return {
      parts,
      placeholders,
    };
  },
  template(customTypeMapping = {}) {
    let initialTypeMapping = {
      unknown: 'unknown' in customTypeMapping ? customTypeMapping.unknown : 'Unknown',
      ...customTypeMapping,
    };
    let plugins = [];

    return (parts, ...placeholders) => {
      return {
        setPlugins(customPlugins) {
          plugins = customPlugins;
          return this;
        },
        instantiate(context, extension) {
          const pluginsTypeMapping = plugins
            .map(plugin => plugin.getTypeMapping({ extension }))
            .reverse();
          const typeConstructor = new TypeConstructor({
            pluginsTypeMapping,
            context,
            parts,
            placeholders,
            initialTypeMapping,
          });
          return typeConstructor.construct();
        },
      };
    };
  },
};
