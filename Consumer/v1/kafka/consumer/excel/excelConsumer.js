const BaseConsumer = require('src/interface/messaging/v1/kafka/BaseClasses/Consumer');

class excelConsumer extends BaseConsumer {
    constructor ({ logger, SettingService, FileService, ProductFileRepository }) {
        super(SettingService.getKafka.kafkaHost, logger, FileService);
        this.ProductFileRepository = ProductFileRepository;
        this.FileService = FileService;
        this.createConsumers(1, [ { topic: 'BUCKET_EVENTS' } ]);
    }

    messageHandler = async (message) => {
        const filterPrefix = message.key.split('/');
        const eventTime = (JSON.parse(message.value)).Records[0].eventTime;
        message = filterPrefix.splice(1, filterPrefix.length - 2);
        const key = filterPrefix[filterPrefix.length - 1];

        if (message.join('/') === 'product-files') {
            await this.ProductFileRepository.update(
                { fileName: key.replace('.xlsx', '') },
                { uploadedAt: eventTime },
                this.locale,
            ).then(() => {
                this.commit(this.consumers[0]);
            });
        }
    };
}

module.exports = excelConsumer;
