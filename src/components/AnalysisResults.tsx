"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Stethoscope, AlertTriangle, CheckCircle2, IndianRupee, Pill } from "lucide-react";
import type { AnalyzeMedicalBillOutput } from "@/ai/flows/analyze-medical-bill";
import type { AnalyzePrescriptionOutput } from "@/ai/flows/analyze-prescription";

interface AnalysisResultsProps {
  mode: "bill" | "prescription";
  data: AnalyzeMedicalBillOutput | AnalyzePrescriptionOutput | null;
}

export function AnalysisResults({ mode, data }: AnalysisResultsProps) {
  if (!data) return null;

  if (mode === "bill") {
    const billData = data as AnalyzeMedicalBillOutput;
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-primary/10 shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 pb-4">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-xl">Bill Analysis Summary</CardTitle>
            </div>
            <CardDescription>Estimated potential savings based on Indian market fair rates</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-accent/10 p-4 rounded-lg mb-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">Total Possible Savings</p>
                <p className="text-3xl font-bold text-primary flex items-center justify-center md:justify-start">
                  <IndianRupee className="h-6 w-6" />
                  {(billData.totalPossibleSavings ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Negotiating these items can significantly reduce your bill.
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Overpriced Items Identified
              </h3>
              <div className="grid gap-3">
                {billData.overpricedItems && billData.overpricedItems.length > 0 ? (
                  billData.overpricedItems.map((item, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-white shadow-sm hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-foreground">{item.item}</span>
                        <Badge variant="destructive" className="ml-2">Overcharged</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">Billed Price</p>
                          <p className="font-semibold">₹{(item.billedPrice ?? 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fair Estimate</p>
                          <p className="font-semibold text-green-600">₹{(item.fairPriceEstimate ?? 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground bg-slate-50 p-2 rounded border-l-2 border-primary">
                        {item.recommendation}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">No significantly overpriced items detected based on typical charges.</p>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">General Recommendations</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                {billData.generalRecommendations && billData.generalRecommendations.length > 0 ? (
                  billData.generalRecommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))
                ) : (
                  <li className="italic">Standard billing review recommended.</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const prescriptionData = data as AnalyzePrescriptionOutput;
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-primary/10 shadow-sm overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4">
          <div className="flex items-center gap-2 text-primary">
            <Stethoscope className="h-5 w-5" />
            <CardTitle className="text-xl">Prescription Analysis</CardTitle>
          </div>
          <CardDescription>Details for identified medications in your prescription</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {prescriptionData.medicines && prescriptionData.medicines.length > 0 ? (
            prescriptionData.medicines.map((med, idx) => (
              <div key={idx} className="group border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-slate-50 p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg text-primary">{med.name}</h3>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{med.treats}</Badge>
                </div>
                <div className="p-4 grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Common Side Effects</h4>
                      <div className="flex flex-wrap gap-1">
                        {med.sideEffects && med.sideEffects.length > 0 ? med.sideEffects.map((effect, i) => (
                          <Badge key={i} variant="outline" className="text-xs font-normal border-slate-200">{effect}</Badge>
                        )) : <span className="text-xs text-muted-foreground">None listed</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-2">Drug Interactions</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                        {med.drugInteractions && med.drugInteractions.length > 0 ? med.drugInteractions.map((item, i) => (
                          <li key={i}>{item}</li>
                        )) : <li>No major interactions identified</li>}
                      </ul>
                    </div>
                  </div>
                  <div className="bg-amber-50/50 p-3 rounded-md border border-amber-100">
                    <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-1 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      Important Cautions
                    </h4>
                    <ul className="text-xs space-y-2 text-amber-800">
                      {med.cautions && med.cautions.length > 0 ? med.cautions.map((caution, i) => (
                        <li key={i} className="leading-relaxed">• {caution}</li>
                      )) : <li className="italic">Standard precautions apply.</li>}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground italic border-2 border-dashed rounded-lg">
              No medications were clearly identified from the provided text.
            </div>
          )}
        </CardContent>
      </Card>
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-muted-foreground flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
        <p>
          <strong>Disclaimer:</strong> This analysis is generated by AI and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or medication.
        </p>
      </div>
    </div>
  );
}
