import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await login({ email, password });
      if (error) throw error;
      navigate('/dashboard'); // Arahkan ke dashboard setelah login berhasil
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => { // <-- TAMBAHAN
    setIsPasswordVisible(prevState => !prevState);
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-950 to-blue-300">
      <div id="defaultModal" tabindex="-1" className="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
        <div className="relative p-4 w-full max-w-lg h-full md:h-auto">
          <div className="relative p-8 bg-white rounded-full shadow border border-cyan-300">
            <div className="flex pb-4 mb-4 rounded-t sm:mb-5 items-center gap-32">
              <Link to='/' className="text-3xl mx-auto text-gray-500 text-center justify-center">
                Login
              </Link>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <div className="gap-4 mb-4 w-full">
                <div className='mb-4'>
                  <label for="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                  <input type="text" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Type your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label for="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                  <div className="flex">

                    <input type={isPasswordVisible ? 'text' : 'password'} name="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Type your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <div className="p-2 bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg">
                      <button
                        type="button" // 'type="button"' agar tidak men-submit form
                        onClick={togglePasswordVisibility}
                      >
                        {isPasswordVisible ? '😑' : '😐'}
                      </button>
                    </div>
                  </div>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
              </div>
              <button type="submit" className="text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-1/2" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}

              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    // <div>
    //   <h2>Login</h2>
    //   <form onSubmit={handleSubmit}>
    //     <div>
    //       <label>Email:</label>
    //       <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
    //     </div>
    //     <div>
    //       <label>Password:</label>
    //       <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
    //     </div>
    //     {error && <p style={{ color: 'red' }}>{error}</p>}
    //     <button type="submit" disabled={loading}>
    //       {loading ? 'Logging in...' : 'Login'}
    //     </button>
    //   </form>
    //   <p>
    //     Don't have an account? <Link to="/register">Register here</Link>
    //   </p>
    // </div>
  );
};

export default Login;