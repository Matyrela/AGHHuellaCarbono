import {Injectable} from '@angular/core';
import * as XLSX from 'xlsx';
import {Chart} from "chart.js";
import Decimal from "decimal.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Injectable({
  providedIn: 'root'
})
export class XlsxDataService {
  totalEncuestados!: number;

  constructor() {
    Chart.register(ChartDataLabels);
  }

  rows: any = [];

  isDataUploaded(): boolean {
    return this.rows.length > 0;
  }

  async upload(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      this.rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    };
    reader.readAsArrayBuffer(file);
  }

  calcTotalEncuestados() {
    this.totalEncuestados = this.rows.slice(1).filter((row: any) => row[0] !== undefined).length;
  }

  hasData() {
    return this.rows.length > 0;
  }

  co2: Decimal = new Decimal(0);

  getTotalCO2() {
    this.rows.forEach((row: any) => {
      let vehiculo: TipoDeTransporteCO2 | undefined;
      const tipoDeTransporte = row[6];
      if (tipoDeTransporte === "🚍Ómnibus") {
        const tipoMotor = row[8];
        switch (tipoMotor) {
          case "Diesel":
            vehiculo = TipoDeTransporteCO2.BondiCombustion;
            break;
          case "Eléctrico":
            vehiculo = TipoDeTransporteCO2.BondiElectrico;
            break;
        }
      } else if (tipoDeTransporte === "🚗Auto") {
        const tipoMotor = row[7];
        switch (tipoMotor) {
          case "Diesel":
            vehiculo = TipoDeTransporteCO2.AutoDiesel;
            break;
          case "Eléctrico":
            vehiculo = TipoDeTransporteCO2.AutoElectrico;
            break;
          case "Híbrido":
            vehiculo = TipoDeTransporteCO2.AutoHibrido;
            break;
          case "Gasolina":
            vehiculo = TipoDeTransporteCO2.AutoGasolina;
            break;
        }
      } else if (tipoDeTransporte === "🛵Moto") {
        vehiculo = TipoDeTransporteCO2.Moto;
      }

      const km = row[10];
      if (vehiculo !== undefined) {
        this.co2 = this.co2.plus(this.getCO2(vehiculo, km));
      }
    });
    return this.co2;
  }

  private getCO2(tipoDeTransporte: TipoDeTransporteCO2, km: number, cantidadGente: number = 1): number {
    const result = new Decimal(tipoDeTransporte).times(km).div(cantidadGente);
    console.log(parseFloat(result.toFixed(2)));
    return parseFloat(result.toFixed(2));
  }

  private getTotalCO2Mitigado() {
    return 5323;
  }

  getDataSetForTotalEmitidoMitigado() {
    return new Chart('chart2', {
      type: 'bar',
      data: {
        labels: ['Total emitido', 'Total mitigado'],
        datasets: [{
          label: 'CO2',
          data: [this.co2.toNumber(), this.getTotalCO2Mitigado()],
          backgroundColor: [
            'rgba(224, 51, 99, 0.2)',
            'rgba(203, 223, 203, 0.2)',
          ],
          borderColor: [
            'rgba(224, 51, 99, 1)',
            'rgba(203, 223, 203, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            color: '#000',
            formatter: (value: any, context: any) => {
              return value + " g";
            }
          }
        }
      },
      plugins: [ChartDataLabels],
    } as any);
  }

  getDataSetForTipoDeTransporte(): Chart<'pie'> {
    const data = this.rows.slice(1).map((row: any) => row[6]);
    const labels = Array.from(new Set(data));
    for (let i = 0; i < labels.length; i++) {
      if (labels[i] === undefined) {
        labels.splice(i, 1);
        i--;
      }
    }
    const dataCount: number[] = labels.map((label: any) => data.filter((d: any) => d === label).length);

    return new Chart<'pie'>('chart1', {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Personas',
          data: dataCount,
          backgroundColor: [
            'rgba(203, 223, 203, 0.2)',
            'rgba(224, 51, 99, 0.2)',
            'rgba(81, 66, 128, 0.2)',
            'rgba(239, 126, 78, 0.2)',
          ],
          borderColor: [
            'rgba(203, 223, 203, 1)',
            'rgba(224, 51, 99, 1)',
            'rgba(81, 66, 128, 1)',
            'rgba(239, 126, 78, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            color: '#000',
            formatter: (value: any, context: any) => {
              return (
                context.chart.data.labels[context.dataIndex][0] + context.chart.data.labels[context.dataIndex][1] + " "
              ) + (value * 100 / this.totalEncuestados).toFixed(1) + '%';
            }
          }
        }
      },
      plugins: [ChartDataLabels],
    } as any);
  }


  getDataSetForCantidadPersonasEnAuto() {
    //get row 6 and 9 only if row 6 is auto
    const data = this.rows.slice(1).filter((row: any) => row[6] === "🚗Auto").map((row: any) => row[9]);
    const labels = Array.from(new Set(data));
    for (let i = 0; i < labels.length; i++) {
      if (labels[i] === undefined) {
        labels.splice(i, 1);
        i--;
      }
    }

    const dataCount: number[] = labels.map((label: any) => data.filter((d: any) => d === label).length);

    return new Chart('chart3', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Personas',
          data: dataCount,
          backgroundColor: [
            'rgba(203, 223, 203, 0.2)',
            'rgba(224, 51, 99, 0.2)',
            'rgba(81, 66, 128, 0.2)',
            'rgba(239, 126, 78, 0.2)',
          ],
          borderColor: [
            'rgba(203, 223, 203, 1)',
            'rgba(224, 51, 99, 1)',
            'rgba(81, 66, 128, 1)',
            'rgba(239, 126, 78, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            color: '#000',
            formatter: (value: any, context: any) => {
              return value + " personas";
            }
          }
        }
      },
      plugins: [ChartDataLabels],
    } as any);
  }
}

enum TipoDeTransporteCO2 {
  AutoGasolina = 193.7,
  AutoDiesel = 265.1,
  AutoElectrico = 8.9,
  AutoHibrido = 50.3,

  BondiCombustion = 19.4,
  BondiElectrico = 0.8,

  Moto = 75.9,
}

// Chart colors
// GREEN: #cbdfcb
// RED: #e03363
// ORANGE: #e95056
// LIGHT ORANGE: #ef7e4e|
// PURPLE: #514280
