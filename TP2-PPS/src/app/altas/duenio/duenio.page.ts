import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-duenio',
  templateUrl: './duenio.page.html',
  styleUrls: ['./duenio.page.scss'],
})
export class DuenioPage implements OnInit {
  form: FormGroup;
  urlFoto : any = 'assets/perfil.png';
  abierta = false;
  fotoCapturada:any = null;
  toggle1State: boolean = false;
  toggle2State: boolean = false;
  toast = false;
  mensaje = '';

  nombre = '';
  apellido = '';
  dni:any;
  cuil:any;

  constructor(private angularFirestorage: AngularFireStorage, private auth: AuthService, private formBuilder: FormBuilder, private firestore: Firestore) 
  {
    this.form = this.formBuilder.group(
      {
        nombre: ['', [Validators.required, this.letrasValidator()]],
        apellido: ['', [Validators.required, this.letrasValidator()]],
        dni: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(8), Validators.pattern('^[0-9]+$')]],
        cuil: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(11), Validators.pattern('^[0-9]+$')]],
      }
    );
  }

  ngOnInit() 
  {

  }

  ngOnDestroy(): void 
  {
    this.stopScan();
  }

  toggleChanged(toggleNumber: number) 
  {
    if (toggleNumber === 1) 
    {
      this.toggle1State = !this.toggle1State;
      this.toggle2State = false;
    } 
    else 
    {
      this.toggle2State = !this.toggle2State;
      this.toggle1State = false; 
    }
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

  splitAndConvert(input: string)
  {
    if (input.length === 3) 
    {
      const primeraParte = parseInt(input.slice(0, 2), 10);
      const segundaParte = parseInt(input.slice(2), 10);
      return {primeraParte, segundaParte};
    } 
    else 
    {
      return;
    }
  }

  rellenarInputs(string: string)
  {
    let array = string.split("@");

    if(array.length === 9)
    {
      let cuilA:any = this.splitAndConvert(array[8]);

      this.apellido = this.capitalizeFirstLetter(array[1]);
      this.nombre = this.capitalizeFirstLetter(array[2]);
      this.dni = parseInt(array[4]);
      this.cuil = `${cuilA.primeraParte}${this.dni}${cuilA.segundaParte}`;
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

  subir(obj:any)
  {
    try
    {
      let options : any = { timeZone: 'America/Argentina/Buenos_Aires'};
      const fecha = new Date().toLocaleString('es-AR', options);
      const storage = getStorage();
      const nombre = `${this.nombre}_${this.apellido} ${fecha}`;
      const storageRef = ref(storage, nombre);
      //this.mostrarSpinner = true;
      uploadString(storageRef as any, this.fotoCapturada.dataUrl as any, 'data_url').then(()=>{
        const urlPromise = this.angularFirestorage.ref(nombre).getDownloadURL().toPromise();
        urlPromise.then((url: any) => 
        {
          //this.mostrarSpinner = false;
          let obj_ = {...obj, foto: url};
          FirestoreService.guardarFs('duenios', obj_, this.firestore);
        });
      });
    }
    catch
    {
      
    }
  }

  guardar()
  {
    let obj;
    let perfil = this.toggle1State ? 'duenio' : (this.toggle2State ? 'superv' : '');

    if(this.form.valid && this.fotoCapturada != null)
    {
      if(perfil != '')
      {
        obj = {nombre: this.nombre, apellido: this.apellido, dni: this.dni, cuil: this.cuil, perfil: perfil};
        this.subir(obj);
        this.mensaje = 'Alta realizada con exito';
        this.urlFoto = 'assets/perfil.png';
        this.nombre = '';
        this.apellido = '';
        this.dni = '';
        this.cuil = '';
        this.toggle1State = false;
        this.toggle2State = false;
      }
      else
      {
        this.mensaje = '¡Debe elegir un perfil!';
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
    }
    alert(this.mensaje);
    this.toast = true;
    setTimeout(()=>{
      this.toast = false;
      this.mensaje = '';
    }, 2000);
  }
}