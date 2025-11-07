import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Activity, LogOut, Users, FileText, CheckCircle } from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface PatientInfo {
  id: string;
  user_id: string;
  age: number;
  gender: string;
  blood_sugar: number;
  cholesterol: number;
  bmi: number;
  profiles: {
    full_name: string;
    email: string;
  };
  predictions: Array<{
    disease: string;
    risk_score: number;
  }>;
  recommendations: Array<{
    id: string;
    disease: string;
    drug_list: string[];
    reason: string;
    approved: boolean;
    doctor_comment: string | null;
  }>;
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [doctorComment, setDoctorComment] = useState("");

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
      loadPatients();
    }
  }, [session]);

  const loadPatients = async () => {
    try {
      const { data: patientsData, error } = await supabase
        .from("patients")
        .select(`
          *,
          profiles!inner(full_name, email),
          predictions(disease, risk_score),
          recommendations(id, disease, drug_list, reason, approved, doctor_comment)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPatients(patientsData as any);
    } catch (error: any) {
      toast.error("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRecommendation = async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from("recommendations")
        .update({ 
          approved: true,
          doctor_comment: doctorComment || null
        })
        .eq("id", recommendationId);

      if (error) throw error;

      toast.success("Recommendation approved");
      setSelectedRecommendation(null);
      setDoctorComment("");
      loadPatients();
    } catch (error: any) {
      toast.error("Failed to approve recommendation");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">MediPredict - Doctor Dashboard</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Patient Reports</h2>
          </div>
          <p className="text-muted-foreground">Review and approve drug recommendations</p>
        </div>

        <div className="grid gap-6">
          {patients.map((patient) => (
            <Card key={patient.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{patient.profiles.full_name}</CardTitle>
                    <CardDescription>{patient.profiles.email}</CardDescription>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Age: {patient.age} | Gender: {patient.gender}</p>
                    <p>BMI: {patient.bmi} | Blood Sugar: {patient.blood_sugar}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Predictions */}
                {patient.predictions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Disease Risk Predictions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {patient.predictions.map((pred, idx) => (
                        <Badge key={idx} variant={Number(pred.risk_score) >= 70 ? "destructive" : "secondary"}>
                          {pred.disease}: {Number(pred.risk_score).toFixed(0)}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {patient.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Drug Recommendations
                    </h4>
                    {patient.recommendations.map((rec) => (
                      <Card key={rec.id} className="mb-4">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-semibold">{rec.disease}</h5>
                            {rec.approved ? (
                              <Badge variant="default">Approved</Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-medium">Drugs:</span>{" "}
                              {rec.drug_list.join(", ")}
                            </p>
                            <p>
                              <span className="font-medium">Reason:</span>{" "}
                              {rec.reason}
                            </p>
                            {rec.doctor_comment && (
                              <p className="italic text-muted-foreground">
                                <span className="font-medium">Your comment:</span>{" "}
                                {rec.doctor_comment}
                              </p>
                            )}
                          </div>
                          {!rec.approved && (
                            <div className="mt-4 space-y-2">
                              {selectedRecommendation === rec.id ? (
                                <>
                                  <Textarea
                                    placeholder="Add your comment (optional)..."
                                    value={doctorComment}
                                    onChange={(e) => setDoctorComment(e.target.value)}
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleApproveRecommendation(rec.id)}
                                    >
                                      Confirm Approval
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedRecommendation(null);
                                        setDoctorComment("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedRecommendation(rec.id)}
                                >
                                  Approve Recommendation
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;