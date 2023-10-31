import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {Camera, CameraResultType, CameraSource} from '@capacitor/camera';
import { getStorage, ref, uploadString } from '@firebase/storage';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, MinLengthValidator } from '@angular/forms';
import { QrService } from 'src/app/services/qr.service';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.page.html',
  styleUrls: ['./mesa.page.scss'],
})
export class MesaPage implements OnInit {

  form : FormGroup;

  numero : any = '';
  cantidad : any = '';
  foto = 'assets/mesa-redonda.png';
  tipoMesa = '';
  qr = 'assets/escanear.png';
  
  info: any;

  constructor(private aFirestorage : AngularFireStorage, private formBuilder: FormBuilder, private qrService : QrService, private firestore : Firestore, private authService :AuthService) 
  { 
    this.form = this.formBuilder.group({
      numero: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      cantidad: ['', [Validators.required,  Validators.pattern('^[0-9]+$')]],
    });
  }

  ngOnInit() {
    
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
    let nombre = `mesas/fotos/${this.numero} ${fecha}`;
    let storageRef = ref(storage, nombre);
  
    uploadString(storageRef as any, fotoCapturada.dataUrl as any, 'data_url').then(()=>{
      let promesa = this.aFirestorage.ref(nombre).getDownloadURL().toPromise();
  
      promesa.then((url : any)=>{
        this.foto = url;
      });
    });
  }

  generarQR(mesa : string) : boolean
  {
    let retorno = false;
    let url = this.qrService.generarCodigoQR(mesa);

    if(url)
    {
      this.subirQR(url);
      retorno = true;
    }

    return retorno;
  }

  subirQR(url : string)
  {
    try
    {
      const fecha = new Date().getTime();
      const storage = getStorage();
      const nombre = `mesas/qr/QR_${this.numero} ${fecha}`;
      const storageRef = ref(storage, nombre);

       uploadString(storageRef as any, url as any, 'data_url').then(()=>{
        const urlPromise = this.aFirestorage.ref(nombre).getDownloadURL().toPromise();
        urlPromise.then((url2: any) => 
        {
          this.qr = url2;
          let mesa = {numero : this.numero, cantidadComensales : this.cantidad, tipoMesa : this.tipoMesa, foto : this.foto, QR : this.qr};
          FirestoreService.guardarFs('mesas', mesa, this.firestore);
        });
      });
    }
    catch
    {
      this.authService.mostrarToastError('No se pudo subir el código QR.')
    }
  }

  darAlta()
  {
    if(!this.form.valid  || this.tipoMesa === '' || this.foto === 'assets/mesa-redonda.png')
    {
      this.authService.mostrarToastError('Quedan campos por completar!');
    }
    else
    {
      if(this.generarQR(`{numero : ${this.numero}, cantidad : ${this.cantidad}, tipoMesa : ${this.tipoMesa}, foto : ${this.foto}}`))
      {
        this.authService.mostrarToastExito('El alta fue exitosa, el QR ya se encuentra disponible.');
      }

    }
  }
}
