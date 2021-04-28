const kafka = require('kafka-node');

class KafkaAdmin {
    kafkaHost;
    autoConnect;
    constructor ({ SettingRepository }) {
        this.SettingRepository = SettingRepository;
        this.settingMessagingGroup = 'messaging';
        this.settingTopicsGroup = 'topics';
        this.kafkaHostKey = 'KAFKA_HOST';
        this.autoConnectKey = 'KAFKA_AUTO_CONNECT';
        this.messagingGroupKey = 'messaging';
    }

    /* -------------------------------------------------------------------------- */
    /*                             add just one topic                             */
    /* -------------------------------------------------------------------------- */
    #addTopic = async (topics) => {
        // console.log();
        const client = new kafka.KafkaClient({
            kafkaHost: this.kafkaHost.value,
            autoConnect: this.autoConnect.value,
        });
        const admin = new kafka.Admin(client);
        // admin.listGroups((err, res) => {
        //     console.log('consumerGroups', res);
        // });


        const createdTopics = await new Promise((resolve, reject) => {
            admin.listTopics((err, res) => {
                if (err) reject(err);
                resolve(Reflect.ownKeys(res[1].metadata));
            });
        });
        return await new Promise((resolve, reject) => {
            const topicsToCreate = [];

            topics.forEach(topic => {
                if (!createdTopics.includes(topic.value)) {
                    topicsToCreate.push(
                        {
                            topic: topic.value,
                            partitions: 3,
                            replicationFactor: 2,
                        },
                    );
                }
            });

            if (topicsToCreate.length) {
                admin.createTopics(topicsToCreate, (err, res) => {
                    if (err) {
                        reject(err);
                    }

                    resolve(res);
                });
            }
        });
    };

    async topicsInit () {
        const group = await this.SettingRepository.getSettingByGroup(
            this.messagingGroupKey,
        );

        const topics = await this.SettingRepository.getSettingByGroup(
            this.settingTopicsGroup,
        );
        this.kafkaHost = group.find((value) => {
            return value.key === this.kafkaHostKey;
        });
        this.autoConnect = group.find((value) => {
            return value.key === this.autoConnectKey;
        });

        await this.#addTopic(topics);
    }
}

module.exports = KafkaAdmin;
