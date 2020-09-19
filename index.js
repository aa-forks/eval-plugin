const { Plugin } = require("powercord/entities");
const { inspect } = require("util");

const Settings = require("./Settings.jsx");

module.exports = class EvalCommand extends Plugin {
  startPlugin() {
    const replace = this.settings.get("tokenReplacer", "[REDACTED]");

    powercord.api.settings.registerSettings("pc-evalcommand", {
      category: this.entityID,
      label: "Eval Command",
      render: Settings,
    });

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

          const evaluated = inspect(toEval, false);

          return {
            send: false,
            result: [
              `⏱️ Took:  ${hr[0] > 0 ? `${hr[0]}s ` : ""}${hr[1] / 1000000}ms`,
              `🔍 Type: ${EvalCommand.type(toEval)}`,
              `\`\`\`js\n${evaluated
                .toString()
                .replace(powercord.account.token, replace)
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
