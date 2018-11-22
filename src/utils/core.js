/**
 * Copyright (c) 2017-2018, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const shortid = require('shortid')

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////                           START COLLECTION                           ////////////////////////////////

/**
 * Breaks down an array into an array with 2 items:
 * 	[0]: Head of size 'headSize' (default 'headSize' is 1)
 * 	[1]: The rest of the items
 * 	
 * @param  {Array}   a        	Original array
 * @param  {Number} headSize 	Default 1
 * @return {Array}           	Array of length 2
 */
const headTail = (a, headSize=1) => (a || []).reduce((acc, v, idx) => {
	idx < headSize ? acc[0].push(v) : acc[1].push(v)
	return acc
}, [[],[]])


const uniq = (a, fn) => {
	fn = fn || (x => x)
	return Object.keys((a || []).reduce((acc,x) => {
		const v = fn(x)
		if (!acc[v])
			acc[v] = true
		return acc
	}, {}))
}

const _objectSortBy = (obj, fn = x => x, dir='asc') => Object.keys(obj || {})
	.map(key => ({ key, value: obj[key] }))
	.sort((a,b) => {
		const vA = fn(a.value)
		const vB = fn(b.value)
		if (dir == 'asc') {
			if (vA < vB)
				return -1
			else if (vA > vB)
				return 1
			else
				return 0
		} else {
			if (vA > vB)
				return -1
			else if (vA < vB)
				return 1
			else
				return 0
		}
	}).reduce((acc,v) => {
		acc[v.key] = v.value
		return acc
	}, {})

const _arraySortBy = (arr, fn = x => x, dir='asc') => (arr || []).sort((a,b) => {
	const vA = fn(a)
	const vB = fn(b)
	if (dir == 'asc') {
		if (vA < vB)
			return -1
		else if (vA > vB)
			return 1
		else
			return 0
	} else {
		if (vA > vB)
			return -1
		else if (vA < vB)
			return 1
		else
			return 0
	}
})

const sortBy = (obj, fn = x => x, dir='asc') => Array.isArray(obj) ? _arraySortBy(obj, fn, dir) : _objectSortBy(obj, fn, dir)
const newSeed = (size=0) => Array.apply(null, Array(size))

const mergeCollection = (...collections) => {
	if (collections.length == 0)
		return []

	const lengths = collections.filter(col => col && col.length).map(col => col.length)
	if (lengths.length == 0)
		return collections
	
	const maxLength = Math.max(...collections.filter(col => col && col.length).map(col => col.length))

	return collections.map(col => {
		const l = (col || []).length
		if (l == 0) {
			return newSeed(maxLength)
		}
		if (l == maxLength)
			return col 

		const diff = maxLength - l
		return [...col, ...newSeed(diff)]
	})
}

//////////////////////////                           END COLLECTION                             ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////                           START CONVERTER                           	////////////////////////////////

/**
 * Convert snake case to camel case
 * @param  {String} s 	e.g., "hello_world"
 * @return {String}   	e.g., "helloWorld"
 */
const s2cCase = s => (s || '').replace(/\s/g, '').toLowerCase().split(/(?=_.{1})/g).reduce((result, part) => result + (result ? (part.slice(1,2).toUpperCase() + part.slice(2)) : part), '')

/**
 * Convert camel case to snake case
 * @param  {String} s 	e.g., "helloWorld"
 * @return {String}   	e.g., "hello_world"
 */
const c2sCase = s => (s || '').replace(/\s/g, '').split(/(?=[A-Z]{1})/g).map(x => x.toLowerCase()).join('_')

// Transforms { helloWorld: 'Nic' } to { hello_world: 'Nic' }
const objectC2Scase = obj => {
	if (!obj || typeof(obj) != 'object') 
		return obj 

	return Object.keys(obj).reduce((acc, key) => {
		const v = obj[key]
		const p = c2sCase(key)
		if (v && typeof(v) == 'object') {
			if (Array.isArray(v))
				acc[p] = v.map(x => objectC2Scase(x))
			else
				acc[p] = objectC2Scase(v)
		} else
			acc[p] = v 
		return acc
	}, {})
}

// Transforms { hello_world: 'Nic' } to { helloWorld: 'Nic' }
const objectS2Ccase = obj => {
	if (!obj || typeof(obj) != 'object') 
		return obj 

	return Object.keys(obj).reduce((acc, key) => {
		const v = obj[key]
		const p = s2cCase(key)
		if (v && typeof(v) == 'object') {
			if (Array.isArray(v))
				acc[p] = v.map(x => objectS2Ccase(x))
			else
				acc[p] = objectS2Ccase(v)
		} else
			acc[p] = v 
		return acc
	}, {})
}

