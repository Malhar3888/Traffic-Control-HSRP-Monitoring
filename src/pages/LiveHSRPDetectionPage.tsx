import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Camera,
  Video,
  VideoOff,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Maximize2,
} from 'lucide-react';

interface DetectionResult {
  id: string;
  timestamp: Date;
  plateNumber: string;
  hsrpStatus: 'valid' | 'invalid' | 'unknown';
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  screenshot?: string;
}

export default function LiveHSRPDetectionPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const wsRef = useRef<WebSocket | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [currentDetection, setCurrentDetection] = useState<DetectionResult | null>(null);
  const [fps, setFps] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [demoMode, setDemoMode] = useState(true); // Demo mode for testing without backend

  // Demo plate numbers for simulation
  const demoPlates = [
    { number: 'MH12AB1234', hsrp: 'valid', confidence: 95 },
    { number: 'MH12CD5678', hsrp: 'invalid', confidence: 88 },
    { number: 'DL01EF9012', hsrp: 'valid', confidence: 92 },
    { number: 'KA03GH3456', hsrp: 'invalid', confidence: 85 },
    { number: 'TN09IJ7890', hsrp: 'valid', confidence: 97 },
  ];

  // Handle detection result from backend
  const handleDetectionResult = useCallback((result: any) => {
    const detection: DetectionResult = {
      id: Date.now().toString(),
      timestamp: new Date(),
      plateNumber: result.plate_number || 'Unknown',
      hsrpStatus: result.hsrp_status || 'unknown',
      confidence: result.confidence || 0,
      boundingBox: result.bounding_box,
    };

    setCurrentDetection(detection);
    setDetections(prev => [detection, ...prev].slice(0, 20));
    setIsProcessing(true);

    setTimeout(() => {
      setCurrentDetection(null);
      setIsProcessing(false);
    }, 2000);
  }, []);

  // Demo mode: Simulate detections
  const startDemoProcessing = useCallback(() => {
    let frameCount = 0;
    let lastTime = Date.now();

    const processFrame = () => {
      if (!isStreaming) return;

      frameCount++;
      const currentTime = Date.now();
      
      // Calculate FPS
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }

      // Simulate detection every 2-3 seconds
      if (Math.random() < 0.03) {
        const randomPlate = demoPlates[Math.floor(Math.random() * demoPlates.length)];
        const detection: DetectionResult = {
          id: Date.now().toString(),
          timestamp: new Date(),
          plateNumber: randomPlate.number,
          hsrpStatus: randomPlate.hsrp as 'valid' | 'invalid',
          confidence: randomPlate.confidence + Math.random() * 5 - 2.5,
          boundingBox: {
            x: Math.random() * 0.3 + 0.35,
            y: Math.random() * 0.3 + 0.35,
            width: 0.2,
            height: 0.1,
          },
        };

        setCurrentDetection(detection);
        setDetections(prev => [detection, ...prev].slice(0, 20));
        setIsProcessing(true);

        // Clear detection after 2 seconds
        setTimeout(() => {
          setCurrentDetection(null);
          setIsProcessing(false);
        }, 2000);
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();
  }, [isStreaming, demoPlates]);

  // Capture and send frames to backend
  const startFrameCapture = useCallback(() => {
    const captureFrame = () => {
      if (!videoRef.current || !canvasRef.current || !wsRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(captureFrame);
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64 and send to backend
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ frame: frameData }));
      }

      // Capture at ~10-15 FPS
      setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(captureFrame);
      }, 1000 / 12); // 12 FPS
    };

    captureFrame();
  }, []);

  // Connect to WebSocket backend
  const connectWebSocket = useCallback(() => {
    try {
      // Replace with your backend WebSocket URL
      const ws = new WebSocket('ws://localhost:8000/ws/detect');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        startFrameCapture();
      };

      ws.onmessage = (event) => {
        const result = JSON.parse(event.data);
        handleDetectionResult(result);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Backend connection failed. Running in demo mode.');
        setDemoMode(true);
        startDemoProcessing();
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setError('Backend not available. Running in demo mode.');
      setDemoMode(true);
      startDemoProcessing();
    }
  }, [startFrameCapture, handleDetectionResult, startDemoProcessing]);

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);

        // Start frame processing
        if (demoMode) {
          startDemoProcessing();
        } else {
          connectWebSocket();
        }
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      console.error('Camera error:', err);
    }
  }, [demoMode, startDemoProcessing, connectWebSocket]);

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsStreaming(false);
    setCurrentDetection(null);
  }, []);

  // Capture screenshot
  const captureScreenshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw detection overlay if present
    if (currentDetection?.boundingBox) {
      const box = currentDetection.boundingBox;
      ctx.strokeStyle = currentDetection.hsrpStatus === 'valid' ? '#22C55E' : '#EF4444';
      ctx.lineWidth = 4;
      ctx.strokeRect(
        box.x * canvas.width,
        box.y * canvas.height,
        box.width * canvas.width,
        box.height * canvas.height
      );
    }

    // Download screenshot
    const link = document.createElement('a');
    link.download = `hsrp-detection-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  }, [currentDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'invalid':
        return <XCircle className="w-4 h-4 text-danger" />;
      default:
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'destructive' | 'secondary'; label: string }> = {
      valid: { variant: 'default', label: '✅ HSRP Valid' },
      invalid: { variant: 'destructive', label: '❌ Non-HSRP' },
      unknown: { variant: 'secondary', label: '⚠️ Unknown' },
    };
    const config = variants[status] || variants.unknown;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Live HSRP Detection</h1>
        <p className="text-muted-foreground">Real-time number plate detection using laptop camera</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {demoMode && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            Running in demo mode. Simulated detections will appear randomly. Connect backend for real AI processing.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Camera View */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live Camera Feed</CardTitle>
                  <CardDescription>Point camera at vehicle number plate</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {isProcessing && (
                    <Badge variant="default" className="animate-pulse">
                      <Activity className="w-3 h-3 mr-1" />
                      Processing
                    </Badge>
                  )}
                  {isStreaming && (
                    <Badge variant="outline">
                      {fps} FPS
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Detection Overlay */}
                {currentDetection && currentDetection.boundingBox && (
                  <div
                    className="absolute border-4 rounded"
                    style={{
                      left: `${currentDetection.boundingBox.x * 100}%`,
                      top: `${currentDetection.boundingBox.y * 100}%`,
                      width: `${currentDetection.boundingBox.width * 100}%`,
                      height: `${currentDetection.boundingBox.height * 100}%`,
                      borderColor: currentDetection.hsrpStatus === 'valid' ? '#22C55E' : '#EF4444',
                    }}
                  >
                    <div className="absolute -top-20 left-0 bg-background/90 backdrop-blur-sm p-3 rounded-lg border border-border min-w-[200px]">
                      <p className="font-bold text-lg mb-1">{currentDetection.plateNumber}</p>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(currentDetection.hsrpStatus)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {currentDetection.confidence.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}

                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Camera not active</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                {!isStreaming ? (
                  <Button onClick={startCamera} className="flex-1">
                    <Video className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <Button onClick={stopCamera} variant="destructive" className="flex-1">
                    <VideoOff className="w-4 h-4 mr-2" />
                    Stop Camera
                  </Button>
                )}
                <Button
                  onClick={captureScreenshot}
                  variant="outline"
                  disabled={!isStreaming}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Screenshot
                </Button>
                <Button variant="outline" disabled={!isStreaming}>
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detection Log */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Detection Log</CardTitle>
              <CardDescription>Recent detections</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {detections.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No detections yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start camera to begin detection
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detections.map((detection) => (
                      <div
                        key={detection.id}
                        className="border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(detection.hsrpStatus)}
                            <span className="font-bold">{detection.plateNumber}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {detection.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          {getStatusBadge(detection.hsrpStatus)}
                          <span className="text-xs text-muted-foreground">
                            {detection.confidence.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>AI pipeline and backend connection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-4">
            <div className="flex items-center justify-between border border-border rounded-lg p-3">
              <span className="text-sm">Camera</span>
              <Badge variant={isStreaming ? 'default' : 'secondary'}>
                {isStreaming ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between border border-border rounded-lg p-3">
              <span className="text-sm">YOLOv8</span>
              <Badge variant={demoMode ? 'secondary' : 'default'}>
                {demoMode ? 'Demo' : 'Active'}
              </Badge>
            </div>
            <div className="flex items-center justify-between border border-border rounded-lg p-3">
              <span className="text-sm">OCR Engine</span>
              <Badge variant={demoMode ? 'secondary' : 'default'}>
                {demoMode ? 'Demo' : 'Active'}
              </Badge>
            </div>
            <div className="flex items-center justify-between border border-border rounded-lg p-3">
              <span className="text-sm">HSRP CNN</span>
              <Badge variant={demoMode ? 'secondary' : 'default'}>
                {demoMode ? 'Demo' : 'Active'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
