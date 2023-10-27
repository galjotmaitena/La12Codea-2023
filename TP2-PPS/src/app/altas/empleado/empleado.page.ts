import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-empleado',
  templateUrl: './empleado.page.html',
  styleUrls: ['./empleado.page.scss'],
})
export class EmpleadoPage implements OnInit {

  nombre = '';
  apellido = '';
  dni = 0;
  cuil = 0;
  
  constructor() { }

  ngOnInit() {
  }

}
