import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import {Camera, CameraResultType, CameraSource} from '@capacitor/camera';
import { getStorage, ref, uploadString } from '@firebase/storage';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-empleado',
  templateUrl: './empleado.page.html',
  styleUrls: ['./empleado.page.scss'],
})
export class EmpleadoPage implements OnInit {

  nombre = '';
  apellido = '';
  dni = null;
  cuil = null;

  abierta = false;
  escaneado = '';
  dniEsc : any[] = [];

  foto = "assets/perfil.png";
  
  constructor(private aFirestorage : AngularFireStorage, private authService : AuthService) { }

  ngOnInit() {
  }

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
        //alert(result);
        if(result?.hasContent)
        {
          this.escaneado = result.content;
          BarcodeScanner.showBackground();
          document.querySelector('body')?.classList.add('scanner-active');
          //alert(this.escaneado);
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
      this.nombre = this.dniEsc[2];
      this.apellido = this.dniEsc[1];
      this.dni = this.dniEsc[4];
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
      let nombre = `${this.authService.get_email()} ${fecha}`;
      let storageRef = ref(storage, nombre);
  
      uploadString(storageRef as any, fotoCapturada.dataUrl as any, 'data_url').then(()=>{
        let promesa = this.aFirestorage.ref(nombre).getDownloadURL().toPromise();
  
         promesa.then((url : any)=>{
           this.foto = url;
         });
      });
    }
}
