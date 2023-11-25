import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth.service';
import { ActionSheetController } from '@ionic/angular';
import { PushService } from '../../../services/push.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-metres',
  templateUrl: './home-metres.page.html',
  styleUrls: ['./home-metres.page.scss'],
})
export class HomeMetresPage implements OnInit {

  ///////////////////METRES
  listaEspera : any[] = [];
  listaMesas : any[] = [];
  metres: any[] = [];
  observableEspera : any;
  observableMesas : any;
  observableEmpleados:any;
  clienteEspera : any = '';
  mesa : any = '';
  mostrarSpinner = false;

  presentingElement:any;
  
  abierta = false;

  user = this.authService.get_user();
  metre : any;

  constructor(private firestore : Firestore, private authService : AuthService, private actionSheetCtrl: ActionSheetController, private push: PushService, private router: Router) { }

  ngOnInit() 
  {
    this.observableEmpleados = FirestoreService.traerFs('empleados', this.firestore).subscribe((data)=>{
      this.metres = [];

      data.forEach(m  => {
        if(m.tipoEmpleado === 'metre')
        {
          this.metres.push(m);

          if(m.email === this.user?.email)
          {
            this.metre = m;
          }
        }
      });
    });

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
      this.listaMesas = [];
      data.forEach(mesa => {
        if(!mesa.ocupada)
        {
          this.listaMesas.push(mesa);
        }
      });
    });

    this.presentingElement = document.querySelector('.ion-page');
    
  }

  ngOnDestroy()
  {
    this.observableEspera.unsubscribe();
    this.observableMesas.unsubscribe();
  }


  //#region METRES
  asignarMesas()
  {
    this.mostrarSpinner = true;
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
                this.mostrarSpinner = false;
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

  cerrar()
  {
    this.listaMesas = [];
    this.abierta = false;
  }

  salir()
  {
    this.mostrarSpinner = true;
    let usuario:any;

    this.metres.forEach((u:any) => {
      if(this.authService.get_user()?.email === u.email)
      {
        usuario = u;
      }
    });

    this.authService.logout()?.then(()=>{
      this.push.cierreSesion(usuario, 'empleados');
      this.router.navigateByUrl('login');
      this.mostrarSpinner = false;
    })
    .catch((err)=>{
      alert(JSON.stringify(err));
    });
  }

  irA(path: string)
  {
    this.mostrarSpinner = true;
    setTimeout(()=>{
      this.router.navigateByUrl(path);
      this.mostrarSpinner = false;
    }, 2500)
  }
}
