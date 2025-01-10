import React from 'react';
import "../CSS/login.css";

function Login() {
    return (
        <div className='login-wrapper'>
            <h1>Login component</h1>
            <form>
                <label for='fname'>Username:</label><br></br>
                <input type='text' name='fname'></input><br></br>
                <label for='pword'>Password:</label><br></br>
                <input type='text' name='pword'></input>
            </form>
        </div>
    )
}

export default Login