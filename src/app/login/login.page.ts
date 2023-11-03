import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isPickerOpen = false;
  correo = '';
  clave = '';
  mostrarSpinner = false;
  mensajeError = '';

  constructor(private router: Router, private auth: AuthService, private toastController: ToastController) { }

  ngOnInit(){}

  ingresar()
  {
    this.mostrarSpinner = true;
    this.auth.login(this.correo, this.clave)
      ?.then(response =>
      {
        console.log("redireccionando...");
        this.correo = '';
        this.clave = '';
        setTimeout(()=>{
          this.mostrarSpinner = false;
          this.router.navigate(['/inicio']);
        }, 2000);
        
      })
      .catch(error =>
      {
        setTimeout(()=>{
          console.log(error);
          this.mostrarSpinner = false;
          switch(error.code)
          {
            case 'auth/invalid-email':
              this.mensajeError =  "Correo inválido.";
            break;
            case 'auth/missing-password':
              this.mensajeError = "Contraseña inválida.";
            break;
            case 'auth/invalid-login-credentials':
              this.mensajeError = 'Correo y/o contraseña incorrectos.';
            break;
          }
          this.mostrarError(this.mensajeError);
          console.log(error);
        }, 2000);
      });
  }

  cambiarUsuario(usuarioElegido: string)
  {
    switch(usuarioElegido)
    {
      case 'admin':
        this.correo = 'admin@admin.com';
        this.clave = '111111'; 
      break;
      case 'invitado':
        this.correo = 'invitado@invitado.com';
        this.clave = '222222'; 
      break;
      case 'usuario':
        this.correo = 'usuario@usuario.com';
        this.clave = '333333'; 
      break;
      case 'tester':
        this.correo = 'tester@tester.com';
        this.clave = '555555'; 
      break;
      case 'anonimo':
        this.correo = 'anonimo@anonimo.com';
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
    this.correo = '';
    this.clave = '';
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
    });

    await toast.present();
  }
}
