import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-home-metres',
  templateUrl: './home-metres.page.html',
  styleUrls: ['./home-metres.page.scss'],
})
export class HomeMetresPage implements OnInit {

  listaEspera : any[] = [];
  listaMesas : any[] = [];
  clienteEspera : string = '';
  mesa : string = '';
  observableEspera : any;
  observableMesas : any;
  
  abierta = false;
  constructor(private firestore : Firestore, private authService : AuthService, private actionSheetCtrl: ActionSheetController) { }

  ngOnInit() 
  {
    this.observableEspera = FirestoreService.traerFs('listaEspera', this.firestore).subscribe((data)=>{
      this.listaEspera = data;

    });
    this.observableMesas = FirestoreService.traerFs('mesas', this.firestore).subscribe((data)=>{
      data.forEach(mesa => {
        if(!mesa.ocupada)
        {
          this.listaMesas.push(mesa);
        }
      });
      this.listaMesas.push({'numero':1}, {'numero':2}, {'numero':3});

    });
  }

  ngOnDestroy()
  {
    this.observableEspera.unsubscribe();
    this.observableMesas.unsubscribe();
  }

  asignarMesas()
  {
    this.listaEspera.forEach(cliente => {
      if(cliente.dni === parseInt(this.clienteEspera) && cliente.mesa === '')          ///////busco por nombre     DNI
      {
        this.listaMesas.forEach(mesa => {
          if(parseInt(this.mesa) === mesa.numero && mesa.ocupada === false)
          {
            mesa.ocupada = true;
            FirestoreService.actualizarFs('mesas', mesa, this.firestore).then(()=>{
              cliente.mesa = this.mesa;         /////////update cliente n° mesa y mesa ocupada true
              FirestoreService.actualizarFs('clientes', cliente, this.firestore).then(()=>{
                this.authService.mostrarToastExito(`Mesa ${this.mesa} asignada con exito!`);
              });
            });
          }
        });
      }
    });
  }

  prueba(obj : any)
  {
    console.log(obj);
  }

  getMesa(mesa : string)
  {
    this.abierta = false;
    this.mesa = mesa;
    console.log(mesa);
  }


}
