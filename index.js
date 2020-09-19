const { Plugin } = require("powercord/entities");

module.exports = class EvalCommand extends Plugin {
  startPlugin() {
    powercord.api.commands.registerCommand({
      command: "eval",
      aliases: ["evaluate"],
      description: "Evaluates JavaScript code",
      usage: "{c} [ code ]",
      category: "Util",
      async executor(args) {
        try {
          const hrstart = process.hrtime();
          let toEval = eval(args.join(" "));
          const hr = process.hrtime(hrstart);

          if (EvalCommand.isPromise(toEval)) {
            toEval = await toEval;
            hr = process.hrtime(hrstart);
          }

          return {
            send: false,
            result: [
              `⏱️ Took:  ${hr[0] > 0 ? `${hr[0]}s ` : ""}${hr[1] / 1000000}ms`,
              `🔍 Type: ${this.type(toEval)}`,
              `\`\`\`js\n${evaluated
                .toString()
                .replace(powercord.account.token, "fuck off")
                .substring(0, 1950)}\`\`\``,
            ].join("\n"),
          };
        } catch (error) {
          return {
            send: false,
            result: `Error:\`\`\`js${error}\`\`\``,
          };
        }
      },
    });
  }

  pluginWillUnload() {
    powercord.api.commands.unregisterCommand("eval");
  }

  static type(value) {
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
  }

  static isPromise(value) {
    return (
      value &&
      typeof value.then === "function" &&
      typeof value.catch === "function"
    );
  }
};
