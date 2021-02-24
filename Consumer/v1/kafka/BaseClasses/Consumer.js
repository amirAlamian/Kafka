const { Kafka } = require('kafkajs');


class BaseConsumer {
    defaultConsumerOption = {
        autoCommit: true, // default true
        autoCommitThreshold: 3,
        partitionsConsumedConcurrently: 1, // commit each message after read it
        groupId: 'KAFKA_DEFAULT_GROUP',
        fromBeginning: true,
        partitionAssigners: [ 'range' ],
        allowAutoTopicCreation: false,
    }

    constructor (kafkaHost, logger) {
        this.logger = logger;
        this.kafka = new Kafka({
            clientId: 'Products',
            brokers: [ kafkaHost ],

        });
        this.consumers = [];
    }

    async start () {
        this.consumers.forEach(consumer => {
            consumer.run({
                ...this.defaultConsumerOption,
                eachMessage: async ({ topic, partition, message }) => {
                    this.messageHandler(message, topic, partition, consumer);
                },
            });
        });
    }

    messageHandler = () => {
        console.log('replace it with your own functionality');
    }
    createConsumers = (
        consumerCount,
        topic,
        options = this.defaultConsumerOption,
    ) => {
        if (typeof consumerCount !== 'number') {
            throw new Error('consumer count must be a number');
        }

        const { groupId, fromBeginning, ...restOptions } = options; // fromBeginning = true means that the consumer reads data from the last committed offset
        this.defaultConsumerOption = restOptions;

        for (let i = 0; i < consumerCount; i++) {
            const consumer = this.kafka.consumer({ groupId });
            consumer.connect();
            consumer.subscribe({ topic, fromBeginning });
            this.consumers.push(consumer);
        }
    }
    // messages can be one message

    commit = (consumer, topic, partition, offset) => {
        return consumer.commitOffsets([
            { topic, partition, offset },
        ]);
    }
    moveOffset = (consumer, topic, partition, offset) => {
        consumer.seek({ topic, partition, offset });
    }
    refreshOffset = (consumer, topic, partition, offset) => {
        consumer.setOffset(topic, partition, offset);
    }

    pause = (consumer, topic) => {
        consumer.pause([ { topic } ]);
    }
    resume = (consumer, topic) => {
        consumer.resume([ { topic } ]);
    }
}

module.exports = BaseConsumer;
