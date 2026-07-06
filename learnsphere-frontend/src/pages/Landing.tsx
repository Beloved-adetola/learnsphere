
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, BookOpen, Users, Award, BarChart } from 'lucide-react';

const Landing: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard');
    } else {
      navigate('/signup');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-50 to-violet-50">
        <div className="quiz-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Create and take <span className="text-quiz-primary">effective quizzes</span> with ease
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-md">
                LearnSphere is your all-in-one platform for creating, managing, and taking quizzes in any field of knowledge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleGetStarted} className="group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/faq')}>
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative hidden md:block animate-fade-in">
              <div className="absolute inset-0 bg-quiz-primary/10 blur-3xl rounded-full"></div>
              <div className="relative bg-white rounded-xl shadow-xl overflow-hidden border">
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop" 
                  alt="Quiz interface" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-white">
        <div className="quiz-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose LearnSphere?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform is designed to make quiz creation and taking a seamless experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 border rounded-lg transition-all hover:shadow-md">
              <div className="p-3 rounded-full bg-quiz-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="text-quiz-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Quiz Creation</h3>
              <p className="text-gray-600">
                Intuitive interface allows you to create quizzes in minutes
              </p>
            </div>
            
            <div className="p-6 border rounded-lg transition-all hover:shadow-md">
              <div className="p-3 rounded-full bg-quiz-secondary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Users className="text-quiz-secondary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">For All Subjects</h3>
              <p className="text-gray-600">
                Create quizzes for any field, from programming to accounting
              </p>
            </div>
            
            <div className="p-6 border rounded-lg transition-all hover:shadow-md">
              <div className="p-3 rounded-full bg-quiz-accent/10 w-12 h-12 flex items-center justify-center mb-4">
                <Award className="text-quiz-accent h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Feedback</h3>
              <p className="text-gray-600">
                Get immediate results and see correct answers after submission
              </p>
            </div>
            
            <div className="p-6 border rounded-lg transition-all hover:shadow-md">
              <div className="p-3 rounded-full bg-quiz-danger/10 w-12 h-12 flex items-center justify-center mb-4">
                <BarChart className="text-quiz-danger h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Monitor performance and improvement over time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-gradient-to-r from-quiz-primary to-purple-600 text-white">
        <div className="quiz-container text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Join thousands of educators, trainers, and learners who are using LearnSphere to improve knowledge retention
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={handleGetStarted}
            className="bg-white text-quiz-primary hover:bg-gray-100"
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
