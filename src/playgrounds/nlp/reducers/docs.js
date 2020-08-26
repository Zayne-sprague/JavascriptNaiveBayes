import u from 'updeep';
import { csv } from 'd3-request';
// import _ from 'lodash';

export function set_docs(docs){
    return {
        type: "SET_DOCS",
        docs: docs
    }
}

export function append_doc(doc){
    return {
        type: "APPEND_DOC",
        doc: doc
    }
}

export function fetch_data(file, callback) {
    return (dispatch, getState) => {
        return csv(`./data/${file}.csv`, (error, _data) => {
            if (error) {
                return {type: "ERROR"}
            }

            const data = _data.map(d => ({label: d['v1'], data: d['v2']}))

            if(callback){
                dispatch(callback(data));
            }

            return dispatch({
                type: "FETCHED_DATASET",
                data: data, /* TODO make this independent of the file */
                name: file
            })
        })
    }
}


const docs_init = {
    docs: []
};

const reducers = {
    SET_DOCS: (state, action) => {
        return u({docs: u.constant(action.docs)}, state);
    },
    APPEND_DOC: (state, action) => {
        return u({docs: docs => [...docs, action.doc]}, state);
    },
    FETCHED_DATASET: (state, action) => {
        return u({datasets: {[action.name]: action.data}}, state);
    }
}

export default function docs(state = docs_init, action){
    if (action.type in reducers){
        const next_state = reducers[action.type](state, action);
        return next_state
    }

    return state
}
