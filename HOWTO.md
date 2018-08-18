# Questions which to using this client

## How to request latest offset  minus X messages from a topic

It was easy to see how to query from the beginning or from the end of the queue.  By setting the ```fromOffset``` to 'earlest' or 'latest' in the options provided to the ConsumerGroup this was possible.

I was interested to be able to query the latest X messages in a topic queue.

This took quite a long time figure out.
There was a trick required to set the
```fromOffset: true```
option in creating the Consumer. Without this option setting the implementation did not respect setting a target offset.
```
var options = {
  ...,
  fromOffset: true
};
var consumer = new Consumer(client,[{
  topic: topic,
  partition: 0,
  offset: targetOffset
}],options);
```

## How to create a topic with multiple partitions

It seems this is only possible through the kafka shell commands
[see this](https://stackoverflow.com/questions/47139534/how-to-create-kafka-topic-with-partitions-in-nodejs)
