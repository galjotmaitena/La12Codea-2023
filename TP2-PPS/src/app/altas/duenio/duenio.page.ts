import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-duenio',
  templateUrl: './duenio.page.html',
  styleUrls: ['./duenio.page.scss'],
})
export class DuenioPage implements OnInit {
  fotos: any[] = [];
  urlFoto : any = 'assets/perfil.png';
  abierta = false;
  escaneado = '';

  constructor(private angularFirestorage: AngularFireStorage, private auth: AuthService) { }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.stopScan();
  }

  async sacarFoto()
  {
    try
    {
      const fotoCapturada = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 100,
        webUseInput: true,
      });
      
      let options : any = { timeZone: 'America/Argentina/Buenos_Aires'};
      const storage = getStorage();
      const fecha = new Date().toLocaleString('es-AR', options);
      const nombre = `${this.auth.get_email()} ${fecha}`;
      const storageRef = ref(storage, nombre);
      //this.mostrarSpinner = true;
      this.urlFoto = fotoCapturada.dataUrl;
      /* uploadString(storageRef as any, fotoCapturada.dataUrl as any, 'data_url').then(() => 
      {
        const urlPromise = this.angularFirestorage.ref(nombre).getDownloadURL().toPromise();
        urlPromise.then((url: any) => 
        {
          //this.mostrarSpinner = false;
          //let params = ConexionFs.guardarFs('eFeos', this.auth.get_email(), url, this.firestore);
          //this.fotos.unshift(params);
          //this.urlFoto = url;
        });
      }); */
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
          this.escaneado = result.content;
          BarcodeScanner.showBackground();
          document.querySelector('body')?.classList.add('scanner-active');
          
          //this.llenarInputs(this.escaneado);
          alert(this.escaneado);
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
}