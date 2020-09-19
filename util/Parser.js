const quotes = ['""', "''"];
const starting = quotes.reduce((s, q) => [q[0], ...s], []);
const ending = quotes.reduce((s, q) => [q[1], ...s], []);

const FLAG_REGEX = /^(-+[\w]+)/g;
const FLAG_FULL = new RegExp(
  `^-+([\\w-]+)(?:=([${starting.join("")}]?[\\w\\s]+[${ending.join("")}]?))?$`
);

module.exports = class Parser {
  constructor(seperator = " ") {
    this.seperator = seperator;
  }

  parse(text) {
    const str = text.split(this.seperator);

    const obj = { flags: new Map(), phrases: [] };

    for (const phrase of str) {
      if (FLAG_REGEX.test(phrase)) {
        console.log(FLAG_REGEX.exec(phrase));
        let [, name, content] = FLAG_FULL.exec(phrase);

        obj.flags.set(name, content ?? true);
      } else obj.phrases.push(phrase);
    }

    return obj;
  }
};
