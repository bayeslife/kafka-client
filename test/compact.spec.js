var k2client = require("../src/k2client.js")
var assert = require('assert')

var debug = require('debug')('kafka-client');

var topic = 'testistic.projects';
var group = "user_example.com"// groups can be users who are accessing the data

describe('Given kafka server running',()=>{
	let client =null;
	var result
	before(async ()=>{
		client = k2client('192.168.56.10:9092');
	})
	it('Then client is created',async function(){
		assert.ok(client)
	})
	describe('When a offset is requested',()=>{
		before(async ()=> {
		})
		it('Then offset for a new topic is 0',async function(){
			result = await client.getOffset(topic);
			debug(result)
			assert.ok(result)
		})
	})
	describe.only('When selectAll messages',()=>{
		var result

		before(async()=>{
			consumeMessage = await client.selectAll2(group,topic);
		})
		it('Then all messages are read',async function(){
			debug(consumeMessage.length)
			assert.ok(consumeMessage.length>0)
		})
	})

})
