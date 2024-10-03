import {Routes} from '@angular/router';
import {XlsxUploaderComponent} from "./xlsx-uploader/xlsx-uploader.component";
import {XlsxChartsComponent} from "./xlsx-charts/xlsx-charts.component";

export const routes: Routes = [
  {path: '', redirectTo: 'upload', pathMatch: 'full'},
  {path: 'upload', component: XlsxUploaderComponent},
  {path: 'analyze', component: XlsxChartsComponent},
];
