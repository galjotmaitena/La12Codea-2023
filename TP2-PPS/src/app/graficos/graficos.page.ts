import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import Chart from 'chart.js/auto';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-graficos',
  templateUrl: './graficos.page.html',
  styleUrls: ['./graficos.page.scss'],
})
export class GraficosPage implements OnInit {
  barChart: any;
  pieChart: any;
  donaChart: any;
  lineChart: any;

  encuestasClientes: any[] = [];
  obsevable: any;

  constructor(private firestore: Firestore) { }

  ngOnInit() 
  {
    this.obsevable = FirestoreService.traerFs('encuestaClientes', this.firestore).subscribe((data)=>{
      this.encuestasClientes = data;
      this.createPieChart();
      this.createBarChart();
      this.createDonaChart();
      this.createLineChart();
    });
  }

  ngOnDestroy()
  {
    this.obsevable.unsubscribe();
  }

/*   createLineChart(labels: string[], data: number[]) {
    const ctx = document.getElementById('lineChart')?.getContext('2d');
    const lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Data',
          data: data,
          borderColor: '#21A6E5',
          borderWidth: 1.5,
        }],
      },
    });
  } */

/*   createRadarChart(labels: string[], data: number[]) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    const radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Data',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1.5,
        }],
      },
    });
  } */

