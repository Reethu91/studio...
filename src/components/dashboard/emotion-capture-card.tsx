
"use client";

import {
  useState,
  useRef,
  useEffect,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  ScanFace,
  LoaderCircle,
  Smile,
  Frown,
  Angry,
  Meh,
  Annoyed,
  Laugh,
} from "lucide-react";
import type { RecognizeUserEmotionOutput } from "@/ai/flows/recognize-user-emotion";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type EmotionCaptureCardProps = {
  isLoading: boolean;
  emotionResult: RecognizeUserEmotionOutput | null;
  onScan: (dataUri: string) => void;
};

const emotionIcons: { [key: string]: React.ReactNode } = {
  happy: <Laugh className="size-5 text-yellow-400" />,
  sad: <Frown className="size-5 text-blue-400" />,
  angry: <Angry className="size-5 text-red-500" />,
  neutral: <Meh className="size-5 text-gray-400" />,
  surprised: <Smile className="size-5 text-orange-400" />,
  fearful: <Annoyed className="size-5 text-purple-400" />,
};

export default function EmotionCaptureCard({
  isLoading,
  emotionResult,
  onScan,
}: EmotionCaptureCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Not Supported",
          description: "Your browser does not support camera access.",
        });
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description:
            "Please enable camera permissions in your browser settings to use this feature.",
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast]);

  const handleTakePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL("image/jpeg");
        onScan(dataUri);
      }
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Camera className="size-6 text-primary" />
          <div>
            <CardTitle>Emotion Capture</CardTitle>
            <CardDescription>
              Scan your face to generate an emotional key.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center">
        <div className="w-full aspect-video bg-secondary rounded-md flex items-center justify-center relative overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {hasCameraPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Alert variant="destructive" className="w-auto">
                <Camera className="size-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access to use this feature.
                </AlertDescription>
              </Alert>
            </div>
          )}
           {hasCameraPermission === null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <LoaderCircle className="size-8 animate-spin text-primary" />
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
      <CardFooter className="flex-col !pt-0 gap-4">
        <div className="w-full h-16 flex items-center justify-center rounded-lg bg-secondary/50 p-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-primary">
              <LoaderCircle className="size-5 animate-spin" />
              <span>Analyzing emotion...</span>
            </div>
          ) : emotionResult ? (
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between items-center font-medium text-foreground">
                <span className="flex items-center gap-2">
                  {emotionIcons[emotionResult.emotion.toLowerCase()] || (
                    <Smile />
                  )}
                  Detected: {emotionResult.emotion}
                </span>
                <span>{(emotionResult.confidence * 100).toFixed(0)}%</span>
              </div>
              <Progress value={emotionResult.confidence * 100} />
            </div>
          ) : (
            <span className="text-muted-foreground">
              Scan your face to see results
            </span>
          )}
        </div>
        <Button
          onClick={handleTakePicture}
          disabled={!hasCameraPermission || isLoading}
          className="w-full"
        >
          <ScanFace className="mr-2" />
          {isLoading ? "Scanning..." : "Scan Emotion"}
        </Button>
      </CardFooter>
    </Card>
  );
}
