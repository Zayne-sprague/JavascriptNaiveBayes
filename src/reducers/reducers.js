import { combineReducers } from 'redux'
import docs from './docs'
import bow from './bow'
import naivebayes from "./naivebayes";
import u from 'updeep';
// import _ from 'lodash';

export function set_control(updates){
    return {
        type: "SET_CONTROL",
        updates: updates
    }
}

const controls_init = {};
const reducers = {
    SET_CONTROL: (state, action) => {
        return u(action.updates, state);
    },
    RESET_CONTROLS: (state, action) => {
        return u.constant(controls_init);
    }
}

function controls(state = controls_init, action){
    if (action.type in reducers){
        const next_state = reducers[action.type](state, action);
        return next_state
    }

    return state
}

export default combineReducers({
    controls,
    docs,
    bow,
    naivebayes
})
