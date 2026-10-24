/**
 * @file SignUpPage.jsx
 * @description Orchestrateur du flux d'inscription en 2 étapes
 * @author Fatima Zahra MARGHICH
 * @version 1.0.0
 *
 * Gère le state partagé entre SignUpStep1 et SignUpStep2
 * et orchestre la navigation entre les étapes.
 */

import { useState } from "react";
import SignUpStep1 from "./SignUpStep1";
import SignUpStep2 from "./SignUpStep2";

/**
 * Page d'inscription CareerPilot
 * Orchestre les 2 étapes d'inscription
 * Route : /signup
 */
export default function SignUpPage() {
  const [step, setStep]         = useState(1);
  const [step1Data, setStep1Data] = useState(null);

  /** Passer à l'étape 2 avec les données de l'étape 1 */
  const handleStep1Next = (data) => {
    setStep1Data(data);
    setStep(2);
  };

  /** Retourner à l'étape 1 */
  const handleBack = () => {
    setStep(1);
  };

  return step === 1
    ? <SignUpStep1 onNext={handleStep1Next} />
    : <SignUpStep2 step1Data={step1Data} onBack={handleBack} />;
}