import { GLOBALTYPES } from "../actions/globalTypes"

const intialState = {}

const alertReducer = (state = intialState,action) => {
 switch (action.type) {
    case GLOBALTYPES.ALERT:
        return action.payload
    default: return state
 }
}

export default alertReducer