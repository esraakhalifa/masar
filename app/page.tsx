import Layout from '../components/Layout';

export default function HomePage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to CareerPath
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your AI-powered career development platform. Get personalized career roadmaps and guidance.
          </p>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">CV Analysis</h3>
            <p className="text-gray-600">
              Upload your CV and get instant feedback on your skills and experience.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Roadmap</h3>
            <p className="text-gray-600">
              Get a personalized roadmap to achieve your career goals.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Guidance</h3>
            <p className="text-gray-600">
              Connect with industry experts for personalized career advice.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
