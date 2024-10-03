import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import {XlsxDataService} from "../xlsx-data.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-xlsx-charts',
  templateUrl: './xlsx-charts.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./xlsx-charts.component.scss']
})
export class XlsxChartsComponent implements OnInit {

  constructor(
    protected xlsxData: XlsxDataService,
    private router: Router
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    if (!this.xlsxData.isDataUploaded()) {
      this.router.navigate(['/upload']);
    }
    this.xlsxData.getTotalCO2();

    this.xlsxData.calcTotalEncuestados();
    this.parseData();
    this.initializeCharts();
  }

  initializeCharts(): void {
    const chart1 = this.xlsxData.getDataSetForTipoDeTransporte();
    const chart2 = this.xlsxData.getDataSetForTotalEmitidoMitigado();
    const chart3 = this.xlsxData.getDataSetForCantidadPersonasEnAuto();
  }

  co2Gramos: number | string = 0;

  parseData() {
    this.co2Gramos = this.xlsxData.co2.toNumber();
    console.log(this.co2Gramos);
    if (this.co2Gramos > 1000000000) {
      this.co2Gramos = this.co2Gramos / 1000000000;
      this.co2Gramos =  this.co2Gramos.toFixed(2) + " KT";
    } else if (this.co2Gramos > 1000000) {
      this.co2Gramos = this.co2Gramos / 1000000;
      this.co2Gramos =  this.co2Gramos.toFixed(2) + " T";
    } else if (this.co2Gramos > 1000) {
      this.co2Gramos = this.co2Gramos / 1000;
      this.co2Gramos =  this.co2Gramos.toFixed(2) + " KG";
    } else {
      this.co2Gramos =  this.co2Gramos.toFixed(2) + " g";
    }
  }
}
