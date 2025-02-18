import React, { forwardRef } from 'react';
import logo from '../assets/images/stayscan-logo.jpg';
import Image from 'next/image';
import { DialogTitle, DialogDescription } from '@radix-ui/react-dialog';


interface QRScannerGuideProps {
  qrcode: string;
  propertyName: string;
}

const QRScannerGuide = forwardRef<HTMLDivElement, QRScannerGuideProps>(
  ({ qrcode, propertyName }, ref) => {

  return (
    <div ref={ref} className="max-w-[100%] text-center bg-white p-4 rounded">
      <DialogTitle className="text-emerald-600 text-2xl font-bold mb-2">
        SCAN ME NOW  
      </DialogTitle>
      
      <div className="mb-4">
        <h2 className="text-xl mb-1 text-emerald-600 font-bold">{propertyName}</h2>
        <DialogDescription className="text-emerald-600 text-sm mb-2 font-bold">Your Digital Guide Awaits</DialogDescription>
        <p className="text-gray-600 text-sm">
          WiFi Access • House Rules • Local Attractions • More
        </p>
      </div>

      <div className="border-2 border-gray-200 mb-6 mx-auto w-64 h-64">
        <img 
          src={qrcode}
          alt="QR Code"
          className="w-full h-full"
        />
      </div>

      <div className="flex justify-between max-w-xs mx-auto">
        <div className="text-center">
          <div className="w-8 h-8 bg-emerald-600 rounded-full text-white flex items-center justify-center mx-auto mb-2">
            1
          </div>
          <p className="text-xs text-gray-600">Open your camera</p>
        </div>
        
        <div className="text-center">
          <div className="w-8 h-8 bg-emerald-600 rounded-full text-white flex items-center justify-center mx-auto mb-2">
            2
          </div>
          <p className="text-xs text-gray-600">Scan QR code</p>
        </div>
        
        <div className="text-center">
          <div className="w-8 h-8 bg-emerald-600 rounded-full text-white flex items-center justify-center mx-auto mb-2">
            3
          </div>
          <p className="text-xs text-gray-600">Access guide</p>
        </div>
      </div>

      <div className="mt-6 text-gray-400 text-xs flex justify-center items-center gap-2">
        <span>Powered by</span> <img className='w-[20px] h-[20px] rounded-full' src={logo.src} alt="logo" />  <span className="text-gray-500">Stayscan.tech</span>
      </div>
    </div>
  );
});

export default QRScannerGuide;