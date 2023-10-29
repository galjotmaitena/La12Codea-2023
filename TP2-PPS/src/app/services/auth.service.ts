import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  email = '';

  constructor(private auth: Auth, private toastController: ToastController) {}

  login(email: string, password: string)
  {
    let ret;

    try
    {
      this.email = email;
      ret = signInWithEmailAndPassword(this.auth, email, password);
    }
    catch(error)
    {
      console.log("Error al loguearse: ", error);

      ret = null;
    }

    return ret;
  }

  logout()
  {
    let ret;

    try
    {
      ret = signOut(this.auth);
    }
    catch(error)
    {
      console.log("Error al desloguarse: ", error);

      ret = null;
    }

    return ret;
  }

  get_email()
  {
    return this.email;
  }

  async mostrarToastError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000, // Duración en milisegundos (3 segundos en este ejemplo)
      color: 'danger', // Color del toast (puedes personalizarlo)
      position: 'bottom', // Posición del toast (puedes cambiarlo)
    });
    toast.present();
  }

  async mostrarToastExito(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000, // Duración en milisegundos (3 segundos en este ejemplo)
      color: 'success', // Color del toast (puedes personalizarlo)
      position: 'bottom', // Posición del toast (puedes cambiarlo)
    });
    toast.present();
  }
}
