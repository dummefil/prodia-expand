function modifyStringBasedOnReference(string1, string2) {
  const array1 = string1.split(',').map(value => value.trim());
  const array2 = string2.split(',').map(value => value.trim());

  // Find elements present in array1 but not in array2
  const difference1 = array1.filter(value => !array2.includes(value));

  // Add missing elements from difference1 to array2
  const modifiedArray2 = array2.concat(difference1);

  // Remove elements present in array2 but not in array1
  const modifiedArray2WithoutDifference2 = modifiedArray2.filter(value => array1.includes(value));

  // Create the modified string
  const modifiedString2 = modifiedArray2WithoutDifference2.join(', ');

  return modifiedString2;
}

const string1 = "looking at viewer, kneeling, solo, twintails, socks";
const string2 = "looking at sky, twintails, nose";

const modifiedString2 = modifyStringBasedOnReference(string1, string2);
console.log("Modified String 2:", modifiedString2);