//////////////////////////                           END CONVERTER	                            ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////                           END DATETIME HELPER                        ////////////////////////////////

const getDateUtc = (date) => {
	const now_utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
	return new Date(now_utc)
}

const addZero = nbr => ('0' + nbr).slice(-2)

const getTimestamp = (options={ short:true }) => {
	const d = getDateUtc(new Date())
	const main = `${d.getUTCFullYear()}${addZero(d.getUTCMonth()+1)}${addZero(d.getUTCDate())}`
	if (options.short)
		return main
	else 
		return `${main}-${addZero(d.getUTCHours())}${addZero(d.getUTCMinutes())}${addZero(d.getUTCSeconds())}`
}

const addDaysToDate = (d, v=0) => {
	const t = new Date(d)
	t.setDate(d.getDate() + v)
	return t
}

const addMonthsToDate = (d, v=0) => {
	const t = new Date(d)
	t.setMonth(d.getMonth() + v)
	return t
}

const addYearsToDate = (d, v=0) => {
	const t = new Date(d)
	t.setYear(d.getFullYear() + v)
	return t
}

const addHoursToDate = (d, v=0) => {
	const t = new Date(d)
	t.setHours(d.getHours() + v)
	return t
}

const addMinutesToDate = (d, v=0) => {
	const t = new Date(d)
	t.setMinutes(d.getMinutes() + v)
	return t
}

const addSecondsToDate = (d, v=0) => {
	const t = new Date(d)
	t.setSeconds(d.getSeconds() + v)
	return t
}

//////////////////////////                           END DATETIME HELPER                        ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////                           START IDENTITY                             ////////////////////////////////

/**
 * Returns a unique identifier (default length 9)
 * @param  {Boolean} options.short 		[description]
 * @param  {Boolean} options.long 		[description]
 * @param  {String}  options.separator 	Not valid when options.short is true
 * @param  {Boolean} options.lowerCase 	[description]
 * @return {[type]}         			[description]
 */
const newId = (options={}) => {
	const sep = options.separator || ''
	const getId = options.lowerCase 
		? () => shortid.generate().replace(/-/g, 'r').replace(/_/g, '9').toLowerCase().slice(0,5)
		: () => shortid.generate().replace(/-/g, 'r').replace(/_/g, '9').slice(0,5)

	return options.short ? getId() : options.long ? `${getId()}${sep}${getId()}${sep}${getId()}${sep}${getId()}` : `${getId()}${sep}${getId()}`

}

//////////////////////////                           START IDENTITY                             ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////                             START MATH                                ///////////////////////////////

/**
 * Calculates the average of a specific field on an array objects
 * 
 * @param  {Array}   	arr 	e.g. [{ name: 'Nic', age: 36 }, { name: 'Boris', age: 30 }]
 * @param  {Function} 	fn  	e.g. x => x.age
 * @return {Number}       		e.g. 33
 */
const avg = (arr=[], fn) => {
	if (arr.length == 0) 
		return null 
	const f = fn || (x => x) 
	return arr.reduce((a,v) => a + f(v), 0)/arr.length
}

/**
 * Calculates the standard deviation of a specific field on an array objects
 * 
 * @param  {Array}   	arr 	e.g. [{ name: 'Nic', age: 36 }, { name: 'Boris', age: 30 }]
 * @param  {Function} 	fn  	e.g. x => x.age
 * @return {Number}       		e.g. 33
 */
const stdDev = (arr=[], fn) => {
	if (arr.length == 0) 
		return null
	const f = fn || (x => x)
	const { result, resultSquare } = arr.reduce((a,v) => {
		const val = f(v)
		return { result: a.result + val, resultSquare: a.resultSquare + Math.pow(val,2) }
	}, { result:0, resultSquare:0 })

	const l = arr.length
	return Math.sqrt((resultSquare/l) - Math.pow((result/l), 2))
}

/**
 * Calculates the median deviation of a specific field on an array objects
 * 
 * @param  {Array}   	arr 	e.g. [{ name: 'Nic', age: 36 }, { name: 'Boris', age: 30 }]
 * @param  {Function} 	fn  	e.g. x => x.age
 * @return {Number}       		e.g. 33
 */
