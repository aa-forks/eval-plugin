const { Plugin } = require("powercord/entities");
const { inspect } = require("util");

const {
  functions: { isPromise, type, parse },
} = require("./util");

const Settings = require("./Settings.jsx");

module.exports = class EvalCommand extends Plugin {
  startPlugin() {
    const autoComplete = (powercord.pluginManager.plugins.get(
      "pc-evalcommand"
    ).messages =
      powercord.pluginManager.plugins.get("pc-evalcommand").messages ?? []);

    const replace = this.settings.get("tokenReplacer", "[REDACTED]");
    const format = this.settings.get(
      "evalFormat",
      "⏱️ Took {time}{n}🔍 Typeof {type}{n}{output}"
    );

    const autoCompleteAmount = this.settings.get("autoCompleteAmount", 25);
    autoComplete.slice(0, autoCompleteAmount);

    powercord.api.settings.registerSettings("pc-evalcommand", {
      category: this.entityID,
      label: "Eval Command",
      render: Settings,
    });

    powercord.api.commands.registerCommand({
      command: "eval",
      aliases: ["evaluate"],
      description: "Evaluates any JavaScript code",
      usage: "{c} [ code ] [ -depth=<number> ]",
      category: "Util",
      async executor(args) {
        if (!args.length)
          return {
            send: false,
            result: `Invalid usage! Valid Usage: \`${this.usage.replace(
              "{c}",
              powercord.api.commands.prefix + this.command
            )}\``,
          };

        const { flags, phrases } = parse(
          args.join(" ").replace(/```js/, "").replace(/```/, "").trim()
        );

        if (!autoComplete.includes(phrases.join(" ")))
          autoComplete.unshift(phrases.join(" "));

        try {
          const start = process.hrtime();
          let toEval = eval(phrases.join(" "));
          let hr = process.hrtime(start);

          if (isPromise(toEval)) {
            toEval = await toEval;
            hr = process.hrtime(start);
          }

          let depth = flags.get("depth") || 0;
          if (isNaN(depth)) depth = 0;

          let returned = inspect(toEval, false, depth).toString();

          if (powercord.account && powercord.account.token)
            returned = returned.replace(powercord.account.token, replace);

          return {
            send: false,
            result: format
              .replace(
                new RegExp("{time}", "gi"),
                `${hr[0] > 0 ? `${hr[0]}s ` : ""}${hr[1] / 1000000}ms`
              )
              .replace(new RegExp("{type}", "gi"), type(toEval))
              .replace(
                new RegExp(`{output}`, "gi"),
                `\`\`\`js\n${returned.toString().substring(0, 1950)}\`\`\``
              )
              .replace(new RegExp("{n}", "gi"), "\n")
              .replace(
                new RegExp("{input}", "gi"),
                `\`\`\`js\n${args
                  .join(" ")
                  .replace(/```js\n?.+\n?```/gi, "")
                  .trim()}\`\`\``
              )
              .replace(new RegExp(`{depth}`, "gi"), depth)
              .substring(0, 1999),
          };
        } catch (error) {
          return {
            send: false,
            result: `\`\`\`js\n${error}\`\`\``,
          };
        }
      },
      autocomplete(args) {
        if (!args || !args.length) return false;

        const messages = powercord.pluginManager.plugins.get("pc-evalcommand")
          .messages;

        return {
          header: `Auto Complete`,
          commands: messages
            .filter((msg) =>
              msg.toLowerCase().includes(args.join(" ").toLowerCase())
            )
            .map((key) => ({ command: key, description: "" })),
        };
      },
    });
  }

  pluginWillUnload() {
    powercord.api.commands.unregisterCommand("eval");
    powercord.api.settings.unregisterSettings("pc-evalcommand");
    delete powercord.pluginManager.plugins.get("pc-evalcommand").messages;
  }
};
