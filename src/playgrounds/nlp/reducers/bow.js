import u from 'updeep';
import _ from 'lodash';

export function create_model(name){
    return {
        type: "CREATE_BOW_MODEL",
        name: name
    }
}

export function create_model_vocab(name, docs){
    let vocab = {}
    let index = 0;

    _.map(docs,(doc)=>{
        _.map(_.split(_.get(doc, 'data'), ' '), (word)=>{
            if (_.get(vocab, word) === undefined){
                vocab[word] = index;
                index++;
            }
        })
    })

    return {
        type: "CREATE_MODEL_VOCAB",
        name, vocab
    }
}

export function create_label_array(name, docs){
    let labels = Array(_.size(docs)).fill(0)

    _.map(docs, (doc, i)=>{
       labels[i] = doc['label'] === 'ham' ? 0 : 1
    })

    return {
        type: "CREATE_LABEL_ARRAY",
        labels: labels,
        name: name
    }
}

export function create_bow_matrix(name, docs, vocab){
    const zero_vector = Array(_.size(_.keys(vocab)) + 1).fill(0);
    let matrix = Array(_.size(docs)).fill(0);

    _.map(docs, (doc, i)=>{
        let doc_vector = _.clone(zero_vector);

        doc_vector[0] = _.get(doc, 'label') === 'ham' ? 0 : 1
        _.map(_.split(_.get(doc, 'data'), ' '), (word)=>{
            doc_vector[vocab[word] + 1] += 1;
        })

        matrix[i] = doc_vector
    })

    return {
        type: "CREATE_BOW_MATRIX",
        name: name,
        //matrix: tf.tensor(matrix, [_.size(docs), _.size(_.keys(vocab)) + 1], 'int32')
        matrix: matrix
    }
}

const bow_init = {
    models: {}
};

const reducers = {
    CREATE_BOW_MODEL: (state, action) => {
        return u({models: {[action.name]: u.constant({})}}, state);
    },
    CREATE_MODEL_VOCAB: (state, action) => {
        return u({models: {[action.name]: {vocab: u.constant(action.vocab)}}}, state);
    },
    CREATE_BOW_MATRIX: (state, action) => {
        return u({models: {[action.name]: {bow_matrix: u.constant(action.matrix)}}}, state);
    },
    CREATE_LABEL_ARRAY: (state, action) => {
        return u({models: {[action.name]: {labels: u.constant(action.labels)}}}, state);
    }
}

export default function bow(state = bow_init, action){
    if (action.type in reducers){
        const next_state = reducers[action.type](state, action);
        return next_state
    }

    return state
}
