module.exports.type = (value) => {
  const type = typeof value;
  switch (type) {
    case "object":
      return value === null
        ? "null"
        : value.constructor
        ? value.constructor.name
        : "any";
    case "function":
      return `${value.constructor.name}(${value.length})`;
    case "undefined":
      return "void";
    default:
      return type;
  }
};

module.exports.isPromise = (value) => {
  return (
    value &&
    typeof value.then === "function" &&
    typeof value.catch === "function"
  );
};
