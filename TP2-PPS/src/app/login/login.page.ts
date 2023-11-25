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
  empleados: any[] = [];
  observableUsuario:any;
  observableDuenios:any;
  observableEmpleados:any;

  constructor(private firestore: Firestore, private router: Router, private auth: AuthService) { }

  ngOnInit()
  {
    this.observableUsuario = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      this.usuarios = data;
    });

    this.observableDuenios = FirestoreService.traerFs('duenios', this.firestore).subscribe((data)=>{
      this.duenios = data;
    });

    this.observableEmpleados = FirestoreService.traerFs('empleados', this.firestore).subscribe((data)=>{
      this.empleados = data;
    });
  }

  ngOnDestroy()
  {
    this.observableUsuario.unsubscribe();
    this.observableDuenios.unsubscribe();
  }

  ingresar()
  {
    let audio = document.getElementById('audio') as HTMLAudioElement;
    this.mostrarSpinner = true;
    this.auth.login(this.email, this.clave)
      ?.then(response =>
      {
        let user:any;
        let duenio:any;
        let empleado:any;

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

        this.empleados.forEach((e)=>{
          if(e.email === this.email)
          {
            empleado = e;
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
              audio?.play();
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
                  audio?.play();
                  this.router.navigate(['/homeClientes']);
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
              audio?.play();
              this.router.navigate(['/home-duenio']);
            }, 2000);
          }
          else
          {
            if(empleado)/////////////////////////
            {
              this.auth.mostrarToastExito('Ingresando...');
                this.email = '';
                this.clave = '';
                setTimeout(()=>{
                  this.mostrarSpinner = false;
                  audio?.play();
                  this.router.navigate(['/home']);
                }, 2000);
              
            }
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

  ingresarAnonimo()
  {
    this.auth.loginAnonimo()?.then((data)=>{
      FirestoreService.guardarFs('clientes', {perfil: 'anonimo', uid: data.user.uid, nombre: this.generarNombreUnico(), mesa: '', espera: false, foto: 'https://firebasestorage.googleapis.com/v0/b/tp-pps-dbd3e.appspot.com/o/usuario.png?alt=media&token=c9af6319-9006-434e-9653-ab0fa1baef9d'}, this.firestore);
      this.router.navigateByUrl('homeClientes');
    });
  }

  generarNombreUnico(): string {
    let nuevoNombre: string;
    do {
      nuevoNombre = 'anonimo_' + Math.floor(Math.random() * 1000);
    } while (this.nombreExistente(nuevoNombre));

    return nuevoNombre;
  }

  nombreExistente(nombre: string): boolean {
    return this.usuarios.some((cliente) => cliente.nombre === nombre);
  }

  cambiarUsuario(usuarioElegido: string)
  {
    switch(usuarioElegido)
    {
      case 'admin':
        this.email = 'gal@gal.com';
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
