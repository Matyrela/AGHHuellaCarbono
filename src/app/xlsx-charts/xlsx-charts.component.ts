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
    this.initializeCharts();
    if (!this.xlsxData.isDataUploaded()) {
      this.router.navigate(['/upload']);
    }

    this.xlsxData.getTotalCO2();
  }

  initializeCharts(): void {
    const chart1 = this.xlsxData.getDataSetForTipoDeTransporte();
    const chart2 = this.xlsxData.getDataSetForTipoDeAuto();


  }
}
