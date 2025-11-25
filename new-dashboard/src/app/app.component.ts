import { Component, Renderer2, RendererFactory2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CitiesEnum, TypedMap } from '@shared/core/services/workers/handlers/models/shared-models';
import { WebWorkerManager } from '@shared/core/services/workers/webWorkerManager.service';
import { TimeResponse } from '@shared/models/times';
import { IRootState } from './store/models';
import { Store } from '@ngrx/store';
import { getTimesAction } from './store/times/actions';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  //workerManager: WebWorkerManager = WebWorkerManager.getInstance();
  renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2, private workerManager: WebWorkerManager, private store: Store<IRootState>) {
    this.renderer = rendererFactory.createRenderer(null, null);
    //this.workerManager.calculateTimes<TypedMap<TimeResponse>>({date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON}).subscribe((res: TypedMap<TimeResponse>)=>{
    //  console.log(res);
    //});
    window.addEventListener('message', (event) => {
      console.log(event);
    });

    this.renderer.addClass(document.body, 'default-theme');
    this.renderer.addClass(document.body, 'default-font-theme');
    this.store.dispatch(getTimesAction());
  }

  print() {
    console.log(window);
    console.log((window as any)?.ReactNativeWebView?.postMessage('ping'));

  }
}
