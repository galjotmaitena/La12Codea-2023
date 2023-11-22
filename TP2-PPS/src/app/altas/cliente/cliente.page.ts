import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { PushService } from 'src/app/services/push.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.page.html',
  styleUrls: ['./cliente.page.scss'],
})
export class ClientePage {
  form: FormGroup;
  urlFoto : any = 'assets/perfil.png';
  abierta = false;
  fotoCapturada:any = null;
  toast = false;
  mensaje = '';

  nombre = '';
  apellido = '';
  dni:any;
  email = '';
  clave = '';
  rClave = '';
  perfil = '';

  duenios:any[] = [];
  clientes:any[] = [];

  constructor(private angularFirestorage: AngularFireStorage, private auth: AuthService, private formBuilder: FormBuilder, private firestore: Firestore, private push: PushService, private router : Router) 
  {
    FirestoreService.traerFs('duenios', firestore).subscribe((data)=>{
      this.duenios = data;
    });

    FirestoreService.traerFs('clientes', firestore).subscribe((data)=>{
      this.clientes = data;
    });

    this.form = this.formBuilder.group(
      {
        nombre: ['', [Validators.required, this.letrasValidator()]],
        apellido: ['', [Validators.required, this.letrasValidator()]],
        dni: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        email: ['', [Validators.required, Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/), Validators.email]],
        clave: ['', [Validators.required, Validators.minLength(6)]],
        rClave: ['', [Validators.required, Validators.minLength(6)]],
        perfil: ['', [Validators.required]]
      },
      {
        validator: this.passwordMatchValidator,
      }
    );
  }

  ngOnDestroy(): void 
  {
    this.stopScan();
  }

  async sacarFoto()
  {
    try
    {
      this.fotoCapturada = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 100,
        webUseInput: true,
      });
      
      this.urlFoto = this.fotoCapturada.dataUrl;
    }
    catch(error)
    {
      console.error('error: ' + error);
    }
  }

  async checkPermission()
  {
    let ret = false;
    try
    {
      const status = await BarcodeScanner.checkPermission({force: true});
      if(status.granted)
      {
        ret = true;
      }
    }
    catch(error)
    { 
     alert(error);
    }

    return ret;
  }

  async startScan()
    {
      try
      {
        const permission = await this.checkPermission();
        if(!permission)
        {
          return;
        }

        this.abierta = true;
        await BarcodeScanner.hideBackground();
        document.querySelector('body')?.classList.add('scanner-active');
        const result = await BarcodeScanner.startScan();
        if(result?.hasContent)
        {
          this.rellenarInputs(result.content);
          BarcodeScanner.showBackground();
          document.querySelector('body')?.classList.add('scanner-active');
          this.abierta = false;
        }
      }
      catch(error)
      {
        alert(error);
        this.stopScan();
      }
  }

  async stopScan()
    {
      BarcodeScanner.showBackground();
      BarcodeScanner.stopScan();
      document.querySelector('body')?.classList.remove('scanner-active');
  }

  capitalizeFirstLetter(input: string): string 
  {
    const words = input.split(' ');
    const capitalizedWords = words.map(word => {
      if (word.length === 0) {
        return '';
      }
      const firstLetter = word[0].toUpperCase();
      const restOfTheWord = word.slice(1).toLowerCase();
      return firstLetter + restOfTheWord;
    });
    return capitalizedWords.join(' ');
  }

  rellenarInputs(string: string)
  {
    let array = string.split("@");

    if(array.length === 9)
    {
      this.apellido = this.capitalizeFirstLetter(array[1]);
      this.nombre = this.capitalizeFirstLetter(array[2]);
      this.dni = parseInt(array[4]);
    }
    else
    {
      this.apellido = this.capitalizeFirstLetter(array[4]);
      this.nombre = this.capitalizeFirstLetter(array[5]);
      this.dni = parseInt(array[1]);
    }
  }

  noWhitespaceValidator(): ValidatorFn 
  {
    return (control: AbstractControl): { [key: string]: any } | null => 
    {
      if (control.value && control.value.trim() === '') 
      {
        return { 'whitespace': true };
      }
      return null;
    };
  }

  letrasValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value) {
        const trimmedValue = value.trim();
        if (!/^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/.test(trimmedValue)) {
          return { 'invalido': true };
        }
      }
      return null;
    };
  }

  subir(obj:any)
  {
    try
    {
      const fecha = new Date().getTime();
      const storage = getStorage();
      const nombre = this.dni != '' ? `clientes/${this.nombre.replace(" ", "_")}_${this.dni}_${fecha}` : `clientes/${this.nombre.replace(" ", "_")}_${fecha}`;
      const storageRef = ref(storage, nombre);
      //this.mostrarSpinner = true;
      uploadString(storageRef as any, this.fotoCapturada.dataUrl as any, 'data_url')
      .then(()=>{
        const urlPromise = this.angularFirestorage.ref(nombre).getDownloadURL().toPromise();
        urlPromise.then((url: any) => 
        {
          //this.mostrarSpinner = false;
          let obj_ = {...obj, foto: url};
          FirestoreService.guardarFs('clientes', obj_, this.firestore);
        });
      });
    }
    catch
    {
      this.auth.mostrarToastError("Error al subir la foto...");
    }
  }

  guardar()
  {
    let obj:any;

    if(this.form.valid && this.fotoCapturada != null)
    {
      if(this.perfil != '')
      {
        if(this.perfil === 'anonimo')
        {
          obj = {nombre: this.nombre, perfil: this.perfil, mesa: '', espera: false, descuento: 0, propina: 0, encuesta: false};
        }
        else
        {
          obj = {nombre: this.nombre, apellido: this.apellido, dni: this.dni, email: this.email, perfil: this.perfil, aprobado: 'espera', mesa: '', espera : false, encuesta: false, descuento: 0, propina: 0};
          this.auth.signup(this.email, this.clave)
          .catch((error)=>{
            if(error === 'auth/email-already-in-use')
            {
              this.auth.mostrarToastError('El correo electrónico ya se encuentra en uso.');
            }
          });
        }

        this.subir(obj);
        this.auth.mostrarToastExito('Alta realizada con exito.');
        this.urlFoto = 'assets/perfil.png';
        this.fotoCapturada = null;
        this.nombre = '';
        this.apellido = '';
        this.dni = '';
        this.email = '';
        this.clave = '';
        this.perfil = '';

        this.duenios.forEach((d) => {
          this.push.sendPush('Alta cliente - La12Codea', "¡Se ha registrado un nuevo cliente!", d);
        });
      }
      else
      {
        this.auth.mostrarToastError('¡Debe elegir un perfil!');
      }
    }
    else
    {
      if(this.fotoCapturada == null)
      {
        this.mensaje = '¡Debe tomar una foto!';
      }
      else
      {
        this.mensaje = 'Completar correctamente los campos indicados';  
      }

      this.auth.mostrarToastError(this.mensaje);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('clave')?.value;
    const confirmPassword = form.get('rClave')?.value;
  
    if (password !== confirmPassword) {
      form.get('rClave')?.setErrors({ passwordMismatch: true });
    } else {
      form.get('rClave')?.setErrors(null);
    }
  }

  cambiarUsuario() {
    // Limpia y deshabilita validaciones según el perfil seleccionado
    if (this.perfil === 'anonimo') 
    {
      this.form.get('apellido')?.clearValidators();
      this.form.get('dni')?.clearValidators();
      this.form.get('email')?.clearValidators();
      this.form.get('clave')?.clearValidators();
      this.form.get('rClave')?.clearValidators();
  
      this.form.get('apellido')?.updateValueAndValidity({ onlySelf: true });
      this.form.get('dni')?.updateValueAndValidity({ onlySelf: true });
      this.form.get('email')?.updateValueAndValidity({ onlySelf: true });
      this.form.get('clave')?.updateValueAndValidity({ onlySelf: true });
      this.form.get('rClave')?.updateValueAndValidity({ onlySelf: true });

      this.apellido = '';
      this.dni = '';
      this.email = '';
      this.clave = '';
      this.rClave = '';
    } 
    else 
    {
      this.form.get('apellido')?.setValidators([Validators.required, this.letrasValidator()]);
      this.form.get('dni')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$')]);
      this.form.get('email')?.setValidators([Validators.required, Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/), Validators.email]);
      this.form.get('clave')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('rClave')?.setValidators([Validators.required, Validators.minLength(6)]);

      this.form.get('apellido')?.updateValueAndValidity({ onlySelf: false });
      this.form.get('dni')?.updateValueAndValidity({ onlySelf: false });
      this.form.get('email')?.updateValueAndValidity({ onlySelf: false });
      this.form.get('clave')?.updateValueAndValidity({ onlySelf: false });
      this.form.get('rClave')?.updateValueAndValidity({ onlySelf: false });
    }
  
    // Actualizar el estado de validación del formulario
    this.form.updateValueAndValidity();
    console.log(this.form);
  }
}
