import u from 'updeep';

export function create_image(image_id){
    return {
        type: "CREATE_IMAGE",
        image: {image_id: image_id}
    }
}

const bow_init = {
    images:[]
};

const reducers = {
    CREATE_IMAGE: (state, action) => {
        return u({images: images => [...images, action.image]}, state);
    }
}

export default function image(state = bow_init, action){
    if (action.type in reducers){
        const next_state = reducers[action.type](state, action);
        return next_state
    }

    return state
}
