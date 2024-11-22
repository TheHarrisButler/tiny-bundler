const getLengthFunction = require("./utilities/get-length");

const cadillacModels = ["escalade", "cts"];

const length = getLengthFunction(cadillacModels);

console.log(length);

module.exports = {
  cadillacModels,
};
