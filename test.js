const helperFunction = () => {
  console.log("I am helping");
};
const getLength = (array) => {
  return array.length;
};
const helperFunction1 = helperFunction;


const buickModels = ["encore", "enclave"];

helperFunction1();
const getLengthFunction = getLength;


const cadillacModels = ["escalade", "cts"];

const length = getLengthFunction(cadillacModels);

console.log(length);
const chevroletModels = ["tahoe", "suburban", "camaro"];
const gmcModels = ["yukon", "sierra", "canyon"];
const gmc = {
  gmcModels,
};

const chevrolet = {
  chevroletModels,
};

const cadillac = {
  cadillacModels,
};

const buick = {
  buickModels,
};


const getModels = (make, models) =>
  `The models for ${make} are: ` + models.join(", ");

console.log(getModels("GMC", gmc.gmcModels));
console.log(getModels("Chevrolet", chevrolet.chevroletModels));
console.log(getModels("Cadillac", cadillac.cadillacModels));
console.log(getModels("Buick", buick.buickModels));
