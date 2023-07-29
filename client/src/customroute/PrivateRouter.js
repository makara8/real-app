import { useSelector } from 'react-redux'
import { Route, Navigate} from 'react-router-dom'

const PrivateRouter = (props) => {
    const firstLogin = localStorage.getItem('firstLogin')
    const {auth} = useSelector(state => state)
    return firstLogin && auth?.user?.verified === true ? <Route {...props} /> : <Navigate to="/"   />
}

export default PrivateRouter