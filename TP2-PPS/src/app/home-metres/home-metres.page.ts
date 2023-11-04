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

  constructor(private firestore : Firestore, private authService : AuthService, private actionSheetCtrl: ActionSheetController) { }

  ngOnInit() 
  {
    FirestoreService.traerFs('listaEspera', this.firestore).then((data)=>{
      this.listaEspera = data;
      this.listaEspera.push({'nombre':'tomas', 'apellido':'gauna', 'dni':44457866});

    })
    .catch((error) => 
    {
      console.log("Error al traer los mensajes de fs...");
    });
    FirestoreService.traerFs('mesas', this.firestore).then((data)=>{
      data.forEach(mesa => {
        if(!mesa.ocupada)
        {
          this.listaMesas.push(mesa);
        }
      });
    })
    .catch((error) => 
    {
      console.log("Error al traer los mensajes de fs...");
    });



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



  canDismiss = async () => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Are you sure?',
      buttons: [
        {
          text: 'Yes',
          role: 'confirm',
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    return role === 'confirm';
  };
}
