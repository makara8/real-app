import { GLOBALTYPES } from "../actions/globalTypes"

const intialState = false

const themeReducer = (state = intialState,action) => {
 switch (action.type) {
    case GLOBALTYPES.THEME:
        return action.payload
    default: return state
 }
}

export default themeReducer