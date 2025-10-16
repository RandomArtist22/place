import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Point } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_SIZE } from '../constants';

interface CanvasProps {
  pixels: string[];
  onPlacePixel: (x: number, y: number) => void;
  isViewMode: boolean;
}

const getDistance = (p1: Point, p2: Point) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
const getMidpoint = (p1: Point, p2: Point) => ({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });

const Canvas: React.FC<CanvasProps> = ({ pixels, onPlacePixel, isViewMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const transform = useRef({ scale: 1, translateX: 0, translateY: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);
  const panStartRef = useRef<Point | null>(null);
  const pinchRef = useRef<{ dist: number; } | null>(null);
  const isInitialTransformSet = useRef(false);
  // FIX: When calling `useRef` without an argument, its `current` property is initialized
  // to `undefined`. The type must therefore include `undefined` to allow this.
  const animationFrameId = useRef<number | undefined>();

  const fitScreenScale = useMemo(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return 0.1;
    const gridWidth = CANVAS_WIDTH * PIXEL_SIZE;
    const gridHeight = CANVAS_HEIGHT * PIXEL_SIZE;
    const scaleX = canvasSize.width / gridWidth;
    const scaleY = canvasSize.height / gridHeight;
    return Math.min(scaleX, scaleY);
  }, [canvasSize]);

  const minScale = useMemo(() => fitScreenScale * 0.5, [fitScreenScale]);
  
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const currentTransform = transform.current;

    context.imageSmoothingEnabled = false;
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();

    context.save();
    context.translate(currentTransform.translateX, currentTransform.translateY);
    context.scale(currentTransform.scale, currentTransform.scale);

    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      for (let x = 0; x < CANVAS_WIDTH; x++) {
        const color = pixels[y * CANVAS_WIDTH + x];
        context.fillStyle = color || '#FFFFFF';
        context.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    }

    if (currentTransform.scale > 5) {
        context.strokeStyle = 'rgba(0,0,0,0.1)';
        context.lineWidth = 1 / currentTransform.scale;
        for (let x = 0; x <= CANVAS_WIDTH; x++) {
            context.beginPath();
            context.moveTo(x * PIXEL_SIZE, 0);
            context.lineTo(x * PIXEL_SIZE, CANVAS_HEIGHT * PIXEL_SIZE);
            context.stroke();
        }
        for (let y = 0; y <= CANVAS_HEIGHT; y++) {
            context.beginPath();
            context.moveTo(0, y * PIXEL_SIZE);
            context.lineTo(CANVAS_WIDTH * PIXEL_SIZE, y * PIXEL_SIZE);
            context.stroke();
        }
    }
    context.restore();
  }, [pixels]);

  const scheduleDraw = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(drawCanvas);
  }, [drawCanvas]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const resizeObserver = new ResizeObserver(() => {
        setCanvasSize({ width: container.clientWidth, height: container.clientHeight });
        isInitialTransformSet.current = false; // Recalculate transform on resize
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0 && !isInitialTransformSet.current) {
        const gridWidth = CANVAS_WIDTH * PIXEL_SIZE;
        const gridHeight = CANVAS_HEIGHT * PIXEL_SIZE;

        const scale = fitScreenScale * 0.95; 

        const translateX = (canvasSize.width - (gridWidth * scale)) / 2;
        const translateY = (canvasSize.height - (gridHeight * scale)) / 2;
        
        transform.current = { scale, translateX, translateY };
        isInitialTransformSet.current = true;
        scheduleDraw();
    }
  }, [canvasSize, fitScreenScale, scheduleDraw]);

  useEffect(() => {
    scheduleDraw();
  }, [pixels, scheduleDraw]);

  const getCanvasPoint = (clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const currentTransform = transform.current;
    return {
      x: (clientX - rect.left - currentTransform.translateX) / currentTransform.scale,
      y: (clientY - rect.top - currentTransform.translateY) / currentTransform.scale,
    };
  };

  const placePixelAtCoords = (clientX: number, clientY: number) => {
    if (isViewMode) return;
    const point = getCanvasPoint(clientX, clientY);
    const x = Math.floor(point.x / PIXEL_SIZE);
    const y = Math.floor(point.y / PIXEL_SIZE);

    if (x >= 0 && x < CANVAS_WIDTH && y >= 0 && y < CANVAS_HEIGHT) {
      onPlacePixel(x, y);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
        panStartRef.current = { x: e.clientX, y: e.clientY };
        setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (panStartRef.current && lastPanPoint) {
        if (!isPanning) {
            const dist = getDistance(panStartRef.current, { x: e.clientX, y: e.clientY });
            if (dist > 5) {
                setIsPanning(true);
            }
        }

        if (isPanning) {
            const dx = e.clientX - lastPanPoint.x;
            const dy = e.clientY - lastPanPoint.y;
            transform.current.translateX += dx;
            transform.current.translateY += dy;
            scheduleDraw();
            setLastPanPoint({ x: e.clientX, y: e.clientY });
        }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 0 && panStartRef.current) {
        if (!isPanning) {
            placePixelAtCoords(e.clientX, e.clientY);
        }
    }
    setIsPanning(false);
    panStartRef.current = null;
    setLastPanPoint(null);
  };
  
  const handleMouseLeave = (e: React.MouseEvent) => {
      if(panStartRef.current) {
          handleMouseUp(e);
      }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const scaleDelta = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const oldTransform = transform.current;
    const newScale = Math.max(minScale, Math.min(oldTransform.scale * scaleDelta, 30));
    const newTranslateX = mouseX - (mouseX - oldTransform.translateX) * (newScale / oldTransform.scale);
    const newTranslateY = mouseY - (mouseY - oldTransform.translateY) * (newScale / oldTransform.scale);
    
    transform.current = { scale: newScale, translateX: newTranslateX, translateY: newTranslateY };
    scheduleDraw();
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
        panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setLastPanPoint(panStartRef.current);
    } else if (e.touches.length === 2) {
        panStartRef.current = null;
        const p1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        const p2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
        pinchRef.current = { dist: getDistance(p1, p2) };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && lastPanPoint) {
        const touch = e.touches[0];
        const dx = touch.clientX - lastPanPoint.x;
        const dy = touch.clientY - lastPanPoint.y;
        transform.current.translateX += dx;
        transform.current.translateY += dy;
        scheduleDraw();
        setLastPanPoint({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 2 && pinchRef.current) {
        const p1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        const p2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
        const newDist = getDistance(p1, p2);
        const midPoint = getMidpoint(p1, p2);
        const scale = newDist / pinchRef.current.dist;

        const rect = canvasRef.current!.getBoundingClientRect();
        const mouseX = midPoint.x - rect.left;
        const mouseY = midPoint.y - rect.top;
        
        const oldTransform = transform.current;
        const newScale = Math.max(minScale, Math.min(oldTransform.scale * scale, 30));
        const newTranslateX = mouseX - (mouseX - oldTransform.translateX) * (newScale / oldTransform.scale);
        const newTranslateY = mouseY - (mouseY - oldTransform.translateY) * (newScale / oldTransform.scale);
        
        transform.current = { scale: newScale, translateX: newTranslateX, translateY: newTranslateY };
        scheduleDraw();
        pinchRef.current.dist = newDist;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (panStartRef.current && lastPanPoint) {
        const distMoved = getDistance(panStartRef.current, lastPanPoint);
        if (distMoved < 10) {
            placePixelAtCoords(panStartRef.current.x, panStartRef.current.y);
        }
    }
    if (e.touches.length < 2) pinchRef.current = null;
    if (e.touches.length < 1) {
        panStartRef.current = null;
        setLastPanPoint(null);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full touch-none">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={`bg-gray-800 block ${
          isViewMode ? 'cursor-grab' : (isPanning ? 'cursor-grabbing' : 'cursor-crosshair')
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};

export default Canvas;