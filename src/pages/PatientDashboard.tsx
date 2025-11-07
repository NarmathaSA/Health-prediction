import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Activity, LogOut, User, AlertCircle, Pill } from "lucide-react";
import PatientDataForm from "@/components/PatientDataForm";
import { Session } from "@supabase/supabase-js";

interface Prediction {
  id: string;
  disease: string;
  risk_score: number;
  created_at: string;
}

interface Recommendation {
  id: string;
  disease: string;
  drug_list: string[];
  reason: string;
  approved: boolean;
  doctor_comment: string | null;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      loadDashboardData();
    }
  }, [session]);

  const loadDashboardData = async () => {
    try {
      // Get patient data
      const { data: patientData } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", session!.user.id)
        .maybeSingle();

      if (!patientData) {
        setShowForm(true);
        setIsLoading(false);
        return;
      }

      // Get predictions
      const { data: predictionsData } = await supabase
        .from("predictions")
        .select("*")
        .eq("patient_id", patientData.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (predictionsData) {
        setPredictions(predictionsData);
      }

      // Get recommendations
      const { data: recommendationsData } = await supabase
        .from("recommendations")
        .select("*")
        .eq("patient_id", patientData.id)
        .order("created_at", { ascending: false });

      if (recommendationsData) {
        setRecommendations(recommendationsData);
      }
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-destructive";
    if (score >= 40) return "text-warning";
    return "text-success";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">MediPredict</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        <PatientDataForm onComplete={() => {
          setShowForm(false);
          loadDashboardData();
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">MediPredict - Patient Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowForm(true)}>
              Update Health Data
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Welcome Back</h2>
          </div>
          <p className="text-muted-foreground">View your disease risk predictions and drug recommendations</p>
        </div>

        {predictions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No predictions available yet. Please complete your health assessment.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {predictions.map((prediction) => (
                <Card key={prediction.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{prediction.disease}</span>
                      <AlertCircle className={`h-5 w-5 ${getRiskColor(Number(prediction.risk_score))}`} />
                    </CardTitle>
                    <CardDescription>Risk Assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Risk Score</span>
                        <span className={`font-bold ${getRiskColor(Number(prediction.risk_score))}`}>
                          {Number(prediction.risk_score).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={Number(prediction.risk_score)} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Pill className="h-5 w-5 text-secondary" />
              Drug Recommendations
            </h3>
            <div className="grid gap-6">
              {recommendations.map((recommendation) => (
                <Card key={recommendation.id}>
                  <CardHeader>
                    <CardTitle>{recommendation.disease}</CardTitle>
                    <CardDescription>
                      {recommendation.approved ? (
                        <span className="text-success">✓ Approved by Doctor</span>
                      ) : (
                        <span className="text-warning">Pending Doctor Review</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Recommended Drugs:</h4>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.drug_list.map((drug, index) => (
                          <span key={index} className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">
                            {drug}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Explanation:</h4>
                      <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                    </div>
                    {recommendation.doctor_comment && (
                      <div>
                        <h4 className="font-semibold mb-2">Doctor's Comment:</h4>
                        <p className="text-sm text-muted-foreground italic">{recommendation.doctor_comment}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;