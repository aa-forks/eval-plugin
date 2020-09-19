const quotes = ['""', "''"];
const starting = quotes.reduce((s, q) => [q[0], ...s], []);
const ending = quotes.reduce((s, q) => [q[1], ...s], []);

const FLAG_REGEX = /^(-+[\w]+)/g;
const FLAG_FULL = new RegExp(
  `^-+([\\w-]+)(?:=([${starting.join("")}]?[\\w\\s]+[${ending.join("")}]?))?$`
);

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

module.exports.parse = (text) => {
  const str = text.split(" ");

  const obj = { flags: new Map(), phrases: [] };

  for (const phrase of str) {
    if (FLAG_REGEX.test(phrase)) {
      console.log(FLAG_REGEX.exec(phrase));
      let [, name, content] = FLAG_FULL.exec(phrase);

      obj.flags.set(name, content ?? true);
    } else obj.phrases.push(phrase);
  }

  return obj;
};
