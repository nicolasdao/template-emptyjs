/**
 * Copyright (c) 2018, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const fetch = require('node-fetch')

const _processResponse = (res, options={}) => (!options.format || options.format == 'json' ? res.json() : res.text())
	.then(data => ({ status: res.status, data }))
	.catch(() => ({ status: 200, data: res }))

const postData = (url, headers={}, body, options={}) => 
	fetch(url, { method: 'POST', headers, body }).then(res => _processResponse(res, options))

const getData = (url, headers={}, options={}) => 
	fetch(url, { method: 'GET', headers }).then(res => _processResponse(res, options))

const deleteData = (url, headers={}, body, options={}) => 
	fetch(url, { method: 'DELETE', headers, body }).then(res => _processResponse(res, options))

const putData = (url, headers={}, body, options={}) => 
	fetch(url, { method: 'PUT', headers, body }).then(res => _processResponse(res, options))

module.exports = {
	'get': getData,
	post: postData,
	put: putData,
	delete: deleteData
}
