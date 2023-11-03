import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.page.html',
  styleUrls: ['./ingreso.page.scss'],
})
export class IngresoPage implements OnInit {

  opiniones : any[] = ['buen servicio', 'la comida muy rica'];

  constructor() { }

  ngOnInit() {}

}
