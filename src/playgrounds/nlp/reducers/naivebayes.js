import u from 'updeep';
import _ from 'lodash';


export function create_nb_model(name){
    return {
        type: "CREATE_NB_MODEL",
        name: name
    }
}

export function calculate_biases(name, labels){
    let n = _.size(labels);
    let raw_counts = {};

    _.map(labels, (l)=>{
       if (!_.get(raw_counts, l)){
           raw_counts[l] = 0;
       }
        raw_counts[l] += 1
    })

    let biases = {};

    _.map(_.keys(raw_counts), (ct)=>{
        biases[ct] = raw_counts[ct] / n
    })

    return {
        type: "CALCULATE_BIASES",
        name,
        biases
    }
}

export function build_feature_vectors(name, bow_model, biases){
    let feature_vectors = Array(_.size(biases));
    _.map(_.keys(biases), (label, i)=>{
      let label_feature_vector = Array(_.size(bow_model[0])).fill(0);
      label_feature_vector[0] = Math.log(1 + biases[label]);
      let n = 0;
      _.map(bow_model, (row)=>{
          if (row[0] === parseInt(label)){
              _.map(row, (i, j)=>{
                  if (j !== 0){
                      label_feature_vector[j] += row[j];
                  }
              })
              n += 1;

          }
      })

      _.map(label_feature_vector, (tmp, i)=>{
          if (i !== 0){
              label_feature_vector[i] = Math.log(1 + (label_feature_vector[i] / n));
          }
      })

      feature_vectors[i] = label_feature_vector;
    })

    return {
        type: "BUILD_FEATURE_VECTORS",
        feature_vectors: feature_vectors,
        name: name
    }
}

export function test_new_doc(doc, vocab, features){
    let doc_vector = {}

    _.map(_.split(doc, ' '), (word)=>{
        if (!_.get(vocab, word)){
            return;
        }
        if (!_.get(doc_vector, [vocab[word]])){
            doc_vector[vocab[word]] = 0;
        }
        doc_vector[vocab[word]] += 1;
    })

    let predicted_label = 0;
    let max_score = 0;
    _.map(_.keys(features), (label)=>{
        let score = 0//features[label][0];
        _.map(_.keys(doc_vector), (key)=>{
            if (features[label][key] !== 0){
                score += features[label][key] * doc_vector[key]
            }
        })

        if (score > max_score){
            predicted_label = label;
            max_score = score;
        }
    })

    return predicted_label
}

const nb_init = {
    models: {}
};

const reducers = {
    CREATE_NB_MODEL: (state, action) => {
        return u({models: {[action.name]: u.constant({})}}, state);
    },
    CALCULATE_BIASES: (state, action) => {
        return u({models: {[action.name]: {biases: u.constant(action.biases)}}}, state);
    },
    BUILD_FEATURE_VECTORS: (state, action) => {
        return u({models: {[action.name]: {feature_vectors: u.constant(action.feature_vectors)}}}, state);
    },
}

export default function naivebayes(state = nb_init, action){
    if (action.type in reducers){
        const next_state = reducers[action.type](state, action);
        return next_state
    }

    return state
}
