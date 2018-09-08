var { kafkaclient, config } = require('../../index.js')
var assert = require('assert')

var debug = require('debug')('kafka-client')

var uuid = require('uuid')

var topic = 'testistic.testruns'
var group = uuid()// groups can be users who are accessing the data

describe('Given kafka server running', function () {
	this.timeout(60000)
	let consumerclient = null
	let producerclient = null

	var result
	before(async () => {
		consumerclient = kafkaclient(config.kafkaService)
		producerclient = kafkaclient(config.kafkaService)
	})
	after(async () => {
		// console.log(consumerclient)
		// consumerclient.disconnect()
		// producerclient.disconnect()
	})
	it('Then client is created', async function () {
		assert.ok(consumerclient)
		assert.ok(producerclient)
	})
	describe('When a messagehandlier is created', () => {
		var themessage = null
		var subscriber
		var messagehandled

		var messagehandler = function (message) {
			themessage = message
		}
		before(async () => {
			subscriber = await consumerclient.createSubscriberGroup(group, topic, messagehandler, 'latest')
		})
		after(() => {
			subscriber.close()
		})
		it('Then subscriber is created', async function () {
			assert.ok(subscriber)
		})
		describe('And when a message is produced', () => {
			before(async () => {
				await producerclient.produceTopicKeyValue('key', 'value', topic)
			})

			it('Then a message was handled', function () {
				assert.ok(themessage)
			})
		})
	})
})
