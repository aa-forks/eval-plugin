const { React } = require("powercord/webpack");
const { TextInput, SwitchItem } = require("powercord/components/settings");

module.exports = ({ getSetting, updateSetting }) => (
  <div>
    <TextInput
      note="Text to replace your token with"
      defaultValue={getSetting("tokenReplacer", "[REDACTED]")}
      onChange={(val) => updateSetting("tokenReplacer", val)}
    >
      Token Replacer
    </TextInput>

    <TextInput
      note="Custom formatting! Check out the github repo for more info."
      defaultValue={getSetting(
        "evalFormat",
        "⏱️ Took {time}{n}🔍 Typeof {type}{n}{output}"
      )}
      onChange={(val) => updateSetting("evalFormat", val)}
    >
      Output Formatting
    </TextInput>

    <TextInput
      note="Amount of messages to hold for autocompletion"
      defaultValue={getSetting("autoCompleteAmount", 25)}
      onChange={(val) =>
        updateSetting("autoCompleteAmount", isNaN(val) ? 25 : Number(val))
      }
    >
      Auto Complete
    </TextInput>

    <SwitchItem
      note="For the users who are inexpirenced. Soon™"
      defaultValue={getSetting("safeEval", true)}
      onChange={updateSetting("safeEval", true)}
      disabled
    >
      Basic/Safe Evaluate
    </SwitchItem>
  </div>
);
