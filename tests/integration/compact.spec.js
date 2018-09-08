var { kafkaclient, config } = require('../../index.js')
var assert = require('assert')

var debug = require('debug')('kafka-client')

var topic = 'testistic.projects'
var group = 'user_example.com'// groups can be users who are accessing the data

describe('Given kafka server running', () => {
	let consumerclient = null
	var result
	before(async () => {
		consumerclient = kafkaclient(config.kafkaService)
	})
	it('Then client is created', async function () {
		assert.ok(consumerclient)
	})
	describe('When a offset is requested', () => {
		before(async () => {
		})
		it('Then offset for a new topic is 0', async function () {
			result = await consumerclient.getOffset(topic)
			debug(result)
			assert.ok(result)
		})
	})
	describe('When selectAll messages', () => {
		var result
		var consumeMessage
		before(async () => {
			consumeMessage = await consumerclient.groupSelectAll(group, topic)
		})
		it('Then all messages are read', async function () {
			debug(consumeMessage.length)
			assert.ok(consumeMessage.length > 0)
		})
	})
})
