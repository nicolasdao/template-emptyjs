/**
 * Copyright (c) 2017-2018, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const throwIfMissing = (value, valueName) => {
	if (!value)
		throw new Error(`Missing required argument${valueName ? ` '${valueName}'` : ''}.`)
	return value
}

const throwIfWrongValue = (value, valueName, validValues) => {
	if (!value)
		throw new Error('Failed to test value against a list of valid value. No value was passed.')
	if (!valueName)
		throw new Error('Failed to test value against a list of valid value. Missing second argument \'valueName\'.')
	if (typeof(valueName) != 'string')
		throw new Error('Failed to test value against a list of valid value. Wrong argument exception. The second argument \'valueName\' must be a string.')
	if (!validValues)
		throw new Error('Failed to test value against a list of valid value. Missing third required argument \'validValues\'.')

	const valid = Array.isArray(validValues) ? validValues.some(v => v == value) : value == validValues
	if (valid)
		return value
	else
		throw new Error(`Value for variable '${valueName}' is invalid. Valid values are ${validValues} (current: ${value}).`)
}

const throwIfNoMatch = (value, valueName, regex) => {
	if (!value)
		throw new Error('Failed to test value against a regex. No value was passed.')
	if (!valueName)
		throw new Error('Failed to test value against a regex. Missing second argument \'valueName\'.')
	if (typeof(valueName) != 'string')
		throw new Error('Failed to test value against a regex. Wrong argument exception. The second argument \'valueName\' must be a string.')
	if (!regex)
		throw new Error('Failed to test value against a regex. Missing third required argument \'regex\'.')
	if (!(regex instanceof RegExp))
		throw new Error('Failed to test value against a regex. Third required argument \'regex\' is not a RegExp.')

	const valid = regex.test(value)
	if (valid)
		return value
	else
		throw new Error(`Value for variable '${valueName}' is invalid. It does not match regex ${regex}.`)
}

module.exports = {
	throwIfMissing,
	throwIfWrongValue,
	throwIfNoMatch
}