  createBarChart() 
  {
    const servicios = [
      { nombre: 'atencion', votos: 0 },
      { nombre: 'bebida', votos: 0 },
      { nombre: 'locacion', votos: 0 },
      { nombre: 'comida', votos: 0 }
    ];
    
    this.encuestasClientes.forEach(e => {
      e.servicios.forEach((servicio:any) => {
        if (servicios.some(op => op.nombre === servicio)) {
          // Incrementa el número de votos para el servicio seleccionado
          servicios.find(op => op.nombre === servicio)!.votos++;
        }
      });  
    });

    //alert(JSON.stringify(servicios.map((servicio) => servicio.votos)))
    this.barChart = new Chart('bar', {
      type: 'bar',
      data: {
        labels: servicios.map((servicio) => ''),
        datasets: [{
            label: '',
            data: servicios.map((servicio) => servicio.votos),
            backgroundColor: [
              '#21A6E5', '#063752', '#3C6C83','#282728', '#202B2C',
              '#00A1FD','#fcb7af','#fdf9c4','#ffe4e1','#b2e2f2','#ff6961'
            ],
            borderColor: [
              '#21A6E5', '#063752', '#3C6C83','#282728', '#202B2C',
              '#00A1FD','#fcb7af','#fdf9c4','#ffe4e1','#b2e2f2','#ff6961'
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          y: {
            display: false,
          },
          x: {
            grid: {
              color: '#555555',
            },
            ticks: {
              color: 'rgb(0,0,0)',
              font: {
                weight: 'bold',
              },
            },
          },
        },
        layout: {
          padding: 20,
        },
        plugins: {
          tooltip: {
            usePointStyle: true,
            borderColor: '#C5DB8F',
            borderWidth: 3,
            boxHeight: 130,
            boxWidth: 130,
            cornerRadius: 8,
            displayColors: true,
            bodyAlign: 'center',
            callbacks: {
              //@ts-ignore
              labelPointStyle(context) 
              {
                const value = context.formattedValue;
                const nombre = servicios[context.dataIndex].nombre;
                context.label = `${value} voto/s - ${nombre}`;
                let image = new Image(120, 120);
                //image.src = fotos[context.dataIndex].foto;
                return{
                  //pointStyle: image
                }
              },
            },
            legend: {
              display: false,
            },
          },
        },
      },
    });
  }

  createPieChart() 
  {
    let recomendaciones = [0, 0];

    this.encuestasClientes.forEach((e)=>{
      if(e.recomendacion)
      {
        recomendaciones[0]++;
      }
      else
      {
        recomendaciones[1]++;
      }
    });

    this.pieChart = new Chart('pie', {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
            label: '',
            data: recomendaciones,
            backgroundColor: [
              '#21A6E5', '#063752', '#BAD696', '#3C6C83','#282728', '#202B2C',
              '#00A1FD','#fcb7af','#fdf9c4','#ffe4e1','#b2e2f2','#ff6961'
            ],
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        plugins: {
          tooltip: {
            usePointStyle: true,
            borderColor: '#C5DB8F',
            borderWidth: 3,
            boxHeight: 130,
            boxWidth: 130,
            cornerRadius: 8,
            displayColors: true,
            bodyAlign: 'center',
            callbacks: {
              //@ts-ignore
              labelPointStyle(context) 
              {
                const value = context.parsed;
                const nombre = context.dataIndex == 0 ? 'Recomendada' : 'No recomendada';
                const veces = value == 1 ? 'vez' : 'veces';
                context.label = `${nombre} ${value} ${veces}`;
                let image = new Image(130, 130);
                image.src = nombre == 'Recomendada' ? 'assets/pulgar-arriba.png' : 'assets/disgusto.png';
                return{
                  pointStyle: image
                }
              },
            },
            legend: {
              display: false,
            },
            datalabels: {
              color: '#ffffff',
              anchor: 'end',
              align: 'center',
              font: {
                size: 30,
                weight: 'bold',
              },
              offset: 5,
              borderColor: '#ffffff',
              borderWidth: 1,
              borderRadius: 10,
              padding: 5,
              textShadowBlur: 10,
              textShadowColor: '#000000',
            },
          },
        },
      },
    });
  }

  createDonaChart() 
  {
    const dataFacilidad = this.encuestasClientes.map((encuesta) => encuesta.facilidad);

    const data = {
      labels: [],
      datasets: [
        {
          data: Array.from({ length: 10 }, (_, i) => dataFacilidad.filter(nota => nota === i + 1).length),
          backgroundColor: [
            '#FF5733', '#FF7F33', '#FFA533', '#FFC933', '#FFEC33',
            '#D5FF33', '#A9FF33', '#7DFF33', '#51FF33', '#33FF46'
          ],
        },
      ],
    };

    this.donaChart = new Chart('dona', {
      type: 'doughnut',
      data: data,
      options: {
        plugins: {
          tooltip: {
            usePointStyle: true,
            borderColor: '#C5DB8F',
            borderWidth: 3,
            boxHeight: 130,
            boxWidth: 130,
            cornerRadius: 8,
            displayColors: true,
            bodyAlign: 'center',
            callbacks: {
              //@ts-ignore
              labelPointStyle(context) 
              {
                const value = context.parsed;
                const nombre = `${context.dataIndex+1}`;
                const veces = value == 1 ? 'vez' : 'veces';
                context.label = `Facilidad: ${nombre} - ${value} ${veces}`;
                let image = new Image(130, 130);
                //image.src = nombre == 'Recomendada' ? 'assets/pulgar-arriba.png' : 'assets/disgusto.png';
                return{
                  //pointStyle: image
                }
              },
            },
            legend: {
              display: false,
            },
            datalabels: {
              color: '#ffffff',
              anchor: 'end',
              align: 'center',
              font: {
                size: 30,
                weight: 'bold',
              },
              offset: 5,
              borderColor: '#ffffff',
              borderWidth: 1,
              borderRadius: 10,
              padding: 5,
              textShadowBlur: 10,
              textShadowColor: '#000000',
            },
          },
        },
      },
    });
  }

  createLineChart()
  {
    const atencion = [
      { nombre: 'muy buena', votos: 0 },
      { nombre: 'buena', votos: 0 },
      { nombre: 'regular', votos: 0 },
      { nombre: 'mala', votos: 0 }
    ];

    this.encuestasClientes.forEach((e) => {
      const atencionVotada = e.atencion;
  
      // Busca la categoría de 'atencion' correspondiente en el array y actualiza los votos
      const categoria = atencion.find((item) => item.nombre === atencionVotada);
      if (categoria) {
        categoria.votos++;
      }
    });

    this.barChart = new Chart('line', {
      type: 'line',
      data: {
        labels: atencion.map((a) => ''),
        datasets: [{
            label: '',
            data: atencion.map((a) => a.votos),
            backgroundColor: [
              '#21A6E5', '#063752', '#3C6C83','#282728', '#202B2C',
              '#00A1FD','#fcb7af','#fdf9c4','#ffe4e1','#b2e2f2','#ff6961'
            ],
            borderColor: [
              '#21A6E5', '#063752', '#3C6C83','#282728', '#202B2C',
              '#00A1FD','#fcb7af','#fdf9c4','#ffe4e1','#b2e2f2','#ff6961'
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'x',
        scales: {
          y: {
            display: false,
          },
          x: {
            grid: {
              color: '#555555',
            },
            ticks: {
              color: 'rgb(0,0,0)',
              font: {
                weight: 'bold',
              },
            },
          },
        },
        layout: {
          padding: 20,
        },
        plugins: {
          tooltip: {
            usePointStyle: true,
            borderColor: '#C5DB8F',
            borderWidth: 3,
            boxHeight: 130,
            boxWidth: 130,
            cornerRadius: 8,
            displayColors: true,
            bodyAlign: 'center',
            callbacks: {
              //@ts-ignore
              labelPointStyle(context) 
              {
                const value = context.formattedValue;
                const nombre = atencion[context.dataIndex].nombre;
                context.label = `${value} voto/s - ${nombre}`;
                let image = new Image(120, 120);
                //image.src = fotos[context.dataIndex].foto;
                return{
                  //pointStyle: image
                }
              },
            },
            legend: {
              display: false,
            },
          },
        },
      },
    });
  }
}
