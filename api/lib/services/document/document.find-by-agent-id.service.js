import {
    MODEL_DOCUMENT,
    SORT_DESC
} from '../../../util/constants';
import ESErrorHandler from '../../errors/es.error-handler';

module.exports = async function ({ agentId, direction = SORT_DESC, skip = 0, limit = 50 }) {

    const { es } = this.server.app;
    const DocumentModel = es.models[MODEL_DOCUMENT];
    try {
        const results = await DocumentModel.search({
            body: {
                'from': skip,
                'size': limit,
                'sort': [
                    {
                        'time_stamp': {
                            'order': direction.toLowerCase()
                        }
                    }
                ],
                'query': {
                    'match': {
                        'agent_id': agentId
                    }
                }
            }
        });
        const count = await DocumentModel.count();
        if (results.hits.total === 0) {
            return { data: [], totalCount: count };
        }
        const data = results.hits.hits.map((result) => ({ id: result._id, ...result._source }));
        return { data, totalCount: count };
    }
    catch (error) {
        throw ESErrorHandler({ error });
    }
};
