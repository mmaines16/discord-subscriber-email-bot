exports.findByPropertyName = function(list, propName, searchString) {
    return list.filter(function(listObj) { 
        if(searchString === listObj[propName]) {
            return listObj;
        }
    })[0];
};

exports.removeByPropName = function(list, propName, searchString) {
    return list.filter(function(listObj) {
        if(listObj[propName] !== searchString) return listObj;
    });
}