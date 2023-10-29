import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  email = '';

  constructor(private auth: Auth) {}

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

  async signup(email: string, password: string)
  {
    let retorno;

    try
    {
      retorno = createUserWithEmailAndPassword(this.auth, email, password);
    }
    catch(error)
    {
      console.log("Error en register: ", error);
      retorno = null;
    }

    return retorno;
  }

  get_email()
  {
    return this.email;
  }
}
