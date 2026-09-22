import React, { useEffect, useRef } from 'react';
import { Game } from '../../../types/game';
import { formatShortDate } from '../../../utils/dateUtils';
import { TimelineGraphPoint } from '../../../hooks/useTimelineData';

interface TimelineCanvasProps {
  game: Game;
  graphData: TimelineGraphPoint[];
  hasActivities: boolean;
  isNotStarted: boolean;
}

export default function TimelineCanvas({ game, graphData, hasActivities, isNotStarted }: TimelineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getAccentPrimaryColor = () => {
    const style = getComputedStyle(document.documentElement);
    const accentPrimary = style.getPropertyValue('--accent-primary').trim();
    return `rgb(${accentPrimary})`;
  };

  useEffect(() => {
    if (!canvasRef.current || !game) return;
    
    const isEmptyGraph = isNotStarted || !hasActivities;
    
    if (graphData.length === 0 && !isEmptyGraph) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const margin = { top: 10, right: 20, bottom: 30, left: 30 };
    const width = rect.width - margin.left - margin.right;
    const height = rect.height - margin.top - margin.bottom;

    let maxHoursFromData = 0;
    if (graphData.length > 0) {
      maxHoursFromData = Math.max(...graphData.map(point => point.hours));
    }
    
    const currentHours = game.HoursPlayed || 0;
    const maxHours = Math.max(currentHours, maxHoursFromData, 10);

    const getHourScale = (max: number) => {
      if (max <= 10) return [0, 2, 4, 6, 8, 10];
      if (max <= 20) return [0, 5, 10, 15, 20];
      if (max <= 40) return [0, 10, 20, 30, 40];
      if (max <= 60) return [0, 15, 30, 45, 60];
      if (max <= 100) return [0, 25, 50, 75, 100];
      const step = Math.ceil(max / 4 / 5) * 5;
      return [0, step, 2 * step, 3 * step, 4 * step];
    };
    
    const hourValues = getHourScale(maxHours);
    const actualMaxHours = hourValues[hourValues.length - 1];    
    
    hourValues.forEach((hours, i) => {
      const y = margin.top + height - (i * (height / (hourValues.length - 1)));
      
      ctx.strokeStyle = "rgb(var(--text-secondary));";
      ctx.lineWidth = 0.5;
      
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width + margin.left, y);
      ctx.stroke();

      if (hours > 0) {
        ctx.fillStyle = "rgb(var(--text-secondary))";
        ctx.font = "11px var(--font-secondary)";
        ctx.textAlign = "right";
        ctx.fillText(`${hours}h`, margin.left - 5, y + 3);
      }
    });
    
    const axisColor = "rgb(var(--text-secondary));";
    
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + height);
    ctx.stroke();      
    
    ctx.strokeStyle = axisColor;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + height);
    ctx.lineTo(margin.left + width, margin.top + height);
    ctx.stroke();
    
    ctx.strokeStyle = axisColor;
    ctx.beginPath();
    ctx.moveTo(margin.left + width, margin.top);
    ctx.lineTo(margin.left + width, margin.top + height);
    ctx.stroke();
    
    ctx.strokeStyle = axisColor;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left + width, margin.top);
    ctx.stroke();
    
    if (!isEmptyGraph && graphData.length > 0) {
      ctx.strokeStyle = getAccentPrimaryColor();
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const xScale = width / Math.max(graphData.length - 1, 1);

      graphData.forEach((point, i) => {
        const x = margin.left + i * xScale;
        const y = margin.top + height - (point.hours / actualMaxHours * height);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      if (graphData.length > 1) {
        graphData.forEach((point, i) => {
          const x = margin.left + i * xScale;
          const y = height + margin.top + 15;
          
          const previousPoint = i > 0 ? graphData[i-1] : undefined;
          const previousDate = previousPoint ? previousPoint.date : undefined;
          const isLastPoint = i === graphData.length - 1;
          
          ctx.fillStyle = "rgb(var(--text-secondary))";
          ctx.font = "11px var(--font-secondary)";
          ctx.textAlign = "center";
          
          const formattedDate = formatShortDate(point.date, previousDate, isLastPoint);
          
          if (formattedDate.includes('\n')) {
            const [datePart, yearPart] = formattedDate.split('\n');
            
            ctx.fillText(datePart, x, y);
            ctx.fillText(yearPart, x, y + 15);
          } else {
            ctx.fillText(formattedDate, x, y);
          }
        });
      }      
      
      graphData.forEach((point, i) => {
        const x = margin.left + i * xScale;
        const y = margin.top + height - (point.hours / actualMaxHours * height);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI); 
        ctx.fillStyle = getAccentPrimaryColor();
        ctx.fill();
      });
    } else if (isEmptyGraph) {
      ctx.fillStyle = "rgb(var(--text-secondary))";
      ctx.font = "14px var(--font-secondary)";
      ctx.textAlign = "center";
      
      const centerX = margin.left + width / 2;
      const centerY = margin.top + height / 2;
      
      if (isNotStarted) {
        ctx.fillText("Gioco non ancora iniziato", centerX, centerY);
      } else {
        ctx.fillText("Nessun dato di gioco disponibile", centerX, centerY);
      }
    }
  }, [hasActivities, isNotStarted, graphData, game]);

  return <canvas ref={canvasRef} className="w-full h-full timeline-canvas"></canvas>;
}
