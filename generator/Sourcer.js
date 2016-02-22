
var _ = require('lodash')

var KEYWORD_REGEXP = /^(abstract|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|undefined|var|void|volatile|while|with)$/

function legalKey (string) {
	return /^[a-z_$][0-9a-z_$]*$/gi.test(string) && !KEYWORD_REGEXP.test(string)
}

// Node.js 0.10 doesn't escape slashes in re.toString() or re.source
// when they were not escaped initially.
// Here we check if the workaround is needed once and for all,
// then apply it only for non-escaped slashes.
var isRegExpEscaped = (new RegExp('/')).source === '\\/'

function stringifyRegExp (re) {
	if (isRegExpEscaped) {
		return re.toString()
	}
	var source = re.source.replace(/\//g, function (found, offset, str) {
		if (offset === 0 || str[offset - 1] !== '\\') {
			return '\\/'
		}
		return '/'
	})
	var flags = (re.global && 'g' || '') + (re.ignoreCase && 'i' || '') + (re.multiline && 'm' || '')
	return '/' + source + '/' + flags
}


module.exports = function (object, indent, startingIndent) {
	var seen = []

	function walk (object, indent, currentIndent, seen) {
		var nextIndent = currentIndent + indent

		if ( _.isString( object ) )
			return JSON.stringify(object)
		if ( _.isBoolean( object ) || _.isNumber( object ) )
			return '' + object
		if ( _.isFunction( object ) )
			return object.toString()
		if ( _.isRegExp( object ) )
			return stringifyRegExp(object)
		if ( _.isDate( object ) )
			return 'new Date(' + object.getTime() + ')'
		if (object === null)
			return 'null'

		var seenIndex = seen.indexOf(object) + 1
		if (seenIndex > 0) {
			return '{$circularReference:' + seenIndex + '}'
		}
		seen.push(object)

		if (_.isArray(object)) {
			return '[ ' + object.map(function (element) {
				return walk(element, indent, nextIndent, seen.slice())
			}).join(', ') + ' ]'
		}
		if (_.isObject(object)) {
			var keys = Object.keys(object)
			return keys.length ? '{\n' + keys.map( function (key) {
				return nextIndent + (legalKey(key) ? key : JSON.stringify(key)) + ': ' + walk(object[key], indent, nextIndent, seen.slice())
			}).join(',\n') + '\n' + currentIndent + '}' : '{ }'
		}
	}

	return walk(object, indent || '\t', startingIndent || '', seen)
}
