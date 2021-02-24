const BaseConsumer = require('src/interface/messaging/v1/kafka/BaseClasses/Consumer');


class TestConsumer extends BaseConsumer {
    constructor ({ logger, SettingService }) {
        super(SettingService.getKafka.kafkaHost, logger);
        this.createConsumers(3, 'SMS', {
            groupId: 'test',
            autoCommit: false,
            fromBeginning: true,
        });
    }

    messageHandler = (message, topic, partition, consumer) => {
        console.log('messages', message.value.toString());
        this.commit(consumer, topic, partition, ++message.batchContext.firstOffset);
    }
}


module.exports = TestConsumer;
