module.exports = function(state, commands) {
    deepClone = Array.isArray(state) ? [] : {};

    for(element in state) {
        if(!(element in commands)) {
            // No deep copy needed, only a reference to the original element
            deepClone[element] = state[element];
        } else {
            // Deep copy needed, since we will be changing the object
            // Only one layer of depth is needed: changing any under-objects is forbidden
            deepClone[element] = JSON.parse(JSON.stringify(state[element]));
        }
    }

    commandList = extractCommands(commands, "deepClone")
    for(command in commandList) {
        // Mutate the deepClone object
        runCommand(commandList[command])
    }

    return deepClone;

    function runCommand(params) {
        var newValue = params[0];
        var location = params[1];
        var commandName = params[2];

        switch(commandName) {
            case "$set":
                eval(location + " = " + JSON.stringify(newValue));
                break;
            case "$push":
                for(value in newValue) {
                    deepClone.push(newValue[value]);
                }
                break;
            case "$unshift":
                // Does element-wise unshift; to 'append' newValue to the front,
                // the loop would need to go backwards
                for(value in newValue) {
                    deepClone.unshift(newValue[value]);
                }
                break;
            case "$splice":
                for(value in newValue) {
                    var start = newValue[value][0]
                    var removeCount = newValue[value][1]
                    var newElements = newValue[value][2];
                    deepClone.splice(start, removeCount, newElements);
                }
                break;
            case "$merge":
                for(key in newValue) {
                    deepClone[key] = newValue[key];
                }
                break;
            case "$apply":
                // Relies on the fact that state is a number and not a list.
                // If state is a list, then we would just run deepClone.map(x => newValue(x));
                deepClone = newValue(state);
                break;
        }
    }


    function extractCommands(commands, clonedObject) {
        commandProperties = [];
        // new values, location, and commandName
        for(element in commands) {
            var alreadyAtCommand = (element[0] == "$");
       // no recursion needed
            var newLocation = clonedObject + "[\"" + element + "\"]";

            if(!alreadyAtCommand) {
                return extractCommands(commands[element], newLocation);
            }
            else {
                commandProperties.push([commands[element], clonedObject, element]);
            }
        }
        return commandProperties;
    }
}
