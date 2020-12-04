const { React } = require("@vizality/webpack");
const {
  SwitchItem,
  TextInput,
  ButtonItem,
} = require("@vizality/components/settings");
const { Button } = require("@vizality/components");

module.exports = class Settings extends React.Component {
  render() {
    const { getSetting, toggleSetting, updateSetting } = this.props;

    return (
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
          note="Amount of messages to cache for auto completion"
          defaultValue={getSetting("autoCompleteAmount", 25)}
          onChange={(val) =>
            updateSetting("autoCompleteAmount", isNaN(val) ? 25 : Number(val))
          }
          disabled={!getSetting("autoCompleteToggle")}
        >
          Auto Complete
        </TextInput>

        <SwitchItem
          note="Turns auto complete on or off."
          value={getSetting("autoCompleteToggle", true)}
          onChange={() => toggleSetting("autoCompleteToggle")}
        >
          Auto Complete
        </SwitchItem>

        <SwitchItem
          note="For the users who are inexpirenced. I'm not sure why you'd want this, but it's here just in case."
          value={getSetting("safeEval", false)}
          onChange={() => toggleSetting("safeEval")}
        >
          Basic/Safe Evaluate
        </SwitchItem>

        <ButtonItem
          note="Clear all of the auto complete cache, just in case."
          disabled={!getSetting("autoCompleteToggle")}
          button="Clear Data"
          color={Button.Colors.RED}
          onClick={() =>
            (vizality.api.commands.commands["eval"].messages = [])
          }
        >
          Clear Auto Complete Cache
        </ButtonItem>
      </div>
    );
  }
};
