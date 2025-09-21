"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeyRound, Lock, Unlock, FileLock2 } from "lucide-react";

type SecureDataCardProps = {
  plainText: string;
  setPlainText: Dispatch<SetStateAction<string>>;
  encryptedText: string;
  encryptionEmotion: string;
  setEncryptionEmotion: Dispatch<SetStateAction<string>>;
  onEncrypt: () => void;
  onDecrypt: () => void;
  isLoading: boolean;
};

const emotions = ["Happy", "Sad", "Angry", "Neutral", "Surprised", "Fearful"];

export default function SecureDataCard({
  plainText,
  setPlainText,
  encryptedText,
  encryptionEmotion,
  setEncryptionEmotion,
  onEncrypt,
  onDecrypt,
  isLoading,
}: SecureDataCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileLock2 className="size-6 text-primary" />
          <div>
            <CardTitle>Secure Data</CardTitle>
            <CardDescription>
              Encrypt and decrypt messages using your emotion.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="grid w-full gap-1.5">
          <Label htmlFor="message">Your Secret Message</Label>
          <Textarea
            placeholder="Type your message here..."
            id="message"
            value={plainText}
            onChange={(e) => setPlainText(e.target.value)}
            rows={5}
            disabled={!!encryptedText || isLoading}
          />
        </div>
        <div className="grid w-full gap-1.5">
          <Label>Encrypted Output</Label>
          <Textarea
            placeholder="Encrypted data will appear here..."
            readOnly
            value={encryptedText}
            className="font-mono text-xs"
            rows={5}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="emotion-key">Emotion Key</Label>
          <Select
            value={encryptionEmotion}
            onValueChange={setEncryptionEmotion}
            disabled={!!encryptedText}
          >
            <SelectTrigger id="emotion-key" className="w-full">
              <SelectValue placeholder="Select an emotion" />
            </SelectTrigger>
            <SelectContent>
              {emotions.map((emotion) => (
                <SelectItem key={emotion} value={emotion}>
                  {emotion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Select the emotion required to decrypt.
          </p>
        </div>
      </CardContent>
      <CardFooter className="!pt-0">
        <div className="flex gap-2 w-full">
          <Button
            onClick={onEncrypt}
            disabled={!!encryptedText || isLoading}
            className="w-full"
            variant="outline"
          >
            <Lock className="mr-2" />
            Encrypt
          </Button>
          <Button
            onClick={onDecrypt}
            disabled={!encryptedText || isLoading}
            className="w-full"
          >
            <Unlock className="mr-2" />
            Decrypt
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
