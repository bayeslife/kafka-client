var config = {
    kafkaService: process.env.KAFKASERVICE || '192.168.1.108:9092',
    zookeeperService: process.env.ZOOKEEPERSERVICE || '192.168.1.108:2181'
}

module.exports = config
