var kclient = require("../src/kclient.js")
var client = kclient('192.168.56.10:2181')
var assert = require('assert')

var debug = require('debug')('kafka-client');

var uuid = require('uuid/v1');

var topic = 'testinstances';
var key = 'key';
var value ="value" // value is a string

//var group = uuid();//a new group id each time means we always read new messages which arrive
var group = "user@example.com"// groups can be users who are accessing the data

describe('Given a zookeeper and kafka server running',()=>{
	var result;
	before(async ()=>{
		await client.connect();
	})
	after(async ()=>{
		await client.disconnect();
	})

	describe('When multiple messages are produced',()=>{
		
		var offsets
		var consumeMessage;
		var latestOffset
		var batchsize=5
		before(async ()=> {
			await client.createTopic(topic);
			for(i=0;i<batchsize;i++){
				produced = await client.produceTopicKeyValue(key,value+i,topic);
			}
			offsets = await client.getOffset(topic);
			latestOffset = offsets[topic]['0'][0];
			initialOffset = offsets[topic]['0'][1];
			debug("Latest Offset",latestOffset)
			debug("Initial Offset",initialOffset)
		})
		describe('When a batch of messages is read',()=>{
			var result
			before(async()=>{
				consumeMessage = await client.batchConsume(group,topic,batchsize);
			})
			it('Then a batch is received',async function(){
				assert.ok(consumeMessage.length==batchsize)
				debug(consumeMessage)
			})
		})
	})
})
