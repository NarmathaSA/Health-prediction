import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PredictionRequest {
  patientId: string;
}

// Mock prediction logic
const generatePredictions = (patientData: any) => {
  const predictions = [];
  
  // Diabetes risk calculation
  let diabetesRisk = 20;
  if (patientData.blood_sugar > 126) diabetesRisk += 40;
  else if (patientData.blood_sugar > 100) diabetesRisk += 20;
  if (patientData.bmi > 30) diabetesRisk += 20;
  else if (patientData.bmi > 25) diabetesRisk += 10;
  if (patientData.family_history?.toLowerCase().includes('diabetes')) diabetesRisk += 15;
  diabetesRisk = Math.min(95, diabetesRisk);
  
  predictions.push({
    disease: 'Diabetes',
    risk_score: diabetesRisk,
  });

  // Heart Disease risk calculation
  let heartRisk = 15;
  if (patientData.cholesterol > 240) heartRisk += 35;
  else if (patientData.cholesterol > 200) heartRisk += 20;
  if (patientData.blood_pressure_systolic > 140) heartRisk += 25;
  else if (patientData.blood_pressure_systolic > 130) heartRisk += 15;
  if (patientData.smoking) heartRisk += 20;
  if (patientData.age > 60) heartRisk += 10;
  heartRisk = Math.min(95, heartRisk);
  
  predictions.push({
    disease: 'Heart Disease',
    risk_score: heartRisk,
  });

  // Hypertension risk calculation
  let hypertensionRisk = 10;
  if (patientData.blood_pressure_systolic > 140) hypertensionRisk += 40;
  else if (patientData.blood_pressure_systolic > 130) hypertensionRisk += 25;
  if (patientData.blood_pressure_diastolic > 90) hypertensionRisk += 20;
  if (patientData.bmi > 30) hypertensionRisk += 15;
  if (patientData.alcohol) hypertensionRisk += 10;
  hypertensionRisk = Math.min(95, hypertensionRisk);
  
  predictions.push({
    disease: 'Hypertension',
    risk_score: hypertensionRisk,
  });

  return predictions;
};

// Mock drug recommendations
const getDrugRecommendations = (disease: string, riskScore: number) => {
  const recommendations: Record<string, any> = {
    'Diabetes': {
      drug_list: ['Metformin', 'Glimepiride', 'Insulin (if needed)'],
      reason: `Based on your risk score of ${riskScore.toFixed(0)}%, we recommend these medications to help control blood sugar levels. Metformin is typically the first-line treatment, while Glimepiride can be added if needed. Regular monitoring and lifestyle changes are also essential.`,
    },
    'Heart Disease': {
      drug_list: ['Aspirin', 'Statins (Atorvastatin)', 'ACE Inhibitors'],
      reason: `With a ${riskScore.toFixed(0)}% risk, these medications can help reduce cardiovascular risk. Aspirin prevents blood clots, statins lower cholesterol, and ACE inhibitors help manage blood pressure and protect the heart.`,
    },
    'Hypertension': {
      drug_list: ['Lisinopril', 'Amlodipine', 'Hydrochlorothiazide'],
      reason: `For your ${riskScore.toFixed(0)}% hypertension risk, these medications work to lower blood pressure through different mechanisms. ACE inhibitors like Lisinopril, calcium channel blockers like Amlodipine, and diuretics like Hydrochlorothiazide are commonly prescribed first-line treatments.`,
    },
  };

  return recommendations[disease] || {
    drug_list: ['Consult your doctor'],
    reason: 'Please consult with your healthcare provider for personalized recommendations.',
  };
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { patientId } = await req.json() as PredictionRequest;

    console.log('Generating predictions for patient:', patientId);

    // Get patient data
    const { data: patientData, error: patientError } = await supabaseClient
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (patientError) throw patientError;

    // Generate predictions
    const predictions = generatePredictions(patientData);

    // Store predictions
    const predictionInserts = predictions.map(pred => ({
      patient_id: patientId,
      disease: pred.disease,
      risk_score: pred.risk_score,
    }));

    const { error: predictionError } = await supabaseClient
      .from('predictions')
      .insert(predictionInserts);

    if (predictionError) throw predictionError;

    console.log('Predictions stored successfully');

    // Generate and store recommendations for high-risk diseases
    for (const prediction of predictions) {
      if (prediction.risk_score >= 40) {
        const recommendation = getDrugRecommendations(prediction.disease, prediction.risk_score);
        
        const { error: recError } = await supabaseClient
          .from('recommendations')
          .insert({
            patient_id: patientId,
            disease: prediction.disease,
            drug_list: recommendation.drug_list,
            reason: recommendation.reason,
          });

        if (recError) {
          console.error('Error storing recommendation:', recError);
        } else {
          console.log(`Recommendation stored for ${prediction.disease}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        predictions,
        message: 'Predictions and recommendations generated successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in predict function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});