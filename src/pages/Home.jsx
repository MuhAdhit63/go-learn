import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <section className="bg-white">
        <div className="max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-12">
          <div className="flex items-center">
            <img className='w-24 h-24' src="logo.png" alt="logo" />
          </div>
        </div>
        <div className="max-w-screen-xl px-4 py-8 mx-auto lg:pt-8">
          <div className="mx-auto lg:col-span-6">
            <h1 className="max-w-4xl text-center mb-4 text-3xl font-bold tracking-tight leading-none md:text-4xl xl:text-5xl mx-auto"><span className='bg-gradient-to-r from-blue-950 to-blue-300 bg-clip-text text-transparent'>GoLearn</span> – Your Smart Learning Partner</h1>
            <h1 className="max-w-4xl mx-auto text-center mb-4 text-2xl font-bold tracking-tight leading-none md:text-3xl xl:text-4xl">Learn Anywhere, Succeed Everywhere</h1>
            <p className="max-w-4xl text-center mx-auto mb-6 font-light text-black lg:mb-8 md:text-lg lg:text-xl">GoLearn is a smart and flexible e-learning platform that helps you learn anytime, anywhere. Access courses, track progress, and grow your skills - all in one app.</p>
            <Link to="/login" href="#" className="block w-1/2 mx-auto px-5 py-3 text-base font-medium text-center text-white border border-gray-300 rounded-lg bg-gradient-to-r from-blue-950 to-blue-300 hover:bg-blue-300 focus:ring-4 focus:ring-gray-100">
              Get Started
            </Link>
            {/* <Link to="/register">sementara</Link> */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;