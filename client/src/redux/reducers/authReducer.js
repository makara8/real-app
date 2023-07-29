import { GLOBALTYPES } from "../actions/globalTypes"

const intialState = {}

const authReducer = (state = intialState,action) => {
 switch (action.type) {
    case GLOBALTYPES.AUTH:
        return action.payload
    default: return state
 }
}

export default authReducer