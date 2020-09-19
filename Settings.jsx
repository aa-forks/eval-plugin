const { React } = require("powercord/webpack");
const { TextInput } = require("powercord/components/settings");

module.exports = ({ getSetting, updateSetting }) => (
  <div>
    <TextInput
      note="Text to replace token with"
      defaultValue={getSetting("tokenReplacer", "[REDACTED]")}
      onChange={(val) => updateSetting("tokenReplacer", val)}
    >
      Token Replace
    </TextInput>

    <TextInput
      note="The output format"
      defaultValue={getSetting(
        "evalFormat",
        "⏱️ Took {time}{n}🔍 Typeof {type}{n}{output}"
      )}
      onChange={(val) => updateSetting("evalFormat", val)}
    ></TextInput>
  </div>
);
