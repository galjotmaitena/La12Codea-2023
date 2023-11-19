import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaisesService {

  ruta : string;

  constructor() 
  { 
    this.ruta = 'https://restcountries.com/v3.1/all';
  }

  traerPaises()
  {
    return fetch(this.ruta).then(response => response.json());
  }
}
