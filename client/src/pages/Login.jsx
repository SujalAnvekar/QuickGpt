import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [state, setState] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {axios,setToken}=useAppContext()

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url=state==="login"? 'api/user/login':'/api/user/register'

    try {
      const {data}=await axios.post(url,{name,email,password})
      if(data.success){
        setToken(data.token)
        localStorage.setItem('token',data.token)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }

    if (state === 'login') {
      console.log('Login:', { email, password });
    } else {
      console.log('Register:', { name, email, password });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-xl text-sm text-gray-500 border
      border-gray-200 p-8 py-12 w-80 sm:w-88"
    >
      <p className="text-2xl font-medium text-center">
        <span className="text-purple-700">User</span>{' '}
        {state === 'login' ? 'Login' : 'Register'}
      </p>

      {state === 'register' && (
        <div className="mt-4">
          <label className="block">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700"
          />
        </div>
      )}

      <div className="mt-4">
        <label className="block">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700"
        />
      </div>

      <div className="mt-4">
        <label className="block">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-200 rounded w-full p-2 mt-1 outline-purple-700"
        />
      </div>

      <p className="mt-4">
        {state === 'login'
          ? "Don't have an account?"
          : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() =>
            setState(state === 'login' ? 'register' : 'login')
          }
          className="text-indigo-500 cursor-pointer"
        >
          Click here
        </button>
      </p>

      <button
        type="submit"
        className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white w-full py-2 rounded-md mt-4 cursor-pointer"
      >
        {state === 'login' ? 'Login' : 'Register'}
      </button>
    </form>
  );
};

export default Login;