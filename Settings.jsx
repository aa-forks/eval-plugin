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
  </div>
);
