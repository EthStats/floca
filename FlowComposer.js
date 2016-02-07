var I_DELIMETER = ':';
var M_DELIMETER = ',';
var A_DELIMETER = '_';
module.exports = {
	createInteraction: function( fnName, messages ){
		return fnName + I_DELIMETER + messages.join( M_DELIMETER ) + A_DELIMETER;
	}
};
