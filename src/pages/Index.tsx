import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Brain, Shield, TrendingUp, Users, Pill } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-2xl shadow-lg">
            <Activity className="h-16 w-16 text-white" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          MediPredict
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          AI-Driven Disease Risk Prediction & Personalized Drug Recommendations
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
            Get Started
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg px-8">
            Sign In
          </Button>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Comprehensive Healthcare Intelligence</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Risk Assessment</h3>
              <p className="text-muted-foreground">
                Advanced algorithms analyze your health data to predict disease risks with high accuracy
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-secondary transition-colors">
            <CardContent className="pt-6">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Pill className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Drug Recommendations</h3>
              <p className="text-muted-foreground">
                Receive personalized medication suggestions based on your unique health profile
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors">
            <CardContent className="pt-6">
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Doctor Collaboration</h3>
              <p className="text-muted-foreground">
                Healthcare providers can review and approve recommendations for better patient care
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-success transition-colors">
            <CardContent className="pt-6">
              <div className="bg-success/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Health Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your health metrics and track disease risk changes over time
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your health data is protected with enterprise-grade security and encryption
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-secondary transition-colors">
            <CardContent className="pt-6">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analysis</h3>
              <p className="text-muted-foreground">
                Get instant predictions and recommendations as soon as you submit your health data
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-card/50 rounded-3xl my-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex gap-4">
            <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
              <p className="text-muted-foreground">
                Sign up as a patient or doctor and complete your profile
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-secondary text-secondary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Input Health Data</h3>
              <p className="text-muted-foreground">
                Enter your medical information, vitals, and lifestyle factors
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-accent text-accent-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Get AI Predictions</h3>
              <p className="text-muted-foreground">
                Receive instant disease risk assessments and drug recommendations
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-success text-success-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Doctor Review</h3>
              <p className="text-muted-foreground">
                Healthcare providers review and approve personalized recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join MediPredict today and get AI-powered insights into your health risks
        </p>
        <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
          Start Your Health Assessment
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-2">
            <strong>Disclaimer:</strong> This is a demonstration application using mock AI predictions.
          </p>
          <p>
            Not intended for actual medical diagnosis or treatment. Always consult qualified healthcare professionals.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;