import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isPickerOpen = false;
  email = '';
  clave = '';
  mostrarSpinner = false;
  mensajeError = '';
  usuarios: any[] = [];
  duenios: any[] = [];
  observableUsuario:any;
  observableDuenios:any;

  constructor(private firestore: Firestore, private router: Router, private auth: AuthService) { }

  ngOnInit()
  {
    this.observableUsuario = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      this.usuarios = data;
    });

    this.observableDuenios = FirestoreService.traerFs('duenios', this.firestore).subscribe((data)=>{
      this.duenios = data;
    });
  }

  ngOnDestroy()
  {
    this.observableUsuario.unsubscribe();
    this.observableDuenios.unsubscribe();
  }

  ingresar()
  {
    this.mostrarSpinner = true;
    this.auth.login(this.email, this.clave)
      ?.then(response =>
      {
        let user:any;
        let duenio:any;

        this.usuarios.forEach((u)=>{
          if(u.email === this.email)
          {
            user = u;
          }
        });

        this.duenios.forEach((u)=>{
          if(u.email === this.email)
          {
            duenio = u;
          }
        });

        if(user)
        {
          if(user.tipo === 'anonimo')
          {
            this.auth.mostrarToastExito('Ingresando...');
            this.email = '';
            this.clave = '';
            setTimeout(()=>{
              this.mostrarSpinner = false;
              this.router.navigate(['/home']);
            }, 2000);
          }
          else
          {
            if(user.aprobado == 'espera')
            {
              this.auth.mostrarToastError('Su usuario se encuentra en evaluación');
              this.auth.logout();
            }
            else
            {
              if(!user.aprobado)
              {
                this.auth.mostrarToastError('Su usuario ha sido rechazado');
                this.auth.logout();
              }
              else
              {
                this.auth.mostrarToastExito('Ingresando...');
                this.email = '';
                this.clave = '';
                setTimeout(()=>{
                  this.mostrarSpinner = false;
                  this.router.navigate(['/home']);
                }, 2000);
              }
            }
          }
        }
        else
        {
          if(duenio)
          {
            this.auth.mostrarToastExito('Ingresando...');
            this.email = '';
            this.clave = '';
            setTimeout(()=>{
              this.mostrarSpinner = false;
              this.router.navigate(['/home-duenio']);
            }, 2000);
          }
        }
      })
      .catch(error =>
      {
        setTimeout(()=>{
          console.log(error);
          this.mostrarSpinner = false;
          switch(error.code)
          {
            case 'auth/invalid-email':
              this.mensajeError =  "email inválido.";
            break;
            case 'auth/missing-password':
              this.mensajeError = "Contraseña inválida.";
            break;
            case 'auth/invalid-login-credentials':
              this.mensajeError = 'email y/o contraseña incorrectos.';
            break;
          }
          this.auth.mostrarToastError(this.mensajeError);
          console.log(error);
        }, 2000);
      });
  }

  cambiarUsuario(usuarioElegido: string)
  {
    switch(usuarioElegido)
    {
      case 'admin':
        this.email = 'admin@admin.com';
        this.clave = '111111'; 
      break;
      case 'invitado':
        this.email = 'invitado@invitado.com';
        this.clave = '222222'; 
      break;
      case 'usuario':
        this.email = 'usuario@usuario.com';
        this.clave = '333333'; 
      break;
      case 'tester':
        this.email = 'tester@tester.com';
        this.clave = '555555'; 
      break;
      case 'anonimo':
        this.email = 'anonimo@anonimo.com';
        this.clave = '444444'; 
      break;
    }
  }  

  public pickerColumns = [
    {
      name: 'usuarios',
      options: [
        {
          text: 'Administrador',
          value: 'admin',
        },
        {
          text: 'Invitado',
          value: 'invitado',
        },
        {
          text: 'Usuario',
          value: 'usuario',
        },
        {
          text: 'Anonimo',
          value: 'anonimo',
        },
        {
          text: 'Tester',
          value: 'tester',
        }
      ]
    },
  ];

  public pickerButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
    },
    {
      text: 'Confirmar',
      handler: (value:any) => {
        this.cambiarUsuario(value.usuarios.value);
        console.log(`You selected: ${value.usuarios.value}`);
      },
    },
  ];

  setOpen(isOpen: boolean) {
    this.isPickerOpen = isOpen;
  }

  limpiarCampos()
  {
    this.email = '';
    this.clave = '';
  }
}
