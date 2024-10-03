import {Injectable} from '@angular/core';
import * as XLSX from 'xlsx';
import {Chart} from "chart.js";
import Decimal from "decimal.js";


@Injectable({
  providedIn: 'root'
})
export class XlsxDataService {

  constructor() {
  }

  rows: any = [];

  isDataUploaded(): boolean {
    return this.rows.length > 0;
  }

  async upload(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {type: 'array'});
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      this.rows = XLSX.utils.sheet_to_json(worksheet, {header: 1});
    };
    reader.readAsArrayBuffer(file);
  }

  getDataSetForTipoDeTransporte(): Chart<'pie'> {
    const data = this.rows.slice(1).map((row: any) => row[6]);
    const labels = Array.from(new Set(data));
    const dataCount = labels.map((label: any) => data.filter((d: any) => d === label).length);
    return new Chart('chart1', {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Tipo de Vehículo',
          data: dataCount,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  getDataSetForTipoDeAuto() {
    const data = this.rows.slice(1).map((row: any) => row[7]);
    const labels = Array.from(new Set(data));
    const dataCount = labels.map((label: any) => data.filter((d: any) => d === label).length);
    return new Chart('chart2', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Tipo de Motor',
          data: dataCount,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
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
