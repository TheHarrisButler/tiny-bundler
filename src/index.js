const gmc = require("./gmc");
const chevrolet = require("./chevrolet");
const cadillac = require("./cadillac");
const buick = require("./buick");

const getModels = (make, models) =>
  `The models for ${make} are: ` + models.join(", ");

console.log(getModels("GMC", gmc.gmcModels));
console.log(getModels("Chevrolet", chevrolet.chevroletModels));
console.log(getModels("Cadillac", cadillac.cadillacModels));
console.log(getModels("Buick", buick.buickModels));
