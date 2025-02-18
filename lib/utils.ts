import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge";
import DOMPurify from 'dompurify';
import Link from 'next/link';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// export function processText(inputText: string) {
//   const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)|\b(www\.[^\s]+\.[a-z]{2,}|[^\s]+\.(com|io|au|uk|org|net|edu)\b)/gi;
//   const processedText = inputText.replace(markdownLinkPattern, '<a class="text-blue-500 underline" href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
//   return DOMPurify.sanitize(processedText); 
// }


// export function processText(inputText: string): string {
//   // Remove content within square brackets
//   let processedText = inputText.replace(/\[[^\]]*\]/g, '');

//   // Define regex for matching URLs and domains
//   const urlPattern = /\b(https?:\/\/\S+|www\.[^\s]+\.[a-z]{2,}|[^\s]+\.(com|io|net|org|edu|au|uk)\b)/gi;

//   // Replace matched URLs with markdown links
//   processedText = processedText.replace(urlPattern, (match) => {
//     // Ensure the URL has a protocol
//     const href = match.startsWith('http') ? match : `https://${match}`;

//     return `<a class="text-blue-500 underline" href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
//   });

//   // Sanitize the processed text
//   return DOMPurify.sanitize(processedText);
// }

export function processText(inputText: string): string {
  // Remove content within square brackets
  let processedText = inputText.replace(/\[[^\]]*\]/g, '');

  // Remove parentheses around URLs
  processedText = processedText.replace(/\((\b(https?:\/\/\S+|www\.[^\s]+\.[a-z]{2,}|[^\s]+\.(com|io|net|org|edu|au|uk)\b))\)/gi, '$1');

  // Define regex for matching URLs and domains
  const urlPattern = /\b(https?:\/\/\S+|www\.[^\s]+\.[a-z]{2,}|[^\s]+\.(com|io|net|org|edu|au|uk)\b)/gi;

  // Replace matched URLs with markdown links
  processedText = processedText.replace(urlPattern, (match) => {
    // Ensure the URL has a protocol
    const href = match.startsWith('http') ? match : `https://${match}`;

    return `<a style="word-wrap: break-word;" class="text-blue-500 underline" href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
  });

  // Sanitize the processed text
  return DOMPurify.sanitize(processedText);
}