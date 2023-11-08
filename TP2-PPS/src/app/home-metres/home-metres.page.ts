import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { ActionSheetController } from '@ionic/angular';
import { PushService } from '../services/push.service';

@Component({
  selector: 'app-home-metres',
  templateUrl: './home-metres.page.html',
  styleUrls: ['./home-metres.page.scss'],
})
export class HomeMetresPage implements OnInit {

  listaEspera : any[] = [];
  listaMesas : any[] = [];
  clienteEspera : any = '';
  mesa : any = '';
  observableEspera : any;
  observableMesas : any;
  
  abierta = false;
  constructor(private firestore : Firestore, private authService : AuthService, private actionSheetCtrl: ActionSheetController, private push: PushService) { }

  ngOnInit() 
  {
    this.observableEspera = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      this.listaEspera = [];
      data.forEach(cliente => {
        if(cliente.espera)
        {
          this.listaEspera.push(cliente);
        }
      });
    });

    this.observableMesas = FirestoreService.traerFs('mesas', this.firestore).subscribe((data)=>{
      data.forEach(mesa => {
        if(!mesa.ocupada)
        {
          this.listaMesas.push(mesa);
        }
      });
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
      if((cliente.dni === parseInt(this.clienteEspera.dni) || cliente.nombre === this.clienteEspera.nombre) && cliente.mesa === '')          ///////busco por nombre     DNI
      {
        this.listaMesas.forEach(mesa => {
          if(this.mesa === mesa.numero && mesa.ocupada === false)
          {
            mesa.ocupada = true;

            FirestoreService.actualizarFs('mesas', mesa, this.firestore).then(()=>{
              cliente.mesa = this.mesa;    
              
              cliente.espera = false;

              FirestoreService.actualizarFs('clientes', cliente, this.firestore).then(()=>{
                this.authService.mostrarToastExito(`Mesa ${this.mesa} asignada con exito!`);

                this.listaEspera = [];
              });

              this.listaMesas=[];
            });
          }
        });
      }
    });
  }

  getMesa(mesa : any)
  {
    this.abierta = false;
    this.mesa = mesa;
  }

  getCliente(cliente : any)
  {
    this.clienteEspera = cliente;
    this.abierta = true;
  }
}
