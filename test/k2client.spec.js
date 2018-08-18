var k2client = require("../src/k2client.js")
var assert = require('assert')

var debug = require('debug')('kafka-client');

var uuid = require('uuid/v1');

describe('Given kafka server running',()=>{
	let client =null;
	var result
	before(async ()=>{
		client = k2client('192.168.56.10:9092');
	})
	after(function(){
	})
	it('Then client is created',async function(){
		assert.ok(client)
	})
	describe('When admin is created',()=>{
		var admin
		before(async ()=> {
			admin = client.getAdmin();
		})
		it('Then admin is created',async function(){
			assert.ok(admin)
		})
		describe('When groups are requested',()=>{
			var groups
			before(async ()=> {
				groups = await admin.getGroups()
			})
			it('Then groups are returned',async function(){
				debug(groups)
				assert.ok(groups)
			})
		})
	})
	describe('When a topics are requested repeatedly',()=>{
		var result;
		it('Then the topic is returned',async function(){
			result = await client.getTopics();
			debug(result)
			assert.ok(result)
		})
		it('Then the topic is returned again',async function(){
			result = await client.getTopics();
			debug(result)
			assert.ok(result)
		})
	}),
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
	}),
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
	describe('When multiple messages are produced',()=>{
		var topic = 'testinstances';
		var key = 'key';
		var value ="value" // value is a string
		var group = "user@example.com"// groups can be users who are accessing the data

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
				consumeMessage = await client.batchConsume(group,topic,batchsize);
			})
			it('Then a batch is received',async function(){
				assert.ok(consumeMessage.length==batchsize)
				debug(consumeMessage)
			})
		})
	})

})
