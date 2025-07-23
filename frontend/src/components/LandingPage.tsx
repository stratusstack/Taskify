
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Clock, BarChart3, ArrowRight, User, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  // Get today's date to select a quote
  const today = new Date().getDate();
  
  const motivatingQuotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The way to get started is to quit talking and begin doing.",
    "Innovation distinguishes between a leader and a follower.",
    "Your time is limited, don't waste it living someone else's life.",
    "If life were predictable it would cease to be life, and be without flavor.",
    "Life is what happens to you while you're busy making other plans.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
    "When you reach the end of your rope, tie a knot in it and hang on.",
    "Always remember that you are absolutely unique. Just like everyone else.",
    "Don't judge each day by the harvest you reap but by the seeds that you plant.",
    "The only impossible journey is the one you never begin.",
    "In this life we cannot do great things. We can only do small things with great love.",
    "Only a life lived for others is a life worthwhile.",
    "The purpose of our lives is to be happy.",
    "You will face many defeats in life, but never let yourself be defeated.",
    "Life is never fair, and perhaps it is a good thing for most of us that it is not.",
    "The only way to do great work is to love what you do.",
    "If you can dream it, you can achieve it.",
    "Everything you've ever wanted is on the other side of fear.",
    "Believe you can and you're halfway there.",
    "Act as if what you do makes a difference. It does.",
    "Success is not how high you have climbed, but how you make a positive difference to the world.",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    "Try to be a rainbow in someone's cloud.",
    "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    "Be yourself; everyone else is already taken.",
    "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    "Be the change that you wish to see in the world.",
    "A room without books is like a body without a soul.",
    "You only live once, but if you do it right, once is enough."
  ];

  const todaysQuote = motivatingQuotes[today - 1] || motivatingQuotes[0];

  const features = [
    {
      icon: <FolderOpen className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" />,
      title: "Project Management",
      description: "Organize your work into projects and manage tasks efficiently with our intuitive project-based approach.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop"
    },
    {
      icon: <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-green-600" />,
      title: "Time Tracking",
      description: "Track time spent on each task with precise timing features and generate detailed reports for better productivity.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop"
    },
    {
      icon: <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600" />,
      title: "Analytics & Reports",
      description: "Get insights into your productivity with comprehensive reports and visual analytics to optimize your workflow.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 sm:py-6">
        <nav className="flex justify-between items-center">
          <div className="text-xl sm:text-2xl font-bold text-gray-800">Taskify</div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/features">
              <Button variant="ghost" size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Features
              </Button>
            </Link>
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Welcome, {user?.name}
                </span>
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button className="gap-2 text-sm sm:text-base px-3 sm:px-4">
                    Projects
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="gap-2 text-sm sm:text-base px-3 sm:px-4">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 sm:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-800 mb-4 sm:mb-6">
          Taskify
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-12">
          Simple, modern task management
        </p>

        {/* Daily Quote */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <blockquote className="text-base sm:text-lg md:text-xl text-gray-700 italic leading-relaxed">
                "{todaysQuote}"
              </blockquote>
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">Daily Motivation - Day {today}</p>
            </CardContent>
          </Card>
        </div>

        {isAuthenticated ? (
          <Link to="/projects">
            <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 gap-2">
              Go to Projects
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 gap-2">
              Start Managing Tasks
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </Button>
          </Link>
        )}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
          Everything you need to stay productive
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="mx-auto mb-4">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-32 sm:h-48 object-cover rounded-lg mb-3 sm:mb-4"
                  />
                  {feature.icon}
                </div>
                <CardTitle className="text-lg sm:text-xl text-gray-800">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <CardDescription className="text-center text-gray-600 leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-8 sm:py-16 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
            Ready to boost your productivity?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
            Join thousands of users managing their tasks effectively with Taskify
          </p>
          {isAuthenticated ? (
            <Link to="/projects">
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 gap-2">
                Go to Projects
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 gap-2">
                Get Started Now
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 sm:py-8 text-center text-gray-600">
        <p className="text-sm sm:text-base">&copy; 2024 Taskify. Built with ❤️ for productivity enthusiasts.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
