import React, { useState } from "react";
import { router } from "expo-router";
import { VEGETABLES, VEGETABLE_DETAILS } from "../../data/vegetables";
import QuestionScreen from "../../components/pages/explore/plantFinder/QuestionScreen";
import ResultsView from "../../components/pages/explore/plantFinder/ResultsView";

interface Question {
  title: string;
  explanation: string;
  options: { label: string; value: string }[];
}

const QUESTIONS: Question[] = [
  {
    title: "Waar ga je planten?",
    explanation: "Heb je een tuin of balkon? Of ga je binnen aan de slag? Binnenplanten hebben minder licht nodig, buitenplanten krijgen meer ruimte.",
    options: [
      { label: "Binnen", value: "inside" },
      { label: "Buiten", value: "outside" },
      { label: "Maakt niet uit", value: "either" },
    ],
  },
  {
    title: "Hoeveel zon krijgt de plek?",
    explanation: "Kijk naar de plek waar je wilt planten. Krijgt het direct zonlicht, staat het in de halfschaduw, of is het er vooral schaduwrijk?",
    options: [
      { label: "Volle zon (+6 uur)", value: "full" },
      { label: "Halfschaduw (3-6 uur)", value: "partial" },
      { label: "Schaduw (-3 uur)", value: "shade" },
    ],
  },
  {
    title: "Wanneer wil je planten?",
    explanation: "Niet elke plant kan het hele jaar door gezaaid worden. Kies de maand waarin je ongeveer wilt beginnen.",
    options: [
      { label: "Januari", value: "1" },
      { label: "Februari", value: "2" },
      { label: "Maart", value: "3" },
      { label: "April", value: "4" },
      { label: "Mei", value: "5" },
      { label: "Juni", value: "6" },
      { label: "Juli", value: "7" },
      { label: "Augustus", value: "8" },
      { label: "September", value: "9" },
      { label: "Oktober", value: "10" },
      { label: "November", value: "11" },
      { label: "December", value: "12" },
    ],
  },
  {
    title: "Hoeveel tijd heb je?",
    explanation: "Sommige planten hebben elke dag aandacht nodig, andere kunnen een weekje zonder. Bedenk wat jij écht kunt geven.",
    options: [
      { label: "Dagelijks", value: "daily" },
      { label: "Wekelijks", value: "weekly" },
      { label: "Maakt niet uit", value: "either" },
    ],
  },
];

const PlantFinder = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([null, null, null, null]);

  const setAnswer = (value: string) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
  };

  const handleNext = () => {
    if (answers[step] === null) return;
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(QUESTIONS.length);
    }
  };

  if (step === QUESTIONS.length) {
    const [placement, sunlight, month, careLevel] = answers as string[];
    const monthNum = parseInt(month, 10);

    const results = VEGETABLES.filter((v) => {
      const d = VEGETABLE_DETAILS[v.id];
      if (!d) return false;
      if (placement !== "either" && d.placement !== "both" && d.placement !== placement) return false;
      if (sunlight !== d.sunlight) return false;
      if (monthNum < d.sowingPeriod.startMonth || monthNum > d.sowingPeriod.endMonth) return false;
      if (careLevel !== "either" && d.careLevel !== careLevel) return false;
      return true;
    });

    return <ResultsView results={results} onRestart={() => { setStep(0); setAnswers([null, null, null, null]); }} />;
  }

  return (
    <QuestionScreen
      question={QUESTIONS[step]}
      step={step}
      totalSteps={QUESTIONS.length}
      answer={answers[step]}
      onAnswer={setAnswer}
      onNext={handleNext}
      onBack={step === 0 ? () => router.navigate("/(explore)/explore") : () => setStep(step - 1)}
      isLast={step === QUESTIONS.length - 1}
    />
  );
};

export default PlantFinder;
