import { Subject } from "rxjs";
import { v4 } from "uuid";
import { CitiesEnum } from "./handlers/models/shared-models";

export class WebWorkerManager {
    private static instance: WebWorkerManager;

    private subjectsMap: {[key: string]: Subject<any>} = {};

    private constructor() {

    }

    public static getInstance(): WebWorkerManager {
        if (!this.instance) this.instance = new WebWorkerManager();
        return this.instance;
    }



    calculateTimes<T>(data: {date: Date, location: CitiesEnum}): Subject<T>{
        const worker = new Worker(new URL('./handlers/workers/time-calculation.worker.ts', import.meta.url), { type: 'module' });
        return this.startTask(worker, data);
    }

    calculateTitles<T>(data: {date: Date, location: CitiesEnum}): Subject<T>{
        const worker = new Worker(new URL('./handlers/workers/titles-calculation.worker.ts', import.meta.url), { type: 'module' });
        return this.startTask(worker, data);
    }

    startTask<T>(worker: Worker, data: any): Subject<T>{
        const id = v4();
        worker.onmessage = (event) => {
            this.subjectsMap[id].next(event.data);
        };
        worker.postMessage({id, data});
        this.subjectsMap[id] = new Subject<T>();
        return this.subjectsMap[id];
    }


}