const BaseProducer = require('src/infrastructure/messaging/v1/Kafka/BaseProducer/Producer');
const faker = require('faker');

class TestProducer extends BaseProducer {
    constructor ({ logger, SettingService }) {
        super(SettingService.getKafka.kafkaHost, logger);
        this.createProducer(1);
    }

    sendMessageToSMS = async () => {
        setInterval(() => {
            let data = Math.floor(Math.random() * 10000);
            data += ' : ' + faker.name.title();

            this.sendMessage(this.producers[0], 'SMS', [ {
                value: data,
                headers: { 'messageFrom': 'product Producer' },
            } ]);
        }, 20);
    }
}


module.exports = TestProducer;
