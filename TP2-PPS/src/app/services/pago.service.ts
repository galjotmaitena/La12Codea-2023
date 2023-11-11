import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private baseUrl = 'https://api.mercadopago.com/checkout/preferences';
  private accessToken = 'TEST-1249301994362591-111113-cff2f1acbb2b52546ca0b292da4ab9bb-404691086';

  constructor(private http: HttpClient) {}

  obtenerURLPago(producto: any, returnUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`
    });

    const productoConAtributos = {
      ...producto,
      purpose: 'wallet_purchase',
      back_urls: {
        success: returnUrl,
        failure: returnUrl,
        pending: returnUrl
      }
    };

    return this.http.post<any>(this.baseUrl, productoConAtributos, { headers });
  }
}
