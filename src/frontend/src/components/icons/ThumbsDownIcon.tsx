import { useEffect, useState } from 'react';

interface ThumbsDownIconProps {
  className?: string;
}

export default function ThumbsDownIcon({ className = '' }: ThumbsDownIconProps) {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    fetch('/assets/thumb-down.svg')
      .then(response => response.text())
      .then(svg => {
        // Parse the SVG and inject className
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        const svgElement = doc.querySelector('svg');
        
        if (svgElement) {
          // Preserve original viewBox and attributes
          svgElement.setAttribute('class', className);
          svgElement.setAttribute('aria-hidden', 'true');
          // Ensure currentColor works for fill/stroke
          svgElement.setAttribute('fill', 'currentColor');
          
          setSvgContent(svgElement.outerHTML);
        }
      })
      .catch(err => {
        console.error('Failed to load thumb-down.svg:', err);
        // Fallback to a simple placeholder
        setSvgContent(`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="${className}" aria-hidden="true"><path d="M17 14V6h-2v8h2zm-6 4c.55 0 1-.45 1-1v-3h4V7c0-1.1-.9-2-2-2H8c-.83 0-1.54.5-1.84 1.22l-1.92 4.61c-.08.19-.12.39-.12.59V14c0 .55.45 1 1 1h4.18l-.63 3.02c-.05.24-.02.49.08.71.23.51.74.85 1.33.85.38 0 .74-.21.92-.55L11 18z" fill="currentColor"/></svg>`);
      });
  }, [className]);

  return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
}
