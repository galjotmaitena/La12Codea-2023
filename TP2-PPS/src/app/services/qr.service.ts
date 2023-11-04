import { Injectable } from '@angular/core';
import * as QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class QrService 
{
  constructor() { }

  generarCodigoQR(json:any) 
  {
    let ret = null;

    QRCode.toDataURL(json, (err, url) => 
    {
      if(err) 
      {
        console.error('Error al generar el código QR', err);
      } 
      else 
      {
        ret = url;
      }
    });

    return ret;
  }
}
