declare module 'qrcode' {
    const QRCode: {
      toDataURL(text: string): Promise<string>;
      // Add other methods you're using from the qrcode package
    };
    export default QRCode;
  }