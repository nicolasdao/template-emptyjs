/**
 * Copyright (c) 2017-2019, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { assert } = require('chai')
const { url, obj:{ merge, mirror, set:setProperty} } = require('../src/utils')

describe('utils', () => {
	describe('#url.getInfo', () => {
		it('Should deconstruct any URI', () => {
			const uri_01 = url.getInfo('https://neap.co')
			assert.equal(uri_01.host, 'neap.co', '01')
			assert.equal(uri_01.protocol, 'https:', '02')
			assert.equal(uri_01.origin, 'https://neap.co', '03')
			assert.equal(uri_01.pathname, '/', '04')
			assert.equal(uri_01.querystring, '', '05')
			assert.equal(Object.keys(uri_01.query).length, 0, '06')
			assert.equal(uri_01.hash, '', '07')
			assert.equal(uri_01.ext, '', '08')
			assert.equal(uri_01.uri, 'https://neap.co', '09')
			assert.equal(uri_01.shorturi, 'https://neap.co', '10')
			assert.equal(uri_01.pathnameonly, '/', '11')
			assert.equal(uri_01.contentType, 'application/octet-stream', '12')

			const uri_02 = url.getInfo(`https://www.linkedin.com/search/results/people/index.js?facetGeoRegion=%5B%22au%3A0%22%5D&origin=FACETED_SEARCH&title=${encodeURIComponent('director of marketing')}#hello`)
			assert.equal(uri_02.host, 'www.linkedin.com', '13')
			assert.equal(uri_02.protocol, 'https:', '14')
			assert.equal(uri_02.origin, 'https://www.linkedin.com', '15')
			assert.equal(uri_02.pathname, '/search/results/people/index.js', '16')
			assert.equal(uri_02.querystring, '?facetGeoRegion=%5B%22au%3A0%22%5D&origin=FACETED_SEARCH&title=director%20of%20marketing', '17')
			assert.equal(Object.keys(uri_02.query).length, 3, '18')
			assert.equal(uri_02.query.facetGeoRegion, '["au:0"]', '19')
			assert.equal(uri_02.query.origin, 'FACETED_SEARCH', '20')
			assert.equal(uri_02.query.title, 'director of marketing', '21')
			assert.equal(uri_02.hash, '#hello', '22')
			assert.equal(uri_02.ext, '.js', '23')
			assert.equal(uri_02.uri, 'https://www.linkedin.com/search/results/people/index.js?facetGeoRegion=%5B%22au%3A0%22%5D&origin=FACETED_SEARCH&title=director%20of%20marketing#hello', '24')
			assert.equal(uri_02.shorturi, 'https://www.linkedin.com/search/results/people/index.js', '25')
			assert.equal(uri_02.pathnameonly, '/search/results/people', '26')
			assert.equal(uri_02.contentType, 'text/javascript', '27')
		})
		it('Should rebuild URI', () => {
			const uri_01 = url.getInfo(`https://www.linkedin.com/search/results/people/index.js?facetGeoRegion=%5B%22au%3A0%22%5D&origin=FACETED_SEARCH&title=${encodeURIComponent('director of marketing')}#hello`)
			const new_uri_01 = url.buildUrl(Object.assign(uri_01, { 
				host:'neap.co', 
				pathname: '/search/splash.js', 
				ext:'.html',
				query: Object.assign(uri_01.query, { title: 'founder & director', age:37 })
			}))
			const new_uri_02 = url.buildUrl({
				'host': 'localhost:3520',
				'protocol': 'http:',
				'origin': 'http://localhost:3520',
				'pathname': '/auth',
				'querystring': '?test=hello',
				'query': {
					'test': 'hello',
					'error_msg': 'The default OAuth succeeded, but HTTP GET to \'userPortal.api\' http://localhost:3520/user/in failed. Details: Invalid username or password.',
					'error_code': 400
				},
				'hash': '',
				'ext': '',
				'uri': 'http://localhost:3520/auth?test=hello',
				'shorturi': 'http://localhost:3520/auth',
				'pathnameonly': '/auth',
				'contentType': 'application/octet-stream'
			})
			
			assert.equal(new_uri_01, 'https://neap.co/search/splash.html?facetGeoRegion=%5B%22au%3A0%22%5D&origin=FACETED_SEARCH&title=founder%20%26%20director&age=37#hello', '01')
			assert.equal(new_uri_02, 'http://localhost:3520/auth?test=hello&error_msg=The%20default%20OAuth%20succeeded%2C%20but%20HTTP%20GET%20to%20\'userPortal.api\'%20http%3A%2F%2Flocalhost%3A3520%2Fuser%2Fin%20failed.%20Details%3A%20Invalid%20username%20or%20password.&error_code=400', '02')
		})
	})
	describe('#obj.merge', () => {
		it('01 - Should merge objects', () => {
			const o1 = {
				project: {
					name: 'P1',
					updated: 'Tuesday'
				}
			}
			const o2 = {
				id: 1,
				project: {
					description: 'Cool cool',
					updated: 'Wednesday'
				}
			}

			assert.deepEqual(merge(o1,o2), { id:1, project:{ name:'P1', updated:'Wednesday', description:'Cool cool'} })
		})
		it('02 - Should support nullifying certain propertiess', () => {
			const o1 = {
				project: {
					name: 'P1',
					updated: 'Tuesday'
				}
			}
			const o2 = {
				id: 1,
				project: {
					description: 'Cool cool',
					updated: null
				}
			}

			assert.deepEqual(merge(o1,o2), { id:1, project:{ name:'P1', updated:null, description:'Cool cool'} })
		})
	})
	describe('#obj.mirror', () => {
		it('Should mirror an object properties', () => {
			const o1 = {
				project: {
					name: 'P1',
					updated: 'Tuesday'
				}
			}
			const o2 = {
				id: 1,
				project: {
					description: 'Cool cool',
					updated: 'Wednesday'
				}
			}

			assert.deepEqual(mirror(o1,o2), { id:1, project:{ updated:'Tuesday', description:'Cool cool'} })
			assert.deepEqual(mirror(o2,o1), { project:{ name: 'P1', updated:'Wednesday'} })
		})
	})
	describe('#obj.set', () => {
		it('Should set a specific object\'s property value/', () => {
			const o = setProperty(setProperty({ name:'Nic' }, 'company.name', 'Neap Pty Ltd'), 'age', 38)

			assert.equal(o.name, 'Nic', '01')
			assert.equal(o.company.name, 'Neap Pty Ltd', '02')
			assert.equal(o.age, 38, '03')
		})
	})
})









