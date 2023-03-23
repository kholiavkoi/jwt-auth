import React from 'react'
import { useState } from "react";
import jwt_decode from 'jwt-decode'

import './App.css';
import axios from "axios";


function App() {
    const [user, setUser] = useState(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const [success, setSuccess] = useState(false)

    const refreshToken = async () => {
        try {
            const res = await axios.post('/refresh', { token: user.refreshToken })
            setUser({
                ...user,
                accessToken: res.data.accessToken,
                refreshToken: res.data.refreshToken
            })
            return res.data
        } catch (err) {
            console.log(err)
        }
    }

    const axiosJWT = axios.create()

    axiosJWT.interceptors.request.use(
        async (config) => {
            let currentDate = new Date();
            const decodedToken = jwt_decode(user.accessToken);
            if (decodedToken.exp * 1000 < currentDate.getTime()) {
                const data = await refreshToken();
                config.headers["authorization"] = "Bearer " + data.accessToken;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post('/login', { username, password })
            setUser(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    const handleDelete = async (id) => {
        setSuccess(false)
        setError(false)
        try {
            await axiosJWT.delete(`/users/${id}`, {
                headers: { authorization: `Bearer ${user.accessToken}` }
            })
            setSuccess(true)
        } catch (err) {
            setError(true)
        }
    }

    return (
        <div className="App">
            {user ?
                <div>
                    <p>Welcome to the <b>{user.isAdmin ? 'admin' : 'user'}</b> dashboard</p>
                    <p>Delete users:</p>
                    <button onClick={() => handleDelete(1)}>Delete Yarik</button>
                    <button onClick={() => handleDelete(2)}>Delete Jane</button>

                    {error && <div>You are not allowed to delete this user!</div>}
                    {success && <div>User has been deleted successfully</div>}
                </div>
                :
                <form onSubmit={handleSubmit}>
                    <input type="text" onChange={(e) => setUsername(e.target.value)} value={username}
                           placeholder='username' />
                    <input type="password" onChange={(e) => setPassword(e.target.value)} value={password}
                           placeholder='password' />
                    <button type='submit'>Login</button>
                </form>
            }

        </div>
    );
}

export default App;
