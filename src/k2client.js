var kafka = require('kafka-node');
var ConsumerGroup = kafka.ConsumerGroup;
var HighLevelProducer = kafka.HighLevelProducer;

var Consumer = kafka.Consumer

var debug = require('debug')('kafka-client')

const K2Client = function(kafkanodes) {
  var kfnodes = kafkanodes;

  return {
    // close: function() {
    //   debug('Closing KafkaClient')
    //   client.close()
    // },
    producePayload: async function(payload){
      return await new Promise(function(res,rej){
        var client = new kafka.KafkaClient({kafkaHost: kfnodes,autoConnect: true})
        var producer = new HighLevelProducer(client);
            producer.send(payload, function(error, result) {
              debug('Sent payload to Kafka: ', payload);
              if (error) {
                console.error(error);
                rej(error)
              } else {
                res(true)
              }
              client.close()
            });
          });
    },
    produceTopicValue: function(value,topic,partition=0){
      var payload = [{
        topic: topic,
        partition: partition,
        messages: [value],
        attributes: 0 /* Use GZip compression for the payload */
      }];
      return this.producePayload(payload)
    },
    produceTopicKeyValue: function(key,value,topic){
      var payload = [{
        key: key,
        topic: topic,
        messages: [value],
        attributes: 0 /* Use GZip compression for the payload */
      }];
      return this.producePayload(payload)
    },
    createTopic: async function(topic){
      var client = new kafka.KafkaClient({kafkaHost: kfnodes,autoConnect: true})
      return await new Promise(function(res,rej){
        debug("Creating topics:",topic)
        client.createTopics(topic,true,function(error,results){
      		debug('CreatedTopic:'+results);
          if(!error)
            res(results)
          else
            rej()
          client.close()
      	});
      })
    },
    getTopics: async function(){
      var client = new kafka.KafkaClient({kafkaHost: kfnodes,autoConnect: true})
      var result = await new Promise(function(res,rej){
       client.loadMetadataForTopics([], function (error, results) {
         if (error) {
           console.log(error);
           rej();
         }else {
           res(results)
         }
         client.close()
       })
     })
     return result.map(function(node){
       return node['metadata'] ? Object.keys(node.metadata) : []
     }).reduce((a,b)=>a.concat(b),[])
    },
    getOffset: async function(topic){
      var client = new kafka.KafkaClient({kafkaHost: kfnodes,autoConnect: true})
      debug("Get Offset:",topic)
      return await new Promise(function(res,rej){
        var offset = new kafka.Offset(client)
        offset.fetch([
          {
            topic,
            time: -1,//not sure why this gives us the latest offsets
            maxNum: 10
          },
        ],function(err,data){
          if(err){
            rej(err)
          } else if(data){
            res(data)
          }
          client.close()
        })
      })
    },
    batchConsume: async function(groupid,topic,batchsize){
      var client = new kafka.KafkaClient({kafkaHost: kfnodes,autoConnect: true})
      var topicOffsets = await this.getOffset(topic);
      var latestOffset = topicOffsets[topic]['0'][0];
      var targetOffset = latestOffset-batchsize>0 ? latestOffset-batchsize : 0;
      debug("Consuming from:",targetOffset," to offset:",latestOffset)
      return await new Promise(function(resp,rejt){
        var content=[]
        var options = {
          autoCommit: false,
          fetchMaxWaitMs: 1000,
          fetchMaxBytes: 10000,
          fromOffset: true
        };
        var consumer = new Consumer(client,[{
          topic: topic,
          partition: 0,
          offset: targetOffset
        }],options);
        consumer.on('done', function(message) {
          consumer.close(true,function(){
            client.close()
            resp(content);
          });
        })
        consumer.on('message', function(message) {
          if(message.key){
            debug('consumed message offset:',message.offset,'=>',message.value);
            content.push(JSON.parse(message.value))
          }
        });
      })
    },
    getAdmin: function(){
      var client = new kafka.KafkaClient({kafkaHost: kfnodes,autoConnect: true})
      const admin = new kafka.Admin(client);
      return {
        getGroups: async function() {
          return await new Promise(function(resp,rejt){
            admin.listGroups((err, res) => {
              if(err){
                rejt(err)
              }else {
                resp(res)
              }
              client.close()
            })
          })
        }
      }
    }
  }
}

module.exports=K2Client
