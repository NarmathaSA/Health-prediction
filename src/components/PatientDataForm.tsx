import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface PatientDataFormProps {
  onComplete: () => void;
}

const PatientDataForm = ({ onComplete }: PatientDataFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    bloodSugar: "",
    cholesterol: "",
    bmi: "",
    bpSystolic: "",
    bpDiastolic: "",
    smoking: false,
    alcohol: false,
    exerciseHours: "",
    familyHistory: "",
    symptoms: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Insert or update patient data
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .upsert({
          user_id: user.id,
          age: parseInt(formData.age),
          gender: formData.gender,
          blood_sugar: parseFloat(formData.bloodSugar),
          cholesterol: parseFloat(formData.cholesterol),
          bmi: parseFloat(formData.bmi),
          blood_pressure_systolic: parseInt(formData.bpSystolic),
          blood_pressure_diastolic: parseInt(formData.bpDiastolic),
          smoking: formData.smoking,
          alcohol: formData.alcohol,
          exercise_hours: parseInt(formData.exerciseHours),
          family_history: formData.familyHistory,
          symptoms: formData.symptoms,
          last_prediction_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (patientError) throw patientError;

      // Call prediction function
      const { data: predictionData, error: predictionError } = await supabase.functions.invoke("predict", {
        body: { patientId: patientData.id },
      });

      if (predictionError) throw predictionError;

      toast.success("Health data saved and predictions generated!");
      onComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to save data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Health Assessment Form</CardTitle>
          <CardDescription>
            Please provide your health information for accurate risk prediction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  min="1"
                  max="120"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodSugar">Blood Sugar (mg/dL)</Label>
                <Input
                  id="bloodSugar"
                  type="number"
                  step="0.1"
                  value={formData.bloodSugar}
                  onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cholesterol">Cholesterol (mg/dL)</Label>
                <Input
                  id="cholesterol"
                  type="number"
                  step="0.1"
                  value={formData.cholesterol}
                  onChange={(e) => setFormData({ ...formData, cholesterol: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmi">BMI</Label>
                <Input
                  id="bmi"
                  type="number"
                  step="0.1"
                  value={formData.bmi}
                  onChange={(e) => setFormData({ ...formData, bmi: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bpSystolic">BP Systolic (mmHg)</Label>
                <Input
                  id="bpSystolic"
                  type="number"
                  value={formData.bpSystolic}
                  onChange={(e) => setFormData({ ...formData, bpSystolic: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bpDiastolic">BP Diastolic (mmHg)</Label>
                <Input
                  id="bpDiastolic"
                  type="number"
                  value={formData.bpDiastolic}
                  onChange={(e) => setFormData({ ...formData, bpDiastolic: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exerciseHours">Exercise Hours/Week</Label>
                <Input
                  id="exerciseHours"
                  type="number"
                  value={formData.exerciseHours}
                  onChange={(e) => setFormData({ ...formData, exerciseHours: e.target.value })}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="smoking">Smoking</Label>
              <Switch
                id="smoking"
                checked={formData.smoking}
                onCheckedChange={(checked) => setFormData({ ...formData, smoking: checked })}
              />
            </div>

            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="alcohol">Alcohol Consumption</Label>
              <Switch
                id="alcohol"
                checked={formData.alcohol}
                onCheckedChange={(checked) => setFormData({ ...formData, alcohol: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyHistory">Family Medical History</Label>
              <Textarea
                id="familyHistory"
                value={formData.familyHistory}
                onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
                placeholder="e.g., Diabetes in parents, heart disease in grandparents..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Current Symptoms</Label>
              <Textarea
                id="symptoms"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="Describe any symptoms you're currently experiencing..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Submit & Get Predictions"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDataForm;