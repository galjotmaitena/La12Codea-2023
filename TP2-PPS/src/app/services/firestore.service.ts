import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, query, orderBy, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

    static guardarFs(col: string, params:any, firestore: Firestore)
    {   
      let coleccion = collection(firestore, col);
      addDoc(coleccion, {...params});
      return params;
    }

    static async traerFs(col: string, firestore: Firestore, ordenar:boolean=false)
    {
        const colRef = collection(firestore, col);
        let q = query(colRef);
        try 
        {
            const querySnapshot = await getDocs(q);
            const data: any[] = [];

            querySnapshot.forEach((doc) => {
                data.push(doc.data());
            });

            return data;
        } 
        catch (error) 
        {
            console.error('Error al obtener datos de Firestore:', error);
            throw error;
        }
    }
}
