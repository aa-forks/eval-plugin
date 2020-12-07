/* Vizality Related Items */
const { Plugin } = require("@vizality/entities");
const { getModule } = require("@vizality/webpack");

/* Eval command specific */
const { inspect } = require("util");
const {
  functions: { isPromise, type, parse },
} = require("./util");
const { Script, createContext } = require("vm");

/* Settings react file */
const Settings = require("./Settings.jsx");

module.exports = class EvalCommand extends Plugin {
  onStart() {
    // All of the settings. Looks ugly but idk how else to make this look "pretty"
    const replace = this.settings.get("tokenReplacer", "[REDACTED]");
    const format = this.settings.get(
      "evalFormat",
      "⏱️ Took {time}{n}🔍 Typeof {type}{n}{output}"
    );
    const safeEval = this.settings.get("safeEval", false);
    const autoCompleteAmount = this.settings.get("autoCompleteAmount", 25);
    const allowAutoComplete = this.settings.get("autoCompleteToggle", true);

    // Register Eval settings
    vizality.api.settings.registerAddonSettings({
      id: this.addonId,
      heading: "Eval Plugin Settings",
      render: Settings,
    });

    // Eval command, of course
    vizality.api.commands.registerCommand({
      command: "eval",
      aliases: ["evaluate"],
      description: "Evaluates any JavaScript code",
      usage: "{c} [ code ] [ -depth=<number> ]",
      category: "Util",
      async executor(args) {
        // Check for arguments
        if (!args.length)
          return {
            send: false,
            result: `Invalid usage! Valid Usage: \`${this.usage.replace(
              "{c}",
              vizality.api.commands.prefix + this.command
            )}\``,
          };

        // Parse flags and phrases
        const { flags, phrases } = parse(
          args.join(" ").replace(/```js/, "").replace(/```/, "").trim()
        );

        // @TODO: fix issue: https://github.com/Sxmurai/eval-plugin/issues/3
        if (!this.messages.includes(phrases.join(" ")) && allowAutoComplete)
          this.messages.unshift(phrases.join(" "));

        // Check for depth.
        let depth = flags.get("depth") || 0;
        if (isNaN(depth)) depth = 0;

        // Try/catch for error handling.
        try {
          if (safeEval) {
            let hrtime = process.hrtime();
            const evaluated = new Script(phrases.join(" ")).runInContext(
              createContext()
            );
            hrtime = process.hrtime(hrtime);

            const inspected = inspect(evaluated, false, depth);

            return {
              send: false,
              result: format
                .replace(
                  new RegExp("{time}", "gi"),
                  `${hrtime[0] > 0 ? `${hrtime[0]}s ` : ""}${
                    hrtime[1] / 1000000
                  }ms`
                )
                .replace(new RegExp("{type}", "gi"), type(evaluated))
                .replace(
                  new RegExp(`{output}`, "gi"),
                  `\`\`\`js\n${inspected.toString().substring(0, 1950)}\`\`\``
                )
                .replace(new RegExp("{n}", "gi"), "\n")
                .replace(
                  new RegExp("{input}", "gi"),
                  `\`\`\`js\n${phrases.join(" ")}\`\`\``
                )
                .substring(0, 1999),
            };
          }

          const start = process.hrtime();
          let toEval = eval(phrases.join(" "));
          let hr = process.hrtime(start);

          if (isPromise(toEval)) {
            toEval = await toEval;
            hr = process.hrtime(start);
          }

          let returned = inspect(toEval, false, depth).toString().replace(getModule("getToken").getToken(), replace);

          return {
            send: false,
            result: format
              .
            (
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
                `\`\`\`js\n${phrases.join(" ")}\`\`\``
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
    });

    // @TODO: improve this garbage
    if (allowAutoComplete) {
      vizality.api.commands.commands["eval"].messages = [];

      const messages = vizality.api.commands.commands["eval"].messages;

      setInterval(() => {
        if (messages.length > autoCompleteAmount)
          messages.slice(0, autoCompleteAmount);
      }, 5000);

      vizality.api.commands.commands["eval"].autocomplete = (args) => {
        if (!args || !args.length) return false;

        return {
          header: `Auto Complete`,
          commands: messages
            .filter((msg) =>
              msg.toLowerCase().includes(args.join(" ").toLowerCase())
            )
            .map((key) => ({ command: key, description: "" })),
        };
      };
    }
  }

  onStop() {
    vizality.api.commands.unregisterCommand("eval");
    vizality.api.settings.unregisterSettings(this.addonId);
  }
};
