import { GLOBALTYPES } from '../actions/globalTypes'


const voiceReducer = (state = false, action) => {
    switch (action.type){
        case GLOBALTYPES.VOICE:
            return action.payload;
        default:
            return state;
    }
}


export default voiceReducer