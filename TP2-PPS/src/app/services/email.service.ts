import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private serviceId = 'service_8d0wrdc';
  private templateId = 'template_i2t5blk';//////////DESPUES ASIGNAR SEGUN EL TEMPLATE QUE NECESITO

  constructor() 
  {
    emailjs.init('KdYKSSM_gb09EeGGA');
  }

  sendEmail(data: any) {
    return emailjs.send(this.serviceId, this.templateId, data);
  }
}
