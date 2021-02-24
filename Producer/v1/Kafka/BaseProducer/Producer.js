const {
    Kafka,
    CompressionTypes,
    CompressionCodecs,
} = require('kafkajs');
const SnappyCodec = require('kafkajs-snappy');

class Producer {
    producerConfig = {
        acks: -1, // all
        compression: CompressionTypes.Snappy,
    }
    constructor (kafkaHost, logger) {
        this.logger = logger;
        this.kafka = new Kafka({
            clientId: 'Products',
            brokers: [ kafkaHost ],

        });
        this.producers = [];
        CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;
    }


    async start () {
        await this.producers.forEach(producer => {
            producer.connect();
        });
    }
    createProducer = async (producerCount) => {
        for (let i = 0; i < producerCount; i++) {
            const producer = this.kafka.producer();

            this.producers.push(producer);
        }
    }
    /*
        By default, the producer is configured to distribute the messages with the following logic:

        If a partition is specified in the message, use it
        If no partition is specified but a key is present choose a partition based on a hash (murmur2) of the key
        If no partition or key is present choose a partition in a round-robin fashion
    */
    async sendMessage (
        producer,
        topic,
        messages, // {value: 'hello world' , partition: 1, header: "#" , key: "partition key" }
        acks = this.producerConfig.acks,
    ) {
        await producer.send({
            topic,
            messages,
            acks,
            compression: this.producerConfig.compression,
        });
    }


    sendMessageToMultipleTopic = async (producer, messages) => {
        producer.sendBatch({ messages });
    }
}


module.exports = Producer;
