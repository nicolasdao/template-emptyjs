/**
 * Copyright (c) 2017-2018, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { obj: { merge }, identity, math } = require('./core')
const { arities } = require('./functional')

const delay = timeout => new Promise(onSuccess => setTimeout(onSuccess, timeout))

const wait = (stopWaiting, options) => Promise.resolve(null).then(() => {
	const now = Date.now()
	const { timeout=300000, start=now, interval=2000 } = options || {}
	
	if ((now - start) > timeout)
		throw new Error('timeout')
	
	return Promise.resolve(null).then(() => stopWaiting()).then(stop => {
		if (stop)
			return
		else
			return delay(interval).then(() => wait(stopWaiting, { timeout, start, interval }))
	})
})

/**
 * Add 3 new functions on a promise. Each one return a boolean:
 * 	1. isFulfilled()
 * 	2. isPending()
 * 	3. isRejected()
 * 	
 * @param  {Promise} promise Original promise
 * @return {Promise}         Same promise as the input, augmented with 3 new functions
 */
const makePromiseQueryable = promise => {
	// Don't modify any promise that has been already modified.
	if (promise.isResolved) return promise

	// Set initial state
	let isPending = true
	let isRejected = false
	let isFulfilled = false

	// Observe the promise, saving the fulfillment in a closure scope.
	let result = promise.then(
		v => {
			isFulfilled = true
			isPending = false
			return v
		}, 
		e => {
			isRejected = true
			isPending = false
			throw e
		}
	)

	result.isFulfilled = () => isFulfilled
	result.isPending = () => isPending
	result.isRejected = () => isRejected
	return result
}

/**
 * Makes a promise throw an error if it times our
 * @param  {Promise} p       	Original promise
 * @param  {Number} timeOut 	Optional. Default is 30,000 milliseconds
 * @return {Promise}         	[description]
 */
const addTimeout = (p, timeOut=30000) => {
	const timeoutMsg = `timout_${identity.new()}`
	const timeoutTask = new Promise(onSuccess => setTimeout(() => onSuccess(timeoutMsg), timeOut))
	return Promise.race([timeoutTask, p])
		.then(res => {
			if (res == timeoutMsg)
				throw new Error('timeout')
			return res
		})
}

/**
 * [description]
 * @param  {Function} fn        				[description]
 * @param  {Function} successFn 				(res, options) => Returns a promise or a value. The value is a boolean or an object that determines 
 *                                  			whether a response is valid or not. If the value is an object, that object might contain
 *                                  			a 'retryInterval' which overrides the optional value. 
 * @param  {Function} failureFn 				(Optional) (error, options) => Returns a promise or a value. The value is a boolean or an object that determines 
 *                                  			whether a response is valid or not. If the value is an object, that object might contain
 *                                  			a 'retryInterval' which overrides the optional value.                          			
 * @param  {Number}   options.retryAttempts   	default: 5. Number of retry
 * @param  {Number}   options.attemptsCount   	Current retry count. When that counter reaches the 'retryAttempts', the function stops.
 * @param  {Number}   options.timeOut   		If specified, 'retryAttempts' and 'attemptsCount' are ignored
 * @param  {Number}   options.retryInterval   	default: 5000. Time interval in milliseconds between each retry. It can also be a 2 items array.
 *                                             	In that case, the retryInterval is a random number between the 2 ranges (e.g., [10, 100] => 54)
 * @param  {Boolean}  options.ignoreError   	In case of constant failure to pass the 'successFn' test, this function will either throw an error
 *                                           	or return the current result without throwing an error if this flag is set to true.
 * @param  {String}   options.errorMsg   		Customize the exception message in case of failure.
 * @param  {String}   options.ignoreFailure   	If set to true, then failure from fn will cause a retry
 * @return {[type]}             				[description]
 */
const retry = arities(
	'function fn, function successFn, object options={}',
	'function fn, function successFn, function failureFn, object options={}',
	({ fn, successFn, failureFn, options={} }) => { 
		const start = Date.now()
		return Promise.resolve(null)
			.then(() => fn()).then(data => ({ error: null, data }))
			.catch(error => { 
				if (options.ignoreFailure && !failureFn)
					failureFn = () => true
				return { error, data: null }
			})
			.then(({ error, data }) => Promise.resolve(null)
				.then(() => {
					if (error && failureFn)
						return failureFn(error, options)
					else if (error)
						throw error 
					else
						return successFn(data, options)
				})
				.then(passed => {
					if (!error && passed)
						return data
					else if ((!error && !passed) || (error && passed)) {
						let { retryAttempts=5, retryInterval=5000, attemptsCount=0, timeOut=null, startTime=null } = options
						if (timeOut > 0) {
							startTime = startTime || start
							if (Date.now() - startTime < timeOut) {
								const explicitRetryInterval = passed && passed.retryInterval > 0 ? passed.retryInterval : null
								const i = (!explicitRetryInterval && Array.isArray(retryInterval) && retryInterval.length > 1)
									? (() => {
										if (typeof(retryInterval[0]) != 'number' || typeof(retryInterval[1]) != 'number')
											throw new Error(`Wrong argument exception. When 'options.retryInterval' is an array, all elements must be numbers. Current: [${retryInterval.join(', ')}].`)
										if (retryInterval[0] > retryInterval[1])
											throw new Error(`Wrong argument exception. When 'options.retryInterval' is an array, the first element must be strictly greater than the second. Current: [${retryInterval.join(', ')}].`)

										return math.randomNumber(retryInterval[0], retryInterval[1])
									})()
									: (explicitRetryInterval || retryInterval)

								return delay(i).then(() => failureFn 
									? retry(fn, successFn, failureFn, merge(options, { startTime }))
									: retry(fn, successFn, merge(options, { startTime })))
							} else
								throw new Error('timeout')
						} else if (attemptsCount < retryAttempts)
							return delay(retryInterval).then(() => failureFn
								? retry(fn, successFn, failureFn, merge(options, { attemptsCount:attemptsCount+1 }))
								: retry(fn, successFn, merge(options, { attemptsCount:attemptsCount+1 })))
						else if (options.ignoreError)
							return data
						else 
							throw new Error(options.errorMsg ? options.errorMsg : `${retryAttempts} attempts to retry the procedure failed to pass the test`)
					} else 
						throw error
				}))
	})


module.exports = {
	delay,
	wait,
	retry,
	makePromiseQueryable,
	addTimeout
}