require("fs")
  .readdirSync(__dirname)
  .filter((file) => !["index.js"].includes(file) && file.endsWith(".js"))
  .forEach((filename) => {
    const moduleName = filename.split(".")[0];
    module.exports[moduleName] = require(`${__dirname}/${filename}`);
  });
