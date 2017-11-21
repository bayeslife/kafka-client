var kafka = require('kafka-node');
var ConsumerGroup = kafka.ConsumerGroup;
var HighLevelProducer = kafka.HighLevelProducer;
var Client = kafka.Client;

var debug = require('debug')('kafka-client')

const KClient = function(zookeeper) {
  var zk = zookeeper;
  var client = null;
  return {
    connect: async function(zookeeper){
        client = new Client(zk);
        await new Promise(function(res,rej){
          client.once('connect', function () {
            debug('connected');
            //res();
          });
          client.once('ready', function () {
            debug('ready');
            res();
          });
          client.on('error', function(error) {
            rej(error);
          });
      })
    },
    disconnect: function(){
      debug('disconnected')      
    },
    createTopic: async function(topic){
      return await new Promise(function(res,ref){
        client.createTopics(topic,function(error,results){
      		debug('CreatedTopic:'+results);
          res(results);
      	});
      })
    },
    getTopics: async function(){
       var result = await new Promise(function(res,rej){
        client.loadMetadataForTopics([], function (error, results) {
      	  if (error) {
      	  	console.log(error);
            rej();
      	  }else {
            res(results)
          }
        })
      })
      return result.map(function(node){
        return node['metadata'] ? Object.keys(node.metadata) : []
      }).reduce((a,b)=>a.concat(b),[])
    },
    produce: async function(key,value,topic){
      return await new Promise(function(res,rej){

        var producer = new HighLevelProducer(client);
                  
            var payload = [{
              key: key,
              topic: topic,
              messages: [value],
              attributes: 0 /* Use GZip compression for the payload */
            }];
            producer.send(payload, function(error, result) {
              debug('Sent payload to Kafka: ', payload);
              if (error) {
                console.error(error);
                rej(error)
              } else {                                
                res(true)
              }
            });
          });
    },  
    singleMessageConsumer: async function(groupid,topic){  
      return await new Promise(function(res,rej){
        
        var topics = [ topic ];
    
        var consumerOptions = {
          host: 'localhost:2181',
          autoCommit: true,
          groupId: groupid,
          sessionTimeout: 10000,
          protocol: ['roundrobin'],
          fromOffset: 'latest' // equivalent of auto.offset.reset valid values are 'none', 'latest', 'earliest'
        };        
        var msg = new Promise(function(rs,rj){
          var consumerGroup = new ConsumerGroup(Object.assign({id: 'consumer1'}, consumerOptions), topics);
          
          var consumeFn = async function(groupid,topic){  
            
            return await new Promise(function(res,rej){
              return res(msg);
            })
          }        
          consumerGroup.on('message', function(message) {            
            debug('consumed message')
            debug(message);
            consumerGroup.close(true,function(){
              rs(message);
            });                                    
          }); 
          consumerGroup.on('error', function(err) {
            console.error(err);          
            rj(err);
          });
          consumerGroup.on('connect', function(message) {
            debug('connect');            
            res(consumeFn);          
          })  
        })
      })           
    }
  }
}

module.exports=KClient
