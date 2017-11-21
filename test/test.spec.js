var kclient = require("../kafkaclient.js")
var client = kclient('localhost:2181')
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
	describe('When topics are requested',()=>{
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

	describe('When a consumer is consuming messages and a message is produced',()=>{
		
		var topic = 'producertest';
		var key = 'key'+uuid();
		var value= 'value'+uuid();

		var group = uuid();//a new group means we always read new messages which arrive

		var consumeMessage;

		it('Then a message is received',async function(){			
			consumeMessage = await client.singleMessageConsumer(group,topic);			
			await client.produce(key,value,topic);								
			var result = await consumeMessage();			
			assert.equal(result.key,key)
			assert.equal(result.value,value)		
		})
	})
})
