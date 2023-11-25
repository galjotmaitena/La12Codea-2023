import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import {Camera, CameraResultType, CameraSource} from '@capacitor/camera';
import { getStorage, ref, uploadString } from '@firebase/storage';
import { AuthService } from 'src/app/services/auth.service';

import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, MinLengthValidator } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { PushService } from 'src/app/services/push.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empleado',
  templateUrl: './empleado.page.html',
  styleUrls: ['./empleado.page.scss'],
})
export class EmpleadoPage implements OnInit {

  form: FormGroup;

  correo = '';
  password = '';
  password2 = '';
  nombre = '';
  apellido = '';
  dni : any = '';
  cuil = null;

  tipoEmpleado = '';

  abierta = false;
  escaneado = '';
  dniEsc : any[] = [];

  foto = "assets/user.png";

  tipo = 0;
  mostrarSpinner = false;
  
  constructor(private push: PushService, private aFirestorage : AngularFireStorage, private authService : AuthService, private formBuilder: FormBuilder, private firestore : Firestore, private router: Router) 
  { 
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required, this.contieneSoloLetras()]],
      apellido: ['', [Validators.required, this.contieneSoloLetras()]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      cuil: ['', [Validators.required,  Validators.pattern('^[0-9]+$')]],
      correo: ['', [Validators.required, Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
      password2: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
    });
  }

  ngOnInit() {}

  ngOnDestroy(): void 
  {
    this.stopScan();
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
        this.escaneado = result.content;
        BarcodeScanner.showBackground();
        document.querySelector('body')?.classList.add('scanner-active');
        this.dniEsc = this.escaneado.split('@');
        this.asignarEscan();
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

  asignarEscan()
  {
    this.mostrarSpinner = true;

    setTimeout(()=>{
      this.tipo = this.dniEsc[1];

      if(this.contieneSoloNumeros(this.dniEsc[3]))
      {
        this.nombre = this.dniEsc[5];
        this.apellido = this.dniEsc[4];
        this.dni = parseInt(this.dniEsc[1]);
      }
      else
      {
        this.nombre = this.dniEsc[2];
        this.apellido = this.dniEsc[1];
        this.dni = this.dniEsc[4];
      }

      this.mostrarSpinner = false;
    }, 1500);
  }

  async sacarFoto()
  {
    const fotoCapturada = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100,
      webUseInput: true,
    });
  
    let storage = getStorage();
    let fecha = new Date().getTime();
    let nombre = `empleados/${this.nombre.replace(' ', '_')}_${this.apellido.replace(' ', '_')} ${fecha}`;
    let storageRef = ref(storage, nombre);
  
    uploadString(storageRef as any, fotoCapturada.dataUrl as any, 'data_url').then(()=>{
      let promesa = this.aFirestorage.ref(nombre).getDownloadURL().toPromise();
  
      promesa.then((url : any)=>{
        this.foto = url;
      });
    });
  }

  contieneSoloNumeros(cadena: string) : boolean 
  {
    const expresionRegular = /^\d+$/;
    return expresionRegular.test(cadena);
  }

  contieneSoloLetras() : ValidatorFn 
  {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value) {
        // Elimina los espacios en blanco al principio y al final del valor
        const trimmedValue = value.trim();
        // Comprueba si el valor contiene solo letras y espacios en blanco
        if (!/^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/.test(trimmedValue)) {
          return { 'invalido': true };
        }
      }
      return null;
    };
  }

  darAlta()
  {
    this.mostrarSpinner = true;
    if(!this.form.valid  || this.tipoEmpleado === '')
    {
      this.mostrarSpinner = false;
      this.authService.mostrarToastError('Quedan campos por completar!');
    }
    else
    {
      if(this.password === this.password2)
      {
        this.authService.mostrarToastExito('Alta exitosa');
        let empleado = {nombre : this.nombre, apellido : this.apellido, dni : this.dni, cuil : this.cuil, email : this.correo, foto : '', tipoEmpleado : this.tipoEmpleado};

        if(this.foto !== "assets/user.png")
        {
          empleado = {nombre : this.nombre, apellido : this.apellido, dni : this.dni, cuil : this.cuil, email : this.correo, foto : this.foto, tipoEmpleado : this.tipoEmpleado};
        }

        this.authService.signup(this.correo, this.password).catch((error)=>{
          if(error === 'auth/email-already-in-use')
          {
            this.mostrarSpinner = false;
            this.authService.mostrarToastError('El correo electrónico ya se encuentra en uso.');
          }
        }).then(()=>{
          FirestoreService.guardarFs('empleados', empleado, this.firestore);

          this.nombre = '';
          this.apellido = '';
          this.dni = '';
          this.cuil = null;
          this.correo = '';
          this.password = '';
          this.password2 = '';
          this.tipoEmpleado = '';
          this.foto = "assets/user.png";
          this.router.navigateByUrl('home-duenio');
          this.mostrarSpinner = false;
        });
      }
      else
      {
        this.mostrarSpinner = false;
        this.authService.mostrarToastError('Las contraseñas no coinciden!');
      }
    }
  }
}
