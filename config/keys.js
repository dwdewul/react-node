// determine which key set to use
if (process.env.NODE_ENV === "production") {
  module.exports = require("./prod");
  console.log(process.env);
} else {
  module.exports = require("./dev");
}
