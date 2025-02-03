import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge";
import DOMPurify from 'dompurify';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function processText(inputText: string) {
  const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g;
  const processedText = inputText.replace(markdownLinkPattern, '<a class="text-blue-500 underline" href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
  return DOMPurify.sanitize(processedText); 
}
