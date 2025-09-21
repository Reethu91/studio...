
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

type CameraStatus = 'idle' | 'requesting' | 'streaming' | 'denied';

export default function EmotionCaptureCard({
  isLoading,
  emotionResult,
  onScan,
}: EmotionCaptureCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const { toast } = useToast();

  const enableCamera = useCallback(async () => {
    if (cameraStatus !== 'idle' && cameraStatus !== 'denied') return;
    
    setCameraStatus('requesting');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraStatus('streaming');
        };
      } else {
        stream.getTracks().forEach(track => track.stop());
        setCameraStatus('denied');
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraStatus('denied');
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  }, [cameraStatus, toast]);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
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

  const renderVideoOverlay = () => {
    switch (cameraStatus) {
      case 'idle':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4 text-center">
            <VideoOff className="size-10 text-muted-foreground mb-4" />
            <p className="text-white font-medium">Camera is off</p>
            <p className="text-sm text-muted-foreground">Click below to enable your camera.</p>
          </div>
        );
      case 'requesting':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4 text-center">
            <LoaderCircle className="size-10 animate-spin text-primary mb-4" />
            <p className="text-white">Requesting camera access...</p>
            <p className="text-sm text-muted-foreground">Please allow permission in your browser.</p>
          </div>
        );
      case 'denied':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/90 p-4 text-center">
            <ShieldAlert className="size-10 text-destructive-foreground mb-4" />
            <h3 className="text-lg font-bold text-destructive-foreground">Camera Access Denied</h3>
            <p className="text-sm text-destructive-foreground/80 mt-2">
              You must grant camera permission in your browser's site settings to use this feature. You may need to refresh the page after granting permission.
            </p>
          </div>
        );
      case 'streaming':
        return null;
    }
  };
  
  const renderFooterButton = () => {
    switch (cameraStatus) {
      case 'idle':
      case 'denied':
        return (
          <Button onClick={enableCamera} className="w-full" disabled={cameraStatus === 'denied'}>
            <Camera className="mr-2" />
            {cameraStatus === 'denied' ? 'Permission Denied' : 'Enable Camera'}
          </Button>
        );
      case 'requesting':
         return (
          <Button disabled className="w-full">
            <LoaderCircle className="mr-2 animate-spin" />
            Waiting for Permission...
          </Button>
        );
      case 'streaming':
        return (
          <Button
            onClick={handleTakePicture}
            disabled={isLoading}
            className="w-full"
          >
            <ScanFace className="mr-2" />
            {isLoading ? "Scanning..." : "Scan Emotion"}
          </Button>
        );
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
            <video ref={videoRef} className={`w-full h-full object-cover ${cameraStatus !== 'streaming' ? 'hidden' : ''}`} autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            {renderVideoOverlay()}
        </div>
      </CardContent>
      <CardFooter className="flex-col !pt-4 gap-4">
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
              {cameraStatus === 'streaming' ? 'Ready to scan' : 'Camera permission needed'}
            </span>
          )}
        </div>

        {renderFooterButton()}
      </CardFooter>
    </Card>
  );
}
