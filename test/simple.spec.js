var kclient = require("../index.js")
var client = kclient('192.168.56.10:2181')
var assert = require('assert')

var debug = require('debug')('kafka-client');

var uuid = require('uuid/v1');

describe('Given a zookeeper and kafka server running',()=>{
	var result;
	before(async ()=>{
		await client.connect();
	})
	after(async ()=>{
		//await client.disconnect();
	})
	describe.only('When topics are requested',()=>{
		before(async ()=> {
			result = await client.getTopics();
		})
		it('Then topics are received',function(){
			debug(result)
			assert.ok(result.length >0)
		})
	})

	describe('When a topic is created',()=>{
		var topic = 'testtopic'+uuid();
		before(async ()=> {
			await client.createTopic(topic);
		})
		it('Then topics contain the topic created',async function(){
			result = await client.getTopics();
			debug(result)
			assert.ok(result.indexOf(topic)>-1)
		})
	})

	describe('When a offset is requested',()=>{
		var topic = 'testtopic'+uuid();
		before(async ()=> {
			await client.createTopic(topic);
		})
		it('Then offset for a new topic is 0',async function(){
			result = await client.getOffset(topic);
			debug(result)
			assert.ok(result)
		})
	})

	describe('When a consumer is consuming messages and a message is produced',()=>{
		var topic = 'producertest';
		var key = 'key';
		var value= 'value1';

		var group = uuid();//a new group means we always read new messages which arrive

		var consumeMessage;
		before(async ()=> {
			await client.createTopic(topic);
		})
		describe('When a single message is produced and read',()=>{
			var result
			before(async()=>{
				consumeMessage = await client.singleMessageConsumer(group,topic);
				await client.produceTopicKeyValue(key,value,topic);
				result = await consumeMessage();
			})
			it('Then a message is received',async function(){
				assert.equal(result.key,key)
				assert.equal(result.value,value)
			})
			describe('When offsets are requested',()=>{
				var offsets
				before(async ()=>{
					offsets = await client.getOffset(topic);
				})
				it('Then offset is 1',async function(){
					debug(offsets)
				})
			})
		})
	
	
	
	
	})

	describe.skip('When a keyless message is produced',()=>{
		var topic = 'producertestkeyless';
		var value= 'value1';

		var group = "user@example.com"

		var consumeMessage;
		before(async ()=> {
			await client.createTopic(topic);
		})
		describe('When a single message is produced and read',()=>{
			var result
			before(async()=>{
				for(var i=0;i<5;i++){
					console.log(i%3)
					await client.produceTopicValue(value,topic,i%3);
				}
			})
			describe('When offsets are requested',()=>{
				var offsets
				before(async ()=>{
					offsets = await client.getOffset(topic);
				})
				it('Then offset is 1',async function(){
					debug(offsets)
				})
			})
		})
	
	
	
	
	})

})