const median = (arr=[], fn) => {
	const f = fn || (x => x)
	const l = arr.length
	if (l == 0)
		return null
	// odd length
	else if (l & 1) 
		return arr.map(x => f(x)).sort((a,b) => a >= b)[Math.floor(l/2)]
	// even length
	else {
		const idx_1 = Math.floor(l/2)
		const idx_0 = idx_1 - 1
		const a = arr.map(x => f(x)).sort((a,b) => a >= b)
		return (a[idx_0] + a[idx_1])/2
	}
}

const getRandomNumber = (start, end) => {
	const size = end == undefined ? start : (end - start)
	const offset = end == undefined ? 0 : start
	return offset + Math.floor(Math.random() * size)
}

//////////////////////////                              END MATH                                 ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////                         START OBJECT HELPERS                                 ////////////////////////

const mergeObj = (...objs) => objs.reduce((acc, obj) => { //Object.assign(...objs.map(obj => JSON.parse(JSON.stringify(obj))))
	obj = obj || {}
	if (typeof(obj) != 'object' || Array.isArray(obj) || (obj instanceof Date))
		return acc
	
	Object.keys(obj).forEach(property => {
		const val = obj[property]
		const originVal = acc[property]
		const readyToMerge = !originVal || !val || typeof(val) != 'object' || Array.isArray(val) || typeof(originVal) != 'object' || Array.isArray(originVal)
		acc[property] = readyToMerge ? val : mergeObj(originVal, val)	
	})

	return acc
}, {})

const isEmptyObj = obj => {
	if (!obj)
		return true 
	try {
		const o = JSON.stringify(obj)
		return o == '{}'
	} catch(e) {
		return (() => false)(e)
	}
}

const isObj = obj => {
	if (!obj || typeof(obj) != 'object')
		return false 

	try {
		const o = JSON.stringify(obj) || ''
		return o.match(/^\{(.*?)\}$/)
	} catch(e) {
		return (() => false)(e)
	}
}

const getDiff = (orig={}, current={}) => {
	return Object.keys(current).reduce((acc, key) => {
		const val = current[key]
		const origVal = orig[key]
		if (val == undefined || origVal == val) 
			return acc
		
		const origValIsObj = isObj(origVal)

		if (!origValIsObj && origVal != val) {
			acc[key] = val
			return acc
		} 

		const valIsObj = isObj(val)

		if (origValIsObj && valIsObj) {
			const objDiff = getDiff(origVal, val)
			if (!isEmptyObj(objDiff))
				acc[key] = objDiff
			return acc
		}

		if (origVal != val) {
			acc[key] = val
			return acc
		} 
		return acc
	}, {})
}

const objAreSame = (obj1, obj2) => {
	const o = getDiff(obj1, obj2)
	return Object.keys(o || {}).length == 0
}

const arrayObjAreDiff = (objArr_01, objArr_02) => {
	objArr_01 = objArr_01 || []
	objArr_02 = objArr_02 || []
	if (objArr_01.length != objArr_02.length)
		return false 
	return objArr_01.some(h1 => !objArr_02.some(h2 => objAreSame(h1, h2)))
}

//////////////////////////                         START OBJECT HELPERS                                 ////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////                         START VALIDATE HELPERS                               ////////////////////////

const validateUrl = (value='') => /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value)

const validateEmail = (value='') => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(value)

const validateIsDate = (d, options={ exception: { toggle: false, message: null } }) => { 
	const test = d && typeof(d.getTime) == 'function' && !isNaN(d.getTime())
	if (!test && options.exception.toggle)
		throw new Error(options.exception.message || `${d} is not a Date object.`)
	return test
}

//////////////////////////                          END VALIDATE HELPERS                                ////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
	collection: {
		uniq,
		headTail,
		sortBy,
		seed: newSeed,
		merge: mergeCollection
	},
	converter: {
		s2cCase,
		c2sCase,
		objectC2Scase,
		objectS2Ccase
	},
	date: {
		timestamp: getTimestamp,
		addDays: addDaysToDate,
		addMonths: addMonthsToDate,
		addYears: addYearsToDate,
		addHours: addHoursToDate,
		addMinutes: addMinutesToDate,
		addSeconds: addSecondsToDate
	},
	identity: {
		'new': newId
	},
	math: {
		avg,
		stdDev,
		median,
		randomNumber: getRandomNumber
	},
	obj: {
		merge: mergeObj,
		isEmpty: isEmptyObj,
		isObj,
		diff: getDiff,
		same: objAreSame,
		arrayAreDiff: arrayObjAreDiff
	},
	validate: {
		url: validateUrl,
		date: validateIsDate,
		email: validateEmail
	}
}
