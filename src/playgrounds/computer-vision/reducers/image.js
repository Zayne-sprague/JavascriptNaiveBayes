import u from 'updeep';

export function create_image(image_id){
    return {
        type: "CREATE_IMAGE",
        image: {image_id: image_id, loaded:false}
    }
}

export function loaded_image(image_id){
    return {
        type: "LOADED_IMAGE",
        image_id: image_id
    }
}

export function set_kernel(image_id, kernel){
    return {
        type: "SET_KERNEL",
        kernel: kernel,
        image_id
    }
}

const bow_init = {
    images:{}
};

const reducers = {
    CREATE_IMAGE: (state, action) => {
        return u({images: {[action.image.image_id]: action.image}}, state);
    },
    LOADED_IMAGE: (state, action) => {
        return u({images: {[action.image_id]: {loaded: true}}}, state);
    },
    SET_KERNEL: (state, action) => {
        return u({images: {[action.image_id]: {kernel: action.kernel}}}, state);
    }
}

export default function image(state = bow_init, action){
    if (action.type in reducers){
        const next_state = reducers[action.type](state, action);
        return next_state
    }

    return state
}
