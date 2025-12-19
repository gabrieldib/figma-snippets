const sel = figma.currentPage.selection;

// Use an array to store the filtered property objects
const allFilteredProperties = [];

// Iterate over each selected element
sel.forEach(e => {
  // Get the component properties for the current element
  const componentProperties = e.componentProperties;
  
  // Create a new object to hold only the 'value' properties
  const filteredProperties = {};

  // Iterate over the keys (property names) of the componentProperties object
  for (const propName in componentProperties) {
    // Ensure the property is directly on the object
    if (componentProperties.hasOwnProperty(propName)) {
      const propertyDetails = componentProperties[propName];

      // We only care about the 'value', so check if it exists
      if (propertyDetails && propertyDetails.hasOwnProperty('value')) {
        // Assign the property name and its extracted 'value' to the new object
        filteredProperties[propName] = propertyDetails.value;
      }
    }
  }

  // Add the resulting object to the main array
  allFilteredProperties.push(filteredProperties);
});

// Convert the array of objects into a single string with newlines, 
// or just log the structure directly.
let data = '';

// Option 1: Log the raw, structured object array (Recommended for easy use later)
console.log(allFilteredProperties);

// Option 2: Format it back to a string where each line is a JSON object 
// containing only the values, similar to your original output format.
allFilteredProperties.forEach(obj => {
  data += `${JSON.stringify(obj)}\n`;
});

// Log the string-based output
console.log(data);