var config = {
    kafkaService: process.env.KAFKASERVICE || "192.168.56.10:9092",
    zookeeperService: process.env.ZOOKEEPERSERVICE || "192.168.56.10:2181"
}

module.exports=config