"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { recognizeUserEmotion, RecognizeUserEmotionOutput } from "@/ai/flows/recognize-user-emotion";
import { personalizeEncryptionRules } from "@/ai/flows/personalize-encryption-rules";
import EmotionCaptureCard from "./emotion-capture-card";
import SecureDataCard from "./secure-data-card";
import AccessLogCard from "./access-log-card";

export type AccessLogEntry = {
  id: number;
  timestamp: Date;
  attempted: string;
  required: string;
  status: "Success" | "Failure";
};

export default function MainDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emotionResult, setEmotionResult] =
    useState<RecognizeUserEmotionOutput | null>(null);
  const [accessLog, setAccessLog] = useState<AccessLogEntry[]>([]);

  // State for the secure data card
  const [plainText, setPlainText] = useState("The launch codes are 0000-0000-0000-0001.");
  const [encryptedText, setEncryptedText] = useState("");
  const [encryptionEmotion, setEncryptionEmotion] = useState("Happy");

  const handleScanEmotion = useCallback(
    async (photoDataUri: string) => {
      setIsLoading(true);
      setEmotionResult(null);
      try {
        const result = await recognizeUserEmotion({ photoDataUri });
        setEmotionResult(result);
        toast({
          title: "Emotion Recognized",
          description: `Detected ${result.emotion} with ${(
            result.confidence * 100
          ).toFixed(0)}% confidence.`,
        });
      } catch (error) {
        console.error("Emotion recognition failed:", error);
        toast({
          variant: "destructive",
          title: "Recognition Error",
          description: "Could not analyze the image. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const handleEncrypt = useCallback(async () => {
    if (!plainText) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "Please enter a message to encrypt.",
      });
      return;
    }
    setIsLoading(true);
    try {
      // Mock encryption
      const mockEncrypted = `emotiguard-v1::${btoa(
        JSON.stringify({
          emotion: encryptionEmotion,
          content: plainText,
        })
      )}`;
      setEncryptedText(mockEncrypted);
      setPlainText("");
      toast({
        title: "Encryption Successful",
        description: `Message encrypted. Required emotion: ${encryptionEmotion}`,
      });
    } catch (error) {
      console.error("Encryption failed:", error);
      toast({
        variant: "destructive",
        title: "Encryption Error",
        description: "Could not encrypt the message. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [plainText, encryptionEmotion, toast]);

  const handleDecrypt = useCallback(() => {
    if (!encryptedText) {
      toast({
        variant: "destructive",
        title: "No Encrypted Data",
        description: "There is nothing to decrypt.",
      });
      return;
    }
    if (!emotionResult) {
      toast({
        variant: "destructive",
        title: "Emotion Not Scanned",
        description: "Please scan your emotion before attempting to decrypt.",
      });
      return;
    }

    let requiredEmotion = "unknown";
    let status: "Success" | "Failure" = "Failure";
    
    try {
      const decodedPayload = atob(encryptedText.split("::")[1]);
      const data = JSON.parse(decodedPayload);
      requiredEmotion = data.emotion;

      const currentEmotion = emotionResult.emotion.toLowerCase();

      if (currentEmotion === requiredEmotion.toLowerCase()) {
        setPlainText(data.content);
        setEncryptedText("");
        status = "Success";
        toast({
          title: "Decryption Successful",
          description: "Emotion matched. You can now see the message.",
        });
      } else {
        status = "Failure";
        toast({
          variant: "destructive",
          title: "Decryption Failed",
          description: "Emotion mismatch. Access denied.",
        });
      }
    } catch (error) {
        status = "Failure";
        toast({
          variant: "destructive",
          title: "Decryption Error",
          description: "The encrypted data appears to be corrupt.",
        });
        setEncryptedText(""); // Clear corrupt data
    }


    const logEntry: AccessLogEntry = {
      id: Date.now(),
      timestamp: new Date(),
      required: requiredEmotion,
      attempted: emotionResult.emotion,
      status,
    };
    setAccessLog((prevLog) => [logEntry, ...prevLog]);
    setEmotionResult(null); // Require a fresh scan for next attempt
  }, [encryptedText, emotionResult, toast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <EmotionCaptureCard
        isLoading={isLoading}
        emotionResult={emotionResult}
        onScan={handleScanEmotion}
      />
      <SecureDataCard
        plainText={plainText}
        setPlainText={setPlainText}
        encryptedText={encryptedText}
        encryptionEmotion={encryptionEmotion}
        setEncryptionEmotion={setEncryptionEmotion}
        onEncrypt={handleEncrypt}
        onDecrypt={handleDecrypt}
        isLoading={isLoading}
      />
      <AccessLogCard log={accessLog} />
    </div>
  );
}
