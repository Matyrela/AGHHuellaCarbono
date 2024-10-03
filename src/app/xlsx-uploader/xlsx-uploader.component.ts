import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {XlsxDataService} from "../xlsx-data.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-xlsx-uploader',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './xlsx-uploader.component.html',
  styleUrl: './xlsx-uploader.component.scss'
})
export class XlsxUploaderComponent {

  constructor(
    protected xlsxData: XlsxDataService,
    private router: Router
  ) {
  }

  async onInputChange($event: Event) {
    const target = $event.target as HTMLInputElement;
    if (target.files == null) return;

    const file = target.files[0];
    if (file) {
      await this.xlsxData.upload(file);
    }

    setTimeout(async () => {
      if (this.xlsxData.hasData()) {
        await this.router.navigate(['/analyze']);
      }
    }, 200);
  }
}
