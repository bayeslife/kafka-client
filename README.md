# kafka-client
A javascript client for kafka

## Why the client

The purpose of this client was to get hands on experience with kafka.

## Getting started

[see Getting Started](./GettingStarted.md)


## Get a client
```
var client = await client.connect();
```

## View Topics
```
var topics = await client.getTopics();
```

## Creating a Topic
```
await client.createTopic(topic);
```

## Produce a simple message
```
await client.produce(key,value,topic);								
```

## Consuming a message
```
//Establish a message consumer for a group on a topic
var consumeMessage = await client.singleMessageConsumer(group,topic);

//Then wait for a message
var result = await consumeMessage();	
```
