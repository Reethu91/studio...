
"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
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
  ShieldAlert,
  Video,
  VideoOff,
} from "lucide-react";
import type { RecognizeUserEmotionOutput } from "@/ai/flows/recognize-user-emotion";
import { useToast } from "@/hooks/use-toast";

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

type CameraStatus = "idle" | "requesting" | "streaming" | "denied" | "error";

export default function EmotionCaptureCard({
  isLoading,
  emotionResult,
  onScan,
}: EmotionCaptureCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    if (cameraStatus === 'streaming') return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Camera not supported by this browser.");
      setCameraStatus("error");
      toast({
        variant: "destructive",
        title: "Camera Not Supported",
        description: "Your browser does not support camera access.",
      });
      return;
    }
    setCameraStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStatus("streaming");
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraStatus("denied");
    }
  }, [cameraStatus, toast]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraStatus("idle");
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTakePicture = () => {
    if (videoRef.current && canvasRef.current && cameraStatus === 'streaming') {
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

  const renderCameraState = () => {
    switch(cameraStatus) {
      case 'idle':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary p-4 text-center">
            <VideoOff className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Camera is off. Click below to start.</p>
          </div>
        );
      case 'requesting':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center">
            <LoaderCircle className="size-10 animate-spin text-primary mb-4" />
            <p className="text-white">Requesting camera access...</p>
          </div>
        );
      case 'denied':
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4 text-center">
              <ShieldAlert className="size-16 text-destructive mb-4" />
              <h3 className="text-xl font-bold text-white">Camera Access Denied</h3>
              <p className="text-md text-muted-foreground mt-2 max-w-sm">
                To use this feature, you must allow camera access. Please click the camera icon in your browser&apos;s address bar, grant permission, and then click &quot;Try Again&quot;.
              </p>
            </div>
        );
      case 'error':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/20 p-4 text-center">
            <ShieldAlert className="size-16 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-destructive-foreground">Camera Not Supported</h3>
            <p className="text-md text-muted-foreground mt-2">
              It seems your browser does not support camera access.
            </p>
          </div>
        );
      case 'streaming':
        return null;
    }
  }

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
            className={`w-full h-full object-cover ${cameraStatus !== 'streaming' ? 'hidden' : ''}`}
          />
          {renderCameraState()}
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
              {cameraStatus === 'streaming' ? 'Ready to scan' : 'Start camera to begin'}
            </span>
          )}
        </div>

        {cameraStatus === 'streaming' ? (
           <div className="flex w-full gap-2">
             <Button
                onClick={handleTakePicture}
                disabled={isLoading}
                className="w-full"
              >
                <ScanFace className="mr-2" />
                {isLoading ? "Scanning..." : "Scan Emotion"}
              </Button>
              <Button onClick={stopCamera} variant="outline" className="shrink-0">
                <VideoOff />
              </Button>
           </div>
        ) : (
          <Button
            onClick={startCamera}
            disabled={cameraStatus === 'requesting' || cameraStatus === 'error'}
            className="w-full"
          >
            {cameraStatus === 'denied' ? <><ShieldAlert className="mr-2" />Try Again</> : <><Video className="mr-2" />Start Camera</>}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

    